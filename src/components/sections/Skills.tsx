import { SKILL_GROUPS, TECH_MARQUEE } from "@/lib/data/skills";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SpotlightCard from "@/components/ui/SpotlightCard";
import MarqueeComp from "@/components/ui/Marquee";
import RevealGroup from "@/components/motion/RevealGroup";

export default function Skills() {
  return (
    <SectionWrapper
      id="skills"
      eyebrow="Keahlian"
      title="Stack & Teknologi"
      subtitle="Tools dan teknologi yang saya gunakan sehari-hari untuk membangun produk berkualitas."
    >
      {/* Marquee strip */}
      <div className="mb-14 -mx-6">
        <MarqueeComp baseSpeed={0.45} className="py-3">
          {TECH_MARQUEE.map(({ name, icon: Icon }) => (
            <div
              key={name}
              className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-bg-elevated border border-nord-border/40 text-sm text-text-muted whitespace-nowrap select-none"
            >
              <Icon size={16} aria-hidden="true" className="text-frost-blue flex-shrink-0" />
              {name}
            </div>
          ))}
        </MarqueeComp>
      </div>

      {/* Skill groups grid */}
      <RevealGroup batch selector=".skill-group" stagger={0.08}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SKILL_GROUPS.map((group) => (
            <SpotlightCard key={group.category} className="skill-group p-5">
              <h3 className="eyebrow text-[11px] mb-4">{group.category}</h3>
              <div className="grid grid-cols-3 gap-3">
                {group.items.map(({ name, icon: Icon }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-bg-elevated/40 hover:bg-bg-elevated border border-transparent hover:border-frost/20 transition-all duration-200 group"
                    title={name}
                  >
                    <Icon
                      size={22}
                      aria-hidden="true"
                      className="text-text-muted group-hover:text-frost transition-colors"
                    />
                    <span className="text-[10px] text-text-muted text-center leading-tight group-hover:text-text-secondary transition-colors">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          ))}
        </div>
      </RevealGroup>
    </SectionWrapper>
  );
}
