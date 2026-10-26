# Tests de Carnet de fonte

`run_tests.py` ouvre l'appli dans un navigateur sans écran et vérifie les points sensibles :
données conservées entre versions, progression des charges, générateur, partage, sauvegardes datées,
compte Google (simulé), premier lancement et affichage sur petit écran.

- Sur GitHub, ils tournent tout seuls à chaque envoi (onglet **Actions** du dépôt).
- Sur ton PC : `pip install playwright`, `python -m playwright install chromium`, puis `python tests/run_tests.py`.

Avant chaque nouvelle version : `python tools/version.py 3.1` change le numéro partout d'un coup.
