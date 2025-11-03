
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User } from "@/api/entities";
import { UserPreference } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress"; // New import
import { createPageUrl } from "@/utils";
import {
  LogOut,
  User as UserIcon,
  MapPin,
  Bell,
  Heart,
  Save,
  CreditCard,
  Settings,
  Edit3,
  Phone,
  MessageCircle,
  Store,
  Camera,
  Info,
  FileText,
  Shield,
  HelpCircle,
  Crown, // New import
  Star, // New import
  // Iconos lineales para categorías
  UtensilsCrossed,
  Sparkles,
  Smartphone,
  Shirt,
  Stethoscope,
  Home,
  Film,
  Trophy,
  GraduationCap,
  Wrench } from
"lucide-react";

const allCategories = [
{ id: "restaurants", name: "Restaurantes", icon: UtensilsCrossed, color: "bg-red-100 text-red-700 border-red-200" },
{ id: "beauty", name: "Belleza", icon: Sparkles, color: "bg-pink-100 text-pink-700 border-pink-200" },
{ id: "technology", name: "Tecnología", icon: Smartphone, color: "bg-blue-100 text-blue-700 border-blue-200" },
{ id: "fashion", name: "Moda", icon: Shirt, color: "bg-purple-100 text-purple-700 border-purple-200" },
{ id: "health", name: "Salud", icon: Stethoscope, color: "bg-green-100 text-green-700 border-green-200" },
{ id: "home", name: "Hogar", icon: Home, color: "bg-amber-100 text-amber-700 border-amber-200" },
{ id: "entertainment", name: "Entretenimiento", icon: Film, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
{ id: "sports", name: "Deportes", icon: Trophy, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
{ id: "education", name: "Educación", icon: GraduationCap, color: "bg-teal-100 text-teal-700 border-teal-200" },
{ id: "other", name: "Otros", icon: Wrench, color: "bg-gray-100 text-gray-700 border-gray-200" }];



export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const fileInputRef = React.useRef(null);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setEditForm({
        full_name: currentUser.full_name || "",
        business_name: currentUser.business_name || "",
        business_description: currentUser.business_description || "",
        business_category: currentUser.business_category || "",
        business_address: currentUser.business_address || "",
        business_phone: currentUser.business_phone || "",
        business_whatsapp: currentUser.business_whatsapp || ""
      });

      if (currentUser.account_type === 'user') {
        let userPrefs = await UserPreference.filter({ user_id: currentUser.id });
        if (userPrefs.length > 0) {
          setPreferences(userPrefs[0]);
        } else {
          const newPrefs = await UserPreference.create({
            user_id: currentUser.id,
            preferred_categories: [],
            location: "",
            notifications_enabled: true
          });
          setPreferences(newPrefs);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      navigate("/");
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ avatar_url: file_url });
      await loadUserData();
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    if (!preferences) return;
    const currentCategories = preferences.preferred_categories || [];
    const newCategories = currentCategories.includes(categoryId) ?
    currentCategories.filter((c) => c !== categoryId) :
    [...currentCategories, categoryId];

    setPreferences({ ...preferences, preferred_categories: newCategories });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData(editForm);

      if (preferences?.id) {
        await UserPreference.update(preferences.id, {
          preferred_categories: preferences.preferred_categories,
          location: preferences.location,
          notifications_enabled: preferences.notifications_enabled
        });
      }

      await loadUserData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await User.logout();
    navigate(createPageUrl("Welcome"));
    window.location.reload();
  };

  if (isLoading || !user) {
    return (
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>);

  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-purple-200">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-[#9b59b6] text-white text-2xl">
                    {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  className="hidden"
                  accept="image/*" />
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#9b59b6] hover:bg-[#8e44ad] text-white"
                  onClick={() => fileInputRef.current.click()}>
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-gray-900 text-lg font-bold truncate">{user.full_name}</h2>
                </div>
                <p className="text-gray-500 text-xs font-light truncate">{user.email}</p>

                {/* DYNAMIC ROLE BADGES */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {user.account_type === 'business' ?
                  <Badge className="bg-purple-100 text-[#9b59b6]">
                      <Store className="w-3 h-3 mr-1" />
                      Comercio
                    </Badge> :

                  <>
                      <Badge className={user.current_role === 'cuponeador' && user.role_status === 'active' ?
                    'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'}>
                        {user.current_role === 'cuponeador' ?
                      <>
                            <Crown className="w-3 h-3 mr-1" />
                            Modo: Cuponeador
                          </> :

                      <>
                            <UserIcon className="w-3 h-3 mr-1" />
                            Modo: Usuario
                          </>
                      }
                      </Badge>

                      {/* Show solidary points */}
                      {user.solidary_points > 0 &&
                    <Badge className="bg-yellow-100 text-yellow-700">
                          <Star className="w-3 h-3 mr-1" />
                          {user.solidary_points} pts
                        </Badge>
                    }

                      {/* Show cuponeador level if active */}
                      {user.role_status === 'active' && user.cuponeador_level !== 'none' &&
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          {user.cuponeador_level.toUpperCase()}
                        </Badge>
                    }
                    </>
                  }
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="hover:bg-purple-50 text-gray-500 hover:text-[#9b59b6] transition-colors">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {isEditing &&
          <div className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Nombre completo</Label>
                <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="mt-1" />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico</Label>
                <Input id="email" value={user.email} disabled className="mt-1 bg-gray-100" />
                <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                  <Info className="w-3 h-3" />
                  <span>El correo no se puede cambiar (asociado a Google).</span>
                </p>
              </div>

              {user.account_type === 'business' &&
            <>
                  <div>
                    <Label htmlFor="business_name" className="text-sm font-medium text-gray-700">Nombre del negocio</Label>
                    <Input
                  id="business_name"
                  value={editForm.business_name}
                  onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                  className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="business_description" className="text-sm font-medium text-gray-700">Descripción del negocio</Label>
                    <Textarea
                  id="business_description"
                  value={editForm.business_description}
                  onChange={(e) => setEditForm({ ...editForm, business_description: e.target.value })}
                  rows={3}
                  className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="business_category" className="text-sm font-medium text-gray-700">Categoría</Label>
                    <Select
                  value={editForm.business_category}
                  onValueChange={(value) => setEditForm({ ...editForm, business_category: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center space-x-2">
                                <IconComponent className="w-4 h-4" />
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>);
                    })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="business_address" className="text-sm font-medium text-gray-700">Dirección</Label>
                    <Input
                  id="business_address"
                  value={editForm.business_address}
                  onChange={(e) => setEditForm({ ...editForm, business_address: e.target.value })}
                  className="mt-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="business_phone" className="text-sm font-medium text-gray-700">Teléfono</Label>
                      <Input
                    id="business_phone"
                    value={editForm.business_phone}
                    onChange={(e) => setEditForm({ ...editForm, business_phone: e.target.value })}
                    placeholder="+34 xxx xxx xxx"
                    className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="business_whatsapp" className="text-sm font-medium text-gray-700">WhatsApp</Label>
                      <Input
                    id="business_whatsapp"
                    value={editForm.business_whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, business_whatsapp: e.target.value })}
                    placeholder="+34 xxx xxx xxx"
                    className="mt-1" />
                    </div>
                  </div>
                </>
            }
            </div>
          }
        </CardContent>
      </Card>

      {/* Plan de Suscripción para Comercios */}
      {user.account_type === 'business' &&
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#9b59b6]" />
              <span>Mi Plan de Suscripción</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-semibold text-gray-800 capitalize">{user.subscription_plan || "Freemium"}</p>
                <p className="text-sm text-gray-500">
                  {user.subscription_active ? "Activo" : "Activo"}
                </p>
              </div>
              <Link to={createPageUrl("SelectPlan")}>
                <Button variant="outline">Cambiar Plan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      }

      {/* Show Cuponeador Stats if in cuponeador mode */}
      {user.current_role === 'cuponeador' && user.role_status === 'active' &&
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Crown className="w-5 h-5" />
              Estadísticas de Cuponeador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{user.coupons_created || 0}</p>
                <p className="text-xs text-gray-600">Cupones Creados</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{user.solidary_points || 0}</p>
                <p className="text-xs text-gray-600">Puntos Solidarios</p>
              </div>
            </div>

            {user.cuponeador_level !== 'none' &&
          <div className="bg-white rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Nivel Actual</span>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    {user.cuponeador_level.toUpperCase()}
                  </Badge>
                </div>
                {/* Assuming 100 coupons for next level as a placeholder for progress */}
                <Progress value={(user.coupons_created || 0) / 100 * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.max(0, 100 - (user.coupons_created || 0))} cupones para el siguiente nivel
                </p>
              </div>
          }
          </CardContent>
        </Card>
      }

      {/* Intereses para Usuarios - Mejorado */}
      {user.account_type === 'user' && preferences &&
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-[#9b59b6]" />
              <span>Mis Intereses</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Selecciona tus categorías favoritas para recibir cupones personalizados.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {allCategories.map((category) => {
              const isSelected = preferences.preferred_categories?.includes(category.id);
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`h-auto flex flex-col items-center space-y-2 p-3 text-sm font-medium transition-all ${isSelected ? 'bg-[#9b59b6] text-white hover:bg-[#8e44ad]' : 'hover:bg-purple-50'}`}>
                    <IconComponent className="w-5 h-5" />
                    <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
                  </Button>);
            })}
            </div>
          </CardContent>
        </Card>
      }

      {/* Configuración General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#9b59b6]" />
            <span>Configuración</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.account_type === 'user' && preferences &&
          <>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Ubicación Frecuente</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                  id="location"
                  placeholder="Ej: Madrid, España"
                  value={preferences.location || ""}
                  onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
                  className="pl-9" />
                </div>
              </div>

              <div className={`flex items-center justify-between rounded-lg border-2 p-4 transition-all ${
            preferences.notifications_enabled ?
            'bg-green-50 border-green-300 shadow-sm' :
            'bg-gray-50 border-gray-200'}`
            }>
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="flex items-center space-x-2">
                    <Bell className={`w-4 h-4 ${preferences.notifications_enabled ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={preferences.notifications_enabled ? 'text-green-800 font-medium' : ''}>
                      Notificaciones Push
                    </span>
                  </Label>
                  <p className={`text-xs ${preferences.notifications_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {preferences.notifications_enabled ?
                  '✅ Recibirás avisos de nuevos cupones y ofertas' :
                  'Desactivadas - No recibirás notificaciones'
                  }
                  </p>
                </div>
                <Switch
                id="notifications"
                checked={preferences.notifications_enabled}
                onCheckedChange={(checked) => setPreferences({ ...preferences, notifications_enabled: checked })} />
              </div>
            </>
          }

          {/* Configuración para comerciantes */}
          {user.account_type === 'business' &&
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="space-y-0.5">
                <Label className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-800 font-medium">Notificaciones de Negocio</span>
                </Label>
                <p className="text-xs text-purple-700">
                  ✅ Recibirás avisos cuando los usuarios canjeen tus cupones y estadísticas de rendimiento
                </p>
              </div>
            </div>
          }

          {/* Términos y Condiciones y Privacidad */}
          <div className="space-y-3">
            <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-3 hover:bg-gray-50">
                  <FileText className="w-5 h-5 mr-3 text-gray-500" />
                  <span>Términos y Condiciones</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Términos y Condiciones de Cuponea</DialogTitle>
                  <DialogDescription>
                    Última actualización: Enero 2025
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm max-h-96 overflow-y-auto">
                  <div>
                    <h4 className="font-semibold text-gray-900">1. Aceptación de términos</h4>
                    <p className="text-gray-600 mt-1">
                      Al usar Cuponea, aceptas estos términos y condiciones en su totalidad.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">2. Uso de la plataforma</h4>
                    <p className="text-gray-600 mt-1">
                      Cuponea es una plataforma de cupones digitales que conecta comercios con usuarios finales.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">3. Responsabilidades del usuario</h4>
                    <p className="text-gray-600 mt-1">
                      Los usuarios se comprometen a usar la plataforma de manera responsable y respetuosa.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">4. Responsabilidades del comercio</h4>
                    <p className="text-gray-600 mt-1">
                      Los comercios deben honrar todos los cupones válidos presentados por los usuarios.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowTermsDialog(false)}>Cerrar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-3 hover:bg-gray-50">
                  <Shield className="w-5 h-5 mr-3 text-gray-500" />
                  <span>Política de Privacidad</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Política de Privacidad de Cuponea</DialogTitle>
                  <DialogDescription>
                    Cómo protegemos tu información personal
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm max-h-96 overflow-y-auto">
                  <div>
                    <h4 className="font-semibold text-gray-900">Información que recolectamos</h4>
                    <p className="text-gray-600 mt-1">
                      • Información de perfil (nombre, email)
                      • Preferencias de categorías
                      • Ubicación (opcional, solo para ofertas cercanas)
                      • Historial de cupones canjeados
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cómo usamos tu información</h4>
                    <p className="text-gray-600 mt-1">
                      • Personalizar ofertas y recomendaciones
                      • Mejorar la experiencia de la app
                      • Enviar notificaciones relevantes
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Protección de datos</h4>
                    <p className="text-gray-600 mt-1">
                      Utilizamos encriptación y medidas de seguridad estándar de la industria para proteger tu información.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowPrivacyDialog(false)}>Cerrar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" className="w-full justify-start p-3 hover:bg-gray-50">
              <HelpCircle className="w-5 h-5 mr-3 text-gray-500" />
              <span>Centro de Ayuda</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="space-y-3">
        <Button className="w-full bg-[#9b59b6] hover:bg-[#8e44ad] text-white"
        onClick={handleSaveProfile}
        disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
        <a
          href="https://wa.me/1234567890?text=Hola%2C%20necesito%20ayuda%20con%20Cuponea."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full">
          <Button
            variant="outline" className="bg-background text-[#1abc9c] mt-3 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border h-10 w-full border-[#1abc9c] hover:bg-teal-50 hover:text-[#16a085]">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contactar Soporte
          </Button>
        </a>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>);

}