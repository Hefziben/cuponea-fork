"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import CuponeadorGameExplainer from "@/components/CuponeadorGameExplainer";
import { createPageUrl } from "@/utils";
import {
  DollarSign,
  Users,
  TrendingUp,
  Award,
  Share,
  Calendar,
  Target,
  Crown,
  Copy,
  Zap,
  Briefcase,
  Gamepad2,
  BrainCircuit
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CuponeadorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cuponeadorData, setCuponeadorData] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [gameCommissions, setGameCommissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.account_type !== "cuponeador") {
        router.push(createPageUrl("Home"));
        return;
      }

      const cuponeadorInfo = await base44.entities.Cuponeador.filter({
        user_id: currentUser.id
      });
      if (cuponeadorInfo.length > 0) {
        setCuponeadorData(cuponeadorInfo[0]);

        // Load regular commissions
        const commissionData = await base44.entities.Commission.filter({
          cuponeador_id: cuponeadorInfo[0].id
        });
        setCommissions(commissionData);

        // Load game commissions
        const gameCommissionData = await base44.entities.GameCommission.filter(
          {
            cuponeador_id: cuponeadorInfo[0].id
          }
        );
        setGameCommissions(gameCommissionData);
      }
    } catch (error) {
      console.error("Error loading cuponeador data:", error);
    }
    setIsLoading(false);
  };

  const copyReferralCode = () => {
    if (cuponeadorData?.cuponeador_code) {
      navigator.clipboard.writeText(cuponeadorData.cuponeador_code);
      alert("¡Código copiado! Compártelo con comercios interesados.");
    }
  };

  const getLevelColor = level => {
    const colors = {
      bronce: "text-amber-600 bg-amber-50",
      plata: "text-gray-600 bg-gray-50",
      oro: "text-yellow-600 bg-yellow-50",
      diamante: "text-purple-600 bg-purple-50"
    };
    return colors[level] || colors.bronce;
  };

  const getNextLevelRequirement = currentClients => {
    if (currentClients < 5)
      return { level: "Plata", needed: 5 - currentClients };
    if (currentClients < 15)
      return { level: "Oro", needed: 15 - currentClients };
    if (currentClients < 30)
      return { level: "Diamante", needed: 30 - currentClients };
    return { level: "Diamante", needed: 0 };
  };

  if (isLoading || !cuponeadorData) {
    return (
      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const nextLevel = getNextLevelRequirement(cuponeadorData.clients_registered);
  const totalGameEarnings = gameCommissions.reduce(
    (sum, gc) => sum + gc.amount,
    0
  );
  const pendingGameEarnings = gameCommissions
    .filter(gc => gc.status === "pending")
    .reduce((sum, gc) => sum + gc.amount, 0);

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Crown className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Cuponeador
          </h1>
        </div>
        <p className="text-gray-600">
          ¡Hola {user?.full_name}! Aquí está tu rendimiento
        </p>
      </div>

      {/* Level & Ranking Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge
                className={`${getLevelColor(
                  cuponeadorData.level
                )} text-sm font-bold`}
              >
                Nivel{" "}
                {cuponeadorData.level.charAt(0).toUpperCase() +
                  cuponeadorData.level.slice(1)}
              </Badge>
              <div className="text-2xl font-bold mt-1">
                #{cuponeadorData.rank_position || "N/A"}
              </div>
              <div className="text-purple-100 text-sm">Ranking mensual</div>
            </div>
            <Award className="w-12 h-12 text-purple-200" />
          </div>

          {nextLevel.needed > 0 && (
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progreso a {nextLevel.level}</span>
                <span>{cuponeadorData.clients_registered} clientes</span>
              </div>
              <Progress
                value={
                  (cuponeadorData.clients_registered /
                    (cuponeadorData.clients_registered + nextLevel.needed)) *
                  100
                }
                className="h-2"
              />
              <div className="text-xs text-purple-100 mt-1">
                Te faltan {nextLevel.needed} clientes para subir de nivel
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview - Updated with Game Earnings */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              ${(cuponeadorData.total_commissions || 0) + totalGameEarnings}
            </div>
            <div className="text-xs text-gray-500">Total Ganado</div>
            {totalGameEarnings > 0 && (
              <div className="text-xs text-green-600 mt-1">
                +${totalGameEarnings} de juegos
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {cuponeadorData.clients_registered || 0}
            </div>
            <div className="text-xs text-gray-500">Clientes Totales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Gamepad2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              ${pendingGameEarnings}
            </div>
            <div className="text-xs text-gray-500">Juegos Pendiente</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {cuponeadorData.active_clients || 0}
            </div>
            <div className="text-xs text-gray-500">Clientes Activos</div>
          </CardContent>
        </Card>
      </div>

      {/* Game System Explainer - NEW */}
      <CuponeadorGameExplainer />

      {/* Referral Code */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share className="w-5 h-5 text-green-600" />
            <span>Tu Código de Referido</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-3">
            <code className="bg-white px-3 py-2 rounded font-mono text-lg flex-1 text-center border">
              {cuponeadorData.cuponeador_code}
            </code>
            <Button size="sm" onClick={copyReferralCode} variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-green-700">
            Comparte este código con comercios para empezar a ganar comisiones
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <span>Acciones Rápidas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Link href={createPageUrl("CuponeadorProspecting")}>
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <Briefcase className="w-4 h-4 mr-2" />
              Gestionar Clientes
            </Button>
          </Link>
          <Link href={createPageUrl("NearbyOffers")}>
            <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
              <Target className="w-4 h-4 mr-2" />
              Prospectar Nuevos Comercios
            </Button>
          </Link>
          <Link href={createPageUrl("CuponeadorSalesCoach")}>
            <Button className="w-full justify-start" variant="outline">
              <BrainCircuit className="w-4 h-4 mr-2" />
              Coach de Ventas IA
            </Button>
          </Link>
          <Button className="w-full justify-start" variant="outline">
            <DollarSign className="w-4 h-4 mr-2" />
            Mi Historial de Comisiones
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Award className="w-4 h-4 mr-2" />
            Ranking y Competencia
          </Button>
        </CardContent>
      </Card>

      {/* Recent Commissions - Updated */}
      {(commissions.length > 0 || gameCommissions.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Comisiones Recientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Regular Commissions */}
              {commissions.slice(0, 2).map(commission => (
                <div
                  key={commission.id}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {commission.commission_type === "cierre"
                        ? "Cierre"
                        : commission.commission_type === "volumen"
                          ? "Bono Volumen"
                          : "Residual"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {commission.period || "Este mes"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ${commission.amount}
                    </div>
                    <Badge
                      variant={
                        commission.status === "pagado" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {commission.status}
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Game Commissions */}
              {gameCommissions.slice(0, 2).map(gameComm => (
                <div
                  key={gameComm.id}
                  className="flex justify-between items-center py-2 border-b last:border-b-0 bg-purple-50"
                >
                  <div>
                    <div className="font-medium text-sm flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3 text-purple-600" />
                      Comisión por Juego
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(gameComm.claimed_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">
                      ${gameComm.amount}
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-purple-100 text-purple-800"
                    >
                      {gameComm.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <Zap className="w-5 h-5" />
            <span>Tips para Crecer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-yellow-700">
            <div>
              • Visita comercios locales y explícales los beneficios de Cuponea
            </div>
            <div>
              • Enseña a tus clientes a activar "Juegos" para ganar comisiones
              pasivas
            </div>
            <div>• Usa redes sociales para compartir historias de éxito</div>
            <div>• Participa en eventos empresariales de tu ciudad</div>
            <div>
              • Mantén contacto con tus clientes para asegurar su retención
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
