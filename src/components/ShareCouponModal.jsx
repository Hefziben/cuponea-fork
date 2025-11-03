import React, { useState } from "react";
import { SharedCoupon } from "@/api/entities";
import { User } from "@/api/entities";
import { UserPreference } from "@/api/entities";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Share, Gift, Send, Loader2, Bell } from "lucide-react";

export default function ShareCouponModal({ coupon, business, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const sendNotificationToBusiness = async (businessUserId, message) => {
    try {
      // Buscar preferencias del comerciante
      const businessPrefs = await UserPreference.filter({ user_id: businessUserId });
      
      if (businessPrefs.length > 0 && businessPrefs[0].notifications_enabled) {
        // En una app real, esto enviaría push notification
        console.log(`🎮 Notificación de juego enviada: ${message}`);
        
        // Simular notificación visual temporal
        if (window.Notification && Notification.permission === "granted") {
          new Notification("Cuponea - Juego Activo", {
            body: message,
            icon: "/icon-192.png"
          });
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setIsSharing(true);

    try {
      const user = await User.me();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas
      const shareToken = Math.random().toString(36).substring(2, 15);

      const sharedCoupon = await SharedCoupon.create({
        coupon_id: coupon.id,
        sender_id: user.id,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        message: message || `¡${user.full_name} te ha enviado un cupón especial! 🎁`,
        expires_at: expiresAt.toISOString(),
        share_token: shareToken
      });

      // Create share URL
      const shareUrl = `${window.location.origin}/claim/${shareToken}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Enviar notificación al comerciante sobre el juego
      if (business && coupon.enable_sharing) {
        await sendNotificationToBusiness(
          coupon.business_id,
          `🎮 ¡${user.full_name} está jugando con tu cupón "${coupon.title}"! Lo compartió con ${recipientName}.`
        );
      }
      
      setShared(true);
      setTimeout(() => {
        setIsOpen(false);
        setShared(false);
        setRecipientEmail("");
        setRecipientName("");
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error sharing coupon:", error);
    }
    
    setIsSharing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-orange-500" />
            <span>Compartir Cupón</span>
          </DialogTitle>
        </DialogHeader>

        {!shared ? (
          <form onSubmit={handleShare} className="space-y-4">
            {/* Coupon Preview */}
            <Card className="bg-gradient-to-r from-orange-100 to-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {business?.logo_url && (
                    <img 
                      src={business.logo_url} 
                      alt={business.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{coupon.title}</h4>
                    <p className="text-xs text-gray-600">{business?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="recipientName">Nombre del amigo</Label>
              <Input
                id="recipientName"
                placeholder="¿Cómo se llama tu amigo?"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Email del destinatario</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="amigo@ejemplo.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje personalizado (opcional)</Label>
              <Textarea
                id="message"
                placeholder="¡No te pierdas esta increíble oferta!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                ⏰ Tu amigo tendrá <strong>24 horas</strong> para reclamar este cupón o desaparecerá.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              disabled={isSharing}
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Compartiendo...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Cupón
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">¡Cupón Enviado!</h3>
              <p className="text-gray-600 text-sm mt-2">
                El enlace se ha copiado al portapapeles. Compártelo con {recipientName}.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 flex items-center justify-center">
                <Bell className="w-4 h-4 mr-2" />
                El comerciante ha sido notificado del juego
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                Recibirás una notificación cuando {recipientName} reclame el cupón.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}