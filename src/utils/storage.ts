import { createClient } from '@/lib/supabase/client';
import { getPSTDate } from './dateUtils';

export function getSupabaseImageUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data: { publicUrl } } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}

interface DailyVisitData {
  lastVisitDate: string;
  loginPromptShown: boolean;
}

const DAILY_VISIT_KEY = 'guessgrid_daily_visit';

export function getDailyVisitData(): DailyVisitData {
  try {
    const stored = localStorage.getItem(DAILY_VISIT_KEY);
    if (!stored) {
      return {
        lastVisitDate: '',
        loginPromptShown: false
      };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse daily visit data:', error);
    return {
      lastVisitDate: '',
      loginPromptShown: false
    };
  }
}

export function setDailyVisitData(data: DailyVisitData): void {
  try {
    localStorage.setItem(DAILY_VISIT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save daily visit data:', error);
  }
}

export function shouldShowDailyLoginPrompt(): boolean {
  const today = getPSTDate();
  const visitData = getDailyVisitData();

  if (visitData.lastVisitDate !== today) {
    setDailyVisitData({
      lastVisitDate: today,
      loginPromptShown: false
    });
    return true;
  }

  return !visitData.loginPromptShown;
}

export function markLoginPromptShown(): void {
  const today = getPSTDate();
  const visitData = getDailyVisitData();

  setDailyVisitData({
    ...visitData,
    lastVisitDate: today,
    loginPromptShown: true
  });
}
