"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, FileText, Check } from "lucide-react";
import { VideoAssetConfig, getVideoConfig } from "@/lib/config/videoRegistry";
import { Badge } from "@/components/ui/Badge";

export interface VideoCardProps {
  /** Video configuration object or key from SUTRA_VIDEO_REGISTRY */
  video: VideoAssetConfig | string;
  /** Optional custom badge text */
  badgeText?: string;
  /** Whether to allow opening the video in a full expanded view */
  allowExpand?: boolean;
  /** Optional callback when expand is clicked */
  onExpand?: (config: VideoAssetConfig) => void;
  /** Additional custom class names */
  className?: string;
  /** Show transcript toggle if transcript is available */
  showTranscriptToggle?: boolean;
}

export function VideoCard({
  video,
  badgeText,
  allowExpand = true,
  onExpand,
  className = "",
  showTranscriptToggle = true,
}: VideoCardProps) {
  const config = typeof video === "string" ? getVideoConfig(video) : video;

  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const handlePlayToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      setHasStarted(true);
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Video playback error:", err);
      });
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || config.durationSeconds;
    setProgress((current / total) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => {
      setIsPlaying(true);
      setHasStarted(true);
    });
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpand) {
      onExpand(config);
    } else if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden shadow-xs hover:shadow-warm hover:border-[#D4A35A] transition-all duration-300 flex flex-col ${className}`}
    >
      {/* Video Viewport Container */}
      <div className="relative aspect-video w-full bg-[#0F172A] overflow-hidden">
        {/* Poster Image */}
        <Image
          src={config.poster.webp}
          alt={config.title}
          fill
          className={`object-cover transition-opacity duration-500 ${
            hasStarted ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Native Video Element */}
        <video
          ref={videoRef}
          muted={isMuted}
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className={`w-full h-full object-cover ${hasStarted ? "opacity-100" : "opacity-0"}`}
        >
          <source src={config.desktop.webm} type="video/webm" />
          <source src={config.desktop.mp4} type="video/mp4" />
        </video>

        {/* Brand Ambient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges & Duration Pill */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          <Badge variant="gold">
            {badgeText || (config.category === "hero" ? "Ambient Reel" : config.category.toUpperCase())}
          </Badge>

          <span className="px-2.5 py-1 rounded-full bg-[#0F172A]/80 backdrop-blur-md text-[10px] font-mono font-semibold text-[#FFFDF9] border border-white/20">
            {config.durationSeconds}s • 4K UHD
          </span>
        </div>

        {/* Center Big Play Button (When paused/not started) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <button
              onClick={handlePlayToggle}
              type="button"
              aria-label={`Play ${config.title}`}
              className="w-14 h-14 rounded-full bg-[#D4A35A] hover:bg-[#C28F42] text-[#0F172A] shadow-xl flex items-center justify-center transition-transform duration-300 hover:scale-110 cursor-pointer touch-target"
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent flex flex-col gap-2 z-10 transition-opacity duration-300 ${
            isPlaying && !isHovered ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D4A35A] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[#FFFDF9] text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayToggle}
                type="button"
                aria-label={isPlaying ? "Pause" : "Play"}
                className="hover:text-[#D4A35A] transition-colors p-1 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleRestart}
                type="button"
                aria-label="Restart video"
                className="hover:text-[#D4A35A] transition-colors p-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleMuteToggle}
                type="button"
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="hover:text-[#D4A35A] transition-colors p-1 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {config.transcript && showTranscriptToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTranscript(!showTranscript);
                  }}
                  type="button"
                  aria-label="Toggle transcript"
                  className={`p-1 transition-colors cursor-pointer ${
                    showTranscript ? "text-[#D4A35A]" : "hover:text-[#D4A35A]"
                  }`}
                  title="View transcript & captions"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}

              {allowExpand && (
                <button
                  onClick={handleExpandClick}
                  type="button"
                  aria-label="Expand video"
                  className="hover:text-[#D4A35A] transition-colors p-1 cursor-pointer"
                  title="Fullscreen preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-[#0F172A] line-clamp-1">
            {config.title}
          </h3>
          <p className="text-xs font-medium text-[#A98B57] tracking-wider uppercase">
            {config.subtitle}
          </p>
          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed pt-1">
            {config.description}
          </p>
        </div>

        {/* Transcript Accordion / Drawer */}
        {showTranscript && config.transcript && (
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#475569] space-y-1.5 animate-in fade-in duration-200">
            <span className="text-[10px] font-mono font-bold text-[#5C3A1E] uppercase flex items-center gap-1">
              <Check className="w-3 h-3 text-[#2E7D4F]" />
              Voiceover Transcript
            </span>
            <p className="italic leading-relaxed">
              &ldquo;{config.transcript}&rdquo;
            </p>
          </div>
        )}

        {/* Footer Tags */}
        <div className="pt-2 border-t border-[#EADFCB] flex items-center justify-between text-[11px] text-[#94A3B8]">
          <span className="font-mono">Format: MP4 + WebM</span>
          <span className="text-[#5C3A1E] font-medium">H.264 / VP9</span>
        </div>
      </div>
    </div>
  );
}
