import { ContactSection } from "@/components/site/contact-section";
import { ExperienceSection } from "@/components/site/experience-section";
import { HeroSection } from "@/components/site/hero-section";
import { HyperspeedBackground } from "@/components/site/hyperspeed-background";
import { SiteNavbar } from "@/components/site/navbar";
import { ProjectsSection } from "@/components/site/projects-section";
import { SkillsSection } from "@/components/site/skills-section";
import { profile } from "@/lib/site-data";

export default function Home() {
  return (
    <>
      <HyperspeedBackground />
      {/* Navbar is sticky, sits outside the scroll container */}
      <SiteNavbar />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <main className="flex-1">
          <HeroSection />
          <ExperienceSection />
          <SkillsSection />
          <ProjectsSection />
          <ContactSection />
        </main>
        <footer className="page-wrap site-footer flex flex-col justify-between gap-4 border-t border-border/40 py-8 md:flex-row md:items-center">
          <div className="flex items-center">
            <span className="serif text-2xl font-normal italic tracking-tight text-foreground">
              h<span className="text-primary not-italic font-mono">_</span>
            </span>
          </div>
          <p className="serif italic text-sm text-foreground/75 text-center">
            &ldquo;{profile.hindiQuote}&rdquo;
          </p>
          <span className="mono text-[0.68rem] text-muted-foreground/80 md:text-right">
            {profile.tag} · © {new Date().getFullYear()}
          </span>
        </footer>
      </div>
    </>
  );
}
