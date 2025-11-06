"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Cuponeador } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Crown,
  CheckCircle,
  AlertCircle,
  Search
} from "lucide-react";

export default function VerifyCode() {
  const router = useRouter();
  const [cuponeadorCode, setCuponeadorCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerifyCode = async e => {
    e.preventDefault();
    if (!cuponeadorCode.trim()) {
      alert("Por favor ingresa un código de cuponeador");
      return;
    }

    setIsVerifying(true);
    try {
      // Buscar el cuponeador por código
      const cuponeadores = await Cuponeador.filter({
        cuponeador_code: cuponeadorCode.toUpperCase()
      });

      if (cuponeadores.length === 0) {
        setVerificationResult({
          success: false,
          message: "Código de cuponeador no válido"
        });
        setIsVerifying(false);
        return;
      }

      const cuponeador = cuponeadores[0];

      // Obtener información del usuario cuponeador
      const users = await User.list();
      const cuponeadorUser = users.find(u => u.id === cuponeador.user_id);

      setVerificationResult({
        success: true,
        cuponeador: cuponeador,
        user: cuponeadorUser,
        message: "Cuponeador verificado correctamente"
      });
    } catch (error) {
      console.error("Error verifying code:", error);
      setVerificationResult({
        success: false,
        message: "Error al verificar el código"
      });
    }
    setIsVerifying(false);
  };

  const handleUseCode = async () => {
    try {
      const currentUser = await User.me();

      // Asociar el código de referido al usuario actual
      await User.updateMyUserData({
        referred_by: cuponeadorCode.toUpperCase()
      });

      alert("¡Código aplicado! Ahora tienes un cuponeador asociado.");
      router.back();
    } catch (error) {
      console.error("Error applying code:", error);
      alert("Error al aplicar el código");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Verificar Código
            </h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Formulario de Verificación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-purple-600" />
              <span>Código de Cuponeador</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <Label htmlFor="code">Código del Cuponeador</Label>
                <Input
                  id="code"
                  placeholder="Ej: CUP123ABC"
                  value={cuponeadorCode}
                  onChange={e => setCuponeadorCode(e.target.value)}
                  className="uppercase text-center font-mono text-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa el código que te proporcionó tu cuponeador
                </p>
              </div>

              <Button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isVerifying ? (
                  "Verificando..."
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Verificar Código
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultado de la Verificación */}
        {verificationResult && (
          <Card
            className={`mt-6 ${verificationResult.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"}`}
          >
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {verificationResult.success ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <div>
                      <h3 className="text-lg font-bold text-green-800">
                        ¡Código Válido!
                      </h3>
                      <p className="text-green-700 mt-1">
                        {verificationResult.message}
                      </p>
                    </div>

                    {verificationResult.user && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Información del Cuponeador:
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nombre:</span>
                            <span className="font-medium">
                              {verificationResult.user.full_name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Código:</span>
                            <span className="font-mono font-bold">
                              {
                                verificationResult.cuponeador
                                  .cuponeador_code
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nivel:</span>
                            <Badge
                              className={`${verificationResult.cuponeador
                                .level === "oro"
                                ? "bg-yellow-100 text-yellow-800"
                                : verificationResult.cuponeador.level ===
                                  "plata"
                                  ? "bg-gray-100 text-gray-800"
                                  : verificationResult.cuponeador.level ===
                                    "diamante"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-amber-100 text-amber-800"}`}
                            >
                              {verificationResult.cuponeador.level.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleUseCode}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      ✅ Usar Este Código
                    </Button>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <div>
                      <h3 className="text-lg font-bold text-red-800">
                        Código No Válido
                      </h3>
                      <p className="text-red-700 mt-1">
                        {verificationResult.message}
                      </p>
                    </div>
                    <p className="text-sm text-red-600">
                      Verifica que hayas ingresado el código correctamente o
                      contacta a tu cuponeador.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información Adicional */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              ¿Para qué sirve este código?
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Conectarte con un cuponeador verificado</li>
              <li>• Obtener asesoramiento personalizado</li>
              <li>• Acceder a promociones exclusivas</li>
              <li>• Formar parte de su red de referidos</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
