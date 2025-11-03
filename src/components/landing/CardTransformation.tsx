import { useState, useEffect } from "react";
import { Users, TrendingUp } from "lucide-react";
import neuraBridgeLogo from "@/assets/neurabridge-logo.png";

export const CardTransformation = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 1000);
    const timer2 = setTimeout(() => setStage(2), 2500);
    const timer3 = setTimeout(() => setStage(3), 4000);
    const timer4 = setTimeout(() => setStage(0), 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [stage]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-4xl mx-auto">
        <div className="relative h-64 flex items-center justify-center">
          {/* Investors Card */}
          <div
            className={`absolute transition-all duration-1000 ${
              stage === 0 || stage === 1
                ? "opacity-100 -translate-x-32"
                : "opacity-0 translate-x-0 scale-75"
            }`}
          >
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6 w-48 shadow-xl">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Investors</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Seeking Expert Guidance
                </p>
              </div>
            </div>
          </div>

          {/* Experts Card */}
          <div
            className={`absolute transition-all duration-1000 ${
              stage === 0 || stage === 1
                ? "opacity-100 translate-x-32"
                : "opacity-0 translate-x-0 scale-75"
            }`}
          >
            <div className="bg-gradient-to-br from-[hsl(164,59%,49%)]/20 to-[hsl(164,59%,49%)]/10 backdrop-blur-sm border-2 border-[hsl(164,59%,49%)]/30 rounded-2xl p-6 w-48 shadow-xl">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-[hsl(164,59%,49%)]/20 rounded-full">
                  <TrendingUp className="h-8 w-8 text-[hsl(164,59%,49%)]" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Experts</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Sharing Market Insights
                </p>
              </div>
            </div>
          </div>

          {/* Merged/Connecting State */}
          {stage === 2 && (
            <div className="absolute transition-all duration-700 opacity-100">
              <div className="bg-gradient-to-br from-primary/30 via-[hsl(164,59%,49%)]/30 to-accent/30 backdrop-blur-md border-2 border-accent/50 rounded-2xl p-6 w-56 shadow-2xl animate-pulse-glow">
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex gap-2">
                    <div className="p-2 bg-primary/30 rounded-full">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="p-2 bg-[hsl(164,59%,49%)]/30 rounded-full">
                      <TrendingUp className="h-6 w-6 text-[hsl(164,59%,49%)]" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-foreground">Connecting...</h3>
                </div>
              </div>
            </div>
          )}

          {/* NeuraBridge Card - Final State */}
          <div
            className={`absolute transition-all duration-1000 ${
              stage === 3 ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
          >
            <div className="bg-gradient-to-br from-primary/10 via-[hsl(164,59%,49%)]/10 to-accent/10 backdrop-blur-lg border-2 border-accent rounded-3xl p-8 w-72 shadow-2xl">
              <div className="flex flex-col items-center space-y-4">
                <img 
                  src={neuraBridgeLogo} 
                  alt="NeuraBridge" 
                  className="h-12 w-auto"
                />
                <h2 className="font-bold text-2xl text-foreground">NeuraBridge</h2>
                <p className="text-sm text-muted-foreground text-center font-medium">
                  Connected Growth
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <div className="h-2 w-2 rounded-full bg-[hsl(164,59%,49%)] animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
