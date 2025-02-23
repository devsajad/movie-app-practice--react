import { useEffect } from "react";

export function useKey(key, callback) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === key.toLowerCase()) {
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, callback]);
}
