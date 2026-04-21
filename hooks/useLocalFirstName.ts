import { useCallback, useEffect, useMemo, useState } from 'react';

import { getItem, setItem } from '@/services/storage';

const FIRST_NAME_KEY = '@rendsca/user_first_name';

export function useLocalFirstName() {
  const [firstName, setFirstNameState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const raw = await getItem<string>(FIRST_NAME_KEY);
      if (!alive) {
        return;
      }
      const next = typeof raw === 'string' ? raw : null;
      setFirstNameState(next);
      setIsLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const saveFirstName = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      return;
    }
    await setItem(FIRST_NAME_KEY, trimmed);
    setFirstNameState(trimmed);
  }, []);

  const displayFirstName = useMemo(() => {
    const t = firstName?.trim();
    return t ? t : null;
  }, [firstName]);

  const needsFirstNamePrompt = isLoaded && !displayFirstName;

  return { displayFirstName, isLoaded, saveFirstName, needsFirstNamePrompt };
}
