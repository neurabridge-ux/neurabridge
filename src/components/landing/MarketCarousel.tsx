import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TrendingUp, Bitcoin, DollarSign, FileText, Package, LineChart, BarChart3, Building } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

const markets = [
  {
    icon: TrendingUp,
    title: "Stocks",
    description: "Connect with expert equity analysts and traders",
  },
  {
    icon: Bitcoin,
    title: "Crypto",
    description: "Discover top-performing crypto analysts",
  },
  {
    icon: DollarSign,
    title: "Forex",
    description: "Learn from experienced currency traders",
  },
  {
    icon: FileText,
    title: "Bonds",
    description: "Get insights from fixed-income specialists",
  },
  {
    icon: Package,
    title: "Commodities",
    description: "Access commodity market expertise",
  },
  {
    icon: LineChart,
    title: "ETFs",
    description: "Follow diversified portfolio strategists",
  },
  {
    icon: BarChart3,
    title: "Indices",
    description: "Track market trends with index experts",
  },
  {
    icon: Building,
    title: "REITs",
    description: "Explore real estate investment insights",
  },
];

export const MarketCarousel = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Access Experts Across Diverse Markets
          </h2>
          <p className="text-lg text-muted-foreground">
            Whatever your investment focus, find the right expertise here
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent>
            {markets.map((market, index) => {
              const Icon = market.icon;
              return (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <Card className="card-shadow hover:card-shadow-hover transition-smooth">
                      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="p-4 rounded-full bg-primary/10">
                          <Icon className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">{market.title}</h3>
                        <p className="text-sm text-muted-foreground">{market.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};
