import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, GraduationCap, Globe, MessageCircle } from "lucide-react";

const highlights = [
  {
    icon: Lightbulb,
    title: "Expert Insights",
    description: "Access exclusive market guidance from verified professionals",
    delay: "0s",
  },
  {
    icon: GraduationCap,
    title: "Guided Learning",
    description: "Learn directly from experts through materials and mentorship",
    delay: "0.2s",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Discover experts across stocks, crypto, forex, and more",
    delay: "0.4s",
  },
  {
    icon: MessageCircle,
    title: "1-on-1 Sessions",
    description: "Book personal mentorship sessions to level up your investment journey",
    delay: "0.6s",
  },
];

export const ValueHighlights = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Why Choose NeuraBridge
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to succeed in your investment journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <Card
                key={index}
                className="card-shadow hover:card-shadow-hover hover:scale-105 transition-all duration-500 group cursor-pointer"
                style={{ animationDelay: highlight.delay }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:animate-pulse-glow transition-all">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{highlight.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {highlight.description}
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
