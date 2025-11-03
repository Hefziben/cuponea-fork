import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SharedCoupon } from "@/api/entities";
import { Coupon } from "@/api/entities";
import { Business } from "@/api/entities";
import { SavedCoupon } from "@/api/entities";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Gift, 
  Bomb, 
  Heart,
  CheckCircle,
  XCircle,
  Sparkles
} from "lucide-react";

export default function ClaimCoupon() {
  const navigate = useNavigate();
  const [sharedCoupon, setSharedCoupon] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [business, setBusiness] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBomb, setShowBomb] = useState(false);

  const shareToken = window.location.pathname.split('/').pop();

  useEffect(() => {
    loadSharedCoupon();
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(sharedCoupon.expires_at).getTime();
      const remaining = expiry - now;

      if (remaining <= 0) {
        setIsExpired(true);
        setShowBomb(true);
        clearInterval(timer);
        return;
      }

      // Show bomb animation when less than 1 hour left
      if (remaining < 60 * 60 * 1000 && !showBomb) {
        setShowBomb(true);
      }

      setTimeLeft({
        hours: Math.floor(remaining / (1000 * 60 * 60)),
        minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((remaining % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sharedCoupon]);

  const loadSharedCoupon = async () => {
    try {
      const sharedData = await SharedCoupon.filter({ share_token: shareToken });
      if (sharedData.length === 0) {
        navigate(createPageUrl("Home"));
        return;
      }

      const shared = sharedData[0];
      setSharedCoupon(shared);

      // Check if already claimed or expired
      if (shared.is_claimed) {
        setClaimResult("already_claimed");
        setIsLoading(false);
        return;
      }

      const now = new Date().getTime();
      const expiry = new Date(shared.expires_at).getTime();
      
      if (now > expiry) {
        setIsExpired(true);
        setShowBomb(true);
        setIsLoading(false);
        return;
      }

      // Load coupon and business data
      const couponData = await Coupon.filter({ id: shared.coupon_id });
      if (couponData.length > 0) {
        setCoupon(couponData[0]);
        
        const businessData = await Business.filter({ id: couponData[0].business_id });
        if (businessData.length > 0) {
          setBusiness(businessData[0]);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading shared coupon:", error);
      navigate(createPageUrl("Home"));
    }
  };

  const handleClaimCoupon = async () => {
    setIsClaiming(true);
    try {
      const user = await User.me();
      
      // Update shared coupon as claimed
      await SharedCoupon.update(sharedCoupon.id, {
        is_claimed: true,
        claimed_at: new Date().toISOString(),
        claimed_by: user.id
      });

      // Add to user's saved coupons
      await SavedCoupon.create({
        user_id: user.id,
        coupon_id: coupon.id
      });

      setClaimResult("success");
    } catch (error) {
      console.error("Error claiming coupon:", error);
      setClaimResult("error");
    }
    setIsClaiming(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (claimResult === "success") {
      return (
        <div className="text-center space-y-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="text-8xl animate-bounce">🎉</div>
            <div className="absolute -top-2 -right-2 animate-pulse">
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">¡Felicidades!</h2>
            <p className="text-lg text-gray-600">
              Has reclamado exitosamente tu cupón de {sharedCoupon.recipient_name}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✅ El cupón se ha guardado en tu cuenta y ya puedes usarlo
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate(createPageUrl("Saved"))}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Heart className="w-4 h-4 mr-2" />
            Ver Mis Cupones
          </Button>
        </div>
      );
    }

    if (claimResult === "already_claimed") {
      return (
        <div className="text-center space-y-6">
          <div className="text-6xl">😔</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Cupón ya reclamado</h2>
            <p className="text-gray-600">
              Este cupón ya fue reclamado por otro usuario
            </p>
          </div>
        </div>
      );
    }

    if (isExpired) {
      return (
        <div className="text-center space-y-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="text-8xl animate-pulse">💥</div>
            <Bomb className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 text-red-500 animate-bounce" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-red-600">¡Tiempo Agotado!</h2>
            <p className="text-lg text-gray-600">
              Lo sentimos, las 24 horas han pasado y el cupón ha desaparecido
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                💡 <strong>Tip:</strong> No pierdas las oportunidades, mantente pendiente de los nuevos cupones en CUPONEA
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate(createPageUrl("Home"))}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            Explorar Nuevos Cupones
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Animated Icon */}
        <div className="text-center relative">
          {showBomb ? (
            <div className="relative animate-pulse">
              <Bomb className="w-24 h-24 text-red-500 mx-auto animate-bounce" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-ping">
                !
              </div>
            </div>
          ) : (
            <div className="relative animate-bounce">
              <Gift className="w-24 h-24 text-orange-500 mx-auto" />
              <div className="absolute -top-2 -right-2 animate-pulse">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            ¡{sharedCoupon.recipient_name || "Tienes"} un regalo! 🎁
          </h2>
          <p className="text-gray-600">{sharedCoupon.message}</p>
        </div>

        {/* Countdown Timer */}
        <Card className={`border-2 ${showBomb ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'}`}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className={`w-5 h-5 ${showBomb ? 'text-red-500' : 'text-orange-500'}`} />
              <span className={`font-semibold ${showBomb ? 'text-red-700' : 'text-orange-700'}`}>
                Tiempo restante
              </span>
            </div>
            
            {timeLeft && (
              <div className="flex justify-center space-x-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${showBomb ? 'text-red-600' : 'text-orange-600'}`}>
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">HORAS</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">:</div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${showBomb ? 'text-red-600' : 'text-orange-600'}`}>
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">MIN</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">:</div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${showBomb ? 'text-red-600' : 'text-orange-600'} ${timeLeft.hours === 0 && timeLeft.minutes < 5 ? 'animate-pulse' : ''}`}>
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">SEG</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coupon Preview */}
        {coupon && (
          <Card className="overflow-hidden">
            <div className="relative">
              {coupon.image_url && (
                <img 
                  src={coupon.image_url} 
                  alt={coupon.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="absolute top-3 left-3">
                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` :
                   coupon.discount_type === '2x1' ? '2x1' : 'DESCUENTO'}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg text-gray-900">{coupon.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{coupon.description}</p>
              {business && (
                <p className="text-orange-600 text-sm font-medium mt-2">{business.name}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleClaimCoupon}
          disabled={isClaiming || isExpired}
          className={`w-full py-6 text-lg font-bold ${
            showBomb 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
          }`}
        >
          {isClaiming ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Reclamando...
            </>
          ) : showBomb ? (
            <>
              <Bomb className="w-5 h-5 mr-2" />
              ¡Reclama Ahora o se Pierde!
            </>
          ) : (
            <>
              <Gift className="w-5 h-5 mr-2" />
              Reclamar Mi Cupón
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}