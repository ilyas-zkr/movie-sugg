from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UtilisateurViewSet,
    FilmViewSet,
    NoteViewSet,
    FavoriViewSet,
    firebase_auth,
    get_recommendations,
    get_movie_poster,
    search_movies,
)

router = DefaultRouter()

router.register(r'utilisateurs', UtilisateurViewSet)
router.register(r'films', FilmViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'favs', FavoriViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # 🔥 Firebase Auth
    path('auth/firebase/', firebase_auth),

    # 🎬 Recommendations
    path('recommend/<str:title>/', get_recommendations),

    # 🔍 Search
    path('search/', search_movies),

    # 🖼️ Poster TMDB
    path('poster/<str:title>/', get_movie_poster),
]