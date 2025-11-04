import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MarketCarousel } from "@/components/landing/MarketCarousel";
import { ValueHighlights } from "@/components/landing/ValueHighlights";
import { ExpertSection } from "@/components/landing/ExpertSection";
import { NeuraBridgeAdvantage } from "@/components/landing/NeuraBridgeAdvantage";
import { CardTransformation } from "@/components/landing/CardTransformation";
import { PublicInsightsPreview } from "@/components/landing/PublicInsightsPreview";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Linkedin, Twitter, Youtube, Send, ArrowRight } from "lucide-react";
import neuraBridgeLogo from "@/assets/neurabridge-logo.png";

const Landing = () => {
return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      {/* Card Transformation Animation */}
      <CardTransformation />


      {/* Market Carousel */}
      <MarketCarousel />

      {/* Value Highlights */}
      <ValueHighlights />

      {/* Expert Section */}
      <ExpertSection />

      {/* NeuraBridge Advantage */}
      <NeuraBridgeAdvantage />

      {/* Public Insights Preview */}
      <PublicInsightsPreview />

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary/20 via-background to-primary/5">
        <div className="max-w-5xl mx-auto">
          <Card className="border-2 border-accent/30 shadow-2xl bg-gradient-to-br from-background via-secondary/10 to-accent/5">
            <CardContent className="pt-16 pb-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Ready to grow your wealth with guidance that feels personal?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                Join NeuraBridge today — where every insight connects you closer to your goals.
              </p>
              <Link to="/auth">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all group">
                  Join the Network
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <img src={neuraBridgeLogo} alt="NeuraBridge" className="h-8 w-auto mb-4" />
              <p className="text-sm text-muted-foreground">© 2025 NeuraBridge Technologies Ltd. All Rights Reserved.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>About</p>
                <p>Experts</p>
                <p>Marketplace</p>
                <p>Contact</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Youtube className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Send className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
