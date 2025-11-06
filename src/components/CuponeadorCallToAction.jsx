"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import {
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Zap,
  Crown,
  Target
} from "lucide-react";

export default function CuponeadorCallToAction() {
  const router = useRouter();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const benefits = [
    {
      icon: DollarSign,
      title: "Gana por Cada Cierre",
      description: "Plan básico: $10 | Plan premium: $20",
      color: "text-green-600"
    },
    {
      icon: TrendingUp,
      title: "Bonos por Volumen",
      description: "5 clientes: +$25 | 10 clientes: +$75",
      color: "text-blue-600"
    },
    {
      icon: Award,
      title: "Ranking & Reconocimiento",
      description: "Compite con otros cuponeadores y gana premios",
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: "Cartera Propia",
      description: "Construye tu base de clientes y gana residual",
      color: "text-orange-600"
    }
  ];

  const commissionStructure = [
    { plan: "Freemium", monthly: "$0", commission: "$5", residual: "$1" },
    { plan: "Pro", monthly: "$30", commission: "$10", residual: "$3" },
    { plan: "Avanzado", monthly: "$80", commission: "$20", residual: "$5" }
  ];

  const handleBecomeAgent = () => {
    router.push(createPageUrl("CuponeadorSignup"));
  };

  return (
    <>
      {/* Call to Action Card */}
      <Card className="bg-green-50/70 border border-green-200/80 shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-[1.02] hover:shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-3 bg-white rounded-full shadow">
              <DollarSign className="w-8 h-8 text-[var(--secondary)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-xl text-gray-900">
                  ¡Gana Dinero Extra!
                </h3>
                <Badge className="bg-[var(--highlight)] text-yellow-900 px-1 py-1 text-xs font-bold inline-flex items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80">
                  <Zap className="w-3 h-3 mr-1" />
                  NUEVO
                </Badge>
              </div>
              <p className="text-gray-700 mt-1 mb-4">
                ¿Te gustan las ventas? Conviértete en{" "}
                <strong>Cuponeador</strong> y gana comisiones ayudando a
                comercios locales.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <div className="font-bold text-green-600 text-lg">$10-$20</div>
              <div className="text-xs text-gray-500">Por cliente</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <div className="font-bold text-blue-600 text-lg">+$75</div>
              <div className="text-xs text-gray-500">Bonus volumen</div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowInfoModal(true)}
              variant="outline"
              className="border-green-300 text-[var(--secondary)] hover:bg-green-100 flex-1 font-semibold"
            >
              Ver Detalles
            </Button>
            <Button
              onClick={handleBecomeAgent}
              className="bg-[var(--secondary)] text-white px-2 py-2 text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 hover:bg-green-600 flex-1"
            >
              <Crown className="w-4 h-4 mr-2" />
              Ser Cuponeador
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <Target className="w-6 h-6 text-green-600" />
              <span>Programa Cuponeador</span>
            </DialogTitle>
            <DialogDescription>
              Conviértete en vendedor independiente y construye tu cartera de
              clientes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Beneficios */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900">
                ¿Por qué ser Cuponeador?
              </h3>
              <div className="grid gap-3">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Icon
                        className={`w-5 h-5 mt-0.5 ${benefit.color}`}
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {benefit.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {benefit.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estructura de Comisiones */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900">
                Estructura de Comisiones
              </h3>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-900">
                        Plan Cliente
                      </th>
                      <th className="text-center p-3 font-medium text-gray-900">
                        Por Cierre
                      </th>
                      <th className="text-center p-3 font-medium text-gray-900">
                        Residual/mes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {commissionStructure.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{item.plan}</div>
                          <div className="text-xs text-gray-500">
                            {item.monthly}/mes
                          </div>
                        </td>
                        <td className="text-center p-3 font-bold text-green-600">
                          {item.commission}
                        </td>
                        <td className="text-center p-3 font-bold text-blue-600">
                          {item.residual}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bonos Adicionales */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">
                🎯 Bonos por Volumen Mensual
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>5 clientes registrados</span>
                  <span className="font-bold text-green-600">+$25</span>
                </div>
                <div className="flex justify-between">
                  <span>10 clientes registrados</span>
                  <span className="font-bold text-green-600">+$75</span>
                </div>
                <div className="flex justify-between">
                  <span>15+ clientes registrados</span>
                  <span className="font-bold text-green-600">+$150</span>
                </div>
              </div>
            </div>

            {/* Cómo Funciona */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900">
                ¿Cómo Funciona?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">
                      Regístrate como Cuponeador
                    </div>
                    <div className="text-sm text-gray-600">
                      Obtienes tu código único y dashboard
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Encuentra Comercios</div>
                    <div className="text-sm text-gray-600">
                      Usa tu código para registrar nuevos clientes
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Gana Comisiones</div>
                    <div className="text-sm text-gray-600">
                      Recibe pagos por cada cliente que se suscribe
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInfoModal(false)}
            >
              Cerrar
            </Button>
            <Button
              onClick={handleBecomeAgent}
              className="bg-green-600 hover:bg-green-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Comenzar Ahora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
