"use client";

import React from "react";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tag, Heart, MapPin, Briefcase } from "lucide-react";

const actions = [
  {
    icon: Briefcase,
    label: "Mis Clientes",
    color: "from-blue-500 to-cyan-500",
    path: "CuponeadorProspecting"
  },
  {
    icon: MapPin,
    label: "Cerca",
    color: "from-green-500 to-emerald-500",
    path: "NearbyOffers"
  },
  {
    icon: Heart,
    label: "Guardados",
    color: "from-red-500 to-pink-500",
    path: "Saved"
  },
  {
    icon: Tag,
    label: "Categorías",
    color: "from-purple-500 to-indigo-500",
    path: "Categories"
  }
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map(action => {
        const Icon = action.icon;
        return (
          <Link key={action.label} href={createPageUrl(action.path)}>
            <Card className="hover:shadow-md transition-all cursor-pointer group border-gray-100">
              <CardContent className="p-4 text-center">
                <div
                  className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-700">
                  {action.label}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
