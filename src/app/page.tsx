import Backdrop from "@/components/backdrop/Backdrop";
import SmoothScroll from "@/components/motion/SmoothScroll";
import ScrollProgress from "@/components/motion/ScrollProgress";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import BlogSection from "@/components/sections/BlogSection";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

export default function Home() {
  return (
    <>
      {/* Background: clean Polar Night wash, z-0 */}
      <Backdrop />

      <SmoothScroll>
        {/* Scroll progress bar (Frost, z-50) */}
        <ScrollProgress />

        {/* Sticky navbar (z-40) */}
        <Navbar />

        {/* Main content (z-10) */}
        <main id="main">
          {/* Hero wraps HeroScene — parallax mountains + pin/scrub */}
          <Hero />

          {/* About receives handoff from HeroScene (z-10 > HeroScene z-5) */}
          <About />

          <Skills />
          <Projects />
          <BlogSection />
          <Contact />
        </main>

        <Footer />
      </SmoothScroll>

      {/* Chat widget — floating, outside scroll wrapper */}
      <ChatWidget />
    </>
  );
}
