import { useEffect, useState } from "react";

export function useLocalStorageState(initialValue, key) {
  const [watched, setWatched] = useState(() => {
    const watchedLocal = JSON.parse(localStorage.getItem(key));
    return watchedLocal || initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(watched));
  }, [watched, key]);

  return [watched, setWatched];
}
