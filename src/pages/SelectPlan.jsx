
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Zap, 
  Rocket, 
  Building,
  CheckCircle,
  ArrowRight,
  CreditCard,
  X,
  ArrowLeft
} from "lucide-react";

const plans = [
  {
    id: "freemium",
    name: "Freemium",
    price: 0,
    period: "gratis",
    icon: Zap,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    features: [
      "1 cupón activo",
      "100 visualizaciones/mes",
      "Soporte básico",
      "Estadísticas simples"
    ],
    limitations: [
      "Sin IA",
      "Sin diseño personalizado",
      "Sin WhatsApp integrado"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 15,
    period: "mes",
    icon: Crown,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    popular: true,
    features: [
      "Hasta 10 cupones",
      "IA básica",
      "Diseño automático",
      "Analítica básica",
      "5,000 visualizaciones/mes",
      "Soporte prioritario"
    ]
  },
  {
    id: "avanzado",
    name: "Avanzado",
    price: 35,
    period: "mes",
    icon: Rocket,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    features: [
      "Cupones ilimitados",
      "IA avanzada",
      "Diseño premium",
      "WhatsApp integrado",
      "Créditos para Video-Cupones", // Added feature
      "Analítica avanzada",
      "20,000 visualizaciones/mes",
      "Soporte VIP 24/7"
    ]
  },
  {
    id: "corporativo",
    name: "Corporativo",
    price: "Personalizado",
    period: "",
    icon: Building,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    features: [
      "Todo lo anterior",
      "Funciones personalizadas",
      "API dedicada",
      "Gerente de cuenta",
      "Visualizaciones ilimitadas",
      "Integraciones especiales"
    ]
  }
];

export default function SelectPlan() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePlanSelection = async (planId) => {
    setSelectedPlan(planId);
    
    if (planId === "freemium") {
      setIsProcessing(true);
      try {
        const currentUser = await User.me();
        
        // Enviar email de confirmación a Cuponea
        await SendEmail({
          to: "info@cuponea.com",
          subject: "Nuevo Cliente - Plan Freemium",
          body: `
            Un nuevo cliente ha seleccionado el plan Freemium:
            
            - Usuario: ${currentUser.full_name}
            - Email: ${currentUser.email}
            - Plan: Freemium ($0/mes)
            - Fecha: ${new Date().toLocaleString()}
            
            Por favor, activa la cuenta del cliente.
          `
        });

        await User.updateMyUserData({
          subscription_plan: "freemium",
          subscription_active: true
        });

        setShowConfirmation(true);
        setTimeout(() => {
          navigate(createPageUrl("Home"));
        }, 3000);
        
      } catch (error) {
        console.error("Error activating free plan:", error);
      }
      setIsProcessing(false);
    } else if (planId === "corporativo") {
      // Redirigir a contacto para plan corporativo
      try {
        const currentUser = await User.me();
        
        // Enviar email de solicitud corporativa
        await SendEmail({
          to: "ventas@cuponea.com",
          subject: "Solicitud Plan Corporativo",
          body: `
            Cliente interesado en plan corporativo:
            
            - Usuario: ${currentUser.full_name}
            - Email: ${currentUser.email}
            - Plan solicitado: Corporativo
            - Fecha: ${new Date().toLocaleString()}
            
            Por favor, contactar al cliente para cotización personalizada.
          `
        });
        
        setShowConfirmation(true);
        setTimeout(() => {
          window.open("mailto:ventas@cuponea.com?subject=Plan Corporativo", "_blank");
        }, 2000);
        
      } catch (error) {
        console.error("Error sending corporate request:", error);
      }
    } else {
      // Proceder al pago
      navigate(createPageUrl("Payment") + "?plan=" + planId);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h2>
              <p className="text-gray-600">
                {selectedPlan === "freemium" 
                  ? "Tu plan gratuito está siendo activado"
                  : "Te contactaremos pronto para tu plan corporativo"
                }
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                ✅ Confirmación enviada a nuestro equipo
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Redirigiendo automáticamente...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with Logo */}
        <div className="flex items-center justify-center mb-6">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68aa46b3812d9b619dc0d930/833f784f9_logocuponeamorado.png" 
            alt="Cuponea Logo" 
            className="h-12 w-auto object-contain" 
          />
        </div>

        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Elige tu Plan Perfecto
            </h1>
            <p className="text-gray-600">
              Comienza a crear cupones increíbles para tu negocio
            </p>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(createPageUrl("Home"))}
            className="hover:bg-white/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                  isSelected 
                    ? 'ring-2 ring-orange-400 shadow-lg border-orange-300' 
                    : 'hover:shadow-md border-gray-200'
                } ${plan.popular ? 'border-2 border-orange-300' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2 text-sm font-medium">
                    ⭐ MÁS POPULAR
                  </div>
                )}
                
                <CardHeader className={`${plan.bgColor} border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                        <div className="flex items-center space-x-1">
                          {typeof plan.price === 'number' ? (
                            <>
                              <span className="text-2xl font-bold text-gray-900">${plan.price}</span>
                              <span className="text-gray-500">/{plan.period}</span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">{plan.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations && (
                      <div className="pt-2 mt-4 border-t border-gray-200">
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs">✕</span>
                            </div>
                            <span className="text-sm text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => handlePlanSelection(selectedPlan)}
            disabled={isProcessing}
            className="w-full max-w-md bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 text-lg shadow-lg"
          >
            {isProcessing ? (
              "Procesando..."
            ) : selectedPlan === "freemium" ? (
              "Comenzar Gratis"
            ) : selectedPlan === "corporativo" ? (
              "Contactar Ventas"
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Continuar al Pago
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 mt-4">
            Podrás cambiar o cancelar tu plan en cualquier momento
          </p>
        </div>
      </div>
    </div>
  );
}
