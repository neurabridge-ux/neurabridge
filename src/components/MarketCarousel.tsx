import { TrendingUp, Bitcoin, PieChart, Package, FileText, DollarSign, Wallet, Building2, Wheat } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";

const MarketCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const markets = [
    { name: "Stocks", icon: TrendingUp },
    { name: "Crypto", icon: Bitcoin },
    { name: "ETFs", icon: PieChart },
    { name: "Commodities", icon: Package },
    { name: "Bonds", icon: FileText },
    { name: "Forex", icon: DollarSign },
    { name: "Mutual Funds", icon: Wallet },
    { name: "REITs", icon: Building2 },
    { name: "Agro Commodities", icon: Wheat },
  ];

  useEffect(() => {
    if (!emblaApi) return;

    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [emblaApi]);

  return (
    <section className="py-16 md:py-24 px-4 lg:px-8 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Markets Across the Globe
          </h2>
        </div>

        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex gap-8">
            {[...markets, ...markets].map((market, index) => {
              const Icon = market.icon;
              return (
                <div
                  key={index}
                  className="flex-[0_0_auto] w-[380px] md:w-[450px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-10 md:p-12 border hover:scale-105 transition-transform select-none"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-2xl mb-3">{market.name}</h3>
                      <p className="text-lg text-muted-foreground">
                        Explore experts
                      </p>
                    </div>
                    <Icon className="h-12 w-12 text-primary" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketCarousel;
