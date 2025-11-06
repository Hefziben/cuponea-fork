"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  BrainCircuit,
  MessageCircle,
  Target,
  Lightbulb,
  Users,
  DollarSign
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createPageUrl } from "@/utils";

const QuickTips = [
  {
    icon: Target,
    title: "Enfócate en el Valor",
    tip:
      "No vendas características, vende resultados. '¿Cuántos clientes nuevos quieres este mes?'"
  },
  {
    icon: Users,
    title: "Escucha Activamente",
    tip:
      "Haz preguntas sobre sus desafíos actuales antes de presentar Cuponea como solución."
  },
  {
    icon: DollarSign,
    title: "ROI Claro",
    tip:
      "Muestra números concretos: 'Con 10 cupones activos, podrías atraer 100+ clientes nuevos.'"
  }
];

export default function CuponeadorSalesCoach() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scenario, setScenario] = useState("");

  const loadUser = useCallback(
    async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        if (currentUser?.account_type !== "cuponeador") {
          router.push(createPageUrl("Home"));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    },
    [router]
  );

  useEffect(
    () => {
      loadUser();
      // Mensaje de bienvenida del coach
      setMessages([
        {
          type: "coach",
          content:
            "¡Hola! Soy tu Coach de Ventas personal. 💪\n\n¿En qué puedo ayudarte hoy?\n• Preparar una presentación\n• Manejar objeciones\n• Estrategias de cierre\n• Análisis post-venta\n\nCuéntame tu situación..."
        }
      ]);
    },
    [loadUser]
  );

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { type: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const prompt = `Eres un coach de ventas experto especializado en ayudar a vendedores freelance de "Cuponea" (plataforma de cupones digitales para comercios locales).

CONTEXTO DE CUPONEA:
- Planes: Freemium ($0), Básico ($30/mes), Premium ($80/mes)
- Beneficios para comercios: más clientes, cupones digitales, analytics, sin costos fijos
- El cuponeador gana: $10 por plan básico, $20 por premium + bonos de volumen
- Modelo freelance: sin cargas sociales, cobro por resultados

PREGUNTA/SITUACIÓN DEL CUPONEADOR: "${input}"

Responde como un coach experimentado:
- Sé práctico y específico
- Da consejos accionables
- Incluye ejemplos de scripts de venta si es relevante
- Motiva sin ser empalagoso
- Si es sobre objeciones, da respuestas concretas
- Máximo 200 palabras

Respuesta:`;

      const response = await InvokeLLM({ prompt });

      const coachMessage = { type: "coach", content: response };
      setMessages(prev => [...prev, coachMessage]);
    } catch (error) {
      console.error("Error calling sales coach:", error);
      const errorMessage = {
        type: "coach",
        content: "Ups, tuve un problema técnico. ¿Puedes repetir tu pregunta?"
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const handleScenarioClick = scenarioText => {
    setInput(scenarioText);
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(createPageUrl("CuponeadorDashboard"))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center">
          <BrainCircuit className="w-5 h-5 mr-2 text-purple-600" />
          Coach de Ventas IA
        </h1>
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 gap-3 flex-shrink-0">
        {QuickTips.map((tip, index) => (
          <Card
            key={index}
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"
          >
            <CardContent className="p-3">
              <div className="flex items-start space-x-3">
                <tip.icon className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-purple-800 text-sm">
                    {tip.title}
                  </h3>
                  <p className="text-xs text-purple-700 mt-1">{tip.tip}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            Conversación con tu Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea
            className="flex-1 pr-4 mb-4"
            style={{ height: "300px" }}
          >
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === "user"
                    ? "justify-end"
                    : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg ${message.type ===
                    "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"}`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Scenarios */}
          <div className="mb-4 flex-shrink-0">
            <p className="text-xs text-gray-500 mb-2">Temas populares:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "El comercio dice que es muy caro",
                "¿Cómo empiezo la conversación?",
                "No ven valor en los cupones digitales",
                "¿Cómo hago seguimiento sin ser pesado?"
              ].map((scenario, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleScenarioClick(scenario)}
                  className="text-xs h-8"
                >
                  {scenario}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="flex space-x-2 flex-shrink-0">
            <Input
              placeholder="Escribe tu pregunta o situación..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e =>
                e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <BrainCircuit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
