import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketCarousel } from "@/components/landing/MarketCarousel";
import { ValueHighlights } from "@/components/landing/ValueHighlights";
import { ExpertSection } from "@/components/landing/ExpertSection";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Built for Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-wider text-primary font-semibold mb-4">
              Excellence in Connection
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Built for Experts and Investors
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              A premium platform designed to facilitate meaningful connections and valuable insights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-shadow hover:card-shadow-hover transition-smooth border-2 hover:border-primary/50 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl w-fit mb-4">
                  <TrendingUp className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Expert Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Access exclusive stock analysis and investment strategies from verified market experts with proven track records.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-shadow hover:card-shadow-hover transition-smooth border-2 hover:border-primary/50 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl w-fit mb-4">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Direct Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Subscribe to multiple experts and receive personalized feedback tailored to your investment goals and portfolio.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-shadow hover:card-shadow-hover transition-smooth border-2 hover:border-primary/50 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl w-fit mb-4">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Enterprise-grade security with transparent pricing. Experts set their own fees; investors pay only for what they need.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Carousel */}
      <MarketCarousel />

      {/* Value Highlights */}
      <ValueHighlights />

      {/* Expert Section */}
      <ExpertSection />

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-wider text-primary font-semibold mb-4">
              Simple Process
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How NeuraBridge Works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">For Experts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-foreground">Create Profile</h4>
                    <p className="text-muted-foreground">Set up your expert profile with credentials and pricing</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-foreground">Publish Insights</h4>
                    <p className="text-muted-foreground">Share valuable investment insights with your subscribers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-foreground">Grow Audience</h4>
                    <p className="text-muted-foreground">Build your following and earn from your expertise</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">For Investors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-foreground">Browse Experts</h4>
                    <p className="text-muted-foreground">Discover verified experts that match your investment style</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-foreground">Subscribe & Pay</h4>
                    <p className="text-muted-foreground">Choose your experts and pay only for what you need</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-foreground">Get Insights</h4>
                    <p className="text-muted-foreground">Access exclusive insights and grow your investments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="card-shadow bg-gradient-to-br from-primary/10 via-accent/5 to-background border-2 border-primary/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardContent className="pt-12 pb-12 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to start your investment journey?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join NeuraBridge today as an Investor or Expert.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?type=investor">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                    Join as Investor
                  </Button>
                </Link>
                <Link to="/auth?type=expert">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-primary/5">
                    Join as Expert
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 NeuraBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
