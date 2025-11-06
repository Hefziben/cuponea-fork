"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/api/entities";
import { Payment } from "@/api/entities";
import { Commission } from "@/api/entities";
import { Cuponeador } from "@/api/entities";
import { Prospect } from "@/api/entities";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  Phone,
  Banknote,
  Clock,
  DollarSign,
  AlertCircle
} from "lucide-react";

const PaymentInstructions = ({ method, amount }) => {
  if (method === "yappy") {
    return (
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
        <h4 className="font-bold text-blue-900 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Instrucciones para Pago con Yappy
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">1.</span>
            <span>Abre tu aplicación de Yappy en tu celular</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">2.</span>
            <span>
              Envía el pago de{" "}
              <strong className="text-blue-900">${amount} USD</strong> a:
            </span>
          </p>
          <div className="bg-white border border-blue-200 rounded p-3 text-center">
            <p className="text-xs text-blue-600 mb-1">Usuario Yappy</p>
            <p className="text-lg font-bold text-blue-900">CUPONEA.PA</p>
          </div>
          <p className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">3.</span>
            <span>
              En el concepto/detalle del pago, escribe tu{" "}
              <strong>email de registro</strong>
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">4.</span>
            <span>
              Haz clic en <strong>"Confirmar Pago"</strong> abajo para
              notificarnos
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (method === "bank_transfer") {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 space-y-3">
        <h4 className="font-bold text-green-900 flex items-center gap-2">
          <Banknote className="w-5 h-5" />
          Instrucciones para Transferencia Bancaria
        </h4>
        <div className="space-y-2 text-sm text-green-800">
          <p className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">1.</span>
            <span>
              Realiza la transferencia de{" "}
              <strong className="text-green-900">${amount} USD</strong> a la
              siguiente cuenta:
            </span>
          </p>
          <div className="bg-white border border-green-200 rounded p-3 space-y-1">
            <p>
              <span className="text-green-600">Banco:</span>{" "}
              <strong>Banco General</strong>
            </p>
            <p>
              <span className="text-green-600">Cuenta:</span>{" "}
              <strong>04-72-99-123456-7</strong>
            </p>
            <p>
              <span className="text-green-600">Nombre:</span>{" "}
              <strong>Cuponea Inc.</strong>
            </p>
            <p>
              <span className="text-green-600">Tipo:</span>{" "}
              <strong>Cuenta de Ahorros</strong>
            </p>
          </div>
          <p className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">2.</span>
            <span>
              En el concepto coloca tu <strong>email de registro</strong>
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">3.</span>
            <span>
              Envía el comprobante a:{" "}
              <strong className="text-green-900">pagos@cuponea.com</strong>
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">4.</span>
            <span>
              Haz clic en <strong>"Confirmar Pago"</strong> abajo para
              notificarnos
            </span>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default function CuponeadorClientPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("yappy");

  // Get data from URL params
  const prospectId = searchParams.get("prospect");
  const planId = searchParams.get("plan");
  const cuponeadorId = searchParams.get("cuponeador");

  const [prospect, setProspect] = useState(null);
  const [cuponeador, setCuponeador] = useState(null);
  const [cuponeadorUser, setCuponeadorUser] = useState(null);

  // Plan details with commissions
  const plans = {
    freemium: { name: "Freemium", price: 0, commission: 5, recurring: 0 },
    basico: { name: "Básico", price: 30, commission: 10, recurring: 3 },
    premium: { name: "Premium", price: 80, commission: 20, recurring: 8 }
  };

  const selectedPlan = plans[planId] || plans.basico;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prospectData, cuponeadorData] = await Promise.all([
        base44.entities.Prospect.filter({ id: prospectId }),
        base44.entities.Cuponeador.filter({ id: cuponeadorId })
      ]);

      if (prospectData.length > 0) {
        setProspect(prospectData[0]);
      }

      if (cuponeadorData.length > 0) {
        setCuponeador(cuponeadorData[0]);

        // Get cuponeador user info
        const users = await base44.entities.User.filter({
          id: cuponeadorData[0].user_id
        });
        if (users.length > 0) {
          setCuponeadorUser(users[0]);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    try {
      // Create payment record
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      const paymentData = {
        user_id: prospect.id,
        plan: planId,
        amount: selectedPlan.price,
        currency: "USD",
        payment_method: paymentMethod,
        payment_status: "pending",
        transaction_id: `pending_${Date.now()}`,
        billing_period: "monthly",
        expires_at: expiryDate.toISOString().split("T")[0],
        referred_by_cuponeador: cuponeadorId,
        registration_source: "cuponeador"
      };

      await base44.entities.Payment.create(paymentData);

      // Send confirmation emails
      await base44.integrations.Core.SendEmail({
        to: "pagos@cuponea.com",
        subject: `Nuevo Pago Pendiente - Plan ${selectedPlan.name}`,
        body: `
          Nuevo pago pendiente registrado:
          
          - Cliente: ${prospect.business_name}
          - Plan: ${selectedPlan.name}
          - Monto: $${selectedPlan.price} USD
          - Método: ${paymentMethod}
          - Cuponeador: ${cuponeadorUser?.full_name} (${cuponeador?.cuponeador_code})
          - Fecha: ${new Date().toLocaleString()}
          
          ⚠️ ACCIÓN REQUERIDA: Verificar comprobante de pago manual
          
          Una vez verificado:
          - Activar suscripción del cliente
          - Procesar comisión del cuponeador ($${selectedPlan.commission})
        `
      });

      // Send copy to cuponeador
      if (cuponeadorUser?.email) {
        await base44.integrations.Core.SendEmail({
          to: cuponeadorUser.email,
          subject: `Cliente ${prospect.business_name} - Pago en Proceso`,
          body: `
            ¡Hola ${cuponeadorUser.full_name}!
            
            Tu cliente ${prospect.business_name} ha iniciado el proceso de pago para el plan ${selectedPlan.name}.
            
            - Monto: $${selectedPlan.price} USD
            - Tu comisión por cierre: $${selectedPlan.commission}
            ${selectedPlan.recurring > 0
              ? `- Comisión residual: $${selectedPlan.recurring}/mes x 6 meses`
              : ""}
            
            Una vez confirmemos el pago, tu comisión será procesada.
            
            ¡Excelente trabajo!
            - Equipo Cuponea
          `
        });
      }

      setPaymentSuccess(true);

      setTimeout(() => {
        router.push(createPageUrl("CuponeadorDashboard"));
      }, 4000);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error al procesar el pago. Por favor, inténtalo de nuevo.");
    }

    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Pago en Proceso!
              </h2>
              <p className="text-gray-600">
                Hemos recibido la notificación de pago para{" "}
                {prospect?.business_name}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">En revisión</span>
              </div>
              <p className="text-blue-700 text-sm">
                Verificaremos el pago en las próximas 24 horas y activaremos
                la cuenta del cliente.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                <strong>Tu comisión:</strong> ${selectedPlan.commission}
                {selectedPlan.recurring > 0 && (
                  <span className="block mt-1">
                    + ${selectedPlan.recurring}/mes (residual x 6 meses)
                  </span>
                )}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Redirigiendo a tu dashboard...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="text-2xl font-bold text-gray-900">
            Proceso de Pago
          </h1>

          <div className="w-10" />
        </div>

        {/* Client & Plan Info */}
        <Card className="mb-6 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardTitle>Resumen de Suscripción</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="text-lg font-bold text-gray-900">
                {prospect?.business_name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Plan Seleccionado</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedPlan.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monto Mensual</p>
                <p className="text-2xl font-bold text-green-600">
                  ${selectedPlan.price}
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Tu comisión:</strong> ${selectedPlan.commission} (por
                cierre)
                {selectedPlan.recurring > 0 && (
                  <span className="block mt-1">
                    + ${selectedPlan.recurring}/mes durante 6 meses (residual)
                  </span>
                )}
              </p>
            </div>

            {cuponeadorUser && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500">Cuponeador</p>
                <p className="text-sm font-medium text-gray-700">
                  {cuponeadorUser.full_name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                type="button"
                variant={paymentMethod === "yappy" ? "default" : "outline"}
                onClick={() => setPaymentMethod("yappy")}
                className={`h-20 flex-col ${
                  paymentMethod === "yappy"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }`}
              >
                <Phone className="w-6 h-6 mb-2" />
                <span>Yappy</span>
              </Button>

              <Button
                type="button"
                variant={
                  paymentMethod === "bank_transfer" ? "default" : "outline"
                }
                onClick={() => setPaymentMethod("bank_transfer")}
                className={`h-20 flex-col ${
                  paymentMethod === "bank_transfer"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }`}
              >
                <Banknote className="w-6 h-6 mb-2" />
                <span>Transferencia</span>
              </Button>
            </div>

            <PaymentInstructions
              method={paymentMethod}
              amount={selectedPlan.price}
            />
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="mb-6 bg-yellow-50 border-yellow-300">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Importante</p>
              <p>
                El cliente debe realizar el pago según las instrucciones. Una
                vez completado, haz clic en "Confirmar Pago" para notificar a
                nuestro equipo. Verificaremos el pago en 24 horas y
                activaremos la cuenta.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <Button
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg shadow-lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirmar que el Pago fue Realizado
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Al confirmar, declaras que el cliente ha realizado el pago según las
          instrucciones proporcionadas
        </p>
      </div>
    </div>
  );
}
