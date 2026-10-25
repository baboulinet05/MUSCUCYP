# Publier Carnet de fonte sur le Play Store

Ce dossier contient la version Android de l'appli (Capacitor 8). C'est la même appli que la version web :
quand tu modifies `index.html`, tu recopies et tu recompiles (voir « Mettre à jour l'appli » en bas).

## Ce qui est déjà prêt

- Le projet Android : identifiant `io.github.baboulinet05.fonte`, cible Android 16 (API 36), version 2.8.
- L'icône, l'écran de démarrage et l'icône de notification.
- La notification de fin de repos quand l'écran est verrouillé, le bouton retour d'Android, l'export de
  sauvegarde par le menu Partager.
- La signature : clé d'envoi dans `android/upload-key.jks`, mots de passe dans `android/keystore.properties`.
  Ces deux fichiers ne sont **jamais** envoyés sur GitHub (ils sont dans `.gitignore`).
  **Copie-les sur une clé USB ou dans ton gestionnaire de mots de passe.** Sans eux, tu ne pourras pas publier
  de mise à jour (Google peut réinitialiser la clé d'envoi, mais ça prend plusieurs jours).
- La politique de confidentialité, en ligne sur :
  https://baboulinet05.github.io/MUSCUCYP/confidentialite.html

## Les étapes que toi seul peux faire

### 1. Créer le compte développeur (une seule fois)
1. Va sur https://play.google.com/console et connecte-toi avec ton compte Google.
2. Choisis un compte **personnel**, paie les **25 $** (une seule fois).
3. Vérifie ton identité (pièce d'identité) et ton numéro de téléphone. Ça peut prendre quelques jours.

### 2. Créer l'appli dans la console
1. **Créer une application** → nom : `Carnet de fonte`, langue : français, type : application, gratuite.
2. Accepte les déclarations (règles du programme, lois sur l'export).

### 3. Remplir la fiche (textes ci-dessous, à copier-coller)
- **Fiche principale du Play Store** : nom, description courte, description complète, icône 512 × 512
  (`icon-512.png` à la racine du dépôt), image de présentation 1024 × 500 et au moins 2 captures d'écran
  du téléphone.
- **Contenu de l'application** :
  - Règles de confidentialité : l'adresse ci-dessus.
  - Accès à l'application : « Toutes les fonctionnalités sont disponibles sans restriction ».
  - Annonces : « Non, mon appli ne contient pas d'annonces ».
  - Classification du contenu : catégorie « Toutes les autres applications », réponds « Non » partout.
  - Public cible : 18 ans et plus (ou 13 ans et plus). Ce n'est pas une appli pour enfants.
  - Sécurité des données : « Aucune donnée collectée ni partagée ». Les données restent sur l'appareil ;
    la synchro GitHub est faite par l'utilisateur vers son propre compte.
  - Appli d'actualité, santé, finance… : réponds « Non ». Pour Santé, coche seulement « Fitness » si on
    te le demande.

### 4. Test fermé avec tes collègues (obligatoire pour un compte personnel)
Google impose aux nouveaux comptes personnels un **test fermé avec au moins 12 testeurs pendant 14 jours**
avant de pouvoir publier pour tout le monde. Tes collègues sont parfaits pour ça.
1. **Tester → Test fermé → Créer un canal**.
2. Ajoute une liste de testeurs avec les adresses Gmail de 12 personnes ou plus.
3. **Créer une version** → importe `android/app/build/outputs/bundle/release/app-release.aab`.
   Accepte « Signature d'application par Google Play » quand on te le propose.
4. Envoie le lien d'inscription aux testeurs : chacun l'ouvre, accepte, puis installe depuis le Play Store.
5. Ils doivent garder l'appli installée pendant 14 jours.

### 5. Passer en production
Après 14 jours : **Production → Demander l'accès à la production**, réponds au petit questionnaire sur le
test, puis crée une version de production avec le même fichier `.aab`. La validation par Google prend
en général 1 à 7 jours.

## Textes de la fiche

**Nom (30 caractères max)**
Carnet de fonte

**Description courte (80 caractères max)**
Carnet de muscu simple : séances, séries, 690 exercices en photos, records.

**Description complète**
Carnet de fonte est un carnet de musculation simple, sans compte et sans pub.

SÉANCES
• Note tes séries, reps et charges en quelques touches, avec la colonne « Précédent »
• Minuteur de repos avec notification, même écran verrouillé
• Séries d'échauffement automatiques, drop sets, supersets, reps en réserve
• Chrono pour la planche, le gainage et les étirements

690 EXERCICES
• Photos et explications en 3 étapes pour chaque exercice
• Machines guidées (Technogym, Matrix…), poids libres, poulies, poids du corps
• Nouvelle catégorie Mobilité : étirements et rouleau de massage
• Recherche aussi par le nom écrit sur la machine (chest press, lat machine, rotary torso…)

PROGRESSION
• Records et 1RM estimé, graphiques de progression
• L'appli propose la charge suivante et repère quand tu stagnes
• Tableau des charges selon le nombre de reps
• Séries par muscle chaque semaine, muscles négligés, calendrier, statistiques

PROGRAMMES ET ROUTINES
• Full body, Upper/Lower, Push/Pull/Legs, machines guidées, fessiers, mobilité…
• La prochaine séance de ton programme est proposée automatiquement
• Partage tes routines avec tes collègues par un simple code

TES DONNÉES T'APPARTIENNENT
• Tout reste sur ton téléphone, rien n'est envoyé
• Export de sauvegarde, import depuis Hevy, synchro facultative vers ton GitHub

**Catégorie** : Santé et remise en forme
**Adresse e-mail de contact** : à choisir (elle est affichée publiquement sur la fiche).

## Récupérer ses données depuis la version web (iPhone ou navigateur)
La version Play Store ne voit pas les données de la version web. Pour les récupérer :
1. Dans la version web : **Réglages → Exporter → Copier** (ou Télécharger le fichier).
2. Dans l'appli Android : **Réglages → Coller une sauvegarde** (ou Importer un fichier).

## Mettre à jour l'appli
1. Modifie `index.html` à la racine (comme pour la version web).
2. Dans `mobile/` : `npm run sync` (Node 22 ou plus récent est nécessaire).
3. Dans `mobile/android/app/build.gradle`, augmente `versionCode` de 1 (2, 3, 4…) et mets à jour `versionName`.
4. Compile : `.\build-android.ps1 release`, puis importe le nouveau `.aab` dans la console.

## Compiler
- APK de test (à installer directement sur un téléphone) : `.\build-android.ps1`
  → `android\app\build\outputs\apk\debug\app-debug.apk`
- Bundle pour le Play Store : `.\build-android.ps1 release`
  → `android\app\build\outputs\bundle\release\app-release.aab`

Il faut Java 21 (Temurin, dans `%LOCALAPPDATA%\Programs\jdk-21…`) et le SDK Android (installé avec
Android Studio).
