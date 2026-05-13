import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth, auth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import "../styles/Home.css";


function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieNotes, setMovieNotes] = useState([]);

  const [genre, setGenre] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPrev, setHeroPrev] = useState(null);
  const [heroFading, setHeroFading] = useState(false);
  const heroTimerRef = useRef(null);

  const heroMovies = movies.filter((m) => m.poster).slice(0, 12);
  const currentHero = heroMovies[heroIndex];

  useEffect(() => {
    if (heroMovies.length < 2) return;

    heroTimerRef.current = setInterval(() => {
      setHeroFading(true);

      setTimeout(() => {
        setHeroPrev(heroIndex);
        setHeroIndex((prev) => (prev + 1) % heroMovies.length);
        setHeroFading(false);
      }, 700);
    }, 5000);

    return () => clearInterval(heroTimerRef.current);
  }, [heroMovies.length, heroIndex]);

  const goToHero = (idx) => {
    if (idx === heroIndex) return;

    setHeroFading(true);

    setTimeout(() => {
      setHeroPrev(heroIndex);
      setHeroIndex(idx);
      setHeroFading(false);
    }, 700);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Erreur logout:", err);
    }
  };

  const getRecentKey = () => {
    return user ? `recentMovies_${user.uid}` : "recentMovies_guest";
  };

  const fetchMovies = async () => {
    try {
      let url = "http://127.0.0.1:8000/api/films/?page=1&page_size=60";

      if (genre) {
        url += `&genre=${genre}`;
      }

      const res = await axios.get(url);
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];

      setMovies(data);
      setMessage("");
      setIsSearchMode(false);
    } catch (err) {
      console.log("Erreur films :", err);
      setMovies([]);
      setMessage("Impossible de charger les films.");
    }
  };

  const getDjangoUserId = async () => {
    if (!user) return null;

    const idToken = await user.getIdToken();

    const userRes = await axios.post(
      "http://127.0.0.1:8000/api/auth/firebase/",
      { token: idToken }
    );

    return userRes.data.user_id;
  };

  const fetchFavoriteMovies = async () => {
    if (!user) {
      setFavoriteMovies([]);
      return;
    }

    try {
      const userId = await getDjangoUserId();

      const favRes = await axios.get("http://127.0.0.1:8000/api/favs/");
      const favs = Array.isArray(favRes.data)
        ? favRes.data
        : favRes.data.results || [];

      const userFavs = favs.filter(
        (fav) => String(fav.utilisateur) === String(userId)
      );

      const films = await Promise.all(
        userFavs.slice(0, 10).map(async (fav) => {
          const filmRes = await axios.get(
            `http://127.0.0.1:8000/api/films/${fav.film}/`
          );
          return filmRes.data;
        })
      );

      setFavoriteMovies(films);
    } catch (err) {
      console.log("Erreur favoris :", err);
      setFavoriteMovies([]);
    }
  };

  const loadRecentlyViewed = () => {
    const key = getRecentKey();
    const data = JSON.parse(localStorage.getItem(key)) || [];
    setRecentMovies(data);
  };

  const addToRecentlyViewed = (movie) => {
    const key = getRecentKey();
    const oldMovies = JSON.parse(localStorage.getItem(key)) || [];
    const filtered = oldMovies.filter((m) => m.id !== movie.id);
    const updated = [movie, ...filtered].slice(0, 10);

    localStorage.setItem(key, JSON.stringify(updated));
    setRecentMovies(updated);
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

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchMovies();
      return;
    }

    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/search/?q=${encodeURIComponent(search)}`
      );

      setIsSearchMode(true);

      if (res.data.found) {
        setMovies(res.data.results || []);
        setMessage(`Résultat pour : ${search}`);
      } else {
        setMovies(res.data.recommendations || []);
        setMessage(`Aucun film trouvé pour "${search}". Voici des recommandations.`);
      }
    } catch (err) {
      console.log("Erreur recherche :", err);
      setMessage("Erreur pendant la recherche.");
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [genre]);

  useEffect(() => {
    fetchFavoriteMovies();
    loadRecentlyViewed();
  }, [user]);

  const addToWatchlist = async (filmId) => {
    if (!user) {
      alert("Vous devez vous connecter.");
      navigate("/login");
      return;
    }

    try {
      const userId = await getDjangoUserId();

      await axios.post("http://127.0.0.1:8000/api/favs/", {
        utilisateur: userId,
        film: filmId,
      });

      alert("Film ajouté à la watchlist ✅");
      fetchFavoriteMovies();
    } catch (err) {
      console.log("ERREUR WATCHLIST:", err.response?.data || err);
      alert("Erreur Django : " + JSON.stringify(err.response?.data || err.message));
    }
  };

  const rateMovie = async (filmId, valeur) => {
    if (!user) {
      alert("Vous devez vous connecter pour noter un film.");
      navigate("/login");
      return;
    }

    if (!valeur) return;

    try {
      const userId = await getDjangoUserId();

      await axios.post("http://127.0.0.1:8000/api/notes/", {
        utilisateur: userId,
        film: filmId,
        valeur: Number(valeur),
      });

      alert(`Note ${valeur}/10 ajoutée ✅`);
      fetchMovies();

      if (selectedMovie && selectedMovie.id === filmId) {
        openMovieDetails(selectedMovie);
      }
    } catch (err) {
      console.log("ERREUR NOTE:", err.response?.data || err);
      alert("Erreur note : " + JSON.stringify(err.response?.data || err.message));
    }
  };

  const RatingSelect = ({ movieId }) => {
    const [selected, setSelected] = useState("");

    const handleChange = async (e) => {
      e.stopPropagation();

      const value = e.target.value;
      setSelected(value);

      if (!value) return;

      await rateMovie(movieId, value);

      setTimeout(() => {
        setSelected("");
      }, 300);
    };

    return (
      <select
        className="rating-select"
        value={selected}
        onClick={(e) => e.stopPropagation()}
        onChange={handleChange}
      >
        <option value="">⭐ Noter</option>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((note) => (
          <option key={note} value={note}>
            {note}/10
          </option>
        ))}
      </select>
    );
  };

  const getSectionMovies = (start, end) => {
    return movies.slice(start, end);
  };

  const renderSection = (title, sectionMovies) => {
    if (!sectionMovies || sectionMovies.length === 0) return null;

    return (
      <section className="home-section">
        <h2 className="section-title">{title}</h2>

        <div className="section-row">
          {sectionMovies.map((movie) => (
            <div
              className="section-card"
              key={`${title}-${movie.id}`}
              onClick={() => openMovieDetails(movie)}
            >
              <img
                className="section-poster"
                src={movie.poster || "https://picsum.photos/200/300"}
                alt={movie.titre}
              />

              <div className="section-info">
                <h3>{movie.titre}</h3>
                <p className="rating">⭐ {movie.note_moyenne || "N/A"}/10</p>

                <RatingSelect movieId={movie.id} />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToWatchlist(movie.id);
                  }}
                >
                  {user ? "+ Watchlist" : "Se connecter"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderInterestsPreview = () => {
    const previewGenres = [
      "Action",
      "Comedy",
      "Drama",
      "Horror",
      "Romance",
      "Science Fiction",
      "Thriller",
      "Adventure",
    ];

    return (
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">🎭 Centres d'intérêts populaires</h2>

          <button
            className="see-all-btn"
            onClick={() => navigate("/interests")}
          >
            Voir tous les genres →
          </button>
        </div>

        <div className="interest-preview-grid">
          {previewGenres.map((genreName) => (
            <div
              key={genreName}
              className="interest-preview-card"
              onClick={() => navigate("/interests")}
            >
              <div className="interest-overlay">
                <h3>{genreName}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="imdb-page">
      <nav className="navbar">
        <div className="nav-left">
          <div
            className="logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            🎬 Movie Recommender
          </div>
        </div>

        <input
          className="search-input"
          type="text"
          placeholder="Rechercher un film..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />

        <button className="watchlist-top" onClick={handleSearch}>
          Rechercher
        </button>

        <div className="nav-right">
          {user ? (
            <>
              <a href="/watchlist" className="nav-link">
                📋 Ma Watchlist
              </a>

             <a href="/profile" className="nav-link">
  👤 Mon compte
</a>

              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <a href="/login" className="nav-link">
              Se connecter
            </a>
          )}
        </div>
      </nav>

      <section className="hero">
        {heroPrev !== null && heroMovies[heroPrev] && (
          <div
            className="hero-bg hero-bg-prev"
            style={{ backgroundImage: `url(${heroMovies[heroPrev].poster})` }}
          />
        )}

        {currentHero && (
          <div
            className={`hero-bg hero-bg-current ${
              heroFading ? "hero-bg-fade-out" : "hero-bg-fade-in"
            }`}
            style={{ backgroundImage: `url(${currentHero.poster})` }}
          />
        )}

        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-badge">🎬 Film du moment</div>

          <h1 className="hero-title">
            {currentHero ? currentHero.titre : "Movie Recommender"}
          </h1>

          <p className="hero-sub">
            {currentHero
              ? currentHero.description
                ? currentHero.description.slice(0, 140) + "…"
                : "Découvrez ce film et des milliers d'autres."
              : "Découvrez des films, filtrez par genre et construisez votre watchlist."}
          </p>

          {currentHero && (
            <div className="hero-meta">
              <span className="hero-rating">
                ⭐ {currentHero.note_moyenne || "N/A"}/10
              </span>

              {currentHero.genre && (
                <span className="hero-genre">{currentHero.genre}</span>
              )}
            </div>
          )}

          <div className="hero-actions">
            {currentHero && (
              <button
                className="hero-btn-primary"
                onClick={() => openMovieDetails(currentHero)}
              >
                ▶ Voir détails
              </button>
            )}

            {currentHero && (
              <button
                className="hero-btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  addToWatchlist(currentHero.id);
                }}
              >
                + Watchlist
              </button>
            )}
          </div>
        </div>

        {heroMovies.length > 1 && (
          <div className="hero-thumbs">
            {heroMovies.slice(0, 8).map((m, idx) => (
              <div
                key={m.id}
                className={`hero-thumb ${
                  idx === heroIndex ? "hero-thumb-active" : ""
                }`}
                onClick={() => goToHero(idx)}
              >
                <img src={m.poster} alt={m.titre} />
              </div>
            ))}
          </div>
        )}

        {heroMovies.length > 1 && (
          <div className="hero-dots">
            {heroMovies.slice(0, 8).map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${
                  idx === heroIndex ? "hero-dot-active" : ""
                }`}
                onClick={() => goToHero(idx)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="filters">
        <select
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            setSearch("");
          }}
        >
          <option value="">Tous les genres</option>
          <option value="Action">Action</option>
          <option value="Drama">Drame</option>
          <option value="Comedy">Comédie</option>
          <option value="Thriller">Thriller</option>
          <option value="Science Fiction">Science-Fiction</option>
        </select>
      </div>

      {message && <p className="search-message">{message}</p>}

      {isSearchMode ? (
        renderSection("🔍 Résultats / Recommandations", movies)
      ) : (
        <>
          {renderSection("🎬 Mis en avant aujourd'hui", getSectionMovies(0, 8))}
          {renderSection("👀 Que regarder", getSectionMovies(8, 16))}
          {renderSection("⭐ Meilleurs choix", getSectionMovies(16, 24))}
          {renderSection("❤️ De votre liste de favoris", favoriteMovies)}
          {renderSection("🔥 Top 10 cette semaine", getSectionMovies(0, 10))}
          {renderSection("👏 Favoris des fans", getSectionMovies(32, 40))}
          {renderInterestsPreview()}
          {renderSection("🕒 Récemment consultés", recentMovies)}
        </>
      )}

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

              <h3>Noter ce film</h3>
              <RatingSelect movieId={selectedMovie.id} />

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

              <div className="modal-actions">
                <button onClick={() => addToWatchlist(selectedMovie.id)}>
                  {user ? "+ Watchlist" : "Se connecter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;