import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Send, User as UserIcon, Bot } from 'lucide-react';
import { InvokeLLM } from "@/api/integrations";

export default function AiChatAssistant({ children, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const isCuponeador = user?.account_type === 'cuponeador';

  const getInitialMessage = () => {
    if (isCuponeador) {
      return { 
        role: 'assistant', 
        content: `¡Hola! Soy tu Coach de Ventas IA. 💪

🎯 **PUEDO AYUDARTE CON:**
• Estrategias de prospección
• Scripts para presentaciones
• Manejo de objeciones comunes
• Técnicas de cierre
• Seguimiento de clientes

**CUPONEA - DATOS CLAVE:**
• Plan Básico: $30/mes → Ganas $10 + $3/mes x6
• Plan Premium: $80/mes → Ganas $20 + $8/mes x6  
• Bonos: 5 clientes = +$25, 10 clientes = +$75

¿Qué estrategia quieres mejorar hoy?` 
      };
    }
    return { role: 'assistant', content: '¡Hola! Soy tu asistente de compras IA de Cuponea. ¿Cómo puedo ayudarte a encontrar las mejores ofertas hoy?' };
  };

  const [messages, setMessages] = useState([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let prompt;
      if (isCuponeador) {
        prompt = `Eres un coach de ventas experto para vendedores freelance de "Cuponea" (plataforma de cupones digitales).

DATOS DE CUPONEA:
- Plan Básico: $30/mes (cuponeador gana $10 cierre + $3/mes x6)
- Plan Premium: $80/mes (cuponeador gana $20 cierre + $8/mes x6)
- Bonos volumen: 5 clientes = +$25, 10 clientes = +$75
- Beneficios para comercios: más clientes, cupones digitales, analytics
- Modelo freelance: sin cargas sociales, cobro por resultados

Pregunta del cuponeador: "${input}"

Responde con consejos prácticos de ventas, scripts específicos si es necesario, y sé motivador pero realista. Máximo 150 palabras.`;
      } else {
        prompt = `Eres un asistente de compras amigable para "Cuponea". Ayuda al usuario a encontrar cupones y ofertas. Pregunta: "${input}"`;
      }

      const response = await InvokeLLM({ prompt });
      
      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling LLM:", error);
      const errorMessage = { role: 'assistant', content: 'Lo siento, tuve un problema para conectarme. Por favor, intenta de nuevo.' };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-purple-600" />
            <span>{isCuponeador ? 'Coach de Ventas IA' : 'Asistente de Compras IA'}</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-purple-600" />
                  </div>
                )}
                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-gray-100">
                    <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Input 
              placeholder={isCuponeador ? 'Pide un consejo de ventas...' : 'Pregúntame sobre ofertas...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}