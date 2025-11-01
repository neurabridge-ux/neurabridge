import { CheckCircle2, Users, Globe } from "lucide-react";

const ExpertsSection = () => {
  const features = [
    {
      icon: CheckCircle2,
      title: "Verified Credentials",
      description: "Every expert undergoes rigorous verification to ensure credibility.",
    },
    {
      icon: Users,
      title: "Diverse Expertise",
      description: "Access specialists across stocks, crypto, forex, and more.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with experts from leading financial markets worldwide.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 lg:px-8 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet Our Experts
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Learn from professionals who have mastered the art of investing
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-xl bg-card border hover:border-primary transition-all duration-300 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertsSection;
