import { Sparkles, Target, Zap, Heart } from "lucide-react";

const WhyChoose = () => {
  const benefits = [
    {
      icon: Sparkles,
      title: "Simplified Learning",
      description: "Complex financial concepts made easy through expert guidance.",
    },
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Achieve your financial objectives with structured mentorship.",
    },
    {
      icon: Zap,
      title: "Quick Results",
      description: "See improvements in your investment strategy within weeks.",
    },
    {
      icon: Heart,
      title: "Trusted Community",
      description: "Join a supportive network of like-minded investors.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 lg:px-8 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose NeuraBridge?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We bridge the gap between knowledge and success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-card border hover:border-accent transition-all duration-300 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <benefit.icon className="h-10 w-10 text-accent mb-4" />
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
