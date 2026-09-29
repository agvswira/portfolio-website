/*
 * Fluid solver adapted from lissanh95/splash-background-effect.
 * Source commit and license: see NOTICE.md and LICENSE in this directory.
 */

import type { SplashConfig } from "./config";

export interface SplashPointer {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface FluidEngine {
  pointerMove(pointer: SplashPointer): void;
  pause(): void;
  destroy(): void;
}

type GL = WebGLRenderingContext | WebGL2RenderingContext;
type Target = {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;
  texelX: number;
  texelY: number;
};
type DoubleTarget = { read: Target; write: Target; swap(): void };
type Program = { handle: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };

const vertexSource = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const splatSource = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
}`;

const advectionSource = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
}`;

const divergenceSource = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const clearSource = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

const pressureSource = `
precision mediump float;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const gradientSource = `
precision mediump float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

const displaySource = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 texelSize;
uniform float bloom;
void main () {
  vec3 color = texture2D(uTexture, vUv).rgb;
  vec3 soft = (
    texture2D(uTexture, vUv + vec2(texelSize.x * 2.0, 0.0)).rgb +
    texture2D(uTexture, vUv - vec2(texelSize.x * 2.0, 0.0)).rgb +
    texture2D(uTexture, vUv + vec2(0.0, texelSize.y * 2.0)).rgb +
    texture2D(uTexture, vUv - vec2(0.0, texelSize.y * 2.0)).rgb
  ) * 0.25;
  color += soft * bloom;
  float alpha = max(color.r, max(color.g, color.b));
  gl_FragColor = vec4(color, alpha);
}`;

export function createFluidEngine(
  canvas: HTMLCanvasElement,
  config: SplashConfig
): FluidEngine | null {
  const contextOptions: WebGLContextAttributes = {
    alpha: true,
    premultipliedAlpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
  };
  const context = (canvas.getContext("webgl2", contextOptions) ??
    canvas.getContext("webgl", contextOptions) ??
    canvas.getContext("experimental-webgl", contextOptions)) as GL | null;
  if (!context) return null;
  const gl: GL = context;

  const isWebGL2 =
    typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
  const colorBufferExt = isWebGL2
    ? gl.getExtension("EXT_color_buffer_float")
    : (gl.getExtension("EXT_color_buffer_half_float") ??
      gl.getExtension("WEBGL_color_buffer_float"));
  const halfFloatExt = isWebGL2
    ? null
    : (gl.getExtension("OES_texture_half_float") as { HALF_FLOAT_OES: number } | null);
  if (!colorBufferExt || (!isWebGL2 && !halfFloatExt)) return null;

  const halfFloatLinear = isWebGL2
    ? Boolean(gl.getExtension("OES_texture_float_linear"))
    : Boolean(gl.getExtension("OES_texture_half_float_linear"));
  const halfFloatType = isWebGL2
    ? (gl as WebGL2RenderingContext).HALF_FLOAT
    : halfFloatExt!.HALF_FLOAT_OES;
  const internalFormat = isWebGL2 ? (gl as WebGL2RenderingContext).RGBA16F : gl.RGBA;
  const filter = halfFloatLinear ? gl.LINEAR : gl.NEAREST;
  const shaders: WebGLShader[] = [];
  const programs: WebGLProgram[] = [];
  const buffers: WebGLBuffer[] = [];
  const textures: WebGLTexture[] = [];
  const framebuffers: WebGLFramebuffer[] = [];
  const targets: Target[] = [];

  let dye = null as unknown as DoubleTarget;
  let velocity = null as unknown as DoubleTarget;
  let pressure = null as unknown as DoubleTarget;
  let divergence = null as unknown as Target;
  let active = false;
  let destroyed = false;
  let frameId = 0;
  let lastFrame = 0;
  let lastInput = 0;
  let pixelRatio = 1;
  let velocityResolution = 128;
  let dyeResolution = 1024;
  let pressureIterations = 20;

  try {
    const probe = createTarget(4, 4, gl.NEAREST);
    targets.splice(targets.indexOf(probe), 1);
    destroyTarget(probe);
    gl.clearColor(0, 0, 0, 0);

    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const lowPower =
      config.quality === "low" ||
      (config.quality === "auto" &&
        ((navigator.hardwareConcurrency || 8) <= 4 ||
          (deviceMemory !== undefined && deviceMemory <= 4)));
    if (lowPower) {
      velocityResolution = 96;
      dyeResolution = 512;
      pressureIterations = 12;
    } else if (config.quality === "high") {
      velocityResolution = 144;
      dyeResolution = 1024;
      pressureIterations = 22;
    }

    const quad = gl.createBuffer();
    if (!quad) throw new Error("Unable to allocate fluid geometry");
    buffers.push(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const indices = gl.createBuffer();
    if (!indices) throw new Error("Unable to allocate fluid indices");
    buffers.push(indices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

    const splatProgram = createProgram(splatSource);
    const advectionProgram = createProgram(advectionSource);
    const divergenceProgram = createProgram(divergenceSource);
    const clearProgram = createProgram(clearSource);
    const pressureProgram = createProgram(pressureSource);
    const gradientProgram = createProgram(gradientSource);
    const displayProgram = createProgram(displaySource);

    resize();
    clearAll();

    function adaptShader(source: string, fragment: boolean): string {
      if (!isWebGL2) return source;
      const converted = fragment
        ? source
            .replace(/\bvarying\b/g, "in")
            .replace(/texture2D/g, "texture")
            .replace(/gl_FragColor/g, "fragColor")
        : source.replace(/\battribute\b/g, "in").replace(/\bvarying\b/g, "out");
      if (!fragment) return `#version 300 es\n${converted}`;
      const precision =
        source.match(/^\s*precision\s+(?:lowp|mediump|highp)\s+float;/)?.[0] ??
        "precision highp float;";
      return `#version 300 es\n${precision}\nout vec4 fragColor;\n${converted.replace(precision, "")}`;
    }

    function createProgram(fragmentSource: string): Program {
      const vertex = compile(gl.VERTEX_SHADER, adaptShader(vertexSource, false));
      const fragment = compile(gl.FRAGMENT_SHADER, adaptShader(fragmentSource, true));
      const program = gl.createProgram();
      if (!program) throw new Error("Unable to create fluid shader program");
      programs.push(program);
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.bindAttribLocation(program, 0, "aPosition");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || "Fluid shader link failed");
      }
      const uniforms: Program["uniforms"] = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
      for (let index = 0; index < count; index++) {
        const uniform = gl.getActiveUniform(program, index);
        if (uniform) uniforms[uniform.name] = gl.getUniformLocation(program, uniform.name);
      }
      return { handle: program, uniforms };
    }

    function compile(type: number, source: string): WebGLShader {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Unable to allocate fluid shader");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "Fluid shader compile failed");
      }
      return shader;
    }

    function createTarget(width: number, height: number, textureFilter: number): Target {
      const texture = gl.createTexture();
      const framebuffer = gl.createFramebuffer();
      if (!texture || !framebuffer) throw new Error("Unable to allocate fluid surface");
      textures.push(texture);
      framebuffers.push(framebuffer);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, textureFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, textureFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        width,
        height,
        0,
        gl.RGBA,
        halfFloatType,
        null
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error("Fluid framebuffer is not supported");
      }
      const target = { texture, framebuffer, width, height, texelX: 1 / width, texelY: 1 / height };
      targets.push(target);
      return target;
    }

    function destroyTarget(target: Target): void {
      gl.deleteFramebuffer(target.framebuffer);
      gl.deleteTexture(target.texture);
    }

    function createDoubleTarget(
      width: number,
      height: number,
      textureFilter: number
    ): DoubleTarget {
      let read = createTarget(width, height, textureFilter);
      let write = createTarget(width, height, textureFilter);
      return {
        get read() {
          return read;
        },
        get write() {
          return write;
        },
        swap() {
          [read, write] = [write, read];
        },
      };
    }

    function dimensions(resolution: number): { width: number; height: number } {
      const aspect = canvas.width / Math.max(1, canvas.height);
      const longSide = Math.max(1, Math.round(resolution));
      const shortSide = Math.max(1, Math.round(longSide / Math.max(1, aspect, 1 / aspect)));
      return aspect >= 1
        ? { width: longSide, height: shortSide }
        : { width: shortSide, height: longSide };
    }

    function resize(): void {
      pixelRatio = Math.min(window.devicePixelRatio || 1, config.maxDevicePixelRatio);
      const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
      if (canvas.width === width && canvas.height === height && dye) return;
      canvas.width = width;
      canvas.height = height;
      for (const target of targets.splice(0)) destroyTarget(target);
      const sim = dimensions(velocityResolution);
      const ink = dimensions(dyeResolution);
      velocity = createDoubleTarget(sim.width, sim.height, filter);
      dye = createDoubleTarget(ink.width, ink.height, filter);
      pressure = createDoubleTarget(sim.width, sim.height, gl.NEAREST);
      divergence = createTarget(sim.width, sim.height, gl.NEAREST);
    }

    function bind(program: Program, target: Target | null): void {
      gl.useProgram(program.handle);
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
        gl.viewport(0, 0, target.width, target.height);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
    }

    function attach(program: Program, name: string, target: Target, unit: number): void {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, target.texture);
      gl.uniform1i(program.uniforms[name], unit);
    }

    function clearAll(): void {
      if (!dye) return;
      gl.disable(gl.BLEND);
      for (const target of targets) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
        gl.viewport(0, 0, target.width, target.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      clearCanvas();
    }

    function clearCanvas(): void {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    function splat(x: number, y: number, dx: number, dy: number): void {
      gl.disable(gl.BLEND);
      const aspect = canvas.width / Math.max(1, canvas.height);
      const correctionX = aspect < 1 ? aspect : 1;
      const correctionY = aspect > 1 ? 1 / aspect : 1;
      const radius = Math.max(0.0001, config.splatRadius / 100);

      bind(splatProgram, velocity.write);
      attach(splatProgram, "uTarget", velocity.read, 0);
      gl.uniform1f(splatProgram.uniforms.aspectRatio, aspect);
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      gl.uniform1f(splatProgram.uniforms.radius, radius);
      gl.uniform3f(
        splatProgram.uniforms.color,
        dx * correctionX * config.splatForce,
        dy * correctionY * config.splatForce,
        0
      );
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      velocity.swap();

      const [red, green, blue] = colorFromHex(config.color, config.intensity);
      bind(splatProgram, dye.write);
      attach(splatProgram, "uTarget", dye.read, 0);
      gl.uniform1f(splatProgram.uniforms.aspectRatio, aspect);
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      gl.uniform1f(splatProgram.uniforms.radius, radius);
      gl.uniform3f(splatProgram.uniforms.color, red, green, blue);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      dye.swap();
    }

    function step(dt: number): void {
      gl.disable(gl.BLEND);
      bind(divergenceProgram, divergence);
      gl.uniform2f(
        divergenceProgram.uniforms.texelSize,
        velocity.read.texelX,
        velocity.read.texelY
      );
      attach(divergenceProgram, "uVelocity", velocity.read, 0);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

      bind(clearProgram, pressure.write);
      attach(clearProgram, "uTexture", pressure.read, 0);
      gl.uniform1f(clearProgram.uniforms.value, 0.43);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      pressure.swap();

      for (let iteration = 0; iteration < pressureIterations; iteration++) {
        bind(pressureProgram, pressure.write);
        gl.uniform2f(
          pressureProgram.uniforms.texelSize,
          pressure.read.texelX,
          pressure.read.texelY
        );
        attach(pressureProgram, "uDivergence", divergence, 0);
        attach(pressureProgram, "uPressure", pressure.read, 1);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        pressure.swap();
      }

      bind(gradientProgram, velocity.write);
      gl.uniform2f(gradientProgram.uniforms.texelSize, velocity.read.texelX, velocity.read.texelY);
      attach(gradientProgram, "uPressure", pressure.read, 0);
      attach(gradientProgram, "uVelocity", velocity.read, 1);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      velocity.swap();

      bind(advectionProgram, velocity.write);
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.read.texelX, velocity.read.texelY);
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.velocityDissipation);
      attach(advectionProgram, "uVelocity", velocity.read, 0);
      attach(advectionProgram, "uSource", velocity.read, 1);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      velocity.swap();

      bind(advectionProgram, dye.write);
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.read.texelX, velocity.read.texelY);
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.densityDissipation);
      attach(advectionProgram, "uVelocity", velocity.read, 0);
      attach(advectionProgram, "uSource", dye.read, 1);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      dye.swap();
    }

    function render(): void {
      gl.disable(gl.BLEND);
      clearCanvas();
      gl.useProgram(displayProgram.handle);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      attach(displayProgram, "uTexture", dye.read, 0);
      gl.uniform2f(displayProgram.uniforms.texelSize, dye.read.texelX, dye.read.texelY);
      gl.uniform1f(displayProgram.uniforms.bloom, Math.max(0, config.bloom));
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    function tick(now: number): void {
      if (!active || destroyed) return;
      if (document.hidden || gl.isContextLost()) {
        active = false;
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        return;
      }
      const dt = lastFrame === 0 ? 1 / 60 : Math.min((now - lastFrame) / 1000, 1 / 30);
      lastFrame = now;
      const expectedWidth = Math.floor(canvas.clientWidth * pixelRatio);
      const expectedHeight = Math.floor(canvas.clientHeight * pixelRatio);
      if (canvas.width !== expectedWidth || canvas.height !== expectedHeight) {
        resize();
        clearAll();
      }
      step(dt);
      render();
      if (now - lastInput < 2400) frameId = requestAnimationFrame(tick);
      else {
        active = false;
        frameId = 0;
        clearAll();
      }
    }

    function wake(): void {
      lastInput = performance.now();
      if (!active && !destroyed && !document.hidden) {
        active = true;
        lastFrame = 0;
        frameId = requestAnimationFrame(tick);
      }
    }

    return {
      pointerMove(pointer: SplashPointer): void {
        if (destroyed || gl.isContextLost()) return;
        const dx = Math.max(-0.07, Math.min(0.07, pointer.dx));
        const dy = Math.max(-0.07, Math.min(0.07, pointer.dy));
        if (Math.abs(dx) + Math.abs(dy) < 0.00005) return;
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        resize();
        if (canvas.width !== oldWidth || canvas.height !== oldHeight) clearAll();
        splat(Math.max(0, Math.min(1, pointer.x)), Math.max(0, Math.min(1, pointer.y)), dx, dy);
        wake();
      },
      pause(): void {
        active = false;
        lastFrame = 0;
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        if (!destroyed && !gl.isContextLost()) clearAll();
      },
      destroy(): void {
        if (destroyed) return;
        destroyed = true;
        active = false;
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        if (!gl.isContextLost()) {
          for (const framebuffer of framebuffers) gl.deleteFramebuffer(framebuffer);
          for (const texture of textures) gl.deleteTexture(texture);
          for (const program of programs) gl.deleteProgram(program);
          for (const shader of shaders) gl.deleteShader(shader);
          for (const buffer of buffers) gl.deleteBuffer(buffer);
          clearCanvas();
        }
      },
    };
  } catch (error) {
    if (!gl.isContextLost()) {
      for (const framebuffer of framebuffers) gl.deleteFramebuffer(framebuffer);
      for (const texture of textures) gl.deleteTexture(texture);
      for (const program of programs) gl.deleteProgram(program);
      for (const shader of shaders) gl.deleteShader(shader);
      for (const buffer of buffers) gl.deleteBuffer(buffer);
    }
    canvas.width = 1;
    canvas.height = 1;
    if (import.meta.env.DEV)
      console.warn("Fluid background is unavailable; the site will continue without it.", error);
    return null;
  }
}

function colorFromHex(color: string, intensity: number): [number, number, number] {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color.trim());
  if (!match) return [0.12 * intensity, 0.18 * intensity, 0.2 * intensity];
  return [1, 2, 3].map((index) => (parseInt(match[index], 16) / 255) * intensity) as [
    number,
    number,
    number,
  ];
}
