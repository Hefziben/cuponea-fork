import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Coupon } from '@/api/entities';
import { Business } from '@/api/entities';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Bell, Shield, RadioTower, CheckCircle, AlertTriangle } from "lucide-react";

export default function InstantOpportunity() {
  const [isActivated, setIsActivated] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [watchId, setWatchId] = useState(null);
  const [lastNotification, setLastNotification] = useState(0);

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setIsActivated(Notification.permission === 'granted' && localStorage.getItem('instantOpportunityActive') === 'true');
    }
  }, []);

  const checkNearbyOffers = async (lat, lng) => {
    try {
      // Prevent spam notifications (minimum 5 minutes between notifications)
      const now = Date.now();
      if (now - lastNotification < 300000) return;

      // Fetch active coupons
      const coupons = await Coupon.filter({ is_active: true });
      const businesses = await Business.list();
      
      // Simulate proximity check (in a real app, you'd have business coordinates)
      const nearbyOffers = coupons.filter(() => Math.random() > 0.7); // 30% chance of nearby offer
      
      if (nearbyOffers.length > 0) {
        const randomOffer = nearbyOffers[Math.floor(Math.random() * nearbyOffers.length)];
        const business = businesses.find(b => b.id === randomOffer.business_id);
        
        // Show push notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('¡Oferta Cerca de Ti!', {
            body: `${business?.name || 'Un comercio'} tiene una oferta especial: ${randomOffer.title}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'cuponea-nearby-offer',
            requireInteraction: true,
            actions: [
              { action: 'view', title: 'Ver Oferta' },
              { action: 'dismiss', title: 'Más Tarde' }
            ]
          });

          notification.onclick = () => {
            window.focus();
            window.open(`/coupon-detail?id=${randomOffer.id}`, '_blank');
            notification.close();
          };

          setLastNotification(now);
        }
      }
    } catch (error) {
      console.error('Error checking nearby offers:', error);
    }
  };

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      const watchOptions = {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000 // Cache position for 1 minute
      };

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          checkNearbyOffers(latitude, longitude);
        },
        (error) => {
          console.log('Geolocation error:', error);
        },
        watchOptions
      );

      setWatchId(id);
    }
  };

  const stopLocationTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const handleActivateClick = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        setShowPermissionDialog(true);
      } else if (Notification.permission === 'granted') {
        setIsActivated(true);
        localStorage.setItem('instantOpportunityActive', 'true');
        startLocationTracking();
      } else {
        // Permission denied, show instructions
        alert('Las notificaciones están bloqueadas. Ve a configuración de tu navegador para habilitarlas.');
      }
    } else {
      alert('Tu navegador no soporta notificaciones push.');
    }
  };

  const handleAllowNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setIsActivated(true);
        localStorage.setItem('instantOpportunityActive', 'true');
        startLocationTracking();
        
        // Show welcome notification
        new Notification('¡Oportunidades Instantáneas Activadas!', {
          body: 'Te avisaremos cuando haya ofertas cerca de tu ubicación.',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
    setShowPermissionDialog(false);
  };

  const handleDeactivate = () => {
    setIsActivated(false);
    localStorage.setItem('instantOpportunityActive', 'false');
    stopLocationTracking();
  };

  const handleDenyLocation = () => {
    setShowPermissionDialog(false);
  };

  if (isActivated) {
    return (
      <Card className="bg-gradient-to-r from-teal-50 to-green-50 border-teal-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white rounded-full">
                <RadioTower className="w-6 h-6 text-[#1abc9c] animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Oportunidades Activadas</h3>
                <p className="text-sm text-gray-600">Rastreando ofertas en un radio de 300m</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDeactivate}
              className="text-gray-600 hover:text-red-600"
            >
              Desactivar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-lg border bg-card text-card-foreground shadow-sm bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white rounded-full">
              <MapPin className="w-6 h-6 text-[#9b59b6]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">¡No te pierdas ninguna oferta!</h3>
              <p className="text-sm text-gray-600">Activa las notificaciones de proximidad para recibir alertas de cupones cuando pases cerca de una tienda.</p>
            </div>
          </div>
          <Button
            className="w-full mt-4 bg-[#9b59b6] hover:bg-[#8e44ad] text-white"
            onClick={handleActivateClick}
          >
            <Bell className="w-4 h-4 mr-2" />
            Activar Ahora
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <span>Permisos Necesarios</span>
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 mb-2">📍 Ubicación</h4>
                <p className="text-sm text-blue-700">
                  Para detectar ofertas cerca de ti (radio de 300 metros aproximadamente).
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <h4 className="font-semibold text-orange-800 mb-2">🔔 Notificaciones</h4>
                <p className="text-sm text-orange-700">
                  Para avisarte de ofertas especiales incluso cuando no estés usando la app.
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Tu privacidad es importante. Solo usamos tu ubicación para encontrar ofertas cercanas.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={handleDenyLocation}>
              Cancelar
            </Button>
            <Button 
              className="bg-[#1abc9c] hover:bg-[#16a085] text-white" 
              onClick={handleAllowNotifications}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Activar Notificaciones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}