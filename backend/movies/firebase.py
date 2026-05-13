import firebase_admin
from firebase_admin import credentials, firestore

# Initialise Firebase
cred = credentials.Certificate("backend/movies/firebase_key.json")
firebase_admin.initialize_app(cred)

# Référence à Firestore
db = firestore.client()