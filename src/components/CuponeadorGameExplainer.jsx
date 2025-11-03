import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, DollarSign, Share2, TrendingUp, Lightbulb, ArrowRight } from "lucide-react";

export default function CuponeadorGameExplainer() {
  return (
    <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-purple-600" />
          <span className="text-purple-900">Sistema de Juegos: Ingreso Pasivo Adicional</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ¿Qué es? */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            ¿Qué es el Sistema de Juegos?
          </h3>
          <p className="text-sm text-gray-700">
            Cuando activas la opción de <strong>"Juegos"</strong> en los cupones de tus clientes, 
            permites que los usuarios finales compartan esos cupones con amigos. 
            <strong className="text-purple-700"> ¡Y tú ganas comisiones adicionales por cada canje!</strong>
          </p>
        </div>

        {/* Cómo Funciona */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ¿Cómo Funciona?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Activa el Juego en Cupones</p>
                <p className="text-xs text-gray-600">
                  Enseña a tus clientes a activar "Juegos" cuando crean cupones
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Usuarios Comparten</p>
                <p className="text-xs text-gray-600">
                  Los usuarios finales comparten el cupón con amigos vía WhatsApp/redes sociales
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Amigo Canjea (24h)</p>
                <p className="text-xs text-gray-600">
                  El amigo tiene 24 horas para canjear el cupón en el comercio
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">¡Tú Ganas!</p>
                <p className="text-xs text-green-700 font-semibold">
                  Recibes $2 USD por cada cupón compartido que sea canjeado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ejemplo de Ingresos */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Ejemplo de Ingresos Pasivos
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Cliente crea cupón con juego activado</span>
              <Badge className="bg-white/20 text-white">✓</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>10 usuarios comparten el cupón</span>
              <Badge className="bg-white/20 text-white">✓</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>7 amigos canjean en 24h</span>
              <Badge className="bg-white/20 text-white">7x $2</Badge>
            </div>
            <div className="border-t border-white/30 pt-2 mt-2">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Tu ganancia adicional:</span>
                <span>$14 USD</span>
              </div>
            </div>
          </div>
          <p className="text-xs mt-3 opacity-90">
            * Sin trabajo adicional de tu parte. ¡Es ingreso 100% pasivo!
          </p>
        </div>

        {/* Tips para Cuponeadores */}
        <div className="bg-white rounded-lg p-4 border border-teal-200">
          <h3 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Tips para Maximizar Tus Ganancias
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <span>Explica a tus clientes que cupones con juego tienen <strong>mayor viralidad</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <span>Recomienda activar juegos en cupones de <strong>productos populares</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <span>Cupones con descuentos atractivos (20%+) se comparten <strong>3x más</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <span>Mientras más clientes tengas con juegos activos, <strong>más ganas pasivamente</strong></span>
            </li>
          </ul>
        </div>

        {/* Resumen */}
        <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
          <p className="text-sm text-purple-900 font-semibold text-center">
            💡 <strong>Clave:</strong> No solo ganas por cerrar ventas, también por la actividad 
            viral de los cupones de tus clientes. ¡Más clientes activos = más ingresos recurrentes!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}