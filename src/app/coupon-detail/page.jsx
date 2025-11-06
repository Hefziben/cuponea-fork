"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Coupon } from "@/api/entities";
import { Business } from "@/api/entities";
import { SavedCoupon } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  Heart,
  Share,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Star,
  Tag,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function CouponDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [coupon, setCoupon] = useState(null);
  const [business, setBusiness] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const couponId = searchParams.get("id");

  useEffect(
    () => {
      if (couponId) {
        loadCouponDetails();
      } else {
        router.push(createPageUrl("Home"));
      }
    },
    [couponId]
  );

  const loadCouponDetails = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const couponData = await Coupon.filter({ id: couponId });
      if (couponData.length === 0) {
        router.back();
        return;
      }

      const couponDetail = couponData[0];
      setCoupon(couponDetail);

      // Load business
      if (couponDetail.business_id) {
        const businessData = await Business.filter({
          id: couponDetail.business_id
        });
        if (businessData.length > 0) {
          setBusiness(businessData[0]);
        }
      }

      // Check if saved
      const savedData = await SavedCoupon.filter({
        user_id: currentUser.id,
        coupon_id: couponId
      });
      setIsSaved(savedData.length > 0);
    } catch (error) {
      console.error("Error loading coupon details:", error);
      router.back();
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user || !coupon) return;

    try {
      if (!isSaved) {
        await SavedCoupon.create({
          user_id: user.id,
          coupon_id: coupon.id
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: coupon.title,
          text: coupon.description,
          url: window.location.href
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    }
  };

  const getDiscountText = coupon => {
    switch (coupon.discount_type) {
      case "percentage":
        return `${coupon.discount_value}% OFF`;
      case "fixed_amount":
        return `$${coupon.discount_value} OFF`;
      case "2x1":
        return "2x1";
      case "free_shipping":
        return "ENVÍO GRATIS";
      case "gift":
        return "REGALO";
      default:
        return "DESCUENTO";
    }
  };

  const daysLeft = coupon?.valid_until
    ? Math.ceil(
        (new Date(coupon.valid_until) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const isExpired = daysLeft !== null && daysLeft <= 0;

  if (isLoading) {
    return (
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <Skeleton className="aspect-[16/9] rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!coupon) return null;

  return (
    <div className="pb-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-orange-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className={`hover:bg-orange-100 ${isSaved
              ? "text-red-500"
              : ""}`}
          >
            <Heart
              className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="hover:bg-orange-100"
          >
            <Share className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Image */}
        {coupon.image_url && (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
            <img
              src={coupon.image_url}
              alt={coupon.title}
              className="w-full h-full object-cover"
            />

            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg px-4 py-2">
                {getDiscountText(coupon)}
              </Badge>
            </div>
            {coupon.is_featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white">
                  ⭐ DESTACADO
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Business Info */}
        {business && (
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {business.logo_url && (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {business.name}
                  </h3>
                  {business.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        business.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-gray-500 text-sm hover:text-orange-600"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{business.address}</span>
                    </a>
                  )}
                </div>
                <div className="flex space-x-2">
                  {business.phone && (
                    <a href={`tel:${business.phone}`}>
                      <Button size="sm" variant="outline" className="p-2">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                  {business.whatsapp && (
                    <a
                      href={`https://wa.me/${business.whatsapp.replace(
                        /\D/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 p-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Title and Description */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {coupon.title}
            </h1>
            <p className="text-gray-600 mt-2">{coupon.description}</p>
          </div>

          {/* Status and Validity */}
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${isExpired
                ? "bg-red-100 text-red-700"
                : daysLeft <= 3
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"}`}
            >
              {isExpired ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>
                {isExpired
                  ? "Vencido"
                  : daysLeft <= 3 ? `Vence en ${daysLeft}d` : "Vigente"}
              </span>
            </div>

            {coupon.max_uses && (
              <div className="flex items-center space-x-1 text-orange-600 text-sm">
                <Users className="w-4 h-4" />
                <span>
                  {coupon.current_uses || 0}/{coupon.max_uses} usados
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Detalles del Descuento</span>
              </h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <p className="font-medium capitalize">
                    {coupon.discount_type?.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Categoría:</span>
                  <p className="font-medium capitalize">
                    {coupon.category?.replace("_", " ")}
                  </p>
                </div>
                {coupon.valid_from && (
                  <div>
                    <span className="text-gray-500">Válido desde:</span>
                    <p className="font-medium">
                      {new Date(coupon.valid_from).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {coupon.valid_until && (
                  <div>
                    <span className="text-gray-500">Válido hasta:</span>
                    <p className="font-medium">
                      {new Date(coupon.valid_until).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          {coupon.terms_conditions && (
            <Card className="border-orange-100">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Términos y Condiciones
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {coupon.terms_conditions}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Code Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="bg-[#9b59b6] text-center p-6">
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                {/* Generar URL del QR */}
                <div
                  className="w-32 h-32 bg-white rounded flex items-center justify-center"
                  style={{
                    backgroundImage: `url(https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(
                      `${window.location.origin}${createPageUrl(
                        "VerifyCoupon"
                      )}?qr=${coupon.qr_code}&id=${coupon.id}`
                    )})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center"
                  }}
                >
                  {/* Fallback text si no carga la imagen */}
                  <span className="text-gray-400 text-xs text-center">
                    Código QR<br />{coupon.qr_code?.slice(-8)}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">¡Listo para canjear!</h3>
                <p className="text-orange-100 text-sm">
                  Muestra este código QR en la tienda
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold"
            disabled={isExpired}
          >
            {isExpired ? "Cupón Vencido" : "Usar Cupón Ahora"}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={handleSave}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${isSaved
                  ? "fill-current"
                  : ""}`}
              />
              {isSaved ? "Guardado" : "Guardar"}
            </Button>
            <Button
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={handleShare}
            >
              <Share className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
