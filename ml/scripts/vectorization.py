import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer

df = pd.read_csv("../dataset/final_movies.csv")

cv = CountVectorizer(max_features=5000, stop_words='english')

vectors = cv.fit_transform(df['tags']).toarray()

print("Shape:", vectors.shape)