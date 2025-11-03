import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Bitcoin, DollarSign, FileText, Package, LineChart, BarChart3, TrendingUp, Wheat, Activity } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

const markets = [
  {
    icon: Bitcoin,
    title: "Crypto",
  },
  {
    icon: DollarSign,
    title: "Forex",
  },
  {
    icon: LineChart,
    title: "ETFs",
  },
  {
    icon: Package,
    title: "Commodities",
  },
  {
    icon: FileText,
    title: "Bonds",
  },
  {
    icon: TrendingUp,
    title: "Mutual Funds",
  },
  {
    icon: BarChart3,
    title: "Stocks",
  },
  {
    icon: Wheat,
    title: "Agro",
  },
  {
    icon: Activity,
    title: "Indices",
  },
];

export const MarketCarousel = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Explore <span className="text-accent">Every Market</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            From traditional stocks to emerging crypto — find experts across all financial categories.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 2500,
              stopOnInteraction: false,
            }),
          ]}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {markets.map((market, index) => {
              const Icon = market.icon;
              return (
                <CarouselItem key={index} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                  <Card className="border-2 border-border hover:border-primary/50 bg-card hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="p-4 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">{market.title}</h3>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="left-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
