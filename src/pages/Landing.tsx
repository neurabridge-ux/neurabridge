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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Built for Experts and Investors
            </h2>
            <p className="text-lg text-muted-foreground">
              A premium platform designed to facilitate meaningful connections and valuable insights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-shadow hover:card-shadow-hover transition-smooth">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Expert Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Access exclusive stock analysis and investment strategies from verified market experts with proven track records.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-shadow hover:card-shadow-hover transition-smooth">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Direct Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Subscribe to multiple experts and receive personalized feedback tailored to your investment goals and portfolio.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-shadow hover:card-shadow-hover transition-smooth">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
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
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
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
          <Card className="card-shadow bg-primary/5 border-primary/20">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to start your investment journey?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join NeuraBridge today as an Investor or Expert.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?type=investor">
                  <Button size="lg" className="w-full sm:w-auto">Join as Investor</Button>
                </Link>
                <Link to="/auth?type=expert">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">Join as Expert</Button>
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
