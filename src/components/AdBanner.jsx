import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const adBanners = [
  {
    id: 1,
    title: "¡Black Friday Extendido!",
    subtitle: "Hasta 70% de descuento en miles de productos",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&h=400&fit=crop",
    bgColor: "from-black to-gray-800",
    textColor: "text-white",
    cta: "Ver ofertas",
    sponsored: "Patrocinado"
  },
  {
    id: 2,
    title: "Nuevos Restaurantes",
    subtitle: "Descubre sabores únicos cerca de ti",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=400&fit=crop",
    bgColor: "from-orange-500 to-red-500",
    textColor: "text-white",
    cta: "Explorar",
    sponsored: "Contenido promocional"
  },
  {
    id: 3,
    title: "Tecnología del Futuro",
    subtitle: "Los gadgets más innovadores al mejor precio",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=400&fit=crop",
    bgColor: "from-blue-600 to-purple-600",
    textColor: "text-white",
    cta: "Ver más",
    sponsored: "Patrocinado por TechWorld"
  },
  {
    id: 4,
    title: "Belleza y Bienestar",
    subtitle: "Cuida de ti con los mejores tratamientos",
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=400&fit=crop",
    bgColor: "from-pink-500 to-rose-500",
    textColor: "text-white",
    cta: "Reservar",
    sponsored: "Spa Premium Network"
  }
];

export default function AdBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === adBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? adBanners.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === adBanners.length - 1 ? 0 : currentIndex + 1);
  };

  const currentAd = adBanners[currentIndex];

  return (
    <div className="relative mb-6">
      <Card className="overflow-hidden shadow-lg border-none">
        <div 
          className="relative h-32 overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={{ backgroundImage: `url(${currentAd.image})` }}
          />
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentAd.bgColor} opacity-80`} />

          <CardContent className="relative p-4 h-full flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-white">
                  {currentAd.sponsored}
                </span>
              </div>
              <h3 className={`font-bold text-lg ${currentAd.textColor} leading-tight`}>
                {currentAd.title}
              </h3>
              <p className={`text-sm ${currentAd.textColor} opacity-90 mt-1`}>
                {currentAd.subtitle}
              </p>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all"
            >
              {currentAd.cta}
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>

          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-8 w-8"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-8 w-8"
            onClick={goToNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Indicators */}
      <div className="flex justify-center space-x-2 mt-3">
        {adBanners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-orange-500 w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}