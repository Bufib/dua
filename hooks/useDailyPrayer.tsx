// src/hooks/useDailyPrayer.ts
import { useState, useEffect } from 'react';
import { DailyPrayer } from '@/utils/types'; // Adjust path as needed
import { getDailyPrayerForToday } from '@/utils/initializeDatabase'; // Adjust path as needed

interface UseDailyPrayerResult {
  dailyPrayer: DailyPrayer | null;
  isLoadingPrayer: boolean;
}

export const useDailyPrayer = (language: string): UseDailyPrayerResult => {
  const [dailyPrayer, setDailyPrayer] = useState<DailyPrayer | null>(null);
  const [isLoadingPrayer, setIsLoadingPrayer] = useState<boolean>(true);

  useEffect(() => {
    const fetchPrayer = async () => {
      setIsLoadingPrayer(true);
      try {
        const prayer = await getDailyPrayerForToday();
        setDailyPrayer(prayer);
      } catch (error) {
        console.error("Error fetching daily prayer:", error);
        setDailyPrayer(null); // Set to null on error
      } finally {
        setIsLoadingPrayer(false);
      }
    };

    fetchPrayer();
  }, [language]); // Refetch if language changes

  return { dailyPrayer, isLoadingPrayer };
};