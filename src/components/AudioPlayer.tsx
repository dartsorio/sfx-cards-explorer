
import { useRef, useState, useEffect } from 'react';
import { useAppContext } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AudioPlayer = () => {
  const { currentSound, setCurrentSound, volume, setVolume } = useAppContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Reset player state when sound changes
    if (currentSound && audioRef.current) {
      setIsPlaying(false);
      setCurrentTime(0);
      audioRef.current.volume = volume;
      
      // Auto-play new sound
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Error playing audio:', err);
          toast({
            title: 'Playback Error',
            description: 'Could not play the audio file.',
            variant: 'destructive',
          });
        });
    }
  }, [currentSound]);

  // Update audio element's volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update time display during playback
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play()
          .catch(err => {
            console.error('Error playing audio:', err);
            toast({
              title: 'Playback Error',
              description: 'Could not play the audio file.',
              variant: 'destructive',
            });
          });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleDownload = () => {
    if (!currentSound) return;
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = currentSound.path;
    link.download = `${currentSound.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download Started',
      description: `Downloading ${currentSound.title}`,
    });
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSound) return null;

  return (
    <div className="audio-player">
      {/* Progress bar */}
      <div 
        className="progress-bar"
        onClick={(e) => {
          if (audioRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newTime = percent * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }
        }}
      >
        <div 
          className="progress" 
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center p-2">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePlayPause}
            className="text-foreground hover:text-primary"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          <div className="text-sm text-foreground hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="truncate max-w-[150px] sm:max-w-md">
          <div className="text-sm font-medium truncate">{currentSound.title}</div>
          <div className="text-xs text-muted-foreground truncate">
            {currentSound.category} - {currentSound.season}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 w-24">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground hover:text-primary"
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-full"
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDownload}
            className="text-foreground hover:text-primary"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentSound.path}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onDurationChange={handleTimeUpdate}
      />
    </div>
  );
};

export default AudioPlayer;
