import LandingHero from "@/components/elements/landing-hero";
import AiExperience from "@/components/sections/ai-experience";
import CharacterMarket from "@/components/sections/character-market";
import BuildUniverses from "@/components/sections/build-universes";
import TrustTransparency from "@/components/sections/trust-transparency";
import AboutSection from "@/components/sections/about-section";
import BlogSection from "@/components/sections/blog-section";
import CtaSection from "@/components/sections/cta-section";

export default function Home() {

  return (
    <>
      <LandingHero />
      <section id="about" className="w-full">
        <AboutSection />
      </section>
      <AiExperience />
      <section id="market" className="w-full">
        <CharacterMarket />
      </section>
      <BuildUniverses />
      <section id="blog" className="w-full">
        <BlogSection />
      </section>
      <TrustTransparency />
      <CtaSection />
    </>
  );
}
