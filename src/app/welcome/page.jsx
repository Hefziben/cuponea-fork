"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Store,
  Crown,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Welcome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserStatus = useCallback(
    async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.profile_complete) {
          router.push(createPageUrl("Home"));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.log("User not authenticated");
      }
      setIsLoading(false);
    },
    [router]
  );

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  const handleAccountTypeSelection = async accountType => {
    try {
      if (!user) {
        await base44.auth.login();
        return;
      }

      await base44.auth.updateMe({ account_type: accountType });

      if (accountType === "user") {
        await base44.auth.updateMe({ profile_complete: true });
        router.push(createPageUrl("Home"));
      } else if (accountType === "business") {
        router.push(createPageUrl("BusinessSetup"));
      } else if (accountType === "cuponeador") {
        router.push(createPageUrl("CuponeadorSignup"));
      }
    } catch (error) {
      console.error("Error selecting account type:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header con Logo Mejorado */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68aa46b3812d9b619dc0d930/64b6e0ea4_logocuponeamorado.png"
              alt="Cuponea Logo"
              className="h-24 w-auto object-contain animate-in fade-in zoom-in duration-500"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user
                ? `¡Hola ${user.full_name?.split(" ")[0]}!`
                : "¡Bienvenido a CUPONEA!"}
            </h1>
            <p className="text-gray-600 mt-2">
              {user
                ? "Elige cómo quieres usar la plataforma"
                : "La forma inteligente de ahorrar y ganar"}
            </p>
          </div>
        </div>

        {!user ? (
          <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg">
            <div className="space-y-4">
              <div className="text-5xl">🔐</div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  Inicia Sesión para Continuar
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  Accede de forma rápida y segura con tu cuenta de Google.
                </p>
              </div>
              <Button
                onClick={() => base44.auth.login()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 shadow-md text-base"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar con Google
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Usuario Normal */}
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-300 bg-white/90 backdrop-blur-sm"
              onClick={() => handleAccountTypeSelection("user")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-8 h-8 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      Soy Usuario
                      <Sparkles className="w-4 h-4 text-purple-500" />
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Encuentra y usa los mejores cupones y ofertas
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            {/* Comercio */}
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-orange-300 bg-white/90 backdrop-blur-sm"
              onClick={() => handleAccountTypeSelection("business")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Store className="w-8 h-8 text-[var(--urgent)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      Soy Comerciante
                      <Sparkles className="w-4 h-4 text-orange-500" />
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Crea ofertas y atrae más clientes a tu negocio
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            {/* Cuponeador */}
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-green-300 bg-white/90 backdrop-blur-sm"
              onClick={() => handleAccountTypeSelection("cuponeador")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Crown className="w-8 h-8 text-[var(--secondary)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      Ser Cuponeador
                      <Sparkles className="w-4 h-4 text-green-500" />
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Gana dinero recomendando Cuponea a comercios
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
