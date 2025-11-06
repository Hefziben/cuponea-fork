"use client";

import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Briefcase,
  UserPlus,
  CheckCircle,
  MapPin,
  Phone,
  Building,
  DollarSign,
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createPageUrl } from "@/utils";

const PlanCard = ({ plan, selectedPlan, onSelect, commission, recurring }) => (
  <Card
    className={`cursor-pointer transition-all ${selectedPlan === plan.id
      ? "ring-2 ring-green-500 border-green-400"
      : "hover:bg-gray-50"}`}
    onClick={() => onSelect(plan.id)}
  >
    <CardContent className="p-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h4 className="font-bold text-lg">{plan.name}</h4>
          <p className="text-2xl font-bold text-gray-800">
            ${plan.price}
            <span className="text-sm font-normal text-gray-500">/mes</span>
          </p>
        </div>
        {selectedPlan === plan.id && (
          <CheckCircle className="w-6 h-6 text-green-500" />
        )}
      </div>

      <div className="space-y-2">
        <Badge className="bg-green-100 text-green-800 block text-center">
          <DollarSign className="w-3 h-3 mr-1" />
          Comisión por Cierre: ${commission}
        </Badge>

        {recurring > 0 && (
          <Badge className="bg-blue-100 text-blue-800 block text-center">
            <DollarSign className="w-3 h-3 mr-1" />
            Residual: ${recurring}/mes (6 meses)
          </Badge>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <p>• Sin cargas sociales</p>
        <p>• Cobras por resultados</p>
        <p>• Trabajo freelance</p>
      </div>
    </CardContent>
  </Card>
);

const ProspectCard = ({ prospect, onActivate }) => {
  const statusConfig = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    contacted: { label: "Contactado", color: "bg-blue-100 text-blue-800" },
    interested: {
      label: "Interesado",
      color: "bg-purple-100 text-purple-800"
    },
    meeting_scheduled: {
      label: "Reunión Programada",
      color: "bg-orange-100 text-orange-800"
    },
    signed: { label: "Cliente Activo", color: "bg-green-100 text-green-800" },
    rejected: { label: "Rechazado", color: "bg-red-100 text-red-800" }
  };

  const currentStatus = statusConfig[prospect.status] || statusConfig.pending;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900 pr-2">
            {prospect.business_name}
          </h3>
          <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
        </div>
        <div className="text-sm text-gray-600 mt-2 space-y-1">
          <p className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {prospect.address}
          </p>
          {prospect.phone && (
            <p className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              {prospect.phone}
            </p>
          )}
          {prospect.contact_person && (
            <p className="font-medium">Contacto: {prospect.contact_person}</p>
          )}
          {prospect.next_action && (
            <p className="text-blue-600 font-medium">
              Siguiente: {prospect.next_action}
            </p>
          )}
        </div>
      </CardContent>
      {prospect.status !== "signed" && (
        <div className="bg-gray-50 px-4 py-3 border-t">
          <Button
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => onActivate(prospect)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Activar como Cliente
          </Button>
        </div>
      )}
    </Card>
  );
};

export default function CuponeadorProspecting() {
  const router = useRouter();
  const [prospects, setProspects] = useState([]);
  const [clients, setClients] = useState([]);
  const [user, setUser] = useState(null);
  const [cuponeadorData, setCuponeadorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [isActivating, setIsActivating] = useState(false);

  // Planes según el documento - actualizados con comisiones reales
  const plans = [
    {
      id: "freemium",
      name: "Plan Freemium",
      price: 0,
      commission: 5, // Comisión por cierre
      recurring: 0 // Sin residual para plan gratuito
    },
    {
      id: "basico",
      name: "Plan Básico",
      price: 30,
      commission: 10, // $10 por cierre según documento
      recurring: 3 // 10% de $30 = $3/mes por 6 meses
    },
    {
      id: "premium",
      name: "Plan Premium",
      price: 80,
      commission: 20, // $20 por cierre según documento
      recurring: 8 // 10% de $80 = $8/mes por 6 meses
    }
  ];

  const loadData = useCallback(
    async () => {
      setIsLoading(true);
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (currentUser?.account_type !== "cuponeador") {
          router.push(createPageUrl("Home"));
          return;
        }

        // Cargar datos del cuponeador
        const cuponeadorInfo = await base44.entities.Cuponeador.filter({
          user_id: currentUser.id
        });
        if (cuponeadorInfo.length > 0) {
          setCuponeadorData(cuponeadorInfo[0]);
        }

        const allProspects = await base44.entities.Prospect.filter({
          cuponeador_id: currentUser.id
        });
        setProspects(allProspects.filter(p => p.status !== "signed"));
        setClients(allProspects.filter(p => p.status === "signed"));
      } catch (error) {
        console.error("Error loading prospecting data:", error);
      }
      setIsLoading(false);
    },
    [router]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleActivateClick = prospect => {
    setSelectedProspect(prospect);
    setShowActivationModal(true);
  };

  const handleActivateClient = async () => {
    if (!selectedProspect || !selectedPlan || !user || !cuponeadorData) return;

    setIsActivating(true);
    try {
      // 1. Update prospect status
      await base44.entities.Prospect.update(selectedProspect.id, {
        status: "signed",
        next_action: "Pago pendiente - seguimiento en 24h"
      });

      // 2. Redirect to payment flow
      const paymentUrl =
        createPageUrl("CuponeadorClientPayment") +
        `?prospect=${selectedProspect.id}&plan=${selectedPlan}&cuponeador=${cuponeadorData.id}`;

      router.push(paymentUrl);
    } catch (error) {
      console.error("Error activating client:", error);
      alert("Hubo un error al procesar la activación.");
    }
    setIsActivating(false);
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

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(createPageUrl("CuponeadorDashboard"))}
          className="hover:bg-purple-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-600" />
          Mis Clientes
        </h1>
      </div>

      {/* Volume Progress Card */}
      {cuponeadorData && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-green-800">
                  Progreso del Mes
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {cuponeadorData.clients_this_month}/10
                </p>
                <p className="text-sm text-green-600">
                  clientes este mes
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-700">
                  {cuponeadorData.clients_this_month >= 10
                    ? "🏆 ¡Bono $75!"
                    : cuponeadorData.clients_this_month >= 5
                      ? "🎯 ¡Bono $25!"
                      : cuponeadorData.clients_this_month >= 3
                        ? "💪 Casi ahí..."
                        : "🚀 ¡Vamos!"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="font-semibold text-gray-800 flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-orange-500" />
          Prospectos ({prospects.length})
        </h2>
        {prospects.length > 0 ? (
          prospects.map(p => (
            <ProspectCard
              key={p.id}
              prospect={p}
              onActivate={handleActivateClick}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
            No tienes prospectos pendientes. ¡Ve al mapa y añade nuevos
            comercios!
          </p>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h2 className="font-semibold text-gray-800 flex items-center">
          <Building className="w-5 h-5 mr-2 text-green-600" />
          Clientes Activos ({clients.length})
        </h2>
        {clients.length > 0 ? (
          clients.map(p => <ProspectCard key={p.id} prospect={p} />)
        ) : (
          <p className="text-center text-gray-500 py-4">
            Aún no tienes clientes activos.
          </p>
        )}
      </div>

      <Dialog
        open={showActivationModal}
        onOpenChange={setShowActivationModal}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activar Cliente</DialogTitle>
            <DialogDescription>
              Selecciona el plan para{" "}
              <span className="font-bold">
                {selectedProspect?.business_name}
              </span>{" "}
              para completar la activación y generar tu comisión.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Modelo Freelance sin Riesgos:</p>
                  <p>• No tienes cargas sociales</p>
                  <p>• El comercio paga, tú cobras tu comisión</p>
                  <p>• Trabajo cuando quieras, por resultados</p>
                </div>
              </div>
            </div>

            <h3 className="font-medium">Planes de Cuponea</h3>
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selectedPlan={selectedPlan}
                onSelect={setSelectedPlan}
                commission={plan.commission}
                recurring={plan.recurring}
              />
            ))}

            {cuponeadorData &&
              cuponeadorData.clients_this_month >= 4 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-yellow-800">
                    🎯 ¡Estás cerca de un bono de volumen!
                  </p>
                  <p className="text-xs text-yellow-600">
                    {cuponeadorData.clients_this_month === 4
                      ? "Un cliente más para el bono de $25"
                      : cuponeadorData.clients_this_month >= 5 &&
                        cuponeadorData.clients_this_month < 9
                        ? `${10 -
                            cuponeadorData.clients_this_month} clientes más para el bono de $75`
                        : "¡Ya tienes bonos de volumen!"}
                  </p>
                </div>
              )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActivationModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleActivateClient}
              disabled={isActivating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isActivating ? "Activando..." : "Confirmar Activación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
