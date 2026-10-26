#!/usr/bin/env python3
"""Change la version de l'appli partout d'un coup : python3 tools/version.py 3.1
(index.html, js/app.js, sw.js, Android build.gradle et PLAY-STORE.md)."""
import re, sys, pathlib
v = sys.argv[1]; R = pathlib.Path(__file__).resolve().parent.parent
def sub(path, pat, rep, n=1):
    p = R / path; s = p.read_text(encoding='utf-8'); s2, k = re.subn(pat, rep, s)
    if k < n: sys.exit(f'{path} : motif introuvable ({pat})')
    p.write_text(s2, encoding='utf-8'); print(f'{path} : {k} remplacement(s)')
sub('index.html', r'\?v=[0-9.]+"', f'?v={v}"', 3)
sub('js/app.js', r"const APP_VERSION='[0-9.]+';", f"const APP_VERSION='{v}';")
sub('sw.js', r"\?v=[0-9.]+'", f"?v={v}'", 3)
sub('sw.js', r"const CACHE='fonte-[^']+';", f"const CACHE='fonte-{v}';")
sub('mobile/android/app/build.gradle', r'versionName "[0-9.]+"', f'versionName "{v}"')
g = (R / 'mobile/android/app/build.gradle').read_text(); c = int(re.search(r'versionCode (\d+)', g).group(1))
sub('mobile/android/app/build.gradle', r'versionCode \d+', f'versionCode {c + 1}')
sub('mobile/PLAY-STORE.md', r'version [0-9.]+\.', f'version {v}.')
