import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BrainCircuit, CheckCircle, Zap, Users, Store } from "lucide-react";

const UserContent = () => (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
    <h3 className="font-semibold text-blue-900 mb-3 flex items-center"><Users className="w-5 h-5 mr-2" />Beneficios para ti:</h3>
    <ul className="space-y-2">
      <li className="flex items-start">
        <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-medium">Cupones solo para ti:</span>
          <p className="text-sm text-blue-700">Nuestra IA aprende de tus gustos para mostrarte ofertas que realmente te interesan.</p>
        </div>
      </li>
      <li className="flex items-start">
        <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-medium">Descubre joyas ocultas:</span>
          <p className="text-sm text-blue-700">Encuentra nuevos lugares y productos basados en tus preferencias, no solo en lo popular.</p>
        </div>
      </li>
      <li className="flex items-start">
        <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-medium">Ahorra tiempo:</span>
          <p className="text-sm text-blue-700">No más búsquedas interminables. Te traemos las mejores ofertas directamente.</p>
        </div>
      </li>
    </ul>
  </div>
);

const BusinessContent = () => (
  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
    <h3 className="font-semibold text-orange-900 mb-3 flex items-center"><Store className="w-5 h-5 mr-2" />Beneficios para tu negocio:</h3>
    <ul className="space-y-2">
      <li className="flex items-start">
        <CheckCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-medium">Creación Mágica:</span>
          <p className="text-sm text-orange-700">Genera títulos, descripciones e imágenes atractivas para tus cupones en segundos.</p>
        </div>
      </li>
      <li className="flex items-start">
        <CheckCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-medium">Predicción de Éxito:</span>
          <p className="text-sm text-orange-700">Nuestra IA analiza tu cupón y predice su potencial de éxito para que tomes mejores decisiones.</p>
        </div>
      </li>
      <li className="flex items-start">
        <CheckCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-medium">Optimiza tus Ofertas:</span>
          <p className="text-sm text-orange-700">Obtén sugerencias para maximizar el impacto de tus campañas y atraer más clientes.</p>
        </div>
      </li>
    </ul>
  </div>
);

export default function AiFeatureModal({ children, userType }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-purple-600" />
            <span className="text-xl">Potenciado por Inteligencia Artificial</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            En Cuponea, usamos IA para crear una experiencia única y más eficiente. Descubre cómo te beneficia:
          </p>
          
          {userType === 'business' ? <BusinessContent /> : <UserContent />}

          <div className="text-center mt-6">
            <p className="text-sm font-medium text-purple-700 flex items-center justify-center">
              <Zap className="w-4 h-4 mr-1" />
              ¡El futuro de los descuentos es inteligente!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}