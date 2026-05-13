from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.http import JsonResponse
from django.db.models import Q
from django.db.models import Avg

# ✅ initialise Firebase Admin avant auth.verify_id_token
from . import firebase_config
from firebase_admin import auth

import requests

from .models import Utilisateur, Film, Note, Favori
from .serializers import (
    UtilisateurSerializer,
    FilmSerializer,
    NoteSerializer,
    FavoriSerializer
)
from .recommender import recommend


API_KEY = "e361a3d6faa481e3fed6eb33d7ef69c1"


class FilmPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 60


class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer


class FilmViewSet(viewsets.ModelViewSet):
    queryset = Film.objects.all()
    serializer_class = FilmSerializer
    pagination_class = FilmPagination

    def get_queryset(self):
        queryset = Film.objects.all().order_by("id")
        queryset = Film.objects.all().order_by("-note_moyenne")
        genre = self.request.query_params.get("genre")

        if genre:
            queryset = queryset.filter(genre__icontains=genre)

        return queryset


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

    def perform_create(self, serializer):
        note = serializer.save()
        self.update_movie_rating(note.film)

    def perform_update(self, serializer):
        note = serializer.save()
        self.update_movie_rating(note.film)

    def perform_destroy(self, instance):
        film = instance.film
        instance.delete()
        self.update_movie_rating(film)

    def update_movie_rating(self, film):
        moyenne = Note.objects.filter(film=film).aggregate(
            Avg("valeur")
        )["valeur__avg"]

        film.note_moyenne = round(moyenne, 1) if moyenne else 0
        film.save()


class FavoriViewSet(viewsets.ModelViewSet):
    queryset = Favori.objects.all()
    serializer_class = FavoriSerializer


@api_view(["POST"])
def firebase_auth(request):
    token = request.data.get("token")

    if not token:
        return Response({"error": "Token Firebase manquant"}, status=400)

    try:
        decoded_token = auth.verify_id_token(token)

        uid = decoded_token["uid"]
        email = decoded_token.get("email", "")
        name = decoded_token.get("name") or email.split("@")[0] or "Utilisateur"

        user, created = Utilisateur.objects.get_or_create(
            firebase_uid=uid,
            defaults={
                "email": email,
                "nom": name
            }
        )

        return Response({
            "message": "Utilisateur connecté",
            "user_id": user.id,
            "created": created
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)


def get_recommendations(request, title):
    results = recommend(title)
    return JsonResponse({"recommendations": results})


def get_movie_poster(request, title):
    url = (
        f"https://api.themoviedb.org/3/search/movie"
        f"?api_key={API_KEY}&query={title}"
    )

    try:
        response = requests.get(url).json()

        if response.get("results"):
            poster_path = response["results"][0].get("poster_path")

            if poster_path:
                full_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
                return JsonResponse({"poster": full_url})

        return JsonResponse({"poster": None})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def search_movies(request):
    query = request.GET.get("q", "")

    if not query:
        return JsonResponse({
            "found": False,
            "results": [],
            "recommendations": []
        })

    movies = Film.objects.filter(
        Q(titre__icontains=query) |
        Q(genre__icontains=query) |
        Q(description__icontains=query)
    ).order_by("-note_moyenne")[:20]

    results = FilmSerializer(movies, many=True).data

    if len(results) > 0:
        return JsonResponse({
            "found": True,
            "results": results,
            "recommendations": []
        })

    recommendations = Film.objects.all().order_by("-note_moyenne")[:10]
    recommendations_data = FilmSerializer(recommendations, many=True).data

    return JsonResponse({
        "found": False,
        "results": [],
        "recommendations": recommendations_data
    })