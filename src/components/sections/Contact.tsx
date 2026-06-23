"use client";

import { useState } from "react";
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from "react-icons/fi";
import { PERSONAL } from "@/lib/constants";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";

type FormState = "idle" | "sending" | "sent" | "error";

const SOCIAL = [
  { label: "GitHub", href: PERSONAL.github, Icon: FiGithub },
  { label: "LinkedIn", href: PERSONAL.linkedin, Icon: FiLinkedin },
  { label: "Twitter / X", href: PERSONAL.twitter, Icon: FiTwitter },
  { label: "Email", href: `mailto:${PERSONAL.email}`, Icon: FiMail },
];

const inputBase =
  "w-full bg-bg-elevated border border-nord-border/60 rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-frost/60 focus:ring-1 focus:ring-frost/30 transition-colors";

export default function Contact() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value, // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Terjadi kesalahan.");
      }
      setState("sent");
      form.reset();
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  }

  return (
    <SectionWrapper
      id="contact"
      eyebrow="Kontak"
      title="Mari Berkolaborasi"
      subtitle="Punya proyek menarik atau sekadar ingin ngobrol? Kirim pesan — saya akan balas sesegera mungkin."
    >
      <div className="grid lg:grid-cols-2 gap-10 mt-4">
        {/* Form */}
        <Reveal>
          <SpotlightCard className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} noValidate>
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute opacity-0 h-0 w-0 pointer-events-none"
              />

              <div className="flex flex-col gap-5">
                <div>
                  <label htmlFor="contact-name" className="block text-sm text-text-secondary mb-1.5">
                    Nama
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Nama lengkap Anda"
                    className={inputBase}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm text-text-secondary mb-1.5">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="email@anda.com"
                    className={inputBase}
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm text-text-secondary mb-1.5">
                    Pesan
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Ceritakan proyek atau pertanyaan Anda..."
                    className={`${inputBase} resize-none`}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  shimmer
                  disabled={state === "sending" || state === "sent"}
                  className="w-full justify-center"
                >
                  {state === "sending"
                    ? "Mengirim..."
                    : state === "sent"
                      ? "Terkirim ✓"
                      : "Kirim Pesan"}
                </Button>
              </div>
            </form>

            {/* Status messages */}
            <div role="status" aria-live="polite" aria-atomic="true" className="mt-4">
              {state === "sent" && (
                <p className="text-sm text-aurora-green bg-aurora-green/10 border border-aurora-green/20 rounded-lg px-4 py-3">
                  Pesan berhasil terkirim! Saya akan segera menghubungi Anda.
                </p>
              )}
              {state === "error" && (
                <p className="text-sm text-aurora-red bg-aurora-red/10 border border-aurora-red/20 rounded-lg px-4 py-3">
                  {errorMsg || "Gagal mengirim pesan. Coba lagi nanti."}
                </p>
              )}
            </div>
          </SpotlightCard>
        </Reveal>

        {/* Social links */}
        <Reveal delay={0.15} className="flex flex-col gap-6">
          <div>
            <h3 className="text-text-primary font-semibold mb-2">Atau hubungi langsung</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Temukan saya di platform berikut. Respons paling cepat melalui email atau LinkedIn.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                rel="noopener noreferrer"
                target={href.startsWith("mailto") ? undefined : "_blank"}
                className="flex items-center gap-4 p-4 rounded-xl border border-nord-border/40 hover:border-frost/30 bg-bg-elevated/30 hover:bg-bg-elevated/60 text-text-muted hover:text-text-secondary transition-all duration-200 group"
              >
                <span className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted group-hover:text-frost transition-colors flex-shrink-0">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionWrapper>
  );
}
