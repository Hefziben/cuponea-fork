"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/clientReal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Map,
  Pin,
  Compass,
  Filter,
  MapPin,
  Bell,
  Sparkles,
  Plus,
  List,
  Search,
  Gamepad2,
  Camera,
  Phone,
  Building
} from "lucide-react";

export default function NearbyOffers() {
  const [nearbyOffers, setNearbyOffers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [alertOffer, setAlertOffer] = useState(null);
  const [user, setUser] = useState(null);
  const [isProspectingMode, setIsProspectingMode] = useState(false);
  const [prospects, setProspects] = useState([]);
  const [showProspectForm, setShowProspectForm] = useState(false);
  const [prospectData, setProspectData] = useState({
    business_name: "",
    address: "",
    phone: "",
    contact_person: "",
    business_type: "",
    notes: ""
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [prospectPhotoUrl, setProspectPhotoUrl] = useState("");
  const fileInputRef = useRef(null);

  const checkNearbyBusinesses = useCallback(async (lat, lng) => {
    try {
      const prompt = `Como sistema de geolocalización, simula que un usuario está caminando cerca de comercios en lat: ${lat}, lng: ${lng}. 
      Genera una respuesta JSON con un comercio cercano que tenga promociones activas.
      Formato: {"hasNearbyOffer": true/false, "businessName": "nombre", "offer": "descripción de la oferta", "distance": "100m"}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            hasNearbyOffer: { type: "boolean" },
            businessName: { type: "string" },
            offer: { type: "string" },
            distance: { type: "string" }
          }
        }
      });

      if (response.hasNearbyOffer) {
        setAlertOffer(response);
        setTimeout(() => {
          setShowLocationAlert(true);
        }, 3000);
      }
    } catch (error) {
      console.error("Error checking nearby businesses:", error);
    }
  }, []);

  const requestLocation = useCallback(
    async () => {
      try {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async position => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              await checkNearbyBusinesses(latitude, longitude);
            },
            error => {
              console.log("Geolocation error:", error);
            }
          );
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
    },
    [checkNearbyBusinesses]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser && currentUser.account_type === "cuponeador") {
        const prospectData = await base44.entities.Prospect.filter({
          cuponeador_id: currentUser.id
        });
        setProspects(prospectData);
      }

      const offers = await base44.entities.Coupon.filter(
        { is_active: true },
        "-created_at",
        10
      );

      const prompt = `Genera información de ubicación para estos cupones como si fueran comercios cercanos al usuario.
      Para cada cupón, asigna una distancia realista (50m-2km) y una ubicación descriptiva.
      Cupones: ${offers.map(o => o.title).join(", ")}`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            locations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  distance: { type: "string" },
                  location: { type: "string" },
                  isNearby: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      const offersWithLocation = offers.map((offer, index) => ({
        ...offer,
        distance:
          aiResponse.locations[index]?.distance ||
          `${Math.floor(Math.random() * 1000 + 100)}m`,
        location:
          aiResponse.locations[index]?.location || "Centro de la ciudad",
        isNearby: aiResponse.locations[index]?.isNearby || Math.random() > 0.5
      }));

      setNearbyOffers(offersWithLocation);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(
    () => {
      loadData();
      requestLocation();
    },
    [loadData, requestLocation]
  );

  const handleToggleProspecting = () => {
    setIsProspectingMode(!isProspectingMode);
  };

  const handleAddProspect = async () => {
    if (!userLocation) {
      alert("No se pudo detectar tu ubicación para añadir un prospecto.");
      return;
    }
    if (!user || user.account_type !== "cuponeador") {
      alert("Debes ser un cuponeador para añadir prospectos.");
      return;
    }

    setShowProspectForm(true);
  };

  const handleProspectPhotoUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProspectPhotoUrl(file_url);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Error al subir la foto. Inténtalo de nuevo.");
    }
    setIsUploadingPhoto(false);
  };

  const handleSubmitProspect = async e => {
    e.preventDefault();
    if (
      !prospectData.business_name ||
      !prospectData.address ||
      !prospectData.phone
    ) {
      alert(
        "Por favor completa el nombre del negocio, dirección y teléfono."
      );
      return;
    }

    try {
      await base44.entities.Prospect.create({
        cuponeador_id: user.id,
        business_name: prospectData.business_name,
        address: prospectData.address,
        phone: prospectData.phone,
        contact_person: prospectData.contact_person,
        business_type: prospectData.business_type,
        photo_url: prospectPhotoUrl,
        notes: prospectData.notes,
        lat: userLocation.lat,
        lng: userLocation.lng,
        status: "pending",
        next_action: "Contactar por primera vez"
      });

      setShowProspectForm(false);
      setProspectData({
        business_name: "",
        address: "",
        phone: "",
        contact_person: "",
        business_type: "",
        notes: ""
      });
      setProspectPhotoUrl("");
      loadData();
      alert("¡Prospecto añadido exitosamente!");
    } catch (error) {
      console.error("Error creating prospect:", error);
      alert("Hubo un error al añadir el prospecto. Inténtalo de nuevo.");
    }
  };

  const getDiscountText = coupon => {
    switch (coupon.discount_type) {
      case "percentage":
        return `${coupon.discount_value}% OFF`;
      case "fixed_amount":
        return `$${coupon.discount_value} OFF`;
      case "2x1":
        return "2x1";
      case "free_shipping":
        return "ENVÍO GRATIS";
      case "gift":
        return "REGALO";
      default:
        return "DESCUENTO";
    }
  };

  const isCuponeador = user?.account_type === "cuponeador";

  return (
    <div className="bg-slate-50 mx-auto px-4 py-6 max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Compass className="w-8 h-8 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isCuponeador && isProspectingMode
              ? "Modo Prospección"
              : "Ofertas Cerca de Ti"}
          </h1>
        </div>
        <p className="text-gray-600">
          {isCuponeador && isProspectingMode
            ? "Gestiona y añade nuevos comercios"
            : "Descubre promociones a tu alrededor."}
        </p>
      </div>

      {/* Cuponeador Game Info */}
      {isCuponeador &&
        !isProspectingMode && (
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Gamepad2 className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-purple-800 mb-2">
                    Funcionalidad de Juegos para Cuponeadores
                  </h3>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p>
                      • Ayuda a tus comercios clientes a aumentar la viralidad
                      de sus cupones
                    </p>
                    <p>
                      • Gana comisiones adicionales cuando los cupones
                      compartidos son reclamados
                    </p>
                    <p>
                      • Enseña a los comercios cómo activar el modo juego en
                      sus cupones
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {isCuponeador && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Search className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Prospección</h3>
                <p className="text-xs text-green-600">
                  {prospects.length} comercios en seguimiento
                </p>
              </div>
            </div>
            <Button
              onClick={handleToggleProspecting}
              variant={isProspectingMode ? "default" : "outline"}
              className={
                isProspectingMode
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : ""
              }
            >
              {isProspectingMode ? "Ver Ofertas" : "Prospectar"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mapa Placeholder */}
      <Card>
        <CardContent className="p-2">
          <div
            className="relative h-64 w-full rounded-lg bg-gray-200 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1584931214441-835623425f38?q=80&w=1740&auto=format&fit=crop)",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
            onClick={
              isCuponeador && isProspectingMode ? handleAddProspect : undefined
            }
          >
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <Map className="w-12 h-12 text-[var(--primary)] mx-auto mb-2" />
                <h3 className="font-bold text-lg text-gray-900">
                  Mapa Interactivo
                </h3>
                <p className="text-sm text-gray-600">
                  {userLocation
                    ? "Ubicación detectada"
                    : "Detectando ubicación..."}
                </p>
                {userLocation && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    <MapPin className="w-3 h-3 mr-1" />
                    Activo
                  </Badge>
                )}
                {isCuponeador &&
                  isProspectingMode && (
                    <Button
                      size="sm"
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir Prospecto Aquí
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          {isCuponeador && isProspectingMode
            ? "Prospectos Cercanos"
            : "Promociones Cercanas"}
        </h3>
        {isCuponeador && isProspectingMode ? (
          <Button
            size="sm"
            className="space-x-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleAddProspect}
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Aquí</span>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filtrar</span>
          </Button>
        )}
      </div>

      {/* Lista de ofertas o prospectos */}
      <div className="space-y-3">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-300 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
        ) : isCuponeador && isProspectingMode ? (
          prospects.length > 0 ? (
            prospects.map(prospect => (
              <Card
                key={prospect.id}
                className="border-2 border-blue-200 bg-blue-50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {prospect.photo_url && (
                      <img
                        src={prospect.photo_url}
                        alt={prospect.business_name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800">
                          {prospect.business_name}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="capitalize"
                        >
                          {prospect.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {prospect.address}
                        </p>
                        {prospect.phone && (
                          <p className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {prospect.phone}
                          </p>
                        )}
                        {prospect.business_type && (
                          <p className="flex items-center">
                            <Building className="w-3 h-3 mr-1" />
                            {prospect.business_type}
                          </p>
                        )}
                        {prospect.notes && (
                          <p className="text-xs text-gray-500 italic mt-1">
                            {prospect.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              No hay prospectos en seguimiento. ¡Añade uno tocando el mapa!
            </p>
          )
        ) : nearbyOffers.length > 0 ? (
          nearbyOffers.map(offer => (
            <Card
              key={offer.id}
              className={`border-2 transition-all ${offer.isNearby
                ? "border-orange-200 bg-orange-50"
                : "border-gray-100"}`}
            >
              <CardContent className="p-4 flex items-center space-x-4">
                <div
                  className={`p-3 rounded-lg ${offer.isNearby
                    ? "bg-orange-100"
                    : "bg-purple-100"}`}
                >
                  <Pin
                    className={`w-6 h-6 ${offer.isNearby
                      ? "text-[var(--urgent)]"
                      : "text-[var(--primary)]"}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-800">
                      {getDiscountText(offer)}
                    </h4>
                    {offer.isNearby && (
                      <Badge className="bg-[var(--urgent)] text-white text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        ¡Muy cerca!
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {offer.title}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {offer.location} - a {offer.distance}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            No hay ofertas cercanas disponibles.
          </p>
        )}
      </div>

      {/* Modal de Alerta de Proximidad - Only for regular users */}
      {!isCuponeador && (
        <Dialog open={showLocationAlert} onOpenChange={setShowLocationAlert}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-[var(--urgent)]">
                <Bell className="w-6 h-6" />
                <span>¡Oferta Cerca!</span>
              </DialogTitle>
              <DialogDescription className="pt-4">
                {alertOffer && (
                  <div className="text-center space-y-3">
                    <div className="text-4xl">🎉</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {alertOffer.businessName}
                      </h3>
                      <p className="text-gray-700 mt-1">
                        {alertOffer.offer}
                      </p>
                    </div>
                    <Badge className="bg-[var(--urgent)] text-white">
                      <MapPin className="w-3 h-3 mr-1" />
                      A solo {alertOffer.distance}
                    </Badge>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                variant="outline"
                onClick={() => setShowLocationAlert(false)}
              >
                Más tarde
              </Button>
              <Button
                className="bg-[var(--urgent)] hover:bg-orange-600 text-white"
                onClick={() => setShowLocationAlert(false)}
              >
                ¡Ver Oferta!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Formulario Completo de Prospección - MEJORADO */}
      <Dialog open={showProspectForm} onOpenChange={setShowProspectForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-green-600" />
              <span>Añadir Nuevo Prospecto</span>
            </DialogTitle>
            <DialogDescription>
              Registra todos los detalles del comercio para un mejor
              seguimiento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitProspect} className="space-y-4 py-4">
            {/* Foto del Local */}
            <div>
              <Label>Foto del Local *</Label>
              <div className="space-y-3 mt-2">
                {prospectPhotoUrl ? (
                  <div className="relative">
                    <img
                      src={prospectPhotoUrl}
                      alt="Prospect"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProspectPhotoUrl("")}
                      className="absolute top-2 right-2 bg-white/90"
                    >
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">
                      Toma o sube una foto del comercio
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="w-full"
                    >
                      {isUploadingPhoto ? (
                        "Subiendo..."
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Seleccionar Foto
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProspectPhotoUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                <p className="text-xs text-gray-500">
                  * La foto ayuda a identificar el local más tarde
                </p>
              </div>
            </div>

            {/* Nombre del Negocio */}
            <div>
              <Label htmlFor="business_name">Nombre del Negocio *</Label>
              <Input
                id="business_name"
                value={prospectData.business_name}
                onChange={e =>
                  setProspectData({
                    ...prospectData,
                    business_name: e.target.value
                  })}
                placeholder="Ej: Restaurante El Buen Sabor"
                required
              />
            </div>

            {/* Dirección Completa */}
            <div>
              <Label htmlFor="address">Dirección Completa *</Label>
              <Input
                id="address"
                value={prospectData.address}
                onChange={e =>
                  setProspectData({
                    ...prospectData,
                    address: e.target.value
                  })}
                placeholder="Calle, número, colonia, ciudad"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Incluye referencias para encontrar el local fácilmente
              </p>
            </div>

            {/* Teléfono */}
            <div>
              <Label htmlFor="phone">Teléfono de Contacto *</Label>
              <Input
                id="phone"
                type="tel"
                value={prospectData.phone}
                onChange={e =>
                  setProspectData({ ...prospectData, phone: e.target.value })}
                placeholder="+507 6XXX-XXXX"
                required
              />
            </div>

            {/* Tipo de Negocio y Persona de Contacto */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="business_type">Tipo de Negocio</Label>
                <Input
                  id="business_type"
                  value={prospectData.business_type}
                  onChange={e =>
                    setProspectData({
                      ...prospectData,
                      business_type: e.target.value
                    })}
                  placeholder="Restaurante, Tienda..."
                />
              </div>
              <div>
                <Label htmlFor="contact_person">Contacto</Label>
                <Input
                  id="contact_person"
                  value={prospectData.contact_person}
                  onChange={e =>
                    setProspectData({
                      ...prospectData,
                      contact_person: e.target.value
                    })}
                  placeholder="Nombre del dueño/gerente"
                />
              </div>
            </div>

            {/* Notas Adicionales */}
            <div>
              <Label htmlFor="notes">Notas y Observaciones</Label>
              <Textarea
                id="notes"
                value={prospectData.notes}
                onChange={e =>
                  setProspectData({ ...prospectData, notes: e.target.value })}
                placeholder="Horarios, nivel de interés, próxima acción, etc."
                rows={3}
              />
            </div>

            {/* Ubicación Automática */}
            {userLocation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  Ubicación GPS guardada automáticamente
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProspectForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Guardar Prospecto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
