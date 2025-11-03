import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Lightbulb } from "lucide-react";

const expertBenefits = [
  {
    icon: TrendingUp,
    title: "Grow Your Reach",
    description: "Build your reputation and reach thousands of potential clients.",
  },
  {
    icon: Users,
    title: "Engage Globally",
    description: "Connect with investors from around the world seeking your expertise.",
  },
  {
    icon: Lightbulb,
    title: "Monetize Knowledge",
    description: "Turn your insights into income through consultations and materials.",
  },
];

export const ExpertSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/30 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            For Experts — <span className="text-primary">Build, Earn,</span> and <span className="text-primary">Grow</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with investors, savers, and enthusiasts globally. Provide insights, sell materials, and offer mentorship — all in one organized system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {expertBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="bg-card border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-[hsl(164,59%,49%)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
