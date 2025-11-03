import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Zap, 
  Users,
  Gift
} from "lucide-react";

export default function GameDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 horas en segundos
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Usuario comparte cupón", icon: Users, color: "blue" },
    { title: "Amigo recibe enlace", icon: Zap, color: "yellow" },
    { title: "Contador inicia (24h)", icon: Clock, color: "red" },
    { title: "¡Ambos ganan puntos!", icon: Gift, color: "green" }
  ];

  useEffect(() => {
    let interval = null;
    
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return time - 1;
        });
      }, 50);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (isPlaying) {
      const stepInterval = setInterval(() => {
        setStep(prev => (prev + 1) % steps.length);
      }, 2000);
      return () => clearInterval(stepInterval);
    }
  }, [isPlaying, steps.length]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeLeft(24 * 60 * 60);
    setStep(0);
  };

  const progress = ((24 * 60 * 60 - timeLeft) / (24 * 60 * 60)) * 100;

  return (
    <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-0">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-bold flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            Demostración del Juego
          </h3>

          {/* RELOJ 3D ANIMADO */}
          <div className="relative mx-auto w-32 h-32">
            <div className={`absolute inset-0 rounded-full border-4 border-white/30 ${isPlaying ? 'animate-pulse' : ''}`}>
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="white"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${progress * 2.83} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
            </div>

            <div className={`absolute inset-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg ${isPlaying ? 'animate-bounce' : ''}`}>
              <Clock className={`w-8 h-8 text-white ${isPlaying ? 'animate-spin' : ''}`} />
            </div>

            {isPlaying && (
              <>
                <div className="absolute top-2 left-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-2 right-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute left-2 top-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              </>
            )}
          </div>

          {/* CONTADOR DE TIEMPO */}
          <div className="bg-black/20 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-80 mb-1">Tiempo restante:</p>
            <div className="text-3xl font-mono font-bold tracking-wider">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* PASOS DEL JUEGO */}
          <div className="grid grid-cols-2 gap-2">
            {steps.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = index === step && isPlaying;
              const isCompleted = index < step || (!isPlaying && step === 0 && index === 0);
              
              return (
                <div
                  key={index}
                  className={`p-2 rounded-lg border-2 transition-all duration-500 ${
                    isActive 
                      ? 'border-yellow-300 bg-yellow-500/20 scale-105' 
                      : isCompleted 
                        ? 'border-green-300 bg-green-500/20'
                        : 'border-white/30 bg-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <StepIcon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-medium text-center">{stepItem.title}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CONTROLES MEJORADOS */}
          <div className="flex justify-center gap-3 pt-2">
            {!isPlaying ? (
              <Button 
                onClick={handleStart}
                size="sm"
                className="bg-white text-purple-600 hover:bg-white/90 shadow-lg font-semibold"
              >
                <Play className="w-4 h-4 mr-1" />
                Iniciar Demo
              </Button>
            ) : (
              <Button 
                onClick={handlePause}
                size="sm"
                className="bg-white text-purple-600 hover:bg-white/90 shadow-lg font-semibold"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pausar
              </Button>
            )}
            
            <Button 
              onClick={handleReset}
              size="sm"
              className="bg-white/20 text-white hover:bg-white/30 border-2 border-white/50 backdrop-blur-sm shadow-lg font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>

          {timeLeft === 0 && (
            <div className="bg-red-500/20 border border-red-300 rounded-lg p-3">
              <p className="text-sm font-bold">💥 ¡Tiempo agotado!</p>
              <p className="text-xs opacity-90">El cupón ha expirado. ¡Pero pueden intentar con otro!</p>
            </div>
          )}

          <div className="text-xs opacity-75 italic">
            * Esta es una demostración acelerada del juego real
          </div>
        </div>
      </CardContent>
    </Card>
  );
}