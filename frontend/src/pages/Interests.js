import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Interests.css";

function Interests() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [genresData, setGenresData] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieNotes, setMovieNotes] = useState([]);

  const genres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Science Fiction",
    "Thriller",
    "War",
    "Western",
  ];

  const getRecentKey = () => {
    return user ? `recentMovies_${user.uid}` : "recentMovies_guest";
  };

  const addToRecentlyViewed = (movie) => {
    const key = getRecentKey();
    const oldMovies = JSON.parse(localStorage.getItem(key)) || [];
    const filtered = oldMovies.filter((m) => m.id !== movie.id);
    const updated = [movie, ...filtered].slice(0, 10);

    localStorage.setItem(key, JSON.stringify(updated));
  };

  const fetchGenresMovies = async () => {
    try {
      setLoading(true);

      const genresObject = {};

      for (const genre of genres) {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/films/?genre=${encodeURIComponent(genre)}`
        );

        const movies = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        genresObject[genre] = movies.slice(0, 10);
      }

      setGenresData(genresObject);
    } catch (err) {
      console.log("Erreur genres :", err);
    } finally {
      setLoading(false);
    }
  };

  const openMovieDetails = async (movie) => {
    setSelectedMovie(movie);
    addToRecentlyViewed(movie);

    try {
      const res = await axios.get("http://127.0.0.1:8000/api/notes/");
      const notes = Array.isArray(res.data) ? res.data : res.data.results || [];

      const filmNotes = notes.filter(
        (note) => String(note.film) === String(movie.id)
      );

      setMovieNotes(filmNotes);
    } catch (err) {
      console.log("Erreur notes film :", err);
      setMovieNotes([]);
    }
  };

  const closeMovieDetails = () => {
    setSelectedMovie(null);
    setMovieNotes([]);
  };

  useEffect(() => {
    fetchGenresMovies();
  }, []);

  if (loading) {
    return <div className="interests-loading">Chargement des genres...</div>;
  }

  return (
    <div className="interests-page">
      <div className="interests-navbar">
        <div className="interests-logo" onClick={() => navigate("/")}>
          🎬 Movie Recommender
        </div>

        <button className="interests-home-btn" onClick={() => navigate("/")}>
          ⬅ Retour Home
        </button>
      </div>

      <div className="interests-header">
        <h1>🎭 Centres d’intérêts populaires</h1>
        <p>
          Découvrez les films classés par genres. Cliquez sur un film pour voir
          ses détails et l’ajouter à vos films récemment consultés.
        </p>
      </div>

      {genres.map((genre) => (
        <section className="genre-section" key={genre}>
          <div className="genre-title-row">
            <h2>{genre}</h2>

            <button
              className="see-more-btn"
              onClick={() => navigate(`/?genre=${encodeURIComponent(genre)}`)}
            >
              Voir plus →
            </button>
          </div>

          <div className="genre-row">
            {genresData[genre]?.length > 0 ? (
              genresData[genre].map((movie) => (
                <div
                  className="genre-movie-card"
                  key={movie.id}
                  onClick={() => openMovieDetails(movie)}
                >
                  <img
                    src={movie.poster || "https://picsum.photos/200/300"}
                    alt={movie.titre}
                  />

                  <div className="genre-movie-info">
                    <h3>{movie.titre}</h3>

                    <p className="movie-rating">
                      ⭐ {movie.note_moyenne || "N/A"}/10
                    </p>

                    <button
                      className="details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMovieDetails(movie);
                      }}
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-movies">Aucun film trouvé.</p>
            )}
          </div>
        </section>
      ))}

      {selectedMovie && (
        <div className="movie-modal-overlay" onClick={closeMovieDetails}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeMovieDetails}>
              ✕
            </button>

            <img
              className="modal-poster"
              src={selectedMovie.poster || "https://picsum.photos/200/300"}
              alt={selectedMovie.titre}
            />

            <div className="modal-info">
              <h2>{selectedMovie.titre}</h2>

              <p className="rating">
                ⭐ Note moyenne : {selectedMovie.note_moyenne || "N/A"}/10
              </p>

              <p>
                <strong>Genre :</strong> {selectedMovie.genre}
              </p>

              <p>
                <strong>Description :</strong>{" "}
                {selectedMovie.description || "No description available."}
              </p>

              <h3>Notes des utilisateurs</h3>

              {movieNotes.length > 0 ? (
                <ul>
                  {movieNotes.map((note) => (
                    <li key={note.id}>⭐ {note.valeur}/10</li>
                  ))}
                </ul>
              ) : (
                <p>Aucune note pour ce film.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Interests;