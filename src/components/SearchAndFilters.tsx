
import { useState } from 'react';
import { useAppContext } from '@/lib/app-context';
import { extractTags } from '@/lib/data-utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, X, Filter, Tag } from 'lucide-react';

const SearchAndFilters = () => {
  const { data, filters, setFilters, resetFilters, filteredSounds } = useAppContext();
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  if (!data) return null;

  const tags = extractTags(data.sounds);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleTagToggle = (tagName: string) => {
    const currentTags = [...filters.tags];
    const tagIndex = currentTags.indexOf(tagName);
    
    if (tagIndex === -1) {
      setFilters({ tags: [...currentTags, tagName] });
    } else {
      currentTags.splice(tagIndex, 1);
      setFilters({ tags: currentTags });
    }
  };

  const removeTag = (tagName: string) => {
    const currentTags = [...filters.tags];
    const tagIndex = currentTags.indexOf(tagName);
    
    if (tagIndex !== -1) {
      currentTags.splice(tagIndex, 1);
      setFilters({ tags: currentTags });
    }
  };

  const clearFilters = () => {
    resetFilters();
  };

  const hasActiveFilters = 
    filters.search || 
    filters.category || 
    filters.season || 
    filters.tags.length > 0;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search sounds..."
            value={filters.search}
            onChange={handleSearch}
            className="pl-10 w-full"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => setFilters({ search: '' })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Tags filter */}
        <Popover open={isTagsOpen} onOpenChange={setIsTagsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Tags</span>
              {filters.tags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <div className="p-4 border-b border-border">
              <Label className="text-sm font-medium">Select Tags</Label>
            </div>
            <ScrollArea className="h-60 p-4">
              <div className="space-y-2">
                {tags.sort((a, b) => a.name.localeCompare(b.name)).map((tag) => (
                  <div key={tag.name} className="flex items-center gap-2">
                    <Button
                      variant={filters.tags.includes(tag.name) ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => handleTagToggle(tag.name)}
                    >
                      {tag.name}
                      <Badge variant="secondary" className="ml-auto">
                        {tag.count}
                      </Badge>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Reset filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="outline" className="gap-1 px-3 py-1">
              Category: {filters.category}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setFilters({ category: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.season && (
            <Badge variant="outline" className="gap-1 px-3 py-1">
              Season: {filters.season}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setFilters({ season: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 px-3 py-1">
              {tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredSounds.length} sound{filteredSounds.length !== 1 ? 's' : ''} found
      </div>
    </div>
  );
};

export default SearchAndFilters;
