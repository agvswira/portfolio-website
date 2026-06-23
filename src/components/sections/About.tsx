import { FiMapPin } from "react-icons/fi";
import { PERSONAL, TIMELINE } from "@/lib/constants";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";
import RevealGroup from "@/components/motion/RevealGroup";

const ABOUT_STATS = [
  { label: "Tahun Belajar", value: "1+" },
  { label: "Proyek", value: "2" },
  { label: "Artikel", value: "1" },
  { label: "Tech Stack Dikuasai", value: "10+" },
];

export default function About() {
  return (
    <SectionWrapper
      id="about"
      eyebrow="Tentang Saya"
      title={`Halo, saya ${PERSONAL.name} 👋`}
      subtitle="Mahasiswa yang percaya teknologi bisa dipelajari siapa saja — asal punya rasa penasaran dan semangat untuk terus berkembang."
      className="bg-transparent"
    >
      <div className="grid lg:grid-cols-2 gap-12 items-start mt-8">
        {/* Left — Profile card */}
        <Parallax speed={-0.12}>
          <Reveal>
            <SpotlightCard className="p-8">
              {/* Profile photo — ganti src ke foto asli saat tersedia */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-frost/20 to-frost-deep/30 border border-nord-border/50 flex items-center justify-center mb-6 overflow-hidden">
                <span className="text-2xl font-semibold text-frost/60 select-none">
                  {PERSONAL.fullName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 3)
                    .join("")}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-text-primary mb-1">{PERSONAL.fullName}</h3>
              <p className="text-frost text-sm font-medium mb-4">{PERSONAL.role}</p>

              <div className="flex flex-wrap gap-3 mb-5 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <FiMapPin size={14} aria-hidden="true" />
                  {PERSONAL.location}
                </span>
              </div>

              <p className="text-text-muted text-sm leading-relaxed mb-6">{PERSONAL.bio}</p>

              {/* Stat grid */}
              <div className="grid grid-cols-2 gap-3">
                {ABOUT_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="bg-bg-elevated/60 rounded-lg p-3 border border-nord-border/30"
                  >
                    <p className="text-xl font-bold text-text-primary">{s.value}</p>
                    <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>
        </Parallax>

        {/* Right — Timeline */}
        <div>
          <Reveal className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Perjalanan</h3>
          </Reveal>

          {TIMELINE.length > 0 ? (
            <RevealGroup selector=":scope > .timeline-item" stagger={0.12} className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-[11px] top-3 bottom-3 w-px bg-nord-border/40"
                aria-hidden="true"
              />

              {TIMELINE.map((item, i) => (
                <div key={i} className="timeline-item relative flex gap-5 pb-8 last:pb-0">
                  {/* Dot */}
                  <div className="relative flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-bg-elevated border-2 border-frost-deep flex items-center justify-center z-10 relative">
                      <div className="w-2 h-2 rounded-full bg-frost" />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <p className="eyebrow text-[10px] mb-1">{item.year}</p>
                    <p className="text-frost font-semibold text-sm leading-snug">{item.place}</p>
                    <h4 className="text-text-primary font-medium leading-snug mt-0.5">
                      {item.title}
                    </h4>
                    {item.desc && (
                      <p className="text-text-muted text-sm leading-relaxed mt-1">{item.desc}</p>
                    )}
                  </div>
                </div>
              ))}
            </RevealGroup>
          ) : (
            <Reveal>
              <p className="text-text-muted text-sm italic">
                Belum ada riwayat pengalaman untuk ditampilkan.
              </p>
            </Reveal>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
