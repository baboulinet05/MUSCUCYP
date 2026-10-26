# Carnet de fonte

Application de musculation personnelle (PWA pour iPhone) : séances, séries et répétitions, annuaire de plus de 1 300 exercices illustrés avec descriptions (dont machines Technogym et mobilité), routines, minuteur de repos, records et progression.

Ouvrir sur iPhone dans Safari, puis Partager → Sur l'écran d'accueil.

Photos d'exercices : [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (domaine public).
Exercices supplémentaires : noms et étapes adaptés en français depuis [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (MIT).
Illustrations d'exercices : Exercise data by RepDB ([repdb.co](https://repdb.co)).
QR codes : [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (licence MIT, Kazuhiko Arase).
Les données d'entraînement restent sur le téléphone (Réglages → Exporter pour les sauvegarder).

© 2026 baboulinet — tous droits réservés. Voir [LICENSE](LICENSE).

## Organisation du code
- `index.html` : la page ; `css/app.css` : les styles ; `js/data.js` : l'annuaire d'exercices ; `js/app.js` : l'appli.
- `tests/run_tests.py` : tests automatiques (lancés par GitHub à chaque envoi, onglet Actions).
- `tools/version.py 3.1` : change le numéro de version partout.
- `store/make_store.py` : visuels de la fiche Play Store ; `mobile/` : version Android.
