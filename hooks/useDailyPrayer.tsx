// src/hooks/useDailyPrayer.ts
import { useState, useEffect } from 'react';
// Here allow union type in case you get either a basic DailyPrayer or one with translations.
import { DailyPrayer, PrayerWithTranslations } from '@/utils/types';
import { getDailyPrayerWithLanguage } from '@/utils/initializeDatabase';

interface UseDailyPrayerResult {
  dailyPrayer: DailyPrayer | PrayerWithTranslations | null;
  isLoadingPrayer: boolean;
}

export const useDailyPrayer = (language: string): UseDailyPrayerResult => {
  const [dailyPrayer, setDailyPrayer] = useState<DailyPrayer | PrayerWithTranslations | null>(null);
  const [isLoadingPrayer, setIsLoadingPrayer] = useState<boolean>(true);

  useEffect(() => {
    const fetchPrayer = async () => {
      setIsLoadingPrayer(true);
      try {
        const prayer = await getDailyPrayerWithLanguage(language);
        setDailyPrayer(prayer);
        console.log(prayer);
      } catch (error) {
        console.error("Error fetching daily prayer:", error);
        setDailyPrayer(null);
      } finally {
        setIsLoadingPrayer(false);
      }
    };

    fetchPrayer();
  }, [language]);

  return { dailyPrayer, isLoadingPrayer };
};
