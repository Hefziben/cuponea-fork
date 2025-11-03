import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Gift, Clock, Users, Zap } from "lucide-react";

export default function GameInfoModal({ children }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 text-purple-600" />
            <span>¿Cómo Funciona el Juego?</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Game Badge */}
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 text-lg">
              🎮 JUEGO ACTIVO
            </Badge>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Comparte con Amigos</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Toca el botón "Compartir" y envía el cupón a un amigo por email o WhatsApp
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900">Tiempo Limitado</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Tu amigo tendrá solo <strong>24 horas</strong> para reclamar el cupón antes de que expire
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">¡Ambos Ganan!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Cuando tu amigo reclama el cupón, ¡ambos obtienen puntos y beneficios especiales!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rules */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-orange-500" />
              Reglas del Juego
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Solo puedes compartir cada cupón una vez</li>
              <li>• El comerciante recibe notificación del juego</li>
              <li>• Los cupones compartidos no se pueden revocar</li>
              <li>• Acumulas puntos por cada amigo que reclame</li>
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
              <Gift className="w-4 h-4 mr-2" />
              Beneficios
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700">Conecta amigos</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700">Cupones bonus</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700">Acceso temprano</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700">Puntos extra</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            ¡Diviértete y comparte responsablemente! 🎉
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}