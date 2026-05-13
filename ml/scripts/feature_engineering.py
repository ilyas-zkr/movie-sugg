import pandas as pd

df = pd.read_csv("../dataset/clean_movies.csv")

# fusion des colonnes
df['tags'] = df['genres'] + " " + df['keywords'] + " " + df['overview']

# garder seulement utile
df = df[['title', 'tags']]

# sauvegarder
df.to_csv("../dataset/final_movies.csv", index=False)

print("✅ Feature engineering terminé")