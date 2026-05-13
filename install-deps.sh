#!/bin/bash
cd frontend
npm install firebase react-router-dom
echo "✅ Dépendances installées!"
echo ""
echo "Configuration Firebase nécessaire:"
echo "- Mettez à jour firebaseConfig dans src/context/AuthContext.js"
echo "- Utilisez vos identifiants Firebase"
