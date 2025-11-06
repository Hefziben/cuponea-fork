"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SavedCoupon } from "@/api/entities";
import { Coupon } from "@/api/entities";
import { Business } from "@/api/entities";
import CouponCard from "@/components/CouponCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Saved() {
  const router = useRouter();
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [businesses, setBusinesses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadSavedCoupons();
  }, []);

  const loadSavedCoupons = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Get saved coupon records
      const savedData = await SavedCoupon.filter({ user_id: currentUser.id });
      setSavedCoupons(savedData);

      if (savedData.length > 0) {
        // Get actual coupon data
        const couponIds = savedData.map(s => s.coupon_id);
        const allCoupons = await Coupon.list();
        const filteredCoupons = allCoupons.filter(c =>
          couponIds.includes(c.id)
        );
        setCoupons(filteredCoupons);

        // Get business data
        const businessIds = [
          ...new Set(filteredCoupons.map(c => c.business_id).filter(id => id))
        ];
        if (businessIds.length > 0) {
          const allBusinesses = await Business.list();
          const businessData = allBusinesses.reduce((acc, business) => {
            acc[business.id] = business;
            return acc;
          }, {});
          setBusinesses(businessData);
        }
      }
    } catch (error) {
      console.error("Error loading saved coupons:", error);
    }
    setIsLoading(false);
  };

  const handleRemoveSaved = async couponId => {
    try {
      const savedRecord = savedCoupons.find(s => s.coupon_id === couponId);
      if (savedRecord) {
        await SavedCoupon.delete(savedRecord.id);
        loadSavedCoupons(); // Reload the list
      }
    } catch (error) {
      console.error("Error removing saved coupon:", error);
    }
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-purple-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Cupones Guardados</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3)
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
            ))}
        </div>
      ) : coupons.length > 0 ? (
        <div className="space-y-4">
          {coupons.map(coupon => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              business={businesses[coupon.business_id]}
              isSaved={true}
              onSave={() => handleRemoveSaved(coupon.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center bg-purple-50 border-purple-100">
          <div className="space-y-4">
            <div className="text-5xl text-purple-500">
              <Heart className="inline-block w-16 h-16" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-gray-900">
                Sin cupones guardados
              </h3>
              <p className="text-gray-600">
                Cuando encuentres cupones que te interesen, guárdalos aquí para
                usarlos más tarde.
              </p>
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => router.push("/")}
            >
              Explorar Cupones
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
