import { Shield, Users, TrendingUp, Award } from "lucide-react";

const ValueHighlights = () => {
  const values = [
    {
      icon: Shield,
      title: "Verified Experts",
      description: "All experts are thoroughly vetted and certified professionals.",
    },
    {
      icon: Users,
      title: "Personalized Learning",
      description: "Get 1-on-1 mentorship tailored to your investment goals.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Insights",
      description: "Access market analysis and actionable insights instantly.",
    },
    {
      icon: Award,
      title: "Proven Track Record",
      description: "Join thousands of successful investors in our community.",
    },
  ];

  return (
    <section id="value-highlights" className="py-16 md:py-24 px-4 lg:px-8 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Investors Choose NeuraBridge
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience a new way to learn and grow your wealth with expert guidance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-card border hover:border-primary transition-all duration-300 hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <value.icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueHighlights;
