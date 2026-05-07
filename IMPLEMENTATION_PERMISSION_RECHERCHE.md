# Implémentation : Autorisation des Recherches Multicritères pour Gestionnaires

##  Résumé de l'implémentation

Cette fonctionnalité permet à l'administrateur d'autoriser ou d'interdire aux gestionnaires l'accès aux recherches multicritères.

---

##  Modifications effectuées

### 1️⃣ Backend - Modèle User (`server/src/models/User.model.js`)

**Ajout du champ de permission :**
```javascript
// ── Permissions de recherche (pour les gestionnaires) ──
canSearchMultiCriteria: {
  type: Boolean,
  default: false,  // Les gestionnaires n'ont pas accès par défaut
}
```

- **Type** : Booléen
- **Valeur par défaut** : `false` (les gestionnaires ne peuvent pas faire de recherches multicritères par défaut)

---

### 2️⃣ Backend - Route utilisateur (`server/src/routes/user.routes.js`)

**Nouvelle route PUT pour mettre à jour la permission :**
```
PUT /api/users/:id/search-permission
```

- **Authentification requise** : Oui (middleware `proteger`)
- **Autorisation** : Admin uniquement (middleware `autoriser('admin')`)
- **Body** : `{ "canSearchMultiCriteria": true/false }`
- **Réponse** : Utilisateur mis à jour avec le nouveau statut

---

### 3️⃣ Backend - Contrôleur de recherche (`server/src/controllers/recherche.controller.js`)

**Ajout de la vérification de permission :**

La fonction `rechercherEntreprises` vérifie maintenant :
1. Si l'utilisateur est un gestionnaire (`role === 'manager'`)
2. Si le gestionnaire a fourni plus d'un critère de recherche
3. Si le gestionnaire a la permission `canSearchMultiCriteria`

**Réponse en cas de refus :**
```json
{
  "success": false,
  "message": "Vous n'êtes pas autorisé à effectuer des recherches multicritères. Veuillez contacter l'administrateur pour demander l'autorisation.",
  "requiresPermission": true
}
```

---

### 4️⃣ Frontend Admin (`client/src/views/admin/Admin.jsx`)

#### a) Fonction pour mettre à jour la permission
```javascript
const mettreAJourPermissionRecherche = async (id, permission) => {
  // Envoie une requête PUT à /api/users/{id}/search-permission
  // Affiche un message de confirmation
}
```

#### b) Mise à jour du chargement des utilisateurs
- Le champ `canSearchMultiCriteria` est maintenant chargé avec les données utilisateur

#### c) Nouveau bouton dans le tableau des utilisateurs
- **Visible pour** : Les gestionnaires uniquement
- **Label** : 
  - `🔓 Autoriser recherche` (si non autorisé)
  - `🔒 Refuser recherche` (si autorisé)
- **Couleurs** :
  - Vert (#00904C) si autorisé
  - Orange (#CC6600) si refusé

---

### 5️⃣ Frontend Recherche (`client/src/views/shared/Rechercheentreprise.jsx`)

#### a) État pour la permission
```javascript
const [permissionRefusee, setPermissionRefusee] = useState(false);
```

#### b) Vérification au montage du composant
- Vérifie si l'utilisateur est un gestionnaire
- Marque la permission comme refusée si nécessaire

#### c) Vérification avant la recherche
La fonction `rechercherEntreprise` vérifie maintenant la permission avant d'envoyer la requête :
- Si un gestionnaire n'a pas la permission, affiche un message d'erreur
- Le message guide l'utilisateur à contacter l'administrateur

---

## 🎯 Comportement attendu

### Pour l'Administrateur

1. Accès au tableau "Utilisateurs" dans le panel admin
2. Pour chaque gestionnaire :
   - Voir le bouton "🔓 Autoriser recherche" ou "🔒 Refuser recherche"
   - Un clic change immédiatement la permission
   - Un message de confirmation s'affiche

### Pour le Gestionnaire

1. **Avec autorisation** ✅
   - Peut accéder à la page de recherche multicritère
   - Peut utiliser tous les filtres sans restriction

2. **Sans autorisation** ❌
   - Peut accéder à la page de recherche
   - Voit tous les formulaires de recherche
   - Quand il essaie de chercher avec 2 critères ou plus, reçoit le message :
   ```
   🔒 Vous n'êtes pas autorisé à effectuer des recherches multicritères. 
   Veuillez contacter l'administrateur pour demander l'autorisation.
   ```
   - Peut toujours faire des recherches avec **1 seul critère** (RCCM OU IFU OU Raison sociale)

---

## 📊 Cas d'usage

### Cas 1 : Créer un nouveau gestionnaire sans permission
1. Admin clique "Nouveau gestionnaire"
2. Remplit le formulaire et crée l'utilisateur
3. Le gestionnaire est créé avec `canSearchMultiCriteria: false` (défaut)
4. Le gestionnaire ne peut faire que des recherches avec 1 critère

### Cas 2 : Accorder la permission après
1. Admin voit le gestionnaire dans la table
2. Clique le bouton "🔓 Autoriser recherche"
3. Le bouton devient "🔒 Refuser recherche" (vert → orange)
4. Le gestionnaire peut maintenant faire des recherches multicritères

### Cas 3 : Retirer la permission
1. Admin clique "🔒 Refuser recherche"
2. Le bouton redevient "🔓 Autoriser recherche"
3. Le gestionnaire reçoit le message d'erreur à la prochaine recherche

---

## 🔐 Sécurité

- ✅ Vérification côté serveur (backend)
- ✅ Les gestionnaires ne peuvent pas contourner la permission
- ✅ Les requêtes API sont validées
- ✅ Les administrateurs seuls peuvent modifier les permissions
- ✅ Les utilisateurs normaux (subscriber, visitor) ne sont pas affectés

---

## 📝 Points importants

1. **Les recherches simples (1 critère) sont toujours autorisées** pour les gestionnaires
2. **Seules les recherches multicritères (2+ critères) sont restreintes**
3. **L'autorisation s'applique immédiatement** - pas besoin de reconnexion
4. **Le message est clair et actionnable** - guide l'utilisateur
5. **L'admin peut contrôler chaque gestionnaire individuellement**

---

## 🧪 Test recommandé

1. **Test 1 - Créer un gestionnaire**
   - Créer un nouveau gestionnaire
   - Vérifier qu'il ne peut pas faire de recherche multicritère

2. **Test 2 - Accorder la permission**
   - Cliquer "Autoriser recherche"
   - Vérifier que le gestionnaire peut maintenant faire des recherches multicritères

3. **Test 3 - Retirer la permission**
   - Cliquer "Refuser recherche"
   - Vérifier que le gestionnaire reçoit le message d'erreur

4. **Test 4 - Recherche simple**
   - Vérifier qu'un gestionnaire sans permission peut toujours rechercher avec 1 critère
