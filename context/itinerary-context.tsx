import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  saveItinerary,
  loadItinerary,
  clearItinerary,
  saveOriginalItinerary,
  loadOriginalItinerary,
} from '@/lib/storage';
import type { Itinerary } from '@/lib/types';

interface ItineraryContextValue {
  itinerary: Itinerary | null;
  isLoading: boolean;
  hasData: boolean;
  setItinerary: (data: Itinerary) => Promise<void>;
  setOriginalItinerary: (data: Itinerary) => Promise<void>;
  updateField: (path: string, value: any) => void;
  resetToOriginal: () => Promise<void>;
  clear: () => Promise<void>;
}

const ItineraryContext = createContext<ItineraryContextValue | null>(null);

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  const [itinerary, setItineraryState] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    loadItinerary().then((data) => {
      if (data) {
        setItineraryState(data);
        setHasData(true);
      }
      setIsLoading(false);
    });
  }, []);

  const setItinerary = useCallback(async (data: Itinerary) => {
    setItineraryState(data);
    setHasData(true);
    await saveItinerary(data);
  }, []);

  const setOriginalItinerary = useCallback(async (data: Itinerary) => {
    await saveOriginalItinerary(data);
  }, []);

  const updateField = useCallback((path: string, value: any) => {
    setItineraryState((prev) => {
      if (!prev) return prev;
      const updated: any = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      saveItinerary(updated);
      return updated;
    });
  }, []);

  const resetToOriginal = useCallback(async () => {
    const original = await loadOriginalItinerary();
    if (original) {
      setItineraryState(original);
      setHasData(true);
      await saveItinerary(original);
    }
  }, []);

  const clear = useCallback(async () => {
    setItineraryState(null);
    setHasData(false);
    await clearItinerary();
  }, []);

  return (
    <ItineraryContext.Provider
      value={{
        itinerary,
        isLoading,
        hasData,
        setItinerary,
        setOriginalItinerary,
        updateField,
        resetToOriginal,
        clear,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) throw new Error('useItinerary must be used within ItineraryProvider');
  return context;
}
