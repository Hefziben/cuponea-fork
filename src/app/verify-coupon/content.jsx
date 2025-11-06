"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Coupon } from "@/api/entities";
import { Business } from "@/api/entities";
import { User } from "@/api/entities";
import { UserPreference } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  QrCode,
  Bell
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function VerifyCoupon() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [coupon, setCoupon] = useState(null);
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const qrCode = searchParams.get("qr");
  const couponId = searchParams.get("id");

  useEffect(
    () => {
      if (qrCode && couponId) {
        verifyCoupon();
      } else {
        setVerificationStatus("error");
        setIsLoading(false);
      }
    },
    [qrCode, couponId]
  );

  const verifyCoupon = async () => {
    setIsLoading(true);
    try {
      // Buscar cupón por QR code e ID
      const couponData = await Coupon.filter({ id: couponId, qr_code: qrCode });

      if (couponData.length === 0) {
        setVerificationStatus("error");
        setIsLoading(false);
        return;
      }

      const couponDetail = couponData[0];
      setCoupon(couponDetail);

      // Cargar información del negocio
      if (couponDetail.business_id) {
        const businessData = await Business.filter({
          id: couponDetail.business_id
        });
        if (businessData.length > 0) {
          setBusiness(businessData[0]);
        }
      }

      // Verificar si el cupón está vigente
      const now = new Date();
      const validUntil = couponDetail.valid_until
        ? new Date(couponDetail.valid_until)
        : null;

      if (!couponDetail.is_active || (validUntil && now > validUntil)) {
        setVerificationStatus("expired");
      } else {
        setVerificationStatus("success");
      }
    } catch (error) {
      console.error("Error verifying coupon:", error);
      setVerificationStatus("error");
    }
    setIsLoading(false);
  };

  const sendNotificationToBusiness = async (businessUserId, message) => {
    try {
      // Buscar preferencias del comerciante
      const businessPrefs = await UserPreference.filter({
        user_id: businessUserId
      });

      if (
        businessPrefs.length > 0 &&
        businessPrefs[0].notifications_enabled
      ) {
        // En una app real, esto enviaría push notification
        console.log(`📢 Notificación enviada al comerciante: ${message}`);

        // Simular notificación visual temporal
        if (window.Notification && Notification.permission === "granted") {
          new Notification("Cuponea - Cupón Usado", {
            body: message,
            icon: "/icon-192.png"
          });
        }
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleRedeemCoupon = async () => {
    if (!coupon) return;

    setIsValidating(true);
    try {
      // Incrementar contador de usos
      await Coupon.update(coupon.id, {
        current_uses: (coupon.current_uses || 0) + 1
      });

      // Enviar notificación al comerciante
      if (business) {
        await sendNotificationToBusiness(
          coupon.business_id,
          `¡Tu cupón "${coupon.title}" ha sido canjeado exitosamente! 🎉`
        );
      }

      setVerificationStatus("redeemed");
    } catch (error) {
      console.error("Error redeeming coupon:", error);
    }
    setIsValidating(false);
  };

  const getDiscountText = coupon => {
    switch (coupon?.discount_type) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
          <p className="text-gray-600">Verificando cupón...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">
            Verificación de Cupón
          </h1>
          <div className="w-10" />
        </div>

        {verificationStatus === "success" &&
          coupon && (
            <div className="space-y-6">
              {/* Status Success */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-green-800 mb-2">
                    ¡Cupón Válido!
                  </h2>
                  <p className="text-green-700">
                    Este cupón está listo para ser canjeado
                  </p>
                </CardContent>
              </Card>

              {/* Coupon Details */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xl px-4 py-2 mb-4">
                      {getDiscountText(coupon)}
                    </Badge>
                    <h3 className="text-xl font-bold text-gray-900">
                      {coupon.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{coupon.description}</p>
                  </div>

                  {business && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Comercio:
                      </h4>
                      <div className="flex items-center space-x-3">
                        {business.logo_url && (
                          <img
                            src={business.logo_url}
                            alt={business.name}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium">{business.name}</p>
                          {business.address && (
                            <p className="text-sm text-gray-500">
                              {business.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Categoría:</span>
                        <p className="font-medium capitalize">
                          {coupon.category}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Usos:</span>
                        <p className="font-medium">
                          {coupon.current_uses || 0}
                          {coupon.max_uses ? `/${coupon.max_uses}` : " usos"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleRedeemCoupon}
                disabled={isValidating}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-6 text-lg"
              >
                {isValidating ? "Canjeando..." : "✅ Canjear Cupón Ahora"}
              </Button>
            </div>
          )}

        {verificationStatus === "redeemed" && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <div>
                <h2 className="text-2xl font-bold text-blue-800">
                  ¡Cupón Canjeado!
                </h2>
                <p className="text-blue-700 mt-2">
                  El cupón se ha usado exitosamente
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-4">
                <p className="text-sm text-blue-800 flex items-center justify-center">
                  <Bell className="w-4 h-4 mr-2" />
                  El comerciante ha sido notificado automáticamente
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Gracias por usar Cuponea. ¡Esperamos que hayas disfrutado tu
                  descuento!
                </p>
              </div>
              <Button
                onClick={() => router.push(createPageUrl("Home"))}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Volver al Inicio
              </Button>
            </CardContent>
          </Card>
        )}

        {(verificationStatus === "error" ||
          verificationStatus === "expired") && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-red-800">
                  {verificationStatus === "expired"
                    ? "Cupón Expirado"
                    : "Cupón No Válido"}
                </h2>
                <p className="text-red-700 mt-2">
                  {verificationStatus === "expired"
                    ? "Este cupón ya no está disponible o ha vencido"
                    : "No se pudo verificar este cupón. Código QR inválido."}
                </p>
              </div>
              <Button
                onClick={() => router.push(createPageUrl("Home"))}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Volver al Inicio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
