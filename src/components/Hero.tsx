import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const scrollToValueHighlights = () => {
    const element = document.querySelector("#value-highlights");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="min-h-screen flex items-center pt-20 pb-12 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in-up">
            <p className="text-xs md:text-sm uppercase tracking-wide text-muted-foreground font-medium">
              Because growth needs guidance
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Bridge Knowledge,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Unlock Financial Growth
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl">
              NeuraBridge connects investors with financial experts worldwide — turning
              market insights into daily growth, mentorship, and smarter investing.
            </p>
            <Button
              onClick={scrollToValueHighlights}
              size="lg"
              className="bg-gradient-to-r from-accent to-accent/90 text-accent-foreground hover:scale-105 hover:shadow-lg transition-all animate-pulse-glow group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Visual */}
          <div className="relative animate-slide-in-right">
            <div className="relative z-10 bg-card border rounded-2xl p-8 shadow-xl animate-float">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Global Network</h3>
                  <p className="text-sm text-muted-foreground">
                    Connected Worldwide
                  </p>
                </div>
              </div>
              
              {/* Animated Grid */}
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-border animate-fade-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Background Blur Effects */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
