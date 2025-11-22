import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/clientReal';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  Gift,
  Clock,
  Zap,
  Heart,
  Target,
  Sparkles,
  X
} from "lucide-react";

export default function VideoCouponPlayer({ videoCoupon, coupon, onClaim, onClose }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showClaimButton, setShowClaimButton] = useState(false);

  useEffect(() => {
    // Autoplay when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, show play button
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }

    // Track view
    trackInteraction('view');
  }, []);

  const trackInteraction = async (type, extraData = {}) => {
    try {
      const user = await base44.auth.me();
      await base44.entities.VideoInteraction.create({
        video_coupon_id: videoCoupon.id,
        user_id: user.id,
        interaction_type: type,
        watch_duration: currentTime,
        ...extraData
      });

      // Update video stats
      if (type === 'view') {
        await base44.entities.VideoCoupon.update(videoCoupon.id, {
          views_count: (videoCoupon.views_count || 0) + 1
        });
      } else if (type === 'click') {
        await base44.entities.VideoCoupon.update(videoCoupon.id, {
          clicks_count: (videoCoupon.clicks_count || 0) + 1
        });
      } else if (type === 'share') {
        await base44.entities.VideoCoupon.update(videoCoupon.id, {
          shares_count: (videoCoupon.shares_count || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Show game at 70% of video
      if (!showGame && videoCoupon.game_type !== 'none' && 
          videoRef.current.currentTime / videoRef.current.duration > 0.7) {
        setShowGame(true);
        videoRef.current.pause();
        setIsPlaying(false);
      }

      // Show claim button when video ends
      if (videoRef.current.currentTime >= videoRef.current.duration - 0.5 && !showClaimButton) {
        setShowClaimButton(true);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleShare = async () => {
    trackInteraction('share', { shared_platform: 'native' });
    setPointsEarned(prev => prev + 10);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: coupon.title,
          text: `¡Mira este cupón exclusivo en Cuponea! ${coupon.description}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleGameComplete = (result) => {
    setGameCompleted(true);
    setShowGame(false);
    
    // Award points based on game type
    const gamePoints = {
      'tap_to_claim': 15,
      'countdown': 20,
      'choose_box': 25,
      'scratch': 20,
      'spin': 30
    };
    
    const points = gamePoints[videoCoupon.game_type] || 10;
    setPointsEarned(prev => prev + points);
    
    trackInteraction('game_complete', { 
      game_result: result,
      points_earned: points 
    });

    // Continue video
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleClaim = async () => {
    await trackInteraction('claim');
    await trackInteraction('click');
    onClaim();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Video Container */}
      <div className="relative w-full max-w-md h-[80vh] bg-black rounded-lg overflow-hidden">
        {/* Video */}
        <video
          ref={videoRef}
          src={videoCoupon.video_url}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onEnded={() => setShowClaimButton(true)}
          playsInline
          loop={false}
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Info Bar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {videoCoupon.urgency_type !== 'none' && (
                  <Badge className="bg-red-500 text-white animate-pulse">
                    <Clock className="w-3 h-3 mr-1" />
                    {videoCoupon.urgency_type === 'flash_sale' ? '¡Flash Sale!' : '¡Últimas unidades!'}
                  </Badge>
                )}
                {pointsEarned > 0 && (
                  <Badge className="bg-yellow-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    +{pointsEarned} pts
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleMuteToggle}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Center Play/Pause */}
          {!isPlaying && !showGame && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <Button
                size="lg"
                className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white"
                onClick={handlePlayPause}
              >
                <Play className="w-10 h-10 text-white" />
              </Button>
            </div>
          )}

          {/* Game Overlay */}
          {showGame && !gameCompleted && (
            <GameOverlay
              gameType={videoCoupon.game_type}
              onComplete={handleGameComplete}
            />
          )}

          {/* Bottom Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
            {/* Progress Bar */}
            <Progress value={progress} className="mb-3 h-1" />

            {/* Coupon Info */}
            <div className="text-white mb-3">
              <h3 className="font-bold text-lg">{coupon.title}</h3>
              <p className="text-sm text-white/80 line-clamp-2">{coupon.description}</p>
            </div>

            {/* CTA Button */}
            {(showClaimButton || gameCompleted) && (
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg h-14"
                onClick={handleClaim}
              >
                <Gift className="w-5 h-5 mr-2" />
                ¡Canjear Ahora!
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Game Overlay Component
function GameOverlay({ gameType, onComplete }) {
  const [countdown, setCountdown] = useState(3);
  const [boxes, setBoxes] = useState([
    { id: 1, revealed: false, prize: '10%' },
    { id: 2, revealed: false, prize: '20%' },
    { id: 3, revealed: false, prize: '30%' }
  ]);

  useEffect(() => {
    if (gameType === 'countdown') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameType, onComplete]);

  const handleBoxClick = (box) => {
    setBoxes(boxes.map(b => b.id === box.id ? { ...b, revealed: true } : b));
    setTimeout(() => {
      onComplete(`${box.prize} OFF`);
    }, 1000);
  };

  if (gameType === 'tap_to_claim') {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
        <Button
          size="lg"
          className="w-40 h-40 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse shadow-2xl"
          onClick={() => onComplete('claimed')}
        >
          <div className="text-center">
            <Target className="w-12 h-12 mx-auto mb-2" />
            <span className="text-xl font-bold">¡Toca!</span>
          </div>
        </Button>
      </div>
    );
  }

  if (gameType === 'countdown') {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-bold text-white mb-4 animate-bounce">
            {countdown}
          </div>
          <Button
            size="lg"
            className="bg-red-500 hover:bg-red-600"
            onClick={() => onComplete('claimed_in_time')}
          >
            <Zap className="w-5 h-5 mr-2" />
            ¡Atrapar Ahora!
          </Button>
        </div>
      </div>
    );
  }

  if (gameType === 'choose_box') {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-white text-2xl font-bold mb-6">
            ¡Elige un cofre!
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {boxes.map((box) => (
              <Button
                key={box.id}
                variant="outline"
                className={`w-24 h-24 ${box.revealed ? 'bg-yellow-400' : 'bg-purple-500'} border-4 border-white`}
                onClick={() => !box.revealed && handleBoxClick(box)}
                disabled={boxes.some(b => b.revealed)}
              >
                {box.revealed ? (
                  <div className="text-center">
                    <Gift className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-xl font-bold">{box.prize}</span>
                  </div>
                ) : (
                  <span className="text-4xl">🎁</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}