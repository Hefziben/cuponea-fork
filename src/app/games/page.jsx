"use client";

import React, { useState, useEffect } from "react";
import { SharedCoupon } from "@/api/entities";
import { Coupon } from "@/api/entities";
import { Business } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Gamepad2,
  Gift,
  Clock,
  Trophy,
  Target,
  Zap,
  Users,
  Sparkles,
  Map,
  Award,
  Share,
  Play,
  ArrowRight
} from "lucide-react";

export default function Games() {
  const [sharedCoupons, setSharedCoupons] = useState([]);
  const [receivedCoupons, setReceivedCoupons] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    sent: 0,
    received: 0,
    claimed: 0,
    expired: 0
  });

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Cupones enviados por el usuario
      const sent = await SharedCoupon.filter({ sender_id: currentUser.id });
      setSharedCoupons(sent);

      // Cupones recibidos por el usuario
      const received = await SharedCoupon.filter({
        recipient_email: currentUser.email
      });
      setReceivedCoupons(received);

      // Calcular estadísticas
      const claimed = received.filter(c => c.is_claimed).length;
      const expired = received.filter(c => {
        const now = new Date();
        const expiry = new Date(c.expires_at);
        return now > expiry && !c.is_claimed;
      }).length;

      setStats({
        sent: sent.length,
        received: received.length,
        claimed,
        expired
      });
    } catch (error) {
      console.error("Error loading game data:", error);
    }
    setIsLoading(false);
  };

  const getTimeLeft = expiresAt => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;

    if (diff <= 0) return "Expirado";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 mx-auto px-4 py-6 max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Gamepad2 className="w-8 h-8 text-[#9b59b6]" />
          <h1 className="text-2xl font-bold text-gray-900">
            Centro de Juegos
          </h1>
        </div>
        <p className="text-gray-600">
          Comparte cupones y participa en la diversión
        </p>
      </div>

      {/* Guía de Cómo Jugar */}
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-3 flex items-center">
            <Play className="w-5 h-5 mr-2" />
            ¿Cómo Jugar y Compartir?
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">
                1
              </span>
              <p>Busca cupones con el icono de juego activado</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">
                2
              </span>
              <p>Comparte el cupón con amigos usando el botón compartir</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">
                3
              </span>
              <p>Tus amigos tienen 24 horas para reclamar el cupón</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">
                4
              </span>
              <p>¡Ambos ganan puntos cuando se canjea!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">
              {stats.sent}
            </div>
            <div className="text-xs text-blue-600">Cupones Compartidos</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">
              {stats.received}
            </div>
            <div className="text-xs text-green-600">Cupones Recibidos</div>
          </CardContent>
        </Card>
      </div>

      {/* Cupones Recibidos Activos */}
      {receivedCoupons.filter(
        c => !c.is_claimed && new Date(c.expires_at) > new Date()
      ).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span>Cupones Para Ti</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {receivedCoupons
              .filter(
                c => !c.is_claimed && new Date(c.expires_at) > new Date()
              )
              .slice(0, 3)
              .map(shared => (
                <div
                  key={shared.id}
                  className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        De: {shared.recipient_name || shared.sender_id}
                      </p>
                      <p className="text-sm text-gray-600">
                        "{shared.message || "Te compartió un cupón"}"
                      </p>
                    </div>
                    <Badge variant="outline" className="text-red-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {getTimeLeft(shared.expires_at)}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-2 bg-orange-500 hover:bg-orange-600"
                  >
                    Reclamar Ahora
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Gamification Teaser */}
      <Card className="bg-gradient-to-r from-teal-50 to-green-50 border-teal-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-full">
              <Award className="w-6 h-6 text-[#1abc9c]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                ¡Próximamente: Misiones!
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Completa desafíos como "visita 3 locales" y gana recompensas
                exclusivas.
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Misión Diaria
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Map className="w-3 h-3 mr-1" />
                  Explorador
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invitar Amigos */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <Share className="w-6 h-6 text-[#9b59b6]" />
              <h3 className="font-bold text-gray-900">Invita Amigos</h3>
            </div>
            <p className="text-sm text-gray-600">
              Comparte Cuponea con tus amigos y gana puntos por cada registro
            </p>
            <Button className="bg-[#9b59b6] hover:bg-[#8e44ad] text-white">
              <Share className="w-4 h-4 mr-2" />
              Compartir App
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Juegos */}
      {(sharedCoupons.length > 0 || receivedCoupons.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Tu Historial</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {stats.claimed}
                </div>
                <div className="text-xs text-gray-500">
                  Cupones Canjeados
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {stats.expired}
                </div>
                <div className="text-xs text-gray-500">
                  Cupones Expirados
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      {sharedCoupons.length === 0 &&
        receivedCoupons.length === 0 && (
          <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-teal-50 border-purple-100">
            <div className="space-y-4">
              <div className="text-5xl">🎮</div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-gray-900">
                  ¡Comienza a Jugar!
                </h3>
                <p className="text-gray-600">
                  Busca cupones con juegos activados y comparte con amigos
                  para ganar puntos
                </p>
              </div>
              <Button className="bg-[#9b59b6] hover:bg-[#8e44ad] text-white">
                Explorar Cupones
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}
    </div>
  );
}
