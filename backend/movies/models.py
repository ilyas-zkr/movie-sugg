from django.db import models

# -------------------------------
# Utilisateur (lié à Firebase)
# -------------------------------
class Utilisateur(models.Model):
    firebase_uid = models.CharField(max_length=255, unique=True)
    nom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.nom

# -------------------------------
# Film
# -------------------------------
class Film(models.Model):
    titre = models.CharField(max_length=200)
    genre = models.TextField(blank=True)
    description = models.TextField(blank=True)
    note_moyenne = models.FloatField(default=0)
    poster = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.titre

# -------------------------------
# Note
# -------------------------------
class Note(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    film = models.ForeignKey(Film, on_delete=models.CASCADE)
    valeur = models.IntegerField()

    class Meta:
        unique_together = ('utilisateur', 'film')

    def __str__(self):
        return f"{self.utilisateur.nom} - {self.film.titre} : {self.valeur}"
# -------------------------------
# Favori
# -------------------------------
class Favori(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    film = models.ForeignKey(Film, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.utilisateur.nom} - {self.film.titre}"