# 🔐 Configuration Firebase pour l'authentification

## Étapes pour configurer Firebase:

### 1. Créer un projet Firebase
- Allez sur [Firebase Console](https://console.firebase.google.com)
- Cliquez sur "Créer un projet"
- Nommez-le "movie-recommender"
- Activez les services à la demande

### 2. Ajouter une application Web
- Dans le projet, cliquez sur "</>" pour ajouter une app Web
- Enregistrez l'app
- Copiez la configuration Firebase

### 3. Activer l'authentification par Email/Mot de passe
- Allez dans "Authentication" → "Sign-in method"
- Activez "Email/Password"
- Cliquez sur "Save"

### 4. Mettre à jour le code
Remplacez la configuration dans `frontend/src/context/AuthContext.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 5. Installer les dépendances
```bash
cd frontend
npm install firebase react-router-dom
```

### 6. Démarrer l'application
```bash
npm start
```

## 📱 Fonctionnalités implémentées:

✅ Page de login/inscription avec Firebase
✅ Page Ma Watchlist (protégée par authentification)
✅ Bouton "Ajouter à Watchlist" sur chaque film
✅ Navbar avec info utilisateur et logout
✅ Routes protégées
✅ Authentification persistante

## 🚀 Utilisation:

1. **Se connecter**: Cliquez sur "Se connecter" dans la navbar
2. **Ajouter à la watchlist**: Cliquez sur "➕ Ajouter à Watchlist" sur un film
3. **Voir ma watchlist**: Cliquez sur "📋 Ma Watchlist" dans la navbar
4. **Se déconnecter**: Cliquez sur "Logout"
