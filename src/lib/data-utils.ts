
import { useState, useEffect } from 'react';
import { TokuData, Sound, Tag, FilterState, SoundFormData } from '@/types/types';
import { toast } from '@/components/ui/use-toast';

// Function to load data from the PHP API (dynamic JSON files)
export const useDataLoader = () => {
  const [data, setData] = useState<TokuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data from PHP API that aggregates all validated JSON files
        const response = await fetch('/api/get-sounds.php');
        if (!response.ok) {
          throw new Error('Failed to load sounds from API');
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

// Function to submit sound via PHP (saves to submissions folder)
export const saveFormData = async (formData: any, audioFile?: File, imageFile?: File) => {
  try {
    // Create a FormData object to send both form data and files
    const formDataToSend = new FormData();
    
    // Add form fields
    for (const key in formData) {
      if (Array.isArray(formData[key])) {
        // For arrays like tags, join them as a string
        formDataToSend.append(key, formData[key].join(','));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }
    
    // Add files if provided
    if (audioFile) {
      formDataToSend.append('audio', audioFile);
    }
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }
    
    // Send to PHP endpoint
    const response = await fetch('/api/submit-sound.php', {
      method: 'POST',
      body: formDataToSend,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit sound');
    }
    
    const result = await response.json();
    console.log('Sound submitted:', result.fileName);
    
    return { success: true, fileName: result.fileName };
  } catch (error) {
    console.error('Error submitting sound:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to submit sound' };
  }
};
