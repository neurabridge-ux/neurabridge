import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ValueHighlights from "@/components/ValueHighlights";
import MarketCarousel from "@/components/MarketCarousel";
import ExpertsSection from "@/components/ExpertsSection";
import WhyChoose from "@/components/WhyChoose";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ValueHighlights />
      <MarketCarousel />
      <ExpertsSection />
      <WhyChoose />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Landing;
