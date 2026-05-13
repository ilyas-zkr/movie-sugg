import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

# chemin dataset
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
file_path = os.path.join(BASE_DIR, "../ml/dataset/final_movies.csv")

# charger dataset
df = pd.read_csv(file_path)
df['tags'] = df['tags'].fillna('')

# vectorisation
cv = CountVectorizer(max_features=5000, stop_words='english')
vectors = cv.fit_transform(df['tags']).toarray()

# similarité
similarity = cosine_similarity(vectors)

# -----------------------------
# fonction recommandation
# -----------------------------
def recommend(movie):
    try:
        index = df[df['title'] == movie].index[0]
    except:
        return []

    distances = similarity[index]

    movies_list = sorted(
        list(enumerate(distances)),
        reverse=True,
        key=lambda x: x[1]
    )[1:6]

    results = []
    for i in movies_list:
        results.append(df.iloc[i[0]].title)

    return results