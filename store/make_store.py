#!/usr/bin/env python3
"""Génère les visuels de la fiche Play Store : 6 captures (1080 × 1920) et l'image de présentation (1024 × 500).
Lancement : python3 store/make_store.py   → fichiers dans store/out/"""
import json, os, random, socket, subprocess, sys, time, pathlib, base64
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
LANG = os.environ.get('LANG_STORE', 'fr')
OUT = ROOT / 'store' / ('out' if LANG == 'fr' else 'out-' + LANG); OUT.mkdir(parents=True, exist_ok=True)
s = socket.socket(); s.bind(('127.0.0.1', 0)); PORT = s.getsockname()[1]; s.close()
SRV = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '-b', '127.0.0.1', '-d', str(ROOT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
URL = f'http://127.0.0.1:{PORT}/'

# ---------- un historique de démonstration réaliste (3 mois, PPL) ----------
random.seed(4)
NOW = int(time.time() * 1000); D = 864e5
PUSH = [('developpe-couche-barre', 70, 2.5, 4, 8), ('developpe-incline-halteres', 24, 2, 3, 10), ('elevations-laterales-halteres', 9, 1, 3, 12), ('extension-triceps-corde', 22, 2.5, 3, 12)]
PULL = [('tractions-pronation', 0, 0, 4, 8), ('rowing-barre-buste-penche', 60, 2.5, 4, 8), ('face-pull', 20, 2.5, 3, 15), ('curl-barre-droite', 30, 2.5, 3, 10)]
LEGS = [('squat-barre-haute', 90, 2.5, 4, 6), ('souleve-de-terre-roumain-barre', 80, 2.5, 3, 8), ('presse-a-cuisses', 140, 5, 3, 10), ('mollets-debout-machine', 60, 5, 4, 12)]
hist = []; k = 0
for wk in range(12, -1, -1):
    for di, (nm, L) in enumerate([('Push', PUSH), ('Pull', PULL), ('Jambes', LEGS)]):
        day = NOW - (wk * 7 + (6 - di * 2)) * D
        if day > NOW - 0.5 * D: continue
        st = int(day - 18 * 36e5 + random.randint(0, 3) * 36e5)
        exs = []
        for (i, a0, inc, n, r) in L:
            a = a0 + inc * (12 - wk) // 2 * 1
            exs.append({'exId': i, 'sets': [{'t': 'n', 'a': a, 'b': r + random.choice([0, 0, 1, -1]), 'done': True} for _ in range(n)]})
        k += 1; hist.append({'id': f'd{k}', 'name': nm, 'start': st, 'end': st + int((55 + random.randint(0, 20)) * 6e4), 'exercises': exs, 'prs': []})
hist.sort(key=lambda w: -w['start'])
R = lambda rid, nm, L: {'id': rid, 'name': nm, 'exercises': [{'exId': i, 'rest': 120, 'sets': [{'t': 'n', 'a': '', 'b': str(r)} for _ in range(n)]} for (i, a, inc, n, r) in L]}
dow = (time.localtime().tm_wday) % 7
STATE = {'v': 1, 'settings': {'theme': 'dark', 'onboarded': 1, 'lastReport': time.strftime('%Y-%m'), 'lastExport': NOW, 'suggest': True, 'repLo': 6, 'repHi': 10, 'weekGoal': 3, 'lbFb': True, 'lbName': 'Baboulinet', 'fbUid': 'demo', 'badges': None},
         'history': hist, 'routines': [R('r1', 'Push', PUSH), R('r2', 'Pull', PULL), R('r3', 'Jambes', LEGS)],
         'plan': {str((dow) % 7): 'r1', str((dow + 2) % 7): 'r2', str((dow + 4) % 7): 'r3'},
         'custom': [], 'body': [{'id': f'b{i}', 't': NOW - i * 7 * D, 'kg': round(82 - i * 0.3, 1)} for i in range(12)],
         'fav': ['developpe-couche-barre', 'squat-barre-haute'], 'goals': {'developpe-couche-barre': {'v': 100}},
         'friends': [{'id': 'Kevin', 'name': 'Kevin'}, {'id': 'Sarah', 'name': 'Sarah'}, {'id': 'Tom', 'name': 'Tom'}]}

def shots():
    raw = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, service_workers='block', locale='fr-FR' if LANG == 'fr' else 'en-US')
        ctx.add_init_script("if(!sessionStorage.getItem('s')){localStorage.setItem('carnet-fonte-v1',%s);sessionStorage.setItem('s','1')}" % json.dumps(json.dumps(STATE)))
        pg = ctx.new_page(); pg.goto(URL); pg.wait_for_timeout(1500); pg.evaluate("closeDlg();S.badges=badgeDefs().filter(b=>b.ok).map(b=>b.id);save()")
        def snap(name, js, wait=1200):
            pg.evaluate(js); pg.wait_for_timeout(wait); raw[name] = pg.screenshot()
        snap('accueil', "ui.detail=[];renderDetail();ui.tab='seance';renderMain();document.querySelector('#main').scrollTop=0")
        snap('seance', "startFrom(S.routines[0],'r1');const E=S.active.exercises[0];E.sets[0].a='87,5';E.sets[0].b='8';E.sets[0].done=true;E.sets[1].a='87,5';E.sets[1].b='7';E.sets[1].done=true;ui.editorOpen=true;renderAll()", 1500)
        pg.evaluate("S.active=null;ui.editorOpen=false;renderAll()")
        snap('exercices', "ui.tab='exercices';ui.xMuscle='Pectoraux';renderMain()", 2500)
        snap('fiche', "ui.detail=[{kind:'ex',id:'tirage-archer-vers-le-haut'}];renderDetail()", 1800)
        snap('bilan', "ui.detail=[{kind:'month',id:mShift(mKey(Date.now()),-1)}];renderDetail()")
        snap('classement', """ui.detail=[];for(let i=0;i<3;i++){const w=clone(S.history[i]);w.id='x'+i;w.start=Date.now()-(i+1)*36e5;w.end=w.start+36e5;S.history.unshift(w)}const me=lbProfile();const mk=(n,s,v,st,t,bst)=>({p:{app:'carnet-fonte-profil',name:n,week:me.week,updated:Date.now(),w:{n:s,vol:v,kcal:0},m:{n:s*4,vol:v*4},streak:st,total:t,best:bst}});
          lbFriends={Kevin:mk('Kevin',4,14200,9,96,{'Développé couché':105,'Squat':140}),Sarah:mk('Sarah',3,9100,15,140,{'Squat':95}),Tom:mk('Tom',2,7400,3,41,{'Développé couché':90})};
          pushDetail({kind:'lb'})""")
        b.close()
    return raw

CAP = [('accueil', 'Ton programme, prêt en 4 questions', 'Planning de la semaine, récupération musculaire, séance du jour'),
       ('seance', 'La bonne charge à chaque série', 'Records, minuteur de repos et progression automatique'),
       ('exercices', 'Plus de 1 400 exercices illustrés', 'Barre, haltères, machines, poids du corps, élastiques'),
       ('fiche', 'Chaque mouvement expliqué', 'Étapes en français, conseils et vidéos de démonstration'),
       ('bilan', 'Ta progression, mois après mois', 'Volume, records, muscles travaillés et calories'),
       ('classement', 'Défie tes potes', 'Classement de la semaine, régularité et force')]
if LANG == 'en':
    CAP = [('accueil', 'Your program, ready in 4 questions', 'Weekly schedule, muscle recovery, today\'s workout'),
           ('seance', 'The right weight on every set', 'Records, rest timer and automatic progression'),
           ('exercices', 'Over 1,400 illustrated exercises', 'Barbell, dumbbells, machines, bodyweight, bands'),
           ('fiche', 'Every movement explained', 'Step-by-step instructions, tips and demo videos'),
           ('bilan', 'Your progress, month after month', 'Volume, records, muscles worked and calories'),
           ('classement', 'Challenge your friends', 'Weekly leaderboard, consistency and strength')]
TAGLINE = ('The <b>free</b> workout log,<br>no ads, no subscription.' if LANG == 'en' else 'Le carnet de muscu <b>gratuit</b>,<br>sans pub et sans abonnement.')
LOGO = (ROOT / 'media' / 'logo.svg').read_text()
FONT = '<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Figtree:wght@500;600&display=swap" rel="stylesheet">'

def compose(raw):
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        for i, (k, t, sub) in enumerate(CAP, 1):
            img = base64.b64encode(raw[k]).decode()
            pg.set_content(f"""<html><head>{FONT}<style>body{{margin:0;width:1080px;height:1920px;overflow:hidden;background:radial-gradient(120% 70% at 50% 0%,#2a2f37 0%,#0E1012 60%);font-family:Figtree,sans-serif;color:#ECEEF0}}
            .cap{{padding:120px 80px 0;text-align:center}}h1{{font:800 92px/1.02 'Barlow Condensed',sans-serif;text-transform:uppercase;margin:0;letter-spacing:.01em}}p{{font-size:38px;color:#A9B1BA;margin:26px 0 0}}
            .ph{{position:absolute;left:50%;top:560px;transform:translateX(-50%);width:690px;height:1494px;border-radius:72px;background:#000;padding:18px;box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 3px #3a4048}}
            .ph img{{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:56px;display:block}}.bar{{position:absolute;left:80px;right:80px;top:80px;height:8px;display:flex;gap:10px}}.bar i{{flex:1;border-radius:4px}}</style></head>
            <body><div class="bar"><i style="background:#EE4B3F"></i><i style="background:#6A97F2"></i><i style="background:#E5AE22"></i><i style="background:#55C985"></i></div>
            <div class="cap"><h1>{t}</h1><p>{sub}</p></div><div class="ph"><img src="data:image/png;base64,{img}"></div></body></html>""")
            pg.wait_for_timeout(700); pg.screenshot(path=str(OUT / f'capture-{i}-{k}.png'))
        pg.set_viewport_size({'width': 1024, 'height': 500})
        pg.set_content(f"""<html><head>{FONT}<style>body{{margin:0;width:1024px;height:500px;overflow:hidden;background:radial-gradient(90% 120% at 25% 50%,#2a2f37 0%,#0E1012 70%);color:#ECEEF0;font-family:Figtree,sans-serif;display:flex;align-items:center;gap:30px;padding:0 70px;box-sizing:border-box}}
        svg{{width:330px;height:330px;flex:none}}h1{{font:800 96px/0.95 'Barlow Condensed',sans-serif;text-transform:uppercase;margin:0}}p{{font-size:30px;color:#A9B1BA;margin:18px 0 0;line-height:1.3}}b{{color:#EE4B3F}}</style></head>
        <body>{LOGO}<div><h1>Carnet<br>de fonte</h1><p>{TAGLINE}</p></div></body></html>""")
        pg.wait_for_timeout(700); pg.screenshot(path=str(OUT / 'image-presentation-1024x500.png'))
        b.close()

try:
    compose(shots())
finally:
    SRV.terminate()
print('Visuels générés dans', OUT)
