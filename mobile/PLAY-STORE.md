# Publier Carnet de fonte sur le Play Store

Ce dossier contient la version Android de l'appli (Capacitor 8). C'est la même appli que la version web :
quand tu modifies `index.html`, tu recopies et tu recompiles (voir « Mettre à jour l'appli » en bas).

## Ce qui est déjà prêt

- Le projet Android : identifiant `fr.carnetdefonte.app`, cible Android 16 (API 36), version 3.1.
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
  - Sécurité des données (avec la connexion Google, il faut déclarer ces données) :
    - **Collectées** : adresse e-mail et identifiant du compte (connexion Google), données d'activité
      physique (séances, pesées) pour la sauvegarde, pseudo et statistiques pour le classement si
      l'utilisateur l'active. **Partagées** : aucune (Firebase est un sous-traitant, pas un partage).
    - Chiffrées en transit : oui. Suppression possible : oui, dans l'appli (Réglages → Synchro cloud →
      Supprimer mon compte).
    - Lien de suppression du compte demandé par Google : l'adresse de la politique de confidentialité
      (section « Suppression »).
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
Carnet de muscu gratuit et sans pub : programme, 1 300 exercices, progression.

**Description complète**
Carnet de fonte est le carnet de musculation français, gratuit, sans pub et sans abonnement.

TON PROGRAMME EN 4 QUESTIONS
• Objectif, niveau, lieu et séances par semaine : ton programme complet est prêt
• Planning de la semaine et séance du jour sur l'accueil
• Générateur de séance selon ta durée, ton matériel et tes muscles reposés
• Échauffement guidé de 5 minutes adapté à ta séance

PENDANT LA SÉANCE
• Séries, reps et charges en quelques touches, avec la colonne « Précédent »
• La charge à faire proposée à chaque série, semaine de décharge quand tu stagnes
• Minuteur de repos, séries d'échauffement, drop sets, supersets, RIR
• Remplacement d'un exercice en un geste quand la machine est prise

PLUS DE 1 300 EXERCICES ILLUSTRÉS
• Photos ou illustrations, étapes en français, conseils et vidéos de démonstration
• Poids libres, machines guidées, poulies, poids du corps, élastiques, mobilité
• Favoris et recherche aussi en anglais (chest press, lat pulldown…)

PROGRESSION
• Records, 1RM estimé, graphiques, bilan du mois, calories estimées
• Carte de récupération musculaire et muscles négligés
• 42 badges à débloquer

ENTRE POTES
• Classement de la semaine, régularité et force
• Partage de routines par lien ou QR code

TES DONNÉES T'APPARTIENNENT
• Sans compte, tout reste sur ton téléphone
• Connexion Google facultative pour la sauvegarde et le classement
• Copies automatiques des 7 derniers jours, export, import depuis Hevy

**Visuels** : générés dans `store/out/` (6 captures 1080 × 1920 et l'image de présentation 1024 × 500).
Pour les refaire après une modification de l'appli : `python3 store/make_store.py`.

**Catégorie** : Santé et remise en forme
**Adresse e-mail de contact** : à choisir (elle est affichée publiquement sur la fiche).

## Connexion Google dans l'appli Android (à faire une fois, sur ton PC)
La version web utilise une fenêtre Google ; l'appli Android passe par le sélecteur de compte natif
d'Android (plugin `@capacitor-firebase/authentication`, déjà ajouté à `package.json`).
1. Dans `mobile/` : `npm install`, puis `npm run sync`.
   Si npm refuse la version du plugin, lance `npm install @capacitor-firebase/authentication@latest`.
2. Récupère les empreintes de ta clé : dans `mobile/android`, lance `.\gradlew.bat signingReport`
   et note les lignes **SHA1** et **SHA-256** de la variante `release` (et `debug` pour tes tests).
3. Console Firebase → Paramètres du projet → **Vos applications → Ajouter une application → Android** :
   nom du package `fr.carnetdefonte.app`, puis colle le SHA-1. Ajoute aussi le SHA-256 dans la
   fiche de l'appli Android.
4. Télécharge le fichier **google-services.json** proposé et mets-le dans `mobile/android/app/`.
   Ne l'envoie pas sur GitHub : il est déjà dans `.gitignore`.
5. Quand l'appli sera sur le Play Store : console Play → **Intégrité de l'appli** → copie l'empreinte
   SHA-1 de la **clé de signature d'application** (celle de Google) et ajoute-la aussi dans Firebase.
   Sans elle, la connexion Google ne marchera pas dans la version téléchargée depuis le store.
6. Recompile : `.\build-android.ps1`. Le bouton « Se connecter avec Google » apparaît dans Réglages.

## Récupérer ses données depuis la version web (iPhone ou navigateur)
Le plus simple : se connecter avec le même compte Google sur les deux. Sinon :
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
