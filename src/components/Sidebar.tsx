
import { useState } from 'react';
import { useAppContext } from '@/lib/app-context';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Library, FileAudio, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { data, filters, setFilters } = useAppContext();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  if (!data) {
    return (
      <div className="w-64 h-full bg-sidebar text-sidebar-foreground p-4">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="https://raw.githubusercontent.com/Dartsgame974/TokuSFXV2/main/tokusfx.png" 
            alt="TokuSFX Logo" 
            className="h-10"
          />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-sidebar-accent rounded-md"></div>
          <div className="h-10 bg-sidebar-accent rounded-md"></div>
          <div className="h-10 bg-sidebar-accent rounded-md"></div>
        </div>
      </div>
    );
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectCategory = (category: string) => {
    setFilters({ category, season: '' });
  };

  const selectSeason = (category: string, season: string) => {
    setFilters({ category, season });
  };

  const isCurrentCategory = (category: string) => filters.category === category && !filters.season;
  const isCurrentSeason = (season: string) => filters.season === season;

  return (
    <div className="w-64 h-full bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="https://raw.githubusercontent.com/Dartsgame974/TokuSFXV2/main/tokusfx.png" 
            alt="TokuSFX Logo" 
            className="h-10"
          />
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <div className="space-y-1 px-3">
          <Link to="/">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/submit">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <FileAudio className="mr-2 h-4 w-4" />
              Submit Sound
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => document.getElementById('about-dialog')?.click()}
          >
            <Info className="mr-2 h-4 w-4" />
            About
          </Button>
        </div>

        {/* Categories */}
        <div className="mt-6">
          <h2 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
            Categories
          </h2>
          <div className="mt-2 space-y-1">
            {data.categories.map((category) => (
              <div key={category.name} className="px-3">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center justify-between py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCurrentCategory(category.name) && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  onClick={() => toggleCategory(category.name)}
                >
                  <div className="flex items-center" onClick={(e) => {
                    e.stopPropagation();
                    selectCategory(category.name);
                  }}>
                    <Library className="mr-2 h-4 w-4" />
                    {category.name}
                  </div>
                  {expandedCategories[category.name] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {/* Seasons */}
                {expandedCategories[category.name] && (
                  <div className="pl-6 space-y-1 mt-1">
                    {category.seasons.map((season) => (
                      <Button
                        key={season.name}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-sm py-1 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isCurrentSeason(season.name) && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                        onClick={() => selectSeason(category.name, season.name)}
                      >
                        {season.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
