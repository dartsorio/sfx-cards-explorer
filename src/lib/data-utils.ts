
import { useState, useEffect } from 'react';
import { TokuData, Sound, Tag, FilterState, SoundFormData } from '@/types/types';
import { toast } from '@/components/ui/use-toast';

// Function to load data from the data.json file
export const useDataLoader = () => {
  const [data, setData] = useState<TokuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data from public/data.json
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Failed to load data.json');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load sound data. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load sound data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};

// Function to filter sounds based on the current filter state
export const filterSounds = (sounds: Sound[], filters: FilterState): Sound[] => {
  return sounds.filter((sound) => {
    // Search filter
    const searchMatch = !filters.search || 
      sound.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      sound.season.toLowerCase().includes(filters.search.toLowerCase()) ||
      sound.category.toLowerCase().includes(filters.search.toLowerCase()) ||
      sound.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));

    // Category filter
    const categoryMatch = !filters.category || sound.category === filters.category;

    // Season filter
    const seasonMatch = !filters.season || sound.season === filters.season;

    // Tags filter
    const tagsMatch = filters.tags.length === 0 || 
      filters.tags.every(tag => sound.tags.includes(tag));

    return searchMatch && categoryMatch && seasonMatch && tagsMatch;
  });
};

// Function to extract all tags from the sounds
export const extractTags = (sounds: Sound[]): Tag[] => {
  const tagsMap = new Map<string, number>();
  
  sounds.forEach(sound => {
    sound.tags.forEach(tag => {
      const count = tagsMap.get(tag) || 0;
      tagsMap.set(tag, count + 1);
    });
  });
  
  return Array.from(tagsMap.entries()).map(([name, count]) => ({ name, count }));
};

// Function to save form data to a JSON file
export const saveFormData = async (formData: any) => {
  try {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const fileName = `form_${timestamp}.json`;
    
    // Convert form data to JSON string
    const jsonData = JSON.stringify(formData, null, 2);
    
    // Create a Blob from the JSON string
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a downloadable link for the JSON file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Form data saved as:', fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error saving form data:', error);
    return { success: false, error: 'Failed to save form data' };
  }
};
