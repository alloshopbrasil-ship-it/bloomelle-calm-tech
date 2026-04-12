import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Purpose from "@/components/Purpose";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Community from "@/components/Community";
import Plans from "@/components/Plans";
import Testimonials from "@/components/Testimonials";
import ScienceSection from "@/components/ScienceSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Navbar />
      <div id="home">
        <Hero />
      </div>
      <Purpose />
      <HowItWorks />
      <div id="features">
        <Features />
      </div>
      <div id="community">
        <Community />
      </div>
      <div id="plans">
        <Plans />
      </div>
      <Testimonials />
      <ScienceSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
