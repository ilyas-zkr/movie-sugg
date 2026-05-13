import React, { useEffect, useState } from "react";
import { useAuth, auth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import axios from "axios";
import "../styles/Profile.css";

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [watchlistCount, setWatchlistCount] = useState(0);
  const [recentMovies, setRecentMovies] = useState([]);

  const getDjangoUserId = async () => {
    const idToken = await user.getIdToken();

    const res = await axios.post("http://127.0.0.1:8000/api/auth/firebase/", {
      token: idToken,
    });

    return res.data.user_id;
  };

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const userId = await getDjangoUserId();

      const favRes = await axios.get("http://127.0.0.1:8000/api/favs/");
      const favs = Array.isArray(favRes.data)
        ? favRes.data
        : favRes.data.results || [];

      const userFavs = favs.filter(
        (fav) => String(fav.utilisateur) === String(userId)
      );

      setWatchlistCount(userFavs.length);

      const recentKey = `recentMovies_${user.uid}`;
      const recent = JSON.parse(localStorage.getItem(recentKey)) || [];
      setRecentMovies(recent);
    } catch (err) {
      console.log("Erreur profile :", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadProfileData();
  }, [user]);

  return (
    <div className="profile-page">
      <div className="profile-navbar">
        <div className="profile-logo" onClick={() => navigate("/")}>
          🎬 Movie Recommender
        </div>

        <button onClick={() => navigate("/")}>⬅ Home</button>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar">
          {user?.email?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1>Mon Compte</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h2>👤 Informations</h2>
          <p>
            <strong>Email :</strong> {user?.email}
          </p>
          
        </div>

        <div className="profile-card stat-card">
          <h2>📋 Watchlist</h2>
          <div className="stat-number">{watchlistCount}</div>
          <p>films enregistrés</p>
          <button onClick={() => navigate("/watchlist")}>
            Voir ma watchlist
          </button>
        </div>

        <div className="profile-card stat-card">
          <h2>🕒 Récemment consultés</h2>
          <div className="stat-number">{recentMovies.length}</div>
          <p>films consultés récemment</p>
        </div>
      </div>

      <div className="profile-card recent-section">
        <h2>🎞️ Derniers films consultés</h2>

        {recentMovies.length === 0 ? (
          <p className="empty-profile">Aucun film consulté récemment.</p>
        ) : (
          <div className="profile-recent-row">
            {recentMovies.slice(0, 8).map((movie) => (
              <div key={movie.id} className="profile-recent-card">
                <img
                  src={movie.poster || "https://picsum.photos/200/300"}
                  alt={movie.titre}
                />
                <h3>{movie.titre}</h3>
                <p>⭐ {movie.note_moyenne || "N/A"}/10</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="profile-actions">
        <button onClick={() => navigate("/")}>🏠 Retour Home</button>
        <button onClick={() => navigate("/interests")}>🎭 Genres</button>
        <button onClick={() => navigate("/watchlist")}>📋 Watchlist</button>
        <button className="logout-profile-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;