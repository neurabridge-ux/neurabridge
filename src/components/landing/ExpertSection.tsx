import { Card, CardContent } from "@/components/ui/card";
import { Globe, TrendingUp, MessageCircle, Lightbulb } from "lucide-react";

const expertBenefits = [
  {
    icon: Globe,
    title: "Connect with Investors, Savers, and Enthusiasts Globally",
  },
  {
    icon: TrendingUp,
    title: "Aid, provide insights & track audience growth seamlessly",
  },
  {
    icon: MessageCircle,
    title: "Connect easily with your subscribers",
  },
  {
    icon: Lightbulb,
    title: "Share insights, sell materials, and offer mentorship sessions — all in one organized system",
  },
];

export const ExpertSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 relative overflow-hidden">
      {/* Animated Background Chart */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 400">
          <path
            d="M0,300 Q250,200 500,250 T1000,200"
            stroke="hsl(145 45% 35%)"
            strokeWidth="2"
            fill="none"
            className="animate-float"
          />
          <path
            d="M0,320 Q250,220 500,270 T1000,220"
            stroke="hsl(145 45% 35%)"
            strokeWidth="2"
            fill="none"
            className="animate-float-delayed"
            opacity="0.5"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            For Experts — Build, Earn, and Grow
          </h2>
          <p className="text-lg text-muted-foreground">
            Turn your expertise into a thriving community
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {expertBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="card-shadow hover:card-shadow-hover transition-smooth hover:scale-105"
              >
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-foreground leading-relaxed">
                      {benefit.title}
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
