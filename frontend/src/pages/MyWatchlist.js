import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/MyWatchlist.css";

function MyWatchlist() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDjangoUserId = async () => {
    const idToken = await user.getIdToken();

    const userRes = await axios.post(
      "http://127.0.0.1:8000/api/auth/firebase/",
      { token: idToken }
    );

    return userRes.data.user_id;
  };

  const fetchWatchlist = async () => {
    try {
      setLoading(true);

      const userId = await getDjangoUserId();

      const favRes = await axios.get("http://127.0.0.1:8000/api/favs/");

      const favList = Array.isArray(favRes.data)
        ? favRes.data
        : favRes.data.results || [];

      const userFavs = favList.filter(
        (fav) => String(fav.utilisateur) === String(userId)
      );

      const filmDetails = await Promise.all(
        userFavs.map((fav) =>
          axios.get(`http://127.0.0.1:8000/api/films/${fav.film}/`)
        )
      );

      setWatchlist(filmDetails.map((res) => res.data));

    } catch (err) {

      console.error("Erreur chargement watchlist:", err);
      setWatchlist([]);

    } finally {

      setLoading(false);

    }
  };

  const removeFromWatchlist = async (filmId) => {
    try {

      const userId = await getDjangoUserId();

      const favsRes = await axios.get(
        "http://127.0.0.1:8000/api/favs/"
      );

      const favList = Array.isArray(favsRes.data)
        ? favsRes.data
        : favsRes.data.results || [];

      const userFavs = favList.filter(
        (fav) =>
          String(fav.utilisateur) === String(userId) &&
          String(fav.film) === String(filmId)
      );

      if (userFavs.length > 0) {

        await axios.delete(
          `http://127.0.0.1:8000/api/favs/${userFavs[0].id}/`
        );

        setWatchlist((prev) =>
          prev.filter((film) => film.id !== filmId)
        );
      }

    } catch (err) {

      console.error("Erreur suppression:", err);

    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchWatchlist();

  }, [user, navigate]);

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="watchlist-container">

      {/* NAVBAR */}
      <div className="watchlist-navbar">

        <div
          className="watchlist-logo"
          onClick={() => navigate("/")}
        >
          🎬 Movie Recommender
        </div>

        <button
          className="back-home-btn"
          onClick={() => navigate("/")}
        >
          ⬅ Retour Home
        </button>

      </div>

      <h1>📽️ Ma Watchlist</h1>

      {watchlist.length === 0 ? (

        <div className="empty-watchlist">

          <p>Votre watchlist est vide</p>

          <button
            className="discover-btn"
            onClick={() => navigate("/")}
          >
            Découvrir des films
          </button>

        </div>

      ) : (

        <div className="watchlist-grid">

          {watchlist.map((film) => (

            <div key={film.id} className="watchlist-card">

              <img
                src={film.poster || "https://picsum.photos/200/300"}
                alt={film.titre}
                className="watchlist-poster"
              />

              <div className="watchlist-info">

                <h3>{film.titre}</h3>

                <p className="rating">
                  ⭐ {film.note_moyenne || "N/A"}/10
                </p>

                <p className="genre">
                  {film.genre}
                </p>

                <p className="description">
                  {film.description
                    ? film.description.substring(0, 100) + "..."
                    : "No description available."}
                </p>

                <button
                  className="remove-btn"
                  onClick={() => removeFromWatchlist(film.id)}
                >
                  ❌ Supprimer
                </button>

              </div>
            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default MyWatchlist;