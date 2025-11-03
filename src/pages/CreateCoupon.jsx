
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import GameDemo from "../components/GameDemo";
import {
  ArrowLeft,
  Upload,
  Eye,
  Calendar,
  Tag,
  Percent,
  DollarSign,
  Gift,
  Truck,
  Save,
  Loader2,
  Gamepad2,
  BrainCircuit,
  Sparkles,
  Star,
  Paintbrush,
  Crown,
  CheckCircle,
  Banknote,
  Clock,
  ArrowRight
} from "lucide-react";

const categories = [
{ id: "restaurants", name: "Restaurantes" },
{ id: "beauty", name: "Belleza" },
{ id: "technology", name: "Tecnología" },
{ id: "fashion", name: "Moda" },
{ id: "health", name: "Salud" },
{ id: "home", name: "Hogar" },
{ id: "entertainment", name: "Entretenimiento" },
{ id: "sports", name: "Deportes" },
{ id: "education", name: "Educación" },
{ id: "other", name: "Otros" }];

const discountTypes = [
{ id: "percentage", name: "Porcentaje", icon: Percent, example: "20% OFF" },
{ id: "fixed_amount", name: "Monto Fijo", icon: DollarSign, example: "$10 OFF" },
{ id: "2x1", name: "2 por 1", icon: Gift, example: "2x1" },
{ id: "free_shipping", name: "Envío Gratis", icon: Truck, example: "ENVÍO GRATIS" },
{ id: "gift", name: "Regalo", icon: Gift, example: "REGALO" }];

export default function CreateCoupon() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    category: "restaurants",
    image_url: "",
    terms_conditions: "",
    valid_from: "",
    valid_until: "",
    max_uses: "",
    is_featured: false,
    enable_sharing: false,
    ai_performance_score: 0
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDesignServiceModal, setShowDesignServiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [designRequestSent, setDesignRequestSent] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (currentUser.account_type !== 'business') {
          navigate(createPageUrl("Home"));
          return;
        }
      } catch (error) {
        navigate(createPageUrl("Welcome"));
      }
      setIsLoading(false);
    };

    loadUser();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleGenerateImage = async () => {
    if (!formData.title || !formData.description) {
      alert("Por favor completa el título y descripción primero para generar una imagen.");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const prompt = `Create a modern, attractive coupon design for: ${formData.title}. Description: ${formData.description}. Style: clean, professional, eye-catching colors, promotional design`;

      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      setFormData({ ...formData, image_url: url });
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error al generar la imagen. Inténtalo de nuevo.");
    }
    setIsGeneratingImage(false);
  };

  const handleGenerateText = async (fieldType) => {
    setIsGeneratingText(fieldType);
    try {
      let prompt;
      if (fieldType === 'title') {
        prompt = `Genera un título corto, directo y atractivo (máximo 10 palabras) para un cupón de la categoría '${formData.category}' con un descuento de '${getDiscountPreview()}'. Opcionalmente usa esta descripción: ${formData.description}. Sé creativo.`;
      } else {
        prompt = `Genera una descripción detallada pero concisa (máximo 30 palabras) para un cupón con el título '${formData.title}' y un descuento de '${getDiscountPreview()}'. Explica el valor y la oferta de forma clara y persuasiva.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setFormData((prev) => ({ ...prev, [fieldType]: response }));

    } catch (error) {
      console.error(`Error generating ${fieldType}:`, error);
      alert(`No se pudo generar el ${fieldType}. Inténtalo de nuevo.`);
    }
    setIsGeneratingText(null);
  };
  
  const handleAiAnalyze = () => {
    let score = 50;
    const suggestions = [];

    if (formData.title.length > 5) {
        score += 10;
    } else {
        suggestions.push("Crea un título más descriptivo (Ej: '20% en pizzas').");
    }

    if (formData.description.length > 15) {
        score += 10;
    } else {
        suggestions.push("Añade una descripción más detallada (Ej: 'Válido en todas nuestras sucursales para pedidos online.').");
    }
    
    if (formData.image_url) {
        score += 20;
    } else {
        suggestions.push("Sube una imagen o genera una con IA para hacerlo más atractivo.");
    }

    if (Number(formData.discount_value) > 0 || (formData.discount_type !== 'percentage' && formData.discount_type !== 'fixed_amount')) {
        if(formData.discount_type === 'percentage' && Number(formData.discount_value) >= 10) score += 10;
        if(formData.discount_type === 'fixed_amount' && Number(formData.discount_value) >= 5) score += 10;
        if(formData.discount_type === '2x1' || formData.discount_type === 'free_shipping' || formData.discount_type === 'gift') score += 10;
    } else {
        suggestions.push("Define un valor para el descuento, o selecciona un tipo como '2x1' o 'Envío Gratis'.");
    }

    if (formData.valid_until && new Date(formData.valid_until) > new Date()) {
      score += 5;
    } else {
      suggestions.push("Establece una fecha de validez futura para el cupón.");
    }

    if (formData.terms_conditions.length > 10) {
      score += 5;
    } else {
      suggestions.push("Añade términos y condiciones claros para evitar confusiones.");
    }

    score = Math.min(score, 100);

    setFormData(prev => ({ ...prev, ai_performance_score: score }));
    setAiSuggestions(suggestions);
  };

  const handleFeatureToggle = (checked) => {
    if (user?.subscription_plan === 'freemium' || !user?.subscription_plan || user?.subscription_plan === 'none') {
        if (checked) {
            setShowUpgradeModal(true);
        }
    } else {
        handleInputChange("is_featured", checked);
    }
  };

  const handleRequestDesign = () => {
    setShowDesignServiceModal(true);
  };

  const handleConfirmDesignRequest = () => {
    setShowDesignServiceModal(false);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    try {
      // Enviar email a gentecreativapanama@gmail.com
      await base44.integrations.Core.SendEmail({
        to: "gentecreativapanama@gmail.com",
        subject: `Nueva Solicitud de Diseño de Cupón - ${user.business_name || user.full_name}`,
        body: `
          ═══════════════════════════════════
          NUEVA SOLICITUD DE DISEÑO DE CUPÓN
          ═══════════════════════════════════
          
          📋 INFORMACIÓN DEL CLIENTE:
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          
          👤 Nombre: ${user.full_name || 'No especificado'}
          🏢 Negocio: ${user.business_name || 'No especificado'}
          📧 Email: ${user.email}
          📱 Teléfono: ${user.business_phone || 'No especificado'}
          💬 WhatsApp: ${user.business_whatsapp || 'No especificado'}
          
          
          🎨 DETALLES DEL CUPÓN:
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          
          📝 Título: ${formData.title || 'No especificado'}
          📄 Descripción: ${formData.description || 'No especificada'}
          🏷️ Categoría: ${formData.category}
          💰 Tipo de descuento: ${formData.discount_type}
          📊 Valor: ${formData.discount_value || 'N/A'}
          
          
          💵 DETALLES DEL PAGO:
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          
          💲 Monto: $15 USD
          🏦 Método: Transferencia Bancaria
          📅 Fecha: ${new Date().toLocaleString('es-PA')}
          ⏰ Estado: PENDIENTE DE CONFIRMACIÓN
          
          
          📝 INSTRUCCIONES:
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          
          1. ✅ Verificar la transferencia bancaria
          2. 🎨 Crear el diseño personalizado del cupón
          3. 📧 Enviar el diseño final al email del cliente
          4. ✉️ Copiar a: info@cuponea.com
          
          
          ⏱️ TIEMPO DE ENTREGA: 24-48 horas
          
          ═══════════════════════════════════
        `
      });

      // Enviar email de confirmación al cliente
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "✅ Solicitud de Diseño Recibida - Cuponea",
        body: `
          Hola ${user.full_name?.split(' ')[0] || 'Cliente'},
          
          ¡Excelente noticia! 🎨
          
          ═══════════════════════════════════
          Tu solicitud de diseño ha sido recibida
          ═══════════════════════════════════
          
          📋 DETALLES DE TU SOLICITUD:
          
          • Cupón: ${formData.title || 'Tu cupón personalizado'}
          • Costo: $15 USD
          • Método de pago: Transferencia Bancaria
          • Fecha: ${new Date().toLocaleDateString('es-PA')}
          
          
          💳 INFORMACIÓN DE PAGO:
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          
          Por favor realiza la transferencia de $15 USD a:
          
          🏦 Banco: Banco General
          💼 Cuenta: 04-72-99-123456-7
          👤 Nombre: Cuponea Inc.
          📝 Tipo: Cuenta de Ahorros
          
          ⚠️ IMPORTANTE: En el concepto de la transferencia,
          coloca tu email: ${user.email}
          
          
          📧 COMPROBANTE:
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          
          Envía el comprobante de pago a:
          📩 pagos@cuponea.com
          
          
          ⏰ ¿CUÁNDO RECIBIRÉ MI DISEÑO?
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          
          Una vez confirmado tu pago, nuestro equipo de
          diseño creará tu cupón en 24-48 horas.
          
          Te enviaremos el diseño final a este correo.
          
          
          📱 ¿NECESITAS AYUDA?
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          
          Contáctanos:
          📧 soporte@cuponea.com
          💬 WhatsApp: +507 6XXX-XXXX
          
          
          ¡Gracias por confiar en Cuponea! 🚀
          
          ════════════════════════════════════
          © ${new Date().getFullYear()} Cuponea - Tu plataforma de cupones
        `
      });

      // Enviar copia a Cuponea para seguimiento
      await base44.integrations.Core.SendEmail({
        to: "info@cuponea.com",
        subject: `[TRACKING] Solicitud de Diseño - ${user.business_name || user.full_name}`,
        body: `
          SOLICITUD PROCESADA EXITOSAMENTE
          
          Cliente: ${user.full_name || 'N/A'}
          Email: ${user.email}
          Negocio: ${user.business_name || 'N/A'}
          Costo: $15 USD
          
          Emails enviados a:
          ✓ gentecreativapanama@gmail.com (equipo de diseño)
          ✓ ${user.email} (cliente)
          
          Fecha: ${new Date().toLocaleString('es-PA')}
          
          Estado: Pendiente de pago
        `
      });

      setShowPaymentModal(false);
      setDesignRequestSent(true);
      
      // Mostrar confirmación al usuario por un tiempo
      setTimeout(() => {
        setDesignRequestSent(false);
      }, 5000); // Hide after 5 seconds
      
    } catch (error) {
      console.error('Error sending design request:', error);
      alert("Error al enviar la solicitud. Por favor, intenta de nuevo o contacta al soporte.");
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const qrCode = `CUPONEA-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      const couponData = {
        ...formData,
        discount_value: formData.discount_value ? Number(formData.discount_value) : 0,
        max_uses: formData.max_uses ? Number(formData.max_uses) : null,
        business_id: user.id,
        qr_code: qrCode,
        is_active: true
      };

      await base44.entities.Coupon.create(couponData);
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Error creating coupon:", error);
      alert("Error al crear el cupón. Por favor, verifica los datos e inténtalo de nuevo.");
    }
    setIsSaving(false);
  };

  const getDiscountPreview = () => {
    const type = discountTypes.find((t) => t.id === formData.discount_type);
    if (!type) return ""; // Should not happen with valid discount_type

    // If it's a type that doesn't use a numeric value, just return its example
    if (['2x1', 'free_shipping', 'gift'].includes(formData.discount_type)) {
      return type.example;
    }
    
    // For percentage or fixed_amount, check if discount_value is provided
    if (!formData.discount_value) return type.example; // Return example if value is missing for numeric types

    switch (formData.discount_type) {
      case 'percentage':
        return `${formData.discount_value}% OFF`;
      case 'fixed_amount':
        return `$${formData.discount_value} OFF`;
      default:
        return type.example; // Fallback for any other type (should be caught by the above check)
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-6 max-w-md mx-auto">
      {/* Success Notification */}
      {designRequestSent && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top">
          <Card className="bg-green-50 border-2 border-green-500 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-green-900">¡Solicitud Enviada!</p>
                <p className="text-sm text-green-700">Revisa tu email para las instrucciones de pago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Crear Cupón</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asistente de IA */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BrainCircuit className="w-6 h-6 text-purple-600" />
                <span className="text-lg">Asistente de Creación IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-purple-700">
                Usa nuestra IA para generar contenido atractivo y predecir el éxito de tu cupón.
              </p>
              <div className="space-y-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAiAnalyze} 
                  className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-purple-50 border-purple-200"
                >
                  <Star className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Analizar Potencial</span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGenerateImage} 
                  disabled={isGeneratingImage} 
                  className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-purple-50 border-purple-200"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  )}
                  <span className="font-medium">
                    {isGeneratingImage ? 'Generando...' : 'Generar Imagen'}
                  </span>
                </Button>
              </div>
              {formData.ai_performance_score > 0 && (
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 mt-4">
                   <p className="text-sm font-medium text-purple-800">
                    Potencial de Éxito: 
                    <span className="font-bold ml-1">{formData.ai_performance_score}/100</span>
                  </p>
                  {aiSuggestions.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-xs text-purple-800 font-semibold">Sugerencias para mejorar:</p>
                      <ul className="list-disc list-inside text-xs text-purple-700 mt-1">
                        {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  ) : (
                     <p className="text-xs text-purple-700 mt-1">
                        ¡Excelente! Este cupón tiene un alto potencial de atraer clientes.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-orange-500" />
                <span>Información Básica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="flex justify-between items-center">
                    <span>Título del Cupón *</span>
                    <Button type="button" variant="link" size="sm" className="h-auto p-0 text-purple-600" onClick={() => handleGenerateText('title')} disabled={isGeneratingText === 'title'}>
                        {isGeneratingText === 'title' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-1" /> Generar</>}
                    </Button>
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: 20% descuento en todos los productos"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required />

              </div>

              <div>
                 <Label htmlFor="description" className="flex justify-between items-center">
                    <span>Descripción *</span>
                    <Button type="button" variant="link" size="sm" className="h-auto p-0 text-purple-600" onClick={() => handleGenerateText('description')} disabled={!formData.title || isGeneratingText === 'description'}>
                        {isGeneratingText === 'description' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-1" /> Generar</>}
                    </Button>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe los detalles de tu oferta..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  required />

              </div>

              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) =>
                    <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tipo de Descuento */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Descuento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {discountTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.discount_type === type.id;

                  return (
                    <Button
                      key={type.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleInputChange("discount_type", type.id)}
                      className={`h-auto p-3 flex flex-col space-y-2 ${
                      isSelected ? 'bg-[#9b59b6] hover:bg-[#8e44ad]' : ''}`
                      }>

                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium text-center">{type.name}</span>
                    </Button>);

                })}
              </div>

              {(formData.discount_type === 'percentage' || formData.discount_type === 'fixed_amount') &&
              <div>
                  <Label htmlFor="discount_value">
                    Valor del Descuento {formData.discount_type === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <Input
                  id="discount_value"
                  type="number"
                  placeholder={formData.discount_type === 'percentage' ? "20" : "10"}
                  value={formData.discount_value}
                  onChange={(e) => handleInputChange("discount_value", e.target.value)} />

                </div>
              }

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-700 mb-2">Vista previa:</p>
                <Badge className="bg-gradient-to-r from-[#9b59b6] to-[#8e44ad] text-white text-lg">
                  {getDiscountPreview()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Imagen del Cupón */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-[#9b59b6]" />
                <span>Imagen del Cupón</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.image_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload').click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Imagen Propia
                  </Button>
                </div>
              </div>

              {/* Servicio de Diseño Gráfico - MEJORADO */}
              <Card className="mt-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <Paintbrush className="w-6 h-6 text-[#1abc9c]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-teal-900 text-lg mb-1">
                        ¿Necesitas un diseño profesional?
                      </h4>
                      <p className="text-sm text-teal-800 mb-3">
                        Nuestro equipo de diseño gráfico creará una imagen impactante y profesional para tu cupón.
                      </p>
                      <div className="bg-white rounded-lg p-3 mb-3 border border-teal-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-teal-900">Incluye:</p>
                            <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                              <li>✓ Diseño personalizado</li>
                              <li>✓ Colores de tu marca</li>
                              <li>✓ 1 revisión gratis</li>
                              <li>✓ Entrega en 24-48h</li>
                            </ul>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-teal-600">Inversión</p>
                            <p className="text-2xl font-bold text-teal-900">$15</p>
                            <p className="text-xs text-teal-600">USD</p>
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        size="sm" 
                        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md"
                        onClick={handleRequestDesign}
                      >
                        <Paintbrush className="w-4 h-4 mr-2" />
                        Solicitar Diseño Profesional
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Opciones de Juego */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gamepad2 className="w-5 h-5 text-purple-600" />
                <span>Activar Juego de Compartir</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-purple-700">
                Permite que los usuarios compartan tu cupón con amigos. Los amigos tendrán 24 horas para reclamarlo.
              </p>
              <div className="flex items-center space-x-3">
                <Switch
                  id="enable_sharing"
                  checked={formData.enable_sharing || false}
                  onCheckedChange={(checked) => handleInputChange("enable_sharing", checked)}
                />
                <Label htmlFor="enable_sharing" className="font-medium text-purple-800">
                  Permitir compartir cupón (Juego activado)
                </Label>
              </div>
              {formData.enable_sharing && (
                <div className="space-y-3">
                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
                    <p className="text-sm text-purple-800">
                      🎮 ¡Genial! Los usuarios podrán compartir este cupón y participar en el juego de Cuponea.
                    </p>
                  </div>
                  <GameDemo />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validez y Límites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#9b59b6]" />
                <span>Validez y Límites</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="valid_from">Válido desde</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => handleInputChange("valid_from", e.target.value)} />

                </div>
                <div>
                  <Label htmlFor="valid_until">Válido hasta</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => handleInputChange("valid_until", e.target.value)} />

                </div>
              </div>

              <div>
                <Label htmlFor="max_uses">Máximo de usos (opcional)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  placeholder="Ej: 100"
                  value={formData.max_uses}
                  onChange={(e) => handleInputChange("max_uses", e.target.value)} />

              </div>

              <div>
                <Label htmlFor="terms_conditions">Términos y Condiciones</Label>
                <Textarea
                  id="terms_conditions"
                  placeholder="Describe las condiciones de uso del cupón..."
                  value={formData.terms_conditions}
                  onChange={(e) => handleInputChange("terms_conditions", e.target.value)}
                  rows={3} />

              </div>

              <div className="flex items-center space-x-3">
                 <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={handleFeatureToggle} 
                 />
                <Label htmlFor="is_featured" className="font-medium flex items-center">
                  Cupón Destacado <Crown className="w-4 h-4 ml-2 text-amber-500" />
                </Label>
              </div>
              <p className="text-xs text-gray-500 pl-10">Tu cupón aparecerá primero y tendrá mayor visibilidad.</p>
            </CardContent>
          </Card>

          {/* Botón de Crear */}
          <Button
            type="submit"
            disabled={isSaving || !formData.title || !formData.description}
            className="w-full bg-gradient-to-r from-[#9b59b6] to-[#8e44ad] hover:from-[#8e44ad] hover:to-[#9b59b6] py-6 text-lg text-white">

            {isSaving ?
            <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creando Cupón...
              </> :

            <>
                <Save className="w-5 h-5 mr-2" />
                Crear Cupón
              </>
            }
          </Button>
        </form>
      </div>

        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Crown className="w-6 h-6 text-amber-500" />
                        <span>Función Premium: Cupón Destacado</span>
                    </DialogTitle>
                    <DialogDescription className="pt-4">
                        La opción de 'Cupón Destacado' está disponible solo en nuestros planes de pago (Pro o Avanzado).
                        <br/><br/>
                        Mejora tu plan para aumentar la visibilidad de tus ofertas, atraer más clientes y acceder a todas nuestras herramientas de IA.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>Cancelar</Button>
                    <Button className="bg-[#9b59b6] hover:bg-[#8e44ad] text-white" onClick={() => {
                      setShowUpgradeModal(false);
                      navigate(createPageUrl("SelectPlan"));
                    }}>
                        Ver Planes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      {/* Modal de Solicitud de Diseño */}
      <Dialog open={showDesignServiceModal} onOpenChange={setShowDesignServiceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Paintbrush className="w-6 h-6 text-[#1abc9c]" />
              <span>Servicio de Diseño Profesional</span>
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <h3 className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    ¿Qué incluye el servicio?
                  </h3>
                  <ul className="text-sm text-teal-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span>Diseño personalizado basado en tu cupón</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span>Colores y tipografías profesionales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span>Formato optimizado para móviles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span>1 revisión incluida</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600">•</span>
                      <span>Entrega en 24-48 horas</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Costo del Servicio</h4>
                      <p className="text-2xl font-bold text-yellow-700 mt-1">$15 USD</p>
                      <p className="text-xs text-yellow-700 mt-1">Pago único por diseño</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Tiempo de Entrega</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Una vez confirmado tu pago, recibirás el diseño final en 24-48 horas vía email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDesignServiceModal(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#1abc9c] to-[#16a085] hover:from-[#16a085] hover:to-[#1abc9c] text-white"
              onClick={handleConfirmDesignRequest}
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Información de Pago */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Banknote className="w-6 h-6 text-green-600" />
              <span>Información de Pago</span>
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="space-y-4">
                {/* Resumen del Pedido */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-purple-900 mb-3">Resumen del Pedido</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Servicio:</span>
                        <span className="font-semibold">Diseño de Cupón</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Cupón:</span>
                        <span className="font-semibold">{formData.title || 'Sin título'}</span>
                      </div>
                      <div className="border-t border-purple-200 pt-2 mt-2 flex justify-between">
                        <span className="font-bold text-purple-900">Total:</span>
                        <span className="font-bold text-2xl text-purple-900">$15 USD</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Instrucciones de Transferencia */}
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Transferencia Bancaria
                  </h3>
                  <div className="bg-white border border-green-200 rounded p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Banco:</span>
                      <span className="font-semibold">Banco General</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cuenta:</span>
                      <span className="font-semibold">04-72-99-123456-7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-semibold">Cuponea Inc.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-semibold">Cuenta de Ahorros</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto:</span>
                      <span className="font-bold text-green-700 text-lg">$15.00 USD</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-yellow-50 border border-yellow-300 rounded p-3">
                    <p className="text-xs text-yellow-900">
                      <strong>⚠️ IMPORTANTE:</strong> En el concepto de la transferencia, coloca tu email: <strong>{user?.email}</strong>
                    </p>
                  </div>
                </div>

                {/* Pasos Siguientes */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 Pasos Siguientes:</h4>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li className="flex gap-2">
                      <span className="font-bold">1.</span>
                      <span>Realiza la transferencia bancaria</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">2.</span>
                      <span>Envía el comprobante a: <strong>pagos@cuponea.com</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">3.</span>
                      <span>Haz clic en "Confirmar Solicitud" abajo</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">4.</span>
                      <span>Recibirás las instrucciones completas por email</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">5.</span>
                      <span>Tu diseño estará listo en 24-48 horas</span>
                    </li>
                  </ol>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              onClick={handleConfirmPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Solicitud
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
