
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { Cuponeador } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Crown, DollarSign, Users, Award, Check, Camera, IdCard, AlertTriangle, CheckCircle } from "lucide-react";

export default function CuponeadorSignup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [idImageUrl, setIdImageUrl] = useState('');
  const [isUploadingId, setIsUploadingId] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    motivation: '',
    sales_experience: '',
    available_hours: '',
    target_goal: '',
    birth_date: '',
    id_number: '',
    terms_accepted: false,
    age_verified: false
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleIdUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingId(true);
    try {
      const { file_url } = await UploadFile({ file });
      setIdImageUrl(file_url);
      setFormData({ ...formData, age_verified: true });
    } catch (error) {
      console.error("Error uploading ID:", error);
      alert("Error al subir la imagen. Inténtalo de nuevo.");
    }
    setIsUploadingId(false);
  };

  const generateCuponeadorCode = () => {
    return 'CUP' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.birth_date) {
      alert('Debes ingresar tu fecha de nacimiento');
      return;
    }

    const age = calculateAge(formData.birth_date);
    if (age < 18) {
      alert('Debes ser mayor de 18 años para ser Cuponeador');
      return;
    }

    if (!formData.age_verified) {
      setShowAgeVerification(true);
      return;
    }

    if (!formData.terms_accepted) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    setIsLoading(true);
    try {
      const user = await User.me();
      
      await User.updateMyUserData({
        profile_complete: true,
        birth_date: formData.birth_date,
        id_number: formData.id_number,
        id_image_url: idImageUrl
      });

      const cuponeadorCode = generateCuponeadorCode();
      await Cuponeador.create({
        user_id: user.id,
        cuponeador_code: cuponeadorCode,
        motivation: formData.motivation,
        sales_experience: formData.sales_experience,
        available_hours: formData.available_hours,
        target_goal: formData.target_goal,
        total_commissions: 0,
        pending_commissions: 0,
        paid_commissions: 0,
        clients_registered: 0,
        active_clients: 0,
        rank_position: 0, // Should be calculated by a backend process
        level: 'bronce',
        is_active: true
      });

      navigate(createPageUrl("CuponeadorDashboard"));
    } catch (error) {
      console.error('Error creating cuponeador:', error);
      alert('Error al registrarte como cuponeador. Inténtalo de nuevo.');
    }
    setIsLoading(false);
  };

  const benefits = [
    { icon: DollarSign, text: "Comisiones inmediatas por cada cliente", color: "text-green-600" },
    { icon: Users, text: "Construye tu cartera de clientes", color: "text-blue-600" },
    { icon: Award, text: "Ranking mensual con premios", color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Welcome"))}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <Crown className="w-5 h-5 mr-2 text-[var(--secondary)]" />
              Registro de Cuponeador
            </h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Completa tu Perfil de Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                 <div className="bg-orange-50 border-l-4 border-[var(--urgent)] p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-[var(--urgent)]" />
                    <h3 className="font-semibold text-orange-800">Verificación de Edad</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => handleInputChange('birth_date', e.target.value)}
                        required
                        className="mt-1"
                      />
                      {formData.birth_date && calculateAge(formData.birth_date) < 18 && (
                        <p className="text-sm text-[var(--alert)] mt-1">
                          Debes ser mayor de 18 años para registrarte.
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="id_number">Número de Cédula/ID *</Label>
                      <Input
                        id="id_number"
                        placeholder="Ej: 1234567890"
                        value={formData.id_number}
                        onChange={(e) => handleInputChange('id_number', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="motivation">¿Por qué quieres ser Cuponeador? *</Label>
                  <Textarea
                    id="motivation"
                    placeholder="Ej: Me gustan las ventas y quiero generar ingresos extra..."
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sales_experience">Experiencia en ventas (opcional)</Label>
                  <Input
                    id="sales_experience"
                    placeholder="Ej: 2 años vendiendo seguros, sin experiencia previa..."
                    value={formData.sales_experience}
                    onChange={(e) => handleInputChange('sales_experience', e.target.value)}
                  />
                </div>
              </div>


              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={formData.terms_accepted}
                  onCheckedChange={(checked) => handleInputChange('terms_accepted', checked)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-snug">
                  Acepto los <a href="#" className="text-[var(--primary)] underline">términos y condiciones</a> del programa Cuponeador. Entiendo que soy un vendedor independiente.
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !formData.terms_accepted || (formData.birth_date && calculateAge(formData.birth_date) < 18)}
                className="w-full bg-[var(--secondary)] hover:bg-green-600 text-white font-bold py-3"
              >
                {isLoading ? "Procesando..." : "Completar Registro"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Age Verification Modal */}
        <Dialog open={showAgeVerification} onOpenChange={setShowAgeVerification}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <IdCard className="w-6 h-6 text-blue-600" />
                <span>Verificación de Identidad</span>
              </DialogTitle>
              <DialogDescription>
                Para cumplir con las regulaciones, necesitamos verificar tu identidad. Por favor, sube una foto clara de tu cédula o documento de identidad.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {idImageUrl ? (
                <div className="text-center">
                  <img src={idImageUrl} alt="ID Document" className="max-w-full h-48 object-contain mx-auto rounded-lg border" />
                  <p className="text-sm text-green-600 mt-2 flex items-center justify-center"><CheckCircle className="w-4 h-4 mr-1"/> Documento cargado.</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border-2 border-dashed">
                  <p className="text-sm text-gray-500">Vista previa de la imagen</p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleIdUpload}
                accept="image/*"
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingId}
                className="w-full"
                variant="outline"
              >
                {isUploadingId ? "Subiendo..." : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    {idImageUrl ? "Cambiar Foto" : "Subir Foto de Cédula"}
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">Tu información es privada y se usa solo para verificación.</p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowAgeVerification(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => setShowAgeVerification(false)}
                disabled={!idImageUrl}
                className="bg-[var(--secondary)] hover:bg-green-600 text-white"
              >
                Continuar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
