
import { useState } from 'react';
import { useAppContext } from '@/lib/app-context';
import { Sound } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SoundCardProps {
  sound: Sound;
}

const SoundCard: React.FC<SoundCardProps> = ({ sound }) => {
  const { currentSound, setCurrentSound } = useAppContext();
  const [isHovered, setIsHovered] = useState(false);
  
  const isPlaying = currentSound?.id === sound.id;

  const handlePlay = () => {
    setCurrentSound(sound);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = sound.path;
    link.download = `${sound.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download Started',
      description: `Downloading ${sound.title}`,
    });
  };

  return (
    <Card 
      className="sound-card overflow-hidden cursor-pointer" 
      onClick={handlePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video bg-secondary overflow-hidden">
        {/* Thumbnail */}
        <img 
          src={sound.thumbnailPath} 
          alt={sound.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg'; // Fallback image
          }}
        />
        
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
            isHovered || isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-primary/90 text-primary-foreground border-none">
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
        </div>
        
        {/* Download button (always visible) */}
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute bottom-2 right-2 bg-black/70 text-white border-none hover:bg-primary"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-lg truncate">{sound.title}</h3>
        <div className="text-sm text-muted-foreground mb-2">
          {sound.category} - {sound.season}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {sound.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SoundCard;
