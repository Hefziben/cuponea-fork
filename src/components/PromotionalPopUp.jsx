import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Gift } from "lucide-react";

export default function PromotionalPopUp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopUp = sessionStorage.getItem('promoPopUpSeen');
    if (!hasSeenPopUp) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('promoPopUpSeen', 'true');
      }, 3000); // Show popup after 3 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80" 
            alt="Promotional offer" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 text-center space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600">¡Oferta Exclusiva para Ti!</DialogTitle>
            <DialogDescription className="text-gray-600">
              Disfruta de un <strong>50% de descuento</strong> en tu primera orden en "El Buen Sabor".
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            ¡No dejes pasar esta oportunidad única! Válido solo por tiempo limitado.
          </p>
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white"
            onClick={() => setIsOpen(false)}
          >
            <Gift className="mr-2 h-4 w-4" />
            ¡Lo Quiero!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}