import { Button } from "@/components/ui/button";
import { Globe2 } from "lucide-react";

const scrollToValueHighlights = () => {
  const element = document.getElementById("value-highlights");
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 lg:px-8 pt-20 md:pt-24 pb-16 md:pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                Connect. Learn. Grow.
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Bridge Knowledge,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Unlock Financial Growth
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Connect with verified financial experts worldwide. Get personalized insights,
              mentorship, and guided learning to accelerate your investment journey.
            </p>
            
            <Button
              size="lg"
              onClick={scrollToValueHighlights}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Button>
          </div>

          {/* Right Visual */}
          <div className="relative animate-fade-in">
            <div className="relative z-10 bg-card rounded-2xl p-8 shadow-2xl border">
              <div className="flex items-center space-x-3 mb-6">
                <Globe2 className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">Global Network</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <span className="font-medium">Active Experts</span>
                  <span className="text-2xl font-bold text-primary">500+</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <span className="font-medium">Success Stories</span>
                  <span className="text-2xl font-bold text-accent">2,500+</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <span className="font-medium">Markets Covered</span>
                  <span className="text-2xl font-bold text-primary">50+</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
            
            {/* Animated Grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse-glow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
