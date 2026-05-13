from django.contrib import admin
from .models import Film, Utilisateur, Note, Favori

# Enregistre les modèles pour l'admin
admin.site.register(Film)
admin.site.register(Utilisateur)
admin.site.register(Note)
admin.site.register(Favori)