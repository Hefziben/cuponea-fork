import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from
"@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { Camera, QrCode, Type, Zap } from "lucide-react";

export default function QRScanner({ children }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanMode, setScanMode] = useState("manual"); // "camera" or "manual"
  const fileInputRef = useRef(null);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    // Extraer ID del cupón desde el código
    // Formato esperado: CUPONEA-timestamp-randomstring
    const parts = manualCode.split('-');
    if (parts.length >= 3 && parts[0] === 'CUPONEA') {
      // Simular navegación a verificación (en un caso real buscarías en BD)
      const mockCouponId = `coupon_${parts[2]}`;
      navigate(createPageUrl("VerifyCoupon") + `?qr=${manualCode}&id=${mockCouponId}`);
      setIsOpen(false);
      setManualCode("");
    } else {
      alert("Código QR inválido. Por favor verifica el formato.");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // En un caso real, aquí procesarías la imagen para extraer el QR
    // Por ahora simulamos el proceso
    alert("Funcionalidad de escaneo por imagen en desarrollo. Usa el código manual por ahora.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-[#9b59b6]" />
            <span>Escanear Cupón</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selector */}
          <div className="flex space-x-2">
            <Button
              variant={scanMode === "manual" ? "default" : "outline"}
              onClick={() => setScanMode("manual")}
              className={`flex-1 ${scanMode === "manual" ? 'bg-[#9b59b6] hover:bg-[#8e44ad]' : ''}`}>
              <Type className="w-4 h-4 mr-2" />
              Código Manual
            </Button>
            <Button
              variant={scanMode === "camera" ? "default" : "outline"}
              onClick={() => setScanMode("camera")}
              className={`flex-1 ${scanMode === "camera" ? 'bg-[#9b59b6] hover:bg-[#8e44ad]' : ''}`}>
              <Camera className="w-4 h-4 mr-2" />
              Cámara/Imagen
            </Button>
          </div>

          {scanMode === "manual" &&
          <Card>
              <CardContent className="p-4">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="qr-code">Código QR del Cupón</Label>
                    <Input
                    id="qr-code"
                    placeholder="CUPONEA-1640995200-abc123"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="font-mono text-sm" />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa el código que aparece debajo del QR en el cupón
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full bg-[#1abc9c] hover:bg-[#16a085] text-white">
                    <Zap className="w-4 h-4 mr-2" />
                    Verificar Cupón
                  </Button>
                </form>
              </CardContent>
            </Card>
          }

          {scanMode === "camera" &&
          <Card>
              <CardContent className="p-4 space-y-4">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm mb-4">
                    Toma una foto del código QR o selecciona una imagen de tu galería
                  </p>
                  
                  <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                  ref={fileInputRef} />
                  
                  <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-green-600 hover:bg-green-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Abrir Cámara
                  </Button>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 text-xs">
                    📱 <strong>Consejo:</strong> Asegúrate de que el código QR esté bien iluminado y enfocado para mejores resultados.
                  </p>
                </div>
              </CardContent>
            </Card>
          }

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">¿Cómo usar?</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Encuentra el código QR en el cupón del comercio</li>
              <li>• Escanéalo o ingresa el código manualmente</li>
              <li>• ¡Verifica tu descuento al instante!</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

}