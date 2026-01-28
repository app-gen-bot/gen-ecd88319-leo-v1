'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface VideoPlayerProps {
  title: string;
  description?: string;
  videoUrl?: string; // In real app, this would be actual video URL
  thumbnailUrl?: string;
  duration?: string;
  onClose?: () => void;
  autoplay?: boolean;
  className?: string;
}

interface VideoChapter {
  time: number;
  title: string;
}

export default function VideoPlayer({ 
  title, 
  description,
  videoUrl: _videoUrl,
  thumbnailUrl: _thumbnailUrl,
  duration,
  onClose,
  autoplay = false,
  className = ''
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('1080p');
  const [showTranscript, setShowTranscript] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock video data - in real app this would come from video service
  const chapters: VideoChapter[] = [
    { time: 0, title: 'Introduction' },
    { time: 120, title: 'Core Concepts' },
    { time: 300, title: 'Implementation' },
    { time: 450, title: 'Best Practices' },
    { time: 600, title: 'Q&A' }
  ];

  const transcript = [
    { time: 0, speaker: 'Narrator', text: 'Welcome to Happy Llama. Today we\'ll explore how AI agents collaborate...' },
    { time: 30, speaker: 'Narrator', text: 'First, let\'s understand the core architecture that makes this possible...' },
    { time: 60, speaker: 'Demo', text: 'Here you can see our multi-agent system in action...' }
  ];

  // Mock total duration based on duration prop
  useEffect(() => {
    if (duration) {
      const [minutes, seconds] = duration.split(':').map(Number);
      setTotalDuration(minutes * 60 + seconds);
    } else {
      setTotalDuration(720); // Default 12 minutes
    }
  }, [duration]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Mock video progress
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, totalDuration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(event.target.value);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleChapterJump = (time: number) => {
    setCurrentTime(time);
  };

  const currentChapter = [...chapters].reverse().find(chapter => currentTime >= chapter.time);

  return (
    <div className={`bg-black text-white ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div 
        ref={playerRef}
        className="relative w-full aspect-video bg-gray-900"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => {
          if (isPlaying) {
            setTimeout(() => setShowControls(false), 1000);
          }
        }}
      >
        {/* Video Content Area - Mock */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
          {!isPlaying && (
            <div className="text-center">
              <div 
                className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-opacity-30 transition-all"
                onClick={handlePlayPause}
              >
                <PlayIcon className="h-10 w-10 ml-1" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              {description && (
                <p className="text-gray-300 mt-2 max-w-lg">{description}</p>
              )}
            </div>
          )}

          {isPlaying && (
            <div className="text-center">
              <div className="text-6xl font-bold opacity-30 mb-4">
                {formatTime(currentTime)}
              </div>
              <div className="text-xl">
                {currentChapter?.title || 'Playing...'}
              </div>
              <div className="mt-4 text-sm text-gray-300">
                Simulated video playback - {quality} quality
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isPlaying && currentTime === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              {currentChapter && (
                <p className="text-sm text-gray-300">{currentChapter.title}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-white hover:bg-white/20"
              >
                CC
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20"
              >
                <Cog6ToothIcon className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={totalDuration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-300 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-6 w-6" />
                  ) : (
                    <PlayIcon className="h-6 w-6 ml-1" />
                  )}
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted || volume === 0 ? (
                      <SpeakerXMarkIcon className="h-5 w-5" />
                    ) : (
                      <SpeakerWaveIcon className="h-5 w-5" />
                    )}
                  </Button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="bg-transparent text-white text-sm border border-gray-600 rounded px-2 py-1"
                >
                  <option value="360p">360p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="1440p">1440p</option>
                </select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters and Transcript */}
      {(chapters.length > 0 || showTranscript) && !isFullscreen && (
        <div className="bg-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Chapters */}
            {chapters.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Chapters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {chapters.map((chapter, index) => (
                    <button
                      key={index}
                      onClick={() => handleChapterJump(chapter.time)}
                      className={`text-left p-2 rounded text-sm hover:bg-gray-700 transition-colors ${
                        currentTime >= chapter.time && 
                        (index === chapters.length - 1 || currentTime < chapters[index + 1]?.time)
                          ? 'bg-blue-600' : 'bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">{chapter.title}</div>
                      <div className="text-gray-300">{formatTime(chapter.time)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript */}
            {showTranscript && (
              <div>
                <h4 className="text-lg font-semibold mb-3">Transcript</h4>
                <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {transcript.map((item, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <div className="text-xs text-gray-400 mb-1">
                        {formatTime(item.time)} • {item.speaker}
                      </div>
                      <div className="text-sm">{item.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Styles for Range Inputs */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}