
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sound, FilterState, TokuData } from '@/types/types';
import { useDataLoader, filterSounds } from './data-utils';

interface AppContextType {
  data: TokuData | null;
  loading: boolean;
  error: string | null;
  currentSound: Sound | null;
  filters: FilterState;
  filteredSounds: Sound[];
  isSidebarOpen: boolean;
  volume: number;
  setCurrentSound: (sound: Sound | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleSidebar: () => void;
  setVolume: (volume: number) => void;
}

const defaultFilters: FilterState = {
  search: '',
  category: '',
  season: '',
  tags: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data, loading, error } = useDataLoader();
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('tokusfx-volume');
    return savedVolume ? parseFloat(savedVolume) : 0.7; // Default to 70%
  });

  // Save volume to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('tokusfx-volume', volume.toString());
  }, [volume]);

  // Filter sounds based on current filters
  const filteredSounds = data ? filterSounds(data.sounds, filters) : [];

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        error,
        currentSound,
        filters,
        filteredSounds,
        isSidebarOpen,
        volume,
        setCurrentSound,
        setFilters,
        resetFilters,
        toggleSidebar,
        setVolume,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
