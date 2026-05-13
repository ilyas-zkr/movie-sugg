import csv
import os
import django
import ast
import requests

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from movies.models import Film

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "..", "ml", "dataset", "final_movies.csv")
TMDB_API_KEY = os.environ.get("TMDB_API_KEY")
TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500"

# fonction pour nettoyer genres
def convert(text):
    try:
        data = ast.literal_eval(text)
        return ", ".join([item['name'] for item in data])
    except:
        return ""

# Récupérer le poster depuis l'API TMDB
def get_poster_url(movie_id):
    if not TMDB_API_KEY:
        return None

    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}"
        response = requests.get(url)
        data = response.json()
        poster_path = data.get('poster_path')
        if poster_path:
            return f"{TMDB_IMAGE_URL}{poster_path}"
    except Exception:
        pass
    return None

if not TMDB_API_KEY:
    print("⚠️ TMDB_API_KEY non défini. Les posters ne seront pas importés.")

films_to_create = []
with open(csv_path, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        movie_id = row.get('id') or row.get('movie_id')
        poster_url = get_poster_url(movie_id) if movie_id else None
        
        title = row.get('title') or row.get('original_title') or ''
        tags = row.get('tags', '')
        overview = row.get('overview', '')
        vote_average = row.get('vote_average', row.get('rating', 0))

        films_to_create.append(Film(
            titre=title,
            genre=tags if tags else convert(row.get('genres', '')),
            description=overview,
            note_moyenne=float(vote_average or 0),
            poster_url=poster_url
        ))

Film.objects.bulk_create(films_to_create)
print("✅ Import terminé !")