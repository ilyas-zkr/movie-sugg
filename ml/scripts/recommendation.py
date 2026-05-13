import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# charger dataset
df = pd.read_csv("../dataset/final_movies.csv")

# remplacer NaN
df['tags'] = df['tags'].fillna('')

# vectorisation
cv = CountVectorizer(max_features=5000, stop_words='english')
vectors = cv.fit_transform(df['tags']).toarray()

# calcul similarité
similarity = cosine_similarity(vectors)

# -----------------------------
# fonction recommandation
# -----------------------------
def recommend(movie):
    try:
        index = df[df['title'] == movie].index[0]
    except:
        print("❌ Film non trouvé")
        return

    distances = similarity[index]

    movies_list = sorted(
        list(enumerate(distances)),
        reverse=True,
        key=lambda x: x[1]
    )[1:6]

    print(f"\n🎬 Films similaires à {movie} :\n")

    for i in movies_list:
        print(df.iloc[i[0]].title)

# -----------------------------
# TEST
# -----------------------------
recommend("Avatar")