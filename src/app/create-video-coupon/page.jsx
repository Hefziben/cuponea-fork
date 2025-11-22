"use client";

import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/clientReal";
import { useRouter } from "next/navigation";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Upload,
  Video,
  Wand2,
  Play,
  Loader2,
  CheckCircle,
  Gamepad2,
  Flame,
  Crown,
  Sparkles,
  Lock,
  Zap
} from "lucide-react";

const templates = [
  {
    id: "custom",
    name: "Video Personalizado",
    description: "Sube tu propio video",
    icon: Upload
  },
  {
    id: "animated_basic",
    name: "Animación Básica",
    description: "Texto + Logo animado",
    icon: Wand2
  },
  {
    id: "countdown",
    name: "Cuenta Regresiva",
    description: "Video con timer",
    icon: Gamepad2
  },
  {
    id: "treasure_chest",
    name: "Cofre del Tesoro",
    description: "Juego de selección",
    icon: Gamepad2
  },
  {
    id: "scratch_card",
    name: "Raspa y Gana",
    description: "Tarjeta raspable",
    icon: Gamepad2
  }
];

const gameTypes = [
  { id: "none", name: "Sin Juego", description: "Solo video informativo" },
  {
    id: "tap_to_claim",
    name: "Toca para Reclamar",
    description: "Usuario debe tocar en el momento justo"
  },
  {
    id: "countdown",
    name: "Cuenta Regresiva",
    description: "Atrapar cupón antes de que termine"
  },
  {
    id: "choose_box",
    name: "Elige un Cofre",
    description: "Seleccionar entre 3 opciones"
  },
  {
    id: "scratch",
    name: "Raspa y Gana",
    description: "Raspar para revelar descuento"
  }
];

const urgencyTypes = [
  { id: "none", name: "Sin Urgencia" },
  { id: "limited_time", name: "Tiempo Limitado" },
  { id: "flash_sale", name: "Flash Sale" },
  { id: "last_units", name: "Últimas Unidades" }
];

export default function CreateVideoCoupon() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [canCreateVideo, setCanCreateVideo] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState(0);

  const [formData, setFormData] = useState({
    coupon_id: "",
    template_used: "custom",
    game_type: "none",
    urgency_type: "none",
    video_url: "",
    thumbnail_url: "",
    duration: 15,
    has_audio: true,
    has_subtitles: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.account_type !== "business") {
        router.push(createPageUrl("Home"));
        return;
      }

      // Check if user can create video-coupons
      const hasAdvancedPlan = ["avanzado", "corporativo"].includes(
        currentUser.subscription_plan
      );
      const credits = currentUser.video_coupon_credits || 0;
      const used = currentUser.video_coupons_used || 0;

      setCreditsRemaining(credits - used);
      setCanCreateVideo(hasAdvancedPlan || credits - used > 0);

      // Load user's coupons
      const userCoupons = await base44.entities.Coupon.filter({
        business_id: currentUser.id,
        is_active: true
      });
      setCoupons(userCoupons);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleVideoUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate video
    if (!file.type.startsWith("video/")) {
      alert("Por favor sube un archivo de video válido");
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert("El video es demasiado grande. Máximo 50MB");
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Get video duration
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        setFormData({
          ...formData,
          video_url: file_url,
          duration: Math.floor(video.duration)
        });
      };
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error al subir el video. Inténtalo de nuevo.");
    }
    setIsUploading(false);
  };

  const handleGenerateVideo = async () => {
    if (!formData.coupon_id) {
      alert("Selecciona un cupón primero");
      return;
    }

    const coupon = coupons.find(c => c.id === formData.coupon_id);
    if (!coupon) return;

    setIsGenerating(true);
    try {
      // Use AI to generate video description/script
      const prompt = `Crea un script breve (5-10 segundos) para un video-cupón promocional de: "${coupon.title}". 
      Descripción: ${coupon.description}. 
      Incluye: gancho inicial, beneficio clave, y llamada a la acción. Máximo 30 palabras.`;

      const script = await base44.integrations.Core.InvokeLLM({ prompt });

      // For now, use the image as thumbnail if available
      if (coupon.image_url) {
        setFormData({
          ...formData,
          thumbnail_url: coupon.image_url
        });
      }

      alert(
        `Video generado con script: "${script}"\n\nEn producción, aquí se generaría el video con IA.`
      );
    } catch (error) {
      console.error("Error generating video:", error);
    }
    setIsGenerating(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (
      !formData.coupon_id ||
      (!formData.video_url && formData.template_used === "custom")
    ) {
      alert("Completa todos los campos requeridos");
      return;
    }

    // Check if user can create video-coupon
    const hasAdvancedPlan = ["avanzado", "corporativo"].includes(
      user.subscription_plan
    );
    const creditsLeft = creditsRemaining;

    if (!hasAdvancedPlan && creditsLeft <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    setIsUploading(true);
    try {
      // Create video coupon
      await base44.entities.VideoCoupon.create({
        ...formData,
        business_id: user.id
      });

      // Update credits if using trial
      if (!hasAdvancedPlan) {
        await base44.auth.updateMe({
          video_coupons_used: (user.video_coupons_used || 0) + 1
        });
      }

      alert("¡Video-cupón creado exitosamente!");
      router.push(createPageUrl("Business"));
    } catch (error) {
      console.error("Error creating video coupon:", error);
      alert("Error al crear el video-cupón");
    }
    setIsUploading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const hasAdvancedPlan = ["avanzado", "corporativo"].includes(
    user?.subscription_plan
  );

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 min-h-screen pb-20">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Video className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Crear Video-Cupón
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              Potencia tus ofertas con video
            </p>
          </div>
        </div>

        {/* Credits/Plan Status Banner */}
        {!hasAdvancedPlan ? (
          <Card
            className={`${
              creditsRemaining > 0
                ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                : "bg-gradient-to-r from-gray-500 to-gray-600"
            } text-white`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-bold">Prueba Gratuita</h3>
                  </div>
                  <p className="text-sm text-white/90">
                    {creditsRemaining > 0 ? (
                      <>
                        Te quedan <strong>{creditsRemaining}</strong> video-cupón
                        {creditsRemaining !== 1 ? "es" : ""} gratis
                      </>
                    ) : (
                      <>Has usado tus 3 video-cupones gratuitos</>
                    )}
                  </p>
                </div>
                {creditsRemaining <= 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowUpgradeModal(true)}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    Upgrade
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Plan Avanzado Activo</h3>
                  <p className="text-sm text-white/90">
                    Video-cupones ilimitados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Banner */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-4">
            <h3 className="font-bold mb-2">¿Por qué Video-Cupones?</h3>
            <ul className="text-sm space-y-1">
              <li>✨ 3x más engagement que cupones estáticos</li>
              <li>🎮 Gamificación integrada</li>
              <li>📈 Métricas detalladas de rendimiento</li>
              <li>🚀 Mayor viralidad en redes sociales</li>
            </ul>
          </CardContent>
        </Card>

        {/* Form - Show even without credits but disable submit */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Coupon */}
          <Card>
            <CardHeader>
              <CardTitle>1. Selecciona el Cupón</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.coupon_id}
                onValueChange={value =>
                  setFormData({ ...formData, coupon_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elige un cupón activo" />
                </SelectTrigger>
                <SelectContent>
                  {coupons.map(coupon => (
                    <SelectItem key={coupon.id} value={coupon.id}>
                      {coupon.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Video Template */}
          <Card>
            <CardHeader>
              <CardTitle>2. Tipo de Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map(template => {
                const Icon = template.icon;
                return (
                  <Button
                    key={template.id}
                    type="button"
                    variant={
                      formData.template_used === template.id
                        ? "default"
                        : "outline"
                    }
                    className="w-full justify-start h-auto p-4"
                    onClick={() =>
                      setFormData({ ...formData, template_used: template.id })}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">{template.name}</div>
                      <div className="text-xs opacity-80">
                        {template.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Video Upload/Generation */}
          {formData.template_used === "custom" ? (
            <Card>
              <CardHeader>
                <CardTitle>3. Sube tu Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleVideoUpload}
                    accept="video/*"
                    className="hidden"
                  />

                  {formData.video_url ? (
                    <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                      <video
                        src={formData.video_url}
                        controls
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Subido
                      </Badge>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-3">
                        Formato: 9:16 (vertical)<br />
                        Duración: 15-30 segundos<br />
                        Máximo: 50MB
                      </p>
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Seleccionar Video
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>3. Generar con IA</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                  onClick={handleGenerateVideo}
                  disabled={isGenerating || !formData.coupon_id}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generar Video Automático
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  La IA creará un video profesional basado en tu cupón
                </p>
              </CardContent>
            </Card>
          )}

          {/* Game Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-600" />
                4. Gamificación (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.game_type}
                onValueChange={value =>
                  setFormData({ ...formData, game_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gameTypes.map(game => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.name} - {game.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Urgency Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                5. Tipo de Urgencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.urgency_type}
                onValueChange={value =>
                  setFormData({ ...formData, urgency_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyTypes.map(urgency => (
                    <SelectItem key={urgency.id} value={urgency.id}>
                      {urgency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 text-lg"
            disabled={
              isUploading ||
              (!formData.video_url && formData.template_used === "custom") ||
              (!hasAdvancedPlan && creditsRemaining <= 0)
            }
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creando...
              </>
            ) : !hasAdvancedPlan && creditsRemaining <= 0 ? (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Upgrade para Continuar
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Publicar Video-Cupón
              </>
            )}
          </Button>

          {!hasAdvancedPlan &&
            creditsRemaining > 0 && (
              <p className="text-xs text-center text-gray-600">
                Crearás tu video-cupón #
                {user && user.video_coupon_credits
                  ? user.video_coupon_credits - creditsRemaining + 1
                  : ""} de {user && user.video_coupon_credits
                  ? user.video_coupon_credits
                  : ""} gratis
              </p>
            )}
        </form>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Crown className="w-7 h-7 text-yellow-500" />
              Desbloquea Video-Cupones Ilimitados
            </DialogTitle>
            <DialogDescription className="text-base">
              ¡Felicidades! Has probado los video-cupones gratuitos. ¿Te gustó
              el resultado?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
              <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Plan Avanzado - $35/mes
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>
                    <strong>Video-cupones ilimitados</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Cupones ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>IA avanzada para optimización</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>WhatsApp integrado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Analítica avanzada</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>20,000 visualizaciones/mes</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> Los comercios con video-cupones
                obtienen 3x más canjes y engagement que con cupones
                tradicionales.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Tal Vez Después
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => {
                setShowUpgradeModal(false);
                router.push(createPageUrl("SelectPlan"));
              }}
            >
              <Crown className="w-4 h-4 mr-2" />
              Mejorar a Avanzado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
