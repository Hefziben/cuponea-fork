"use client";

import React, { useState, useEffect } from "react";
import { Coupon } from "@/api/entities";
import { Business } from "@/api/entities";
import { SavedCoupon } from "@/api/entities";
import { User } from "@/api/entities";
import { UserPreference } from "@/api/entities";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPageUrl } from "@/utils";
import CouponCard from "../components/CouponCard";
import AdBanner from "../components/AdBanner";
import QuickActions from "../components/QuickActions";
import BusinessDashboard from "../components/BusinessDashboard";
import AiFeatureModal from "../components/AiFeatureModal";
import PromotionalPopUp from "../components/PromotionalPopUp";
import InstantOpportunity from "../components/InstantOpportunity";
import CuponeadorCallToAction from "../components/CuponeadorCallToAction";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  BrainCircuit
} from "lucide-react";

const categories = [
  { id: "restaurants", name: "Restaurantes", emoji: "🍽️" },
  { id: "beauty", name: "Belleza", emoji: "💄" },
  { id: "technology", name: "Tecnología", emoji: "📱" },
  { id: "fashion", name: "Moda", emoji: "👗" },
  { id: "health", name: "Salud", emoji: "🏥" },
  { id: "entertainment", name: "Entretenimiento", emoji: "🎬" }
];

export default function Home() {
  const [coupons, setCoupons] = useState([]);
  const [aiCoupons, setAiCoupons] = useState([]);
  const [businesses, setBusinesses] = useState({});
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    const currentUser = await User.me();
    setUser(currentUser);

    // Check account type early to prevent unnecessary data loading for specific roles
    if (
      currentUser?.account_type === "business" ||
      currentUser?.account_type === "cuponeador"
    ) {
      setIsLoading(false);
      return;
    }

    // Load public data (coupons)
    let couponsData = [];
    try {
      couponsData = await Coupon.filter({ is_active: true }, "-created_at", 50);
      setCoupons(couponsData);
    } catch (couponsError) {
      console.error("Error loading coupons:", couponsError);
      setCoupons([]);
    }

    // Load user-specific data only if user is authenticated
    let savedData = [];
    let preferencesData = [];

    if (currentUser) {
      try {
        [savedData, preferencesData] = await Promise.all([
          SavedCoupon.filter({ user_id: currentUser.id }).catch(() => []),
          UserPreference.filter({ user_id: currentUser.id }).catch(() => [])
        ]);
      } catch (userDataError) {
        console.error("Error loading user data:", userDataError);
        // Continue without user-specific data
      }
    }

    // Load business data
    const businessIds = [
      ...new Set(couponsData.map(c => c.business_id).filter(id => id))
    ];
    let businessData = {};
    if (businessIds.length > 0) {
      try {
        const allBusinesses = await Business.list();
        businessData = allBusinesses.reduce((acc, business) => {
          acc[business.id] = business;
          return acc;
        }, {});
      } catch (businessError) {
        console.error("Error loading businesses:", businessError);
      }
    }
    setBusinesses(businessData);

    // Simulación de carga de cupones por IA
    const shuffledCoupons = [...couponsData].sort(() => 0.5 - Math.random());
    setAiCoupons(shuffledCoupons.slice(0, 5));

    if (currentUser && savedData.length >= 0) {
      setSavedCoupons(savedData.map(s => s.coupon_id));
      if (preferencesData.length > 0) {
        setUserPreferences(preferencesData[0]);
      }
    }

    setIsLoading(false);
  };


  // Simplified filtered coupons logic
  const filteredCoupons = coupons.filter(c => {
    if (selectedCategory === "all") return true;
    return c.category === selectedCategory;
  });

  const featuredCoupons = coupons.filter(c => c.is_featured);
  const trendingCoupons = coupons.slice(0, 5);

  if (isLoading) {
    return (
      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  // Mostrar BusinessDashboard para comercios
  if (user?.account_type === "business") {
    return <BusinessDashboard user={user} />;
  }

  // Redirigir a CuponeadorDashboard para cuponeadores
  if (user?.account_type === "cuponeador") {
    router.push(createPageUrl("CuponeadorDashboard"));
    return null;
  }



  return (
    <div className="bg-slate-50 mx-auto px-4 py-6 max-w-md space-y-6">
      <PromotionalPopUp />

      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 text-lg font-bold">
              ¡Hola
              {user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}! 👋
            </h2>
            <p className="text-gray-600 text-sm">
              Encuentra los mejores descuentos
            </p>
          </div>
          <Link
            href={createPageUrl("NearbyOffers")}
            className="flex-shrink-0"
          >
            <div className="bg-[#ffcd00] text-[var(--primary)] px-3 py-2 text-xs flex items-center space-x-1 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer shadow-sm">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Cerca de ti</span>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar cupones, tiendas..."
            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9b59b6] focus:border-transparent bg-white shadow-sm"
          />

          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-100"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Instant Opportunity Component - Only for authenticated users */}
      {user && <InstantOpportunity />}

      {/* Cuponeador Call to Action - NEW: Only show to 'user' role */}
      {user?.account_type === "user" && <CuponeadorCallToAction />}

      {/* AI Recommendations Section - Only if user is authenticated */}
      {user && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-6 h-6 text-[var(--primary)]" />
              <h3 className="font-semibold text-gray-900 text-lg">
                Para Ti, con IA
              </h3>
            </div>
            <AiFeatureModal userType={user?.account_type}>
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--primary)] hover:text-[var(--primary-dark)] hover:bg-purple-50 text-xs"
              >
                ¿Cómo funciona?
              </Button>
            </AiFeatureModal>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4">
            {aiCoupons.length > 0 ? (
              aiCoupons.map(coupon => (
                <div key={`ai-${coupon.id}`} className="w-64 flex-shrink-0">
                  <CouponCard
                    coupon={coupon}
                    business={businesses[coupon.business_id]}
                    isSaved={savedCoupons.includes(coupon.id)}
                    onSave={loadData}
                  />
                </div>
              ))
            ) : (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={`skel-ai-${i}`} className="w-64 flex-shrink-0">
                    <Skeleton className="h-48 w-full" />
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[var(--urgent)]" />
            <h3 className="font-semibold text-gray-900">Categorías</h3>
          </div>
          <Link href={createPageUrl("Categories")}>
            <Button
              variant="ghost"
              size="sm"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              Ver todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Badge
            variant={selectedCategory === "all" ? "default" : "outline"}
            className={`cursor-pointer whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]"
                : "hover:bg-purple-50"
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            Todos
          </Badge>
          {categories.map(category => (
            <Badge
              key={category.id}
              variant={
                selectedCategory === category.id ? "default" : "outline"
              }
              className={`cursor-pointer whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]"
                  : "hover:bg-purple-50"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.emoji} {category.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner />

      {/* Welcome Message for New Users or No Coupons */}
      {!isLoading &&
        coupons.length === 0 && (
          <Card className="p-8 text-center bg-gradient-to-br from-purple-50 to-teal-50 border-purple-100">
            <div className="space-y-4">
              <div className="text-6xl">🎉</div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-gray-900">
                  {user ? "¡Bienvenido a CUPONEA!" : "¡Descubre CUPONEA!"}
                </h3>
                <p className="text-gray-600">
                  {user
                    ? "Tu plataforma de cupones inteligente está lista."
                    : "La mejor plataforma de cupones. Inicia sesión para comenzar."}
                </p>
                {!user && (
                  <p className="text-sm text-gray-500">
                    Los comerciantes pueden empezar a crear cupones desde la
                    sección "Crear"
                  </p>
                )}
              </div>
              <div className="flex justify-center space-x-2 pt-4">
                {user ? (
                  <Link href={createPageUrl("Categories")}>
                    <Button className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white">
                      Explorar Categorías
                    </Button>
                  </Link>
                ) : (
                  <Link href={createPageUrl("Welcome")}>
                    <Button className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white">
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        )}

      {/* Featured Coupons */}
      {featuredCoupons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[var(--highlight)]" />
            <h3 className="font-semibold text-gray-900">
              Cupones Destacados
            </h3>
          </div>

          <div className="space-y-3">
            {featuredCoupons.slice(0, 2).map(coupon => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                business={businesses[coupon.business_id]}
                isSaved={savedCoupons.includes(coupon.id)}
                onSave={loadData}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trending Section */}
      {trendingCoupons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[var(--secondary)]" />
            <h3 className="font-semibold text-gray-900">Tendencias</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {trendingCoupons.slice(0, 4).map(coupon => (
              <div key={coupon.id} className="transform scale-90">
                <CouponCard
                  coupon={coupon}
                  business={businesses[coupon.business_id]}
                  isSaved={savedCoupons.includes(coupon.id)}
                  onSave={loadData}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Coupons */}
      {filteredCoupons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {selectedCategory === "all"
                ? "Todos los Cupones"
                : categories.find(c => c.id === selectedCategory)?.name ||
                  "Cupones"}
            </h3>
            <span className="text-sm text-gray-500">
              {filteredCoupons.length} cupones
            </span>
          </div>

          <div className="space-y-4">
            {filteredCoupons.slice(0, 3).map(coupon => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                business={businesses[coupon.business_id]}
                isSaved={savedCoupons.includes(coupon.id)}
                onSave={loadData}
              />
            ))}

            {filteredCoupons.length > 3 && (
              <Link href={createPageUrl("Categories")}>
                <Card className="bg-[var(--primary)] text-center p-4 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer border-purple-200">
                  <div className="space-y-2">
                    <p className="text-slate-50 font-semibold">
                      Ver más cupones
                    </p>
                    <p className="text-slate-50 text-sm">
                      +{filteredCoupons.length - 3} cupones adicionales
                    </p>
                  </div>
                </Card>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}