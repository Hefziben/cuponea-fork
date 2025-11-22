"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/clientReal";
import AiChatAssistant from "../components/AiChatAssistant";
import { Button } from "@/components/ui/button";
import {
  Home,
  Heart,
  User as UserIcon,
  Plus,
  Bell,
  Briefcase,
  LayoutGrid,
  BarChart3,
  BrainCircuit,
  Map,
  Crown,
  Video,
  Store
} from "lucide-react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (
          !currentUser.profile_complete &&
          !pathname.includes("welcome") &&
          !pathname.includes("business-setup") &&
          !pathname.includes("select-plan") &&
          !pathname.includes("payment") &&
          !pathname.includes("cuponeador-signup")
        ) {
          router.push(createPageUrl("Welcome"));
          return;
        }
      } catch (error) {
        console.error("Error loading user in layout:", error);

        if (
          (error.message?.includes("403") || error.status === 403) &&
          !pathname.includes("welcome") &&
          !pathname.includes("claim") &&
          !pathname.includes("cuponeador-signup")
        ) {
          router.push(createPageUrl("Welcome"));
          return;
        }

        setUser(null);
      }
      setIsLoading(false);
    };

    loadUser();
  }, [pathname, router]);

  const specialPages = [
    "welcome",
    "business-setup",
    "select-plan",
    "payment",
    "claim-coupon",
    "verify-coupon",
    "cuponeador-signup"
  ];
  if (specialPages.some(page => pathname.includes(page))) {
    return children;
  }

  const isBusiness = user?.account_type === "business";
  const isCuponeador = user?.account_type === "cuponeador";

  let navigationItems = [];

  // Items for users
  navigationItems.push({
    name: "Inicio",
    path: createPageUrl("Home"),
    icon: Home,
    key: "home",
    forUser: true
  });

  navigationItems.push({
    name: "Cerca",
    path: createPageUrl("NearbyOffers"),
    icon: Map,
    key: "nearby",
    forUser: true,
    forCuponeador: true
  });

  navigationItems.push({
    name: "Guardados",
    path: createPageUrl("Saved"),
    icon: Heart,
    key: "saved",
    forUser: true
  });

  navigationItems.push({
    name: "Categorías",
    path: createPageUrl("Categories"),
    icon: LayoutGrid,
    key: "categories",
    forUser: true
  });

  // Business-specific items
  if (isBusiness) {
    navigationItems.push({
      name: "Crear",
      path: createPageUrl("CreateCoupon"),
      icon: Plus,
      key: "create",
      forBusiness: true
    });
    navigationItems.push({
      name: "Video",
      path: createPageUrl("CreateVideoCoupon"),
      icon: Video,
      key: "create_video",
      forBusiness: true,
      badge: "NEW"
    });
    navigationItems.push({
      name: "Dashboard",
      path: createPageUrl("Business"),
      icon: BarChart3,
      key: "business_dashboard",
      forBusiness: true
    });
  }

  // Cuponeador-specific items
  if (isCuponeador) {
    navigationItems.push({
      name: "Dashboard",
      path: createPageUrl("CuponeadorDashboard"),
      icon: Crown,
      key: "cuponeador_dashboard",
      forCuponeador: true
    });
    navigationItems.push({
      name: "Clientes",
      path: createPageUrl("CuponeadorProspecting"),
      icon: Briefcase,
      key: "cuponeador_clients",
      forCuponeador: true
    });
    navigationItems.push({
      name: "Coach IA",
      path: createPageUrl("CuponeadorSalesCoach"),
      icon: BrainCircuit,
      key: "cuponeador_sales_coach",
      forCuponeador: true
    });
  }

  // Universal items
  navigationItems.push({
    name: "Perfil",
    path: createPageUrl("Profile"),
    icon: UserIcon,
    key: "profile"
  });

  // Filter navigation items
  navigationItems = navigationItems.filter(item => {
    if (isBusiness)
      return item.forBusiness === true || (!item.forUser && !item.forCuponeador);
    if (isCuponeador)
      return (
        item.forCuponeador === true || (!item.forUser && !item.forBusiness)
      );
    return item.forUser === true || (!item.forBusiness && !item.forCuponeador);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b59b6]" />
      </div>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>Cuponea</title>
      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
          <style>
            {`
              :root {
                --primary: #8E44AD;
                --secondary: #28A745;
                --urgent: #FF9800;
                --highlight: #FFC107;
                --alert: #E53935;
              }
            `}
          </style>

          <header className="bg-white/80 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-50">
            <div className="flex items-center justify-between max-w-md mx-auto px-4 py-3">
              <div className="flex items-center space-x-3">
                <Link href={createPageUrl("Home")} className="flex items-center">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68aa46b3812d9b619dc0d930/64b6e0ea4_logocuponeamorado.png"
                    alt="Cuponea Logo"
                    className="h-8 w-auto"
                  />
                </Link>
                {user?.account_type === "business" && (
                  <span className="bg-purple-100 text-[var(--primary)] text-xs px-2 py-1 rounded-full font-medium">
                    <Store className="w-3 h-3 inline mr-1" />
                    Comercio
                  </span>
                )}
                {user?.account_type === "cuponeador" && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    Cuponeador
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button className="bg-purple-100 text-[var(--primary)] p-2 rounded-full hover:bg-purple-200 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="bg-transparent pb-20 min-h-screen">{children}</main>

          {/* AI Chat Assistant FAB */}
          {user &&
            (user.account_type === "user" ||
              user.account_type === "cuponeador") && (
              <AiChatAssistant user={user}>
                <Button className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-[var(--primary)] text-white shadow-lg hover:scale-110 transition-transform z-40">
                  <BrainCircuit className="w-7 h-7" />
                </Button>
              </AiChatAssistant>
            )}

          {/* Navegación sin nombres, solo iconos */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-3 z-50">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {navigationItems.map(item => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "text-[var(--primary)] bg-purple-50 shadow-sm"
                        : "text-gray-500 hover:text-[var(--primary)] hover:bg-purple-50"
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    {item.badge && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[0.6rem] font-bold px-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
