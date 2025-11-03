
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ShareCouponModal from "./ShareCouponModal";
import GameInfoModal from "./GameInfoModal";
import {
  Heart,
  Share,
  MapPin,
  Clock,
  Tag,
  Percent,
  Gift,
  Gamepad2 } from
"lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CouponCard({ coupon, business, onSave, isSaved = false }) {
  const [isLoading, setIsLoading] = useState(false);

  const getDiscountIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />;
      case '2x1':
        return <Gift className="w-4 h-4" />;
      case 'gift':
        return <Gift className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getDiscountText = (coupon) => {
    switch (coupon.discount_type) {
      case 'percentage':
        return `${coupon.discount_value}% OFF`;
      case 'fixed_amount':
        return `$${coupon.discount_value} OFF`;
      case '2x1':
        return '2x1';
      case 'free_shipping':
        return 'ENVÍO GRATIS';
      case 'gift':
        return 'REGALO';
      default:
        return 'DESCUENTO';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving coupon:', error);
    }

    setIsLoading(false);
  };

  const daysLeft = coupon.valid_until ?
  Math.ceil((new Date(coupon.valid_until) - new Date()) / (1000 * 60 * 60 * 24)) :
  null;

  return (
    <Link to={createPageUrl("CouponDetail") + "?id=" + coupon.id}>
      <Card className="rounded-lg text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
        <div className="relative">
          {coupon.image_url &&
          <div className="aspect-[16/9] overflow-hidden">
              <img
              src={coupon.image_url}
              alt={coupon.title}
              className="w-full h-full object-cover" />

            </div>
          }
          
          {/* Discount Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-[var(--primary)] text-white px-3 py-1 text-sm font-bold inline-flex items-center rounded-full border-transparent hover:bg-[var(--primary-dark)]">
              {getDiscountIcon(coupon.discount_type)}
              <span className="ml-1">{getDiscountText(coupon)}</span>
            </Badge>
          </div>

          {/* Game Badge - NEW */}
          {coupon.enable_sharing &&
          <div className="absolute top-3 right-3">
              <GameInfoModal>
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700">
                  <Gamepad2 className="w-3 h-3 mr-1" />
                  JUEGO
                </Badge>
              </GameInfoModal>
            </div>
          }

          {/* Featured Badge */}
          {coupon.is_featured &&
          <div className={`absolute ${coupon.enable_sharing ? 'top-12' : 'top-3'} right-3`}>
              <Badge className="bg-gradient-to-r from-[var(--highlight)] to-[var(--urgent)] text-white px-2.5 py-0.5 text-xs font-semibold">
                ⭐ DESTACADO
              </Badge>
            </div>
          }

          {/* Actions */}
          <div className="absolute bottom-3 right-3 flex space-x-1">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-gray-700 h-8 w-8 p-0"
              onClick={handleSave}
              disabled={isLoading}>

              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[var(--alert)] text-[var(--alert)]' : ''}`} />
            </Button>
            
            {coupon.enable_sharing &&
            <ShareCouponModal coupon={coupon} business={business}>
                <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-700 h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}>

                  <Share className="w-4 h-4" />
                </Button>
              </ShareCouponModal>
            }
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Business Info */}
            {business &&
            <div className="flex items-center space-x-2">
                {business.logo_url &&
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-6 h-6 rounded-full object-cover" />

              }
                <span className="text-sm font-medium text-[var(--primary)]">{business.name}</span>
              </div>
            }

            {/* Title */}
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{coupon.title}</h3>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-2">{coupon.description}</p>

            {/* Game Info */}
            {coupon.enable_sharing &&
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                <p className="text-xs text-purple-700 font-medium flex items-center">
                  <Gamepad2 className="w-3 h-3 mr-1" />
                  ¡Este cupón tiene juego activado! Compártelo y gana puntos
                </p>
              </div>
            }

            {/* Footer Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <div className="flex items-center space-x-4">
                {business?.address &&
                <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-20">{business.address}</span>
                  </div>
                }
                {daysLeft !== null &&
                <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span className={daysLeft <= 3 ? 'text-[var(--alert)] font-medium' : ''}>
                      {daysLeft <= 0 ? 'Vencido' : `${daysLeft}d`}
                    </span>
                  </div>
                }
              </div>
              
              {coupon.max_uses &&
              <div className="text-[var(--primary)] font-medium">
                  {coupon.current_uses || 0}/{coupon.max_uses} usados
                </div>
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>);

}
