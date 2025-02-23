import { useEffect, useState } from "react";

// API key for OMDB
const KEY = "4bbfa765";

export function useMovie(query, callback) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Effect to fetch movies based on query
  useEffect(() => {
    callback?.();

    if (query.length < 3) {
      setError("Start Searching Your movie");
      return;
    }
    const controller = new AbortController();

    (async function fetchMovies() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok)
          throw new Error(
            "Failed to fetch movies,Check you internet connection !"
          );

        const data = await res.json();

        if (data.Response === "False") throw new Error(data.Error);

        setMovies(data.Search);
        setError("");
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    return function () {
      controller.abort();
    };
  }, [query]);
  return { movies, loading, error };
}
