import React, { useEffect, useState } from "react";
import axios from "axios";

function MovieList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/films/")
      .then(res => {
        setMovies(res.data);
      });
  }, []);

  return (
    <div>
      <h2>🎥 Liste des films</h2>
      {movies.map(movie => (
        <p key={movie.id}>{movie.titre}</p>
      ))}
    </div>
  );
}

export default MovieList;