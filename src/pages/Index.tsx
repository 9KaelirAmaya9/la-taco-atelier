import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-tacos.jpg";
import interiorImage from "@/assets/puebla-traditional.jpg";
import logo from "@/assets/logo-illustration.png";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Elegant tacos presentation" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 text-white text-balance leading-tight drop-shadow-2xl">
            {t("home.hero.title1")}
            <br />
            <span className="text-golden-yellow drop-shadow-lg">{t("home.hero.title2")}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto mb-8 sm:mb-12 font-light drop-shadow-lg px-4">
            {t("home.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4">
            <Link to="/order" className="w-full sm:w-auto">
              <Button variant="premium" size="lg" className="text-base font-semibold w-full sm:min-w-[200px]">
                {t("home.hero.orderNow")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/menu" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="text-base font-medium bg-white/95 hover:bg-white border-white text-foreground hover:text-foreground w-full sm:min-w-[200px]">
                {t("home.hero.viewMenu")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                {t("home.about.title1")}
                <br />
                <span className="text-primary">{t("home.about.title2")}</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                {t("home.about.p1")}
              </p>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                {t("home.about.p2")}
              </p>
              <Link to="/menu">
                <Button size="lg" className="mt-4 sm:mt-6 w-full sm:w-auto">
                  {t("home.about.exploreMenu")}
                </Button>
              </Link>
            </div>
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-elegant group">
              <img 
                src={interiorImage} 
                alt="Traditional Puebla restaurant interior" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              {t("home.why.title")} <span className="text-primary">{t("home.why.titleHighlight")}</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
              {t("home.why.subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-background p-6 sm:p-8 rounded-xl shadow-card hover:shadow-elegant transition-all duration-300 border border-border hover:border-primary/20 group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/15 transition-colors">
                <span className="text-3xl">🌮</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 group-hover:text-primary transition-colors">{t("home.feature1.title")}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {t("home.feature1.desc")}
              </p>
            </div>

            <div className="bg-background p-6 sm:p-8 rounded-xl shadow-card hover:shadow-elegant transition-all duration-300 border border-border hover:border-primary/20 group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/15 transition-colors">
                <span className="text-3xl">🚗</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 group-hover:text-primary transition-colors">{t("home.feature2.title")}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {t("home.feature2.desc")}
              </p>
            </div>

            <div className="bg-background p-6 sm:p-8 rounded-xl shadow-card hover:shadow-elegant transition-all duration-300 border border-border hover:border-primary/20 group sm:col-span-2 md:col-span-1">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/15 transition-colors">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 group-hover:text-primary transition-colors">{t("home.feature3.title")}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {t("home.feature3.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-br from-primary via-rico-red-dark to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4IDE5Ljk0IDAgMzYgMTYuMDYgMzYgMzYgMC05Ljk0LTguMDYtMTgtMTgtMTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
            {t("home.cta.title")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 text-white/95 max-w-2xl mx-auto drop-shadow-md px-4">
            {t("home.cta.subtitle")}
          </p>
          <Link to="/order">
            <Button size="lg" className="bg-white text-foreground hover:bg-white/90 text-base font-semibold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all w-full sm:w-auto sm:min-w-[200px]">
              {t("home.cta.startOrder")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8 sm:py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="Ricos Tacos" className="h-12 w-12 sm:h-16 sm:w-16" />
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#E31E24] mb-1">Ricos Tacos</h3>
                  {/* Colorful stripe pattern */}
                  <div className="h-2 flex">
                    <div className="flex-1" style={{ backgroundColor: '#E31E24' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#FF1493' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#92278F' }}></div>
                    <div className="w-1 bg-black"></div>
                    <div className="flex-1" style={{ backgroundColor: '#0071BC' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#57B947' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#FDB913' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#F68D2E' }}></div>
                    <div className="w-1 bg-black"></div>
                    <div className="flex-1" style={{ backgroundColor: '#E31E24' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#00BCD4' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#FF1493' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#92278F' }}></div>
                    <div className="w-1 bg-black"></div>
                    <div className="flex-1" style={{ backgroundColor: '#0071BC' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#57B947' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#FDB913' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#F68D2E' }}></div>
                    <div className="w-1 bg-black"></div>
                    <div className="flex-1" style={{ backgroundColor: '#E31E24' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#FF1493' }}></div>
                    <div className="flex-1" style={{ backgroundColor: '#92278F' }}></div>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                {t("home.footer.tagline1")}
                <br />
                {t("home.footer.tagline2")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t("home.footer.contact")}</h4>
              <p className="text-muted-foreground space-y-1 sm:space-y-2 text-sm sm:text-base">
                <span className="block">505 51st Street</span>
                <span className="block">Brooklyn, NY 11220</span>
                <span className="block">Tel: (718) 633-4816</span>
                <span className="block">Cell: (917) 370-0430</span>
              </p>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t("home.footer.hours")}</h4>
              <p className="text-muted-foreground space-y-1 sm:space-y-2 text-sm sm:text-base">
                <span className="block">{t("home.footer.openDays")}</span>
                <span className="block">{t("common.days")}</span>
                <span className="block">{t("common.hours")}</span>
              </p>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border text-center text-muted-foreground text-xs sm:text-sm">
            <p>&copy; {new Date().getFullYear()} Ricos Tacos. {t("home.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
