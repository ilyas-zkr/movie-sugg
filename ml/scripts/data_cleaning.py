import pandas as pd
import ast

# -----------------------------
# 1. Charger le dataset
# -----------------------------
df = pd.read_csv("../dataset/movies.csv")

print("Avant nettoyage :", df.shape)

# -----------------------------
# 2. Garder les colonnes utiles
# -----------------------------
columns = ['title', 'genres', 'overview', 'keywords']
df = df[columns]

# -----------------------------
# 3. Supprimer les valeurs nulles
# -----------------------------
df.dropna(inplace=True)

# -----------------------------
# 4. Fonction pour transformer JSON → texte
# -----------------------------
def convert(text):
    try:
        data = ast.literal_eval(text)
        return " ".join([item['name'] for item in data])
    except:
        return ""

# Appliquer la transformation
df['genres'] = df['genres'].apply(convert)
df['keywords'] = df['keywords'].apply(convert)

# -----------------------------
# 5. Supprimer les doublons
# -----------------------------
df.drop_duplicates(inplace=True)

# -----------------------------
# 6. Réinitialiser index
# -----------------------------
df.reset_index(drop=True, inplace=True)

print("Après nettoyage :", df.shape)

# -----------------------------
# 7. Sauvegarder le dataset propre
# -----------------------------
df.to_csv("../dataset/clean_movies.csv", index=False)

print("✅ Nettoyage terminé !")