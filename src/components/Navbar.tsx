import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import neurabridgeLogo from "@/assets/neurabridge-logo.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = () => {
    navigate("/auth?mode=login");
  };

  const handleGetStarted = () => {
    navigate("/auth?mode=signup");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <img
              src={neurabridgeLogo}
              alt="NeuraBridge Logo"
              className="h-8 md:h-10 w-auto"
            />
          </button>

          <div className="flex-1" />

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleLogin}>
              Login
            </Button>
            <Button
              size="sm"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-accent to-accent/90 text-accent-foreground hover:shadow-lg transition-all"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-3 mt-8">
                <Button variant="outline" className="w-full" onClick={handleLogin}>
                  Login
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-accent to-accent/90 text-accent-foreground"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
