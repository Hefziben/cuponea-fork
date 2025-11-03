import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import VideoCouponPlayer from "../components/VideoCouponPlayer";
import { createPageUrl } from "@/utils";
import {
  Play,
  Flame,
  Clock,
  TrendingUp,
  Sparkles,
  Filter,
  ArrowLeft,
  Video
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VideoCouponFeed() {
  const navigate = useNavigate();
  const [videoCoupons, setVideoCoupons] = useState([]);
  const [coupons, setCoupons] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, trending, urgent, ai_recommended

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load video coupons
      const videoData = await base44.entities.VideoCoupon.filter({ is_active: true }, '-views_count', 50);
      setVideoCoupons(videoData);

      // Load associated coupons
      const couponIds = [...new Set(videoData.map(vc => vc.coupon_id))];
      const couponData = await base44.entities.Coupon.list();
      const couponMap = couponData.reduce((acc, coupon) => {
        acc[coupon.id] = coupon;
        return acc;
      }, {});
      setCoupons(couponMap);

      // AI Personalization - Get user preferences
      if (currentUser) {
        try {
          const preferences = await base44.entities.UserPreference.filter({ user_id: currentUser.id });
          if (preferences.length > 0) {
            // Sort video coupons by user preferences
            const userCategories = preferences[0].preferred_categories || [];
            const sortedVideos = [...videoData].sort((a, b) => {
              const couponA = couponMap[a.coupon_id];
              const couponB = couponMap[b.coupon_id];
              const scoreA = userCategories.includes(couponA?.category) ? 10 : 0;
              const scoreB = userCategories.includes(couponB?.category) ? 10 : 0;
              return scoreB - scoreA;
            });
            setVideoCoupons(sortedVideos);
          }
        } catch (error) {
          console.log('Could not load preferences:', error);
        }
      }
    } catch (error) {
      console.error('Error loading video coupons:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVideoClick = (videoCoupon) => {
    setSelectedVideo(videoCoupon);
  };

  const handleClaim = async () => {
    if (selectedVideo && user) {
      try {
        const coupon = coupons[selectedVideo.coupon_id];
        
        // Save coupon
        await base44.entities.SavedCoupon.create({
          user_id: user.id,
          coupon_id: coupon.id
        });

        // Update claims count
        await base44.entities.VideoCoupon.update(selectedVideo.id, {
          claims_count: (selectedVideo.claims_count || 0) + 1
        });

        alert('¡Cupón guardado exitosamente!');
        setSelectedVideo(null);
        navigate(createPageUrl("Saved"));
      } catch (error) {
        console.error('Error claiming coupon:', error);
      }
    }
  };

  const getFilteredVideos = () => {
    let filtered = [...videoCoupons];
    
    if (filter === 'trending') {
      filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    } else if (filter === 'urgent') {
      filtered = filtered.filter(v => v.urgency_type !== 'none');
    }
    
    return filtered;
  };

  const filteredVideos = getFilteredVideos();

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 min-h-screen pb-20">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2">
              <Video className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Video-Cupones</h1>
            </div>
            <p className="text-sm text-gray-600">Ofertas en video corto</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-purple-600' : ''}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Para Ti
              </Button>
              <Button
                variant={filter === 'trending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('trending')}
                className={filter === 'trending' ? 'bg-pink-600' : ''}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending
              </Button>
              <Button
                variant={filter === 'urgent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('urgent')}
                className={filter === 'urgent' ? 'bg-red-600' : ''}
              >
                <Flame className="w-4 h-4 mr-1" />
                Urgente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendation Banner */}
        {filter === 'all' && filteredVideos.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h3 className="font-bold">Seleccionados para ti</h3>
                  <p className="text-sm text-white/90">
                    Basado en tus intereses y preferencias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredVideos.map((videoCoupon) => {
              const coupon = coupons[videoCoupon.coupon_id];
              if (!coupon) return null;

              return (
                <Card
                  key={videoCoupon.id}
                  className="relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleVideoClick(videoCoupon)}
                >
                  <div className="relative">
                    {/* Thumbnail */}
                    <div 
                      className="h-64 bg-gradient-to-br from-purple-400 to-pink-400"
                      style={{
                        backgroundImage: videoCoupon.thumbnail_url ? `url(${videoCoupon.thumbnail_url})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                          <Play className="w-6 h-6 text-purple-600 ml-1" />
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-2 left-2 right-2 flex justify-between">
                        {videoCoupon.game_type !== 'none' && (
                          <Badge className="bg-yellow-500 text-white text-xs">
                            🎮 Juego
                          </Badge>
                        )}
                        {videoCoupon.urgency_type !== 'none' && (
                          <Badge className="bg-red-500 text-white text-xs animate-pulse">
                            <Flame className="w-3 h-3 mr-1" />
                            ¡Urgente!
                          </Badge>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {videoCoupon.duration || 15}s
                        </Badge>
                      </div>
                    </div>

                    {/* Info */}
                    <CardContent className="p-3">
                      <h3 className="font-bold text-sm line-clamp-2 text-gray-900">
                        {coupon.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{videoCoupon.views_count || 0} vistas</span>
                        {videoCoupon.shares_count > 0 && (
                          <span>{videoCoupon.shares_count} shares</span>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              No hay video-cupones disponibles
            </h3>
            <p className="text-gray-600 text-sm">
              ¡Pronto habrá ofertas exclusivas en video!
            </p>
          </Card>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoCouponPlayer
          videoCoupon={selectedVideo}
          coupon={coupons[selectedVideo.coupon_id]}
          onClaim={handleClaim}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}