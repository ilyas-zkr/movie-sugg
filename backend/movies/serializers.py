from rest_framework import serializers
from .models import Utilisateur, Film, Note, Favori


# -------------------------------
# Utilisateur
# -------------------------------
class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'firebase_uid', 'nom', 'email']


# -------------------------------
# Film
# -------------------------------
class FilmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Film
        fields = '__all__'


# -------------------------------
# Note
# -------------------------------
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'utilisateur', 'film', 'valeur']


# -------------------------------
# Favori
# -------------------------------
class FavoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favori
        fields = ['id', 'utilisateur', 'film']