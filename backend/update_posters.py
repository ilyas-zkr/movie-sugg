import os
import django
import requests
from urllib.parse import quote

# config Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from movies.models import Film

# 🔑 clé TMDB
API_KEY = "e361a3d6faa481e3fed6eb33d7ef69c1"

# films sans poster
films = Film.objects.filter(poster="")

for film in films:

    try:

        title = quote(film.titre)

        url = f"https://api.themoviedb.org/3/search/movie?api_key={API_KEY}&query={title}"

        response = requests.get(url).json()

        if response.get("results"):

            poster_path = response["results"][0].get("poster_path")

            if poster_path:

                full_poster = f"https://image.tmdb.org/t/p/w500{poster_path}"

                film.poster = full_poster
                film.save()

                print(f"✅ Poster ajouté : {film.titre}")

            else:
                print(f"❌ Aucun poster : {film.titre}")

        else:
            print(f"❌ Film non trouvé : {film.titre}")

    except Exception as e:
        print(f"Erreur {film.titre} :", e)

print("🎬 Mise à jour terminée")