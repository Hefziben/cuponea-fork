"use client";

import React, { useState, useEffect } from "react";
import { Coupon } from "@/api/entities";
import { Business } from "@/api/entities";
import { SavedCoupon } from "@/api/entities";
import { User } from "@/api/entities";
import CouponCard from "@/components/CouponCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Search,
  Filter,
  UtensilsCrossed,
  Sparkles,
  Smartphone,
  Shirt,
  Stethoscope,
  Home,
  Film,
  Trophy
} from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  {
    id: "restaurants",
    name: "Restaurantes",
    icon: UtensilsCrossed,
    color: "text-red-700"
  },
  { id: "beauty", name: "Belleza", icon: Sparkles, color: "text-pink-700" },
  {
    id: "technology",
    name: "Tecnología",
    icon: Smartphone,
    color: "text-blue-700"
  },
  { id: "fashion", name: "Moda", icon: Shirt, color: "text-purple-700" },
  { id: "health", name: "Salud", icon: Stethoscope, color: "text-green-700" },
  { id: "home", name: "Hogar", icon: Home, color: "text-amber-700" },
  {
    id: "entertainment",
    name: "Entretenimiento",
    icon: Film,
    color: "text-indigo-700"
  },
  { id: "sports", name: "Deportes", icon: Trophy, color: "text-emerald-700" }
];

export default function Categories() {
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [businesses, setBusinesses] = useState({});
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("restaurants");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const couponsData = await Coupon.filter(
        { is_active: true },
        "-created_date",
        50
      );
      setCoupons(couponsData);

      const businessIds = [
        ...new Set(couponsData.map(c => c.business_id).filter(id => id))
      ];
      let businessData = {};
      if (businessIds.length > 0) {
        const allBusinesses = await Business.list();
        businessData = allBusinesses.reduce((acc, business) => {
          acc[business.id] = business;
          return acc;
        }, {});
      }
      setBusinesses(businessData);

      if (currentUser) {
        const saved = await SavedCoupon.filter({ user_id: currentUser.id });
        setSavedCoupons(saved.map(s => s.coupon_id));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async couponId => {
    if (!user) return;

    try {
      if (!savedCoupons.includes(couponId)) {
        await SavedCoupon.create({
          user_id: user.id,
          coupon_id: couponId
        });
        setSavedCoupons(prev => [...prev, couponId]);
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
    }
  };

  const handleSearch = term => {
    setSearchTerm(term);
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesCategory = c.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      businesses[c.business_id]
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const selectedCategoryInfo = categories.find(c => c.id === selectedCategory);

  return (
    <div className="pb-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-orange-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Categorías</h1>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-orange-100"
            onClick={() => {
              const term = prompt("Buscar cupones o comercios:");
              if (term !== null) handleSearch(term);
            }}
          >
            <Search className="w-5 h-5" />
          </Button>
          {searchTerm && (
            <div className="absolute -bottom-8 right-0 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
              "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map(category => {
            const categoryCount = coupons.filter(
              c => c.category === category.id
            ).length;
            const isSelected = selectedCategory === category.id;
            const IconComponent = category.icon;

            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                  isSelected
                    ? "ring-2 ring-orange-400 bg-orange-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSearchTerm(""); // Clear search when category changes
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <IconComponent
                      className={`w-8 h-8 ${category.color}`}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {categoryCount} cupones
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected Category Header */}
        {selectedCategoryInfo && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {(() => {
                  const Icon = selectedCategoryInfo.icon;
                  return (
                    <Icon className={`w-7 h-7 ${selectedCategoryInfo.color}`} />
                  );
                })()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategoryInfo.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredCoupons.length} cupones{" "}
                  {searchTerm ? "encontrados" : "disponibles"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (searchTerm) {
                  setSearchTerm("");
                } else {
                  const term = prompt("Filtrar cupones:");
                  if (term !== null) handleSearch(term);
                }
              }}
            >
              {searchTerm ? "Limpiar" : <Filter className="w-4 h-4" />}
            </Button>
          </div>
        )}

        {/* Coupons List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[16/9]" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))
          ) : filteredCoupons.length > 0 ? (
            filteredCoupons.map(coupon => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                business={businesses[coupon.business_id]}
                isSaved={savedCoupons.includes(coupon.id)}
                onSave={() => handleSave(coupon.id)}
              />
            ))
          ) : (
            <Card className="p-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl">🔍</div>
                <h3 className="font-semibold text-gray-900">
                  {searchTerm ? "Sin resultados" : "Sin cupones aún"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? `No encontramos cupones que coincidan con "${searchTerm}"`
                    : "No hay cupones disponibles en esta categoría"}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
