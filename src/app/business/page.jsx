import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Store } from "lucide-react";

export default function Business() {
  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <Card className="p-8 text-center bg-green-50 border-green-100">
        <div className="space-y-4">
          <div className="text-5xl text-green-500">
            <Store className="inline-block" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-gray-900">Modo Comerciante</h3>
            <p className="text-gray-600">
              Aquí los negocios podrán ver su dashboard de rendimiento y gestionar su perfil. ¡En desarrollo!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}