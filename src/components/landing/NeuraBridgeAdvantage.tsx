import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Globe, DollarSign } from "lucide-react";

const advantages = [
  {
    icon: Shield,
    title: "Verified Expertise",
    description: "Every expert is thoroughly vetted for credibility and performance, giving you confidence in every connection.",
  },
  {
    icon: Zap,
    title: "Real-Time Interaction",
    description: "Get instant responses and live insights. Stay connected with your chosen experts through seamless communication tools.",
  },
  {
    icon: Globe,
    title: "Global Visibility",
    description: "Experts gain worldwide exposure, while investors access diverse perspectives from emerging and established markets.",
  },
  {
    icon: DollarSign,
    title: "Monetize Insights",
    description: "Turn knowledge into income. Experts earn through courses, consultations, and premium materials.",
  },
];

export const NeuraBridgeAdvantage = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            The NeuraBridge Advantage
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            A platform built on trust, expertise, and seamless connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <Card
                key={index}
                className="bg-card border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-8 flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-[hsl(164,59%,49%)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold text-foreground">{advantage.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {advantage.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
