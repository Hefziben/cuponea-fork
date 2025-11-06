"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/api/entities";
import { Cuponeador } from "@/api/entities"; // Assuming Cuponeador entity path
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"; // Assuming Badge component path
import { ArrowLeft, Store, Crown, CheckCircle } from "lucide-react"; // Added Crown and CheckCircle

const categories = [
  { id: "restaurants", name: "Restaurantes y Comida", emoji: "🍽️" },
  { id: "beauty", name: "Belleza y Cuidado Personal", emoji: "💄" },
  { id: "technology", name: "Tecnología y Electrónicos", emoji: "📱" },
  { id: "fashion", name: "Moda y Accesorios", emoji: "👗" },
  { id: "health", name: "Salud y Bienestar", emoji: "🏥" },
  { id: "home", name: "Hogar y Decoración", emoji: "🏠" },
  { id: "entertainment", name: "Entretenimiento", emoji: "🎬" },
  { id: "sports", name: "Deportes y Fitness", emoji: "⚽" },
  { id: "education", name: "Educación", emoji: "📚" },
  { id: "other", name: "Otros", emoji: "🔧" }
];

export default function BusinessSetup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cuponeadorCode, setCuponeadorCode] = useState("");
  const [cuponeadorVerified, setCuponeadorVerified] = useState(false);
  const [cuponeadorInfo, setCuponeadorInfo] = useState(null);

  const [formData, setFormData] = useState({
    business_name: "",
    business_description: "",
    business_category: "",
    business_address: "",
    business_phone: "",
    business_whatsapp: "",
    referred_by: "" // Código del cuponeador
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const verifyCuponeadorCode = async () => {
    if (!cuponeadorCode.trim()) return;

    try {
      setIsLoading(true);
      // Buscar cuponeador por código
      const cuponeadores = await Cuponeador.filter({
        cuponeador_code: cuponeadorCode.trim()
      });

      if (cuponeadores.length > 0) {
        const cuponeador = cuponeadores[0];
        // Obtener info del usuario cuponeador
        const users = await User.filter({ id: cuponeador.user_id });
        const cuponeadorUser = users[0];

        if (cuponeadorUser) {
          setCuponeadorVerified(true);
          setCuponeadorInfo({
            name: cuponeadorUser.full_name,
            code: cuponeador.cuponeador_code,
            level: cuponeador.level,
            clients: cuponeador.clients_registered
          });
          setFormData(prev => ({ ...prev, referred_by: cuponeadorCode.trim() }));
          alert(
            `¡Código verificado! Serás atendido por ${cuponeadorUser.full_name}`
          );
        } else {
          alert("No se encontró el usuario asociado al código de cuponeador.");
        }
      } else {
        alert("Código de cuponeador no válido. Verifica e intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error verifying cuponeador code:", error);
      alert("Error al verificar el código. Inténtalo de nuevo.");
    }
    setIsLoading(false);
  };

  const handleSubmit = async e => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    try {
      await User.updateMyUserData({
        ...formData,
        profile_complete: true
      });

      // Redirigir a la selección de plan
      router.push(createPageUrl("SelectPlan"));
    } catch (error) {
      console.error("Error saving business data:", error);
      alert(
        "Error al guardar la información del negocio. Por favor, inténtalo de nuevo."
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Configura tu Negocio
            </h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Cuponeador Verification Section */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Crown className="w-5 h-5" />
              <span>¿Tienes un Cuponeador?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!cuponeadorVerified ? (
              <div className="space-y-3">
                <p className="text-sm text-green-700">
                  Si un cuponeador te refirió, ingresa su código para recibir
                  atención personalizada y beneficios adicionales.
                </p>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Código del cuponeador (ej: CUP123ABC)"
                    value={cuponeadorCode}
                    onChange={e =>
                      setCuponeadorCode(e.target.value.toUpperCase())}
                    className="text-center font-mono"
                  />
                  <Button
                    onClick={verifyCuponeadorCode}
                    disabled={isLoading || !cuponeadorCode.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "..." : "Verificar"}
                  </Button>
                </div>
                <p className="text-xs text-green-600">
                  Si no tienes un código, puedes continuar sin problema.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Cuponeador Verificado
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <p>
                    <strong>Nombre:</strong> {cuponeadorInfo.name}
                  </p>
                  <p>
                    <strong>Código:</strong> {cuponeadorInfo.code}
                  </p>
                  <p>
                    <strong>Nivel:</strong>{" "}
                    <Badge className="capitalize">{cuponeadorInfo.level}</Badge>
                  </p>
                  <p>
                    <strong>Clientes atendidos:</strong>{" "}
                    {cuponeadorInfo.clients}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCuponeadorVerified(false);
                    setCuponeadorCode("");
                    setCuponeadorInfo(null);
                    setFormData(prev => ({ ...prev, referred_by: "" }));
                  }}
                  className="mt-2 text-green-700 hover:text-green-800"
                >
                  Cambiar cuponeador
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="w-6 h-6 text-orange-600" />
              <span>Información de tu Negocio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="business_name">Nombre del Negocio *</Label>
                  <Input
                    id="business_name"
                    placeholder="Ej: Restaurante El Buen Sabor"
                    value={formData.business_name}
                    onChange={e =>
                      handleInputChange("business_name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="business_category">Categoría *</Label>
                  <Select
                    value={formData.business_category}
                    onValueChange={value =>
                      handleInputChange("business_category", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.emoji} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="business_description">
                    Descripción del Negocio *
                  </Label>
                  <Textarea
                    id="business_description"
                    placeholder="Describe tu negocio, productos o servicios..."
                    value={formData.business_description}
                    onChange={e =>
                      handleInputChange("business_description", e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="business_address">Dirección *</Label>
                  <Input
                    id="business_address"
                    placeholder="Calle, número, ciudad"
                    value={formData.business_address}
                    onChange={e =>
                      handleInputChange("business_address", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="business_phone">Teléfono (opcional)</Label>
                  <Input
                    id="business_phone"
                    placeholder="+1 234 567 8900"
                    value={formData.business_phone}
                    onChange={e =>
                      handleInputChange("business_phone", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="business_whatsapp">
                    WhatsApp (opcional)
                  </Label>
                  <Input
                    id="business_whatsapp"
                    placeholder="+1 234 567 8900"
                    value={formData.business_whatsapp}
                    onChange={e =>
                      handleInputChange("business_whatsapp", e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.business_name ||
                  !formData.business_category ||
                  !formData.business_description ||
                  !formData.business_address
                }
                className="w-full bg-[var(--primary)] hover:bg-purple-600 text-white font-bold py-3"
              >
                {isLoading ? "Creando..." : "Continuar al Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">Tu información está segura</p>
        </div>
      </div>
    </div>
  );
}
