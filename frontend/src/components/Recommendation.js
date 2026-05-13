import React, { useState } from "react";
import axios from "axios";

function Recommendation() {
  const [title, setTitle] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    axios.get(`http://127.0.0.1:8000/api/recommend/${title}/`)
      .then(res => {
        setResults(res.data.recommendations);
      })
      .catch(() => {
        alert("Film non trouvé");
      });
  };

  return (
    <div>
      <h2>🔍 Rechercher un film</h2>

      <input
        type="text"
        placeholder="Ex: Inception"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={handleSearch}>Recommander</button>

      <h3>🎬 Films similaires :</h3>
      {results.map((film, index) => (
        <p key={index}>{film}</p>
      ))}
    </div>
  );
}

export default Recommendation;