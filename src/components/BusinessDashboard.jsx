"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { base44 } from "@/api/clientReal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Tag,
  Clock,
  Gamepad2,
  PlusCircle,
  TrendingUp,
  Users,
  BrainCircuit,
  Star,
  CreditCard,
  UserCheck,
  Crown,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { createPageUrl } from "@/utils";

const BusinessCouponCard = ({ coupon, sharedCount, claimedCount }) => {
  const daysLeft = coupon.valid_until
    ? Math.ceil(
        (new Date(coupon.valid_until) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const isActive = coupon.is_active && (daysLeft === null || daysLeft > 0);
  const isEndingSoon = isActive && daysLeft !== null && daysLeft <= 3;

  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-800 pr-4">{coupon.title}</h3>
          <Badge
            variant={isActive ? "default" : "destructive"}
            className={`${
              isEndingSoon
                ? "bg-[var(--urgent)]"
                : isActive ? "bg-[var(--secondary)]" : "bg-[var(--alert)]"
            } text-white`}
          >
            {isEndingSoon
              ? "Termina pronto"
              : isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">
          {coupon.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span className="capitalize">{coupon.category}</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>
              {daysLeft !== null && daysLeft > 0
                ? `${daysLeft}d restantes`
                : "Vencido"}
            </span>
          </Badge>
          {sharedCount > 0 && (
            <Badge
              variant="secondary"
              className="flex items-center space-x-1 bg-blue-100 text-blue-800"
            >
              <Gamepad2 className="w-3 h-3" />
              <span>{sharedCount} compartidos</span>
            </Badge>
          )}
          {claimedCount > 0 && (
            <Badge
              variant="secondary"
              className="flex items-center space-x-1 bg-green-100 text-green-800"
            >
              <Users className="w-3 h-3" />
              <span>{claimedCount} canjeados</span>
            </Badge>
          )}
        </div>

        {/* Estadísticas del cupón */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Usos:</span>
              <span className="font-medium ml-2">
                {coupon.current_uses || 0}
                {coupon.max_uses ? `/${coupon.max_uses}` : ""}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Juegos:</span>
              <span className="font-medium ml-2">{sharedCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function BusinessDashboard({ user }) {
  const [myCoupons, setMyCoupons] = useState([]);
  const [sharedCoupons, setSharedCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [cuponeadorInfo, setCuponeadorInfo] = useState(null);

  useEffect(
    () => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [coupons, shared, fullUser, payments] = await Promise.all([
            base44.entities.Coupon.filter({ created_by: user.email }),
            base44.entities.SharedCoupon.list(),
            base44.auth.me(),
            base44.entities.Payment.filter({ user_id: user.id })
          ]);

          setMyCoupons(coupons);
          setSharedCoupons(shared);
          setUserData(fullUser);

          // Get latest payment
          if (payments.length > 0) {
            const latestPayment = payments.sort(
              (a, b) => new Date(b.created_date) - new Date(a.created_date)
            )[0];
            setPaymentInfo(latestPayment);

            // If referred by cuponeador, get cuponeador info
            if (latestPayment.referred_by_cuponeador) {
              const cuponeadores = await base44.entities.Cuponeador.filter({
                id: latestPayment.referred_by_cuponeador
              });
              if (cuponeadores.length > 0) {
                const cuponeador = cuponeadores[0];
                const cuponeadorUsers = await base44.entities.User.filter({
                  id: cuponeador.user_id
                });
                if (cuponeadorUsers.length > 0) {
                  setCuponeadorInfo({
                    ...cuponeador,
                    name: cuponeadorUsers[0].full_name,
                    email: cuponeadorUsers[0].email
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching business data:", error);
        }
        setIsLoading(false);
      };

      fetchData();
    },
    [user]
  );

  const getSharedCountForCoupon = couponId => {
    return sharedCoupons.filter(sc => sc.coupon_id === couponId).length;
  };

  const getClaimedCountForCoupon = couponId => {
    return sharedCoupons.filter(
      sc => sc.coupon_id === couponId && sc.is_claimed
    ).length;
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  const totalShares = sharedCoupons.length;
  const totalClaims = sharedCoupons.filter(sc => sc.is_claimed).length;

  const getPaymentStatusColor = status => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPaymentStatusIcon = status => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Panel de Comerciante
        </h2>
        <Link href={createPageUrl("CreateCoupon")}>
          <Button className="bg-[var(--secondary)] hover:opacity-90 text-white">
            <PlusCircle className="w-4 h-4 mr-2" />
            Crear
          </Button>
        </Link>
      </div>

      {/* AI Features Promo */}
      <Card className="bg-[var(--primary)] text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <BrainCircuit className="w-10 h-10 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg">
                Potencia tus Cupones con IA
              </h3>
              <p className="text-sm opacity-90 mt-1">
                Usa nuestro asistente para crear ofertas irresistibles y
                predecir su éxito.
              </p>
              <Link href={createPageUrl("CreateCoupon")}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3 bg-white/20 hover:bg-white/30 text-white"
                >
                  Probar Ahora
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription & Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            Suscripción y Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Info */}
          {userData?.subscription_plan && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Plan Actual
                </p>
                <p className="text-lg font-bold text-purple-900 capitalize">
                  {userData.subscription_plan}
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                <Star className="w-3 h-3 mr-1" />
                {userData.subscription_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          )}

          {/* Payment Status */}
          {paymentInfo && (
            <div
              className={`p-3 rounded-lg border-2 ${getPaymentStatusColor(
                paymentInfo.payment_status
              )}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getPaymentStatusIcon(paymentInfo.payment_status)}
                  <span className="font-semibold capitalize">
                    {paymentInfo.payment_status === "completed"
                      ? "Pago Confirmado"
                      : paymentInfo.payment_status === "pending"
                        ? "Pago Pendiente"
                        : "Pago Fallido"}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {paymentInfo.payment_method === "yappy"
                    ? "Yappy"
                    : paymentInfo.payment_method === "bank_transfer"
                      ? "Transferencia"
                      : "Tarjeta"}
                </Badge>
              </div>
              <p className="text-sm">
                Monto: <strong>${paymentInfo.amount}</strong> - Vence:{" "}
                <strong>
                  {new Date(paymentInfo.expires_at).toLocaleDateString()}
                </strong>
              </p>
            </div>
          )}

          {/* Registration Source */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              {userData?.registration_source === "cuponeador" ? (
                <>
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Registrado por Cuponeador
                  </span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Registro Directo
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Cuponeador Info */}
          {cuponeadorInfo && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 font-semibold mb-1">
                Tu Cuponeador
              </p>
              <p className="font-bold text-green-900">
                {cuponeadorInfo.name}
              </p>
              <p className="text-xs text-green-700">
                Código: {cuponeadorInfo.cuponeador_code}
              </p>
              <p className="text-xs text-green-600 mt-2">
                Este agente te ayudó a registrarte y está disponible para
                soporte
              </p>
            </div>
          )}

          <Link href={createPageUrl("SelectPlan")}>
            <Button variant="outline" className="w-full">
              Cambiar / Mejorar Plan
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      {myCoupons.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {myCoupons.length}
                </div>
                <div className="text-xs text-blue-600">Cupones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {totalShares}
                </div>
                <div className="text-xs text-green-600">Compartidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-700">
                  {totalClaims}
                </div>
                <div className="text-xs text-orange-600">Canjeados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {myCoupons.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[var(--urgent)]" />
            <span>Tus Ofertas</span>
          </h3>
          {myCoupons.map(coupon => (
            <BusinessCouponCard
              key={coupon.id}
              coupon={coupon}
              sharedCount={getSharedCountForCoupon(coupon.id)}
              claimedCount={getClaimedCountForCoupon(coupon.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center bg-blue-50 border-blue-100">
          <div className="space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="font-bold text-xl text-gray-900">¡Bienvenido!</h3>
            <p className="text-gray-600">
              Aún no has creado ninguna oferta. ¡Empieza ahora a atraer
              clientes!
            </p>
            <Link href={createPageUrl("CreateCoupon")}>
              <Button className="bg-[var(--urgent)] hover:opacity-90 text-white">
                <PlusCircle className="w-4 h-4 mr-2" />
                Crear Mi Primer Cupón
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
