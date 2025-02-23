/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import React from "react";
import StarRating from "./starRating";
import { useMovie } from "./hooks/useMovie";
import { useLocalStorageState } from "./hooks/useLocalStorageState";

// API key for OMDB
const KEY = "4bbfa765";

// Utility function to calculate average
const average = (arr) => {
  const result = arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
  return result;
};

export default function App() {
  // State variables
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  // Hook to fetch movies based on query
  const { movies, loading, error } = useMovie(query, handleCloseMovie);

  // Handle movie selection
  function handleSelectMovie(id) {
    setSelectedId((prevId) => (prevId === id ? null : id));
  }

  // Handle back button click
  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatch(watchedObj) {
    setWatched((prevWatched) => {
      const updatedList = prevWatched.filter(
        (movie) => movie.imdbID !== watchedObj.imdbID
      );
      return [...updatedList, watchedObj];
    });
  }

  function handleDeleteWatched(id) {
    setWatched((prevWatched) => prevWatched.filter((el) => el.imdbID !== id));
  }

  return (
    <>
      <Nav>
        <Logo />
        <Search setQuery={setQuery} query={query} />
        <SearchNumResult movies={movies} />
      </Nav>

      <Main>
        <Box movies={movies}>
          {loading && <Loading />}
          {!loading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box movies={movies}>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatch={handleAddWatch}
              watched={watched}
              setSelectedId={setSelectedId}
            />
          ) : (
            <>
              <MovieSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                oneDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

// Navbar component
function Nav({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

// Search component
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

// Logo component
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

// Component to display number of search results
function SearchNumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length || 0}</strong> results
    </p>
  );
}

// Main component
function Main({ children }) {
  return <main className="main">{children}</main>;
}

// Box component with toggle functionality
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// Component to display list of movies
function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <MovieItem
          movie={movie}
          key={movie.imdbID}
          setSelectedId={onSelectMovie}
        />
      ))}
    </ul>
  );
}

// Component to display individual movie item
function MovieItem({ movie, setSelectedId }) {
  return (
    <li onClick={() => setSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// Component to display movie details
function MovieDetails({ selectedId, onCloseMovie, onAddWatch, watched }) {
  const [movie, setMovie] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);

  function handleAddClick() {
    onCloseMovie();
    onAddWatch({
      imdbID: movie.imdbID,
      Title: movie.Title,
      Poster: movie.Poster,
      runtime: Number(movie.Runtime.split(" ")[0]),
      imdbRating: Number(movie.imdbRating),
      userRating: Number(rating),
    });
  }

  function checkMovieRated() {
    const el = watched.find((el) => el.imdbID === selectedId);
    return el?.userRating;
  }

  const {
    Title: title,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  // Effect for pressing ESC
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== "Escape") return;
      onCloseMovie();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCloseMovie]);

  useEffect(() => {
    (async function fetchMovies() {
      try {
        setLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );

        if (!res.ok)
          throw new Error(
            "Failed to fetch movie,Check you internet connection !"
          );

        const data = await res.json();

        if (data.Response === "False") throw new Error(data.Error);

        setMovie(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedId]);

  useEffect(() => {
    if (!title) return;
    document.title = title;

    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);

  return loading ? (
    <Loading />
  ) : (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${movie} movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐️</span>
            {imdbRating} IMDb rating
          </p>
        </div>
      </header>

      <section>
        <div className="rating">
          {!checkMovieRated() ? (
            <>
              <StarRating maxRating={10} size={24} onSetRating={setRating} />
              {rating > 0 && (
                <button className="btn-add" onClick={handleAddClick}>
                  + Add to list
                </button>
              )}
            </>
          ) : (
            <p>You rated {checkMovieRated()} ⭐</p>
          )}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}

// Box component for watched movies with toggle functionality
// eslint-disable-next-line no-unused-vars
function WatchedBox({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// Component to display list of watched movies
function WatchedMovieList({ watched, oneDeleteWatched }) {
  return (
    <ul className="list list-movies">
      {watched.map((movie) => (
        <WatchedMovieItem
          movie={movie}
          key={movie.imdbID}
          oneDeleteWatched={oneDeleteWatched}
        />
      ))}
    </ul>
  );
}

// Component to display summary of watched movies
function MovieSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));

  const avgUserRating = average(watched.map((movie) => movie.userRating));

  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating && avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating && avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

// Component to display individual watched movie item
function WatchedMovieItem({ movie, oneDeleteWatched }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => oneDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

// Loading component
function Loading() {
  return (
    <div className="loading-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <radialGradient
          id="a12"
          cx=".66"
          fx=".66"
          cy=".3125"
          fy=".3125"
          gradientTransform="scale(1.5)"
        >
          <stop offset="0" stopColor="#000"></stop>
          <stop offset=".3" stopColor="#000" stopOpacity=".9"></stop>
          <stop offset=".6" stopColor="#000" stopOpacity=".6"></stop>
          <stop offset=".8" stopColor="#000" stopOpacity=".3"></stop>
          <stop offset="1" stopColor="#000" stopOpacity="0"></stop>
        </radialGradient>
        <circle
          transformOrigin="center"
          fill="none"
          stroke="url(#a12)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray="200 1000"
          strokeDashoffset="0"
          cx="100"
          cy="100"
          r="70"
        >
          <animateTransform
            type="rotate"
            attributeName="transform"
            calcMode="spline"
            dur="2"
            values="360;0"
            keyTimes="0;1"
            keySplines="0 0 1 1"
            repeatCount="indefinite"
          ></animateTransform>
        </circle>
        <circle
          transformOrigin="center"
          fill="none"
          opacity=".2"
          stroke="#000"
          strokeWidth="15"
          strokeLinecap="round"
          cx="100"
          cy="100"
          r="70"
        ></circle>
      </svg>
    </div>
  );
}

// Error message component
function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}
