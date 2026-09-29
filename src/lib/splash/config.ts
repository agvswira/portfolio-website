export type SplashQuality = "auto" | "high" | "balanced" | "low";

export interface SplashConfig {
  enabled: boolean;
  color: string;
  intensity: number;
  splatRadius: number;
  splatForce: number;
  densityDissipation: number;
  velocityDissipation: number;
  bloom: number;
  quality: SplashQuality;
  maxDevicePixelRatio: number;
}

export const splashConfig: Readonly<SplashConfig> = Object.freeze({
  enabled: true,
  color: "#88c0d0",
  intensity: 0.2,
  splatRadius: 0.28,
  splatForce: 5000,
  densityDissipation: 4,
  velocityDissipation: 2.87,
  bloom: 0.1,
  quality: "auto",
  maxDevicePixelRatio: 1.5,
});
