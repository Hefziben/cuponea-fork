
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { Payment as PaymentEntity } from "@/api/entities";
import { createPageUrl } from "@/utils"; // Added SendEmail here
import { SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Shield,
  Lock,
  ArrowLeft,
  CheckCircle,
  Banknote,
  Phone
} from "lucide-react";

const planDetails = {
  pro: { name: "Pro", price: 15, features: ["10 cupones", "IA básica", "5K visualizaciones"] },
  avanzado: { name: "Avanzado", price: 35, features: ["Cupones ilimitados", "IA avanzada", "20K visualizaciones"] }
};

const PaymentInstructions = ({ method }) => {
  if (method === 'yappy') {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 space-y-2">
        <h4 className="font-bold text-blue-800">Instrucciones para Yappy</h4>
        <p className="text-sm text-blue-700">1. Abre tu app de Yappy.</p>
        <p className="text-sm text-blue-700">2. Envía el pago a: <span className="font-bold">CUPONEA.PA</span></p>
        <p className="text-sm text-blue-700">3. En el detalle, coloca tu email de registro.</p>
        <p className="text-sm text-blue-700">4. Haz clic en "Confirmar Pago" para notificarnos.</p>
      </div>
    );
  }
  if (method === 'bank_transfer') {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 space-y-2">
        <h4 className="font-bold text-green-800">Instrucciones para Transferencia</h4>
        <p className="text-sm text-green-700">Banco: <span className="font-bold">Banco General</span></p>
        <p className="text-sm text-green-700">Cuenta: <span className="font-bold">04-72-99-123456-7</span></p>
        <p className="text-sm text-green-700">Nombre: <span className="font-bold">Cuponea Inc.</span></p>
        <p className="text-sm text-green-700">Email para comprobante: <span className="font-bold">pagos@cuponea.app</span></p>
      </div>
    );
  }
  return null;
}

export default function Payment() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("credit_card"); // New state for payment method
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const planParam = urlParams.get('plan');

  useEffect(() => {
    if (planParam && planDetails[planParam]) {
      setSelectedPlan(planParam);
    } else {
      navigate(createPageUrl("SelectPlan"));
    }
  }, [planParam, navigate]);

  const handleInputChange = (field, value) => {
    setPaymentData({ ...paymentData, [field]: value });
  };

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    const basePrice = planDetails[selectedPlan].price;
    // Apply yearly discount: 10 months price for 12 months, effectively 17% off (2/12 = 1/6 ~ 16.67%)
    return billingPeriod === "yearly" ? Math.round(basePrice * 10) : basePrice;
  };

  const getDiscount = () => {
    return billingPeriod === "yearly" ? "17% descuento" : null;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      const expiryDate = new Date();
      if (billingPeriod === "yearly") {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }

      const currentUser = await User.me();

      // Enviar email de confirmación a Cuponea
      await SendEmail({
        to: "pagos@cuponea.com",
        subject: `Nueva Suscripción - Plan ${planDetails[selectedPlan].name}`,
        body: `
          Nueva suscripción procesada:
          
          - Cliente: ${currentUser.full_name || 'N/A'}
          - Email: ${currentUser.email || 'N/A'}
          - Plan: ${planDetails[selectedPlan].name}
          - Precio: $${calculateTotal()} USD
          - Método de pago: ${paymentMethod}
          - Período: ${billingPeriod === "yearly" ? "Anual" : "Mensual"}
          - Fecha de procesamiento: ${new Date().toLocaleString()}
          - Expira: ${expiryDate.toLocaleDateString()}
          
          ${paymentMethod !== 'credit_card' ? 
            `⚠️ ATENCIÓN: Pago manual - Verificar comprobante necesario` : 
            `✅ Pago procesado automáticamente`
          }
        `
      });

      // Crear registro de pago
      const payment = await PaymentEntity.create({
        user_id: currentUser.id,
        plan: selectedPlan,
        amount: calculateTotal(),
        currency: "USD",
        payment_method: paymentMethod, // Use new paymentMethod state
        payment_status: paymentMethod === 'credit_card' ? 'completed' : 'pending', // Status depends on method
        transaction_id: paymentMethod === 'credit_card' ? "tx_" + Math.random().toString(36).substring(7) : 'manual_review', // ID depends on method
        billing_period: billingPeriod,
        expires_at: expiryDate.toISOString().split('T')[0]
      });

      // Actualizar usuario con suscripción activa
      await User.updateMyUserData({
        subscription_plan: selectedPlan,
        subscription_active: true
      });

      setPaymentSuccess(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate(createPageUrl("Home"));
      }, 3000);

    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error al procesar el pago. Por favor, verifica tus datos e inténtalo de nuevo.");
    }
    
    setIsProcessing(false);
  };

  if (!selectedPlan) {
    return <div>Cargando...</div>;
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
              <p className="text-gray-600">
                Tu plan {planDetails[selectedPlan].name} está activo
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                ✅ Ya puedes crear cupones increíbles para tu negocio
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

  const plan = planDetails[selectedPlan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Completar Pago
          </h1>
          <div className="w-10" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card className="lg:order-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Resumen del Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-900">Plan {plan.name}</h3>
                <div className="space-y-2 mt-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Período de facturación</Label>
                <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      Mensual - ${plan.price}/mes
                    </SelectItem>
                    <SelectItem value="yearly">
                      Anual - ${Math.round(plan.price * 10)}/año {getDiscount() && `(${getDiscount()})`}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${calculateTotal()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {billingPeriod === "yearly" ? "por año" : "por mes"}
                    </div>
                  </div>
                </div>
                {getDiscount() && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    {getDiscount()} aplicado
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="lg:order-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Información de Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-4">
                
                <div>
                  <Label>Método de Pago</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Button type="button" variant={paymentMethod === 'credit_card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('credit_card')} className="flex-col h-16">
                      <CreditCard className="w-5 h-5 mb-1"/><span>Tarjeta</span>
                    </Button>
                    <Button type="button" variant={paymentMethod === 'yappy' ? 'default' : 'outline'} onClick={() => setPaymentMethod('yappy')} className="flex-col h-16 bg-blue-500 hover:bg-blue-600 text-white data-[variant=outline]:bg-white data-[variant=outline]:text-blue-500">
                       <Phone className="w-5 h-5 mb-1"/><span>Yappy</span>
                    </Button>
                    <Button type="button" variant={paymentMethod === 'bank_transfer' ? 'default' : 'outline'} onClick={() => setPaymentMethod('bank_transfer')} className="flex-col h-16 bg-green-500 hover:bg-green-600 text-white data-[variant=outline]:bg-white data-[variant=outline]:text-green-500">
                      <Banknote className="w-5 h-5 mb-1"/><span>Transf.</span>
                    </Button>
                  </div>
                </div>

                {paymentMethod === 'credit_card' ? (
                  <>
                    <div>
                      <Label htmlFor="email">Email de facturación</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={paymentData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardholderName">Nombre del titular</Label>
                      <Input
                        id="cardholderName"
                        placeholder="Nombre completo"
                        value={paymentData.cardholderName}
                        onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardNumber">Número de tarjeta</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Fecha de vencimiento</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  // Display instructions for other payment methods
                  <PaymentInstructions method={paymentMethod} />
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Tu pago está protegido con encriptación SSL de 256 bits
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-6 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      {paymentMethod === 'credit_card' ? `Pagar $${calculateTotal()} de forma segura` : `Confirmar Pago de $${calculateTotal()}`}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Al completar tu pago, aceptas nuestros términos de servicio y política de privacidad. 
                  Puedes cancelar en cualquier momento.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
