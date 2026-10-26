#!/usr/bin/env python3
"""Tests automatiques de Carnet de fonte.

Lancement : python3 tests/run_tests.py   (il faut : pip install playwright && python -m playwright install chromium)
Ils tournent aussi tout seuls sur GitHub à chaque modification (.github/workflows/tests.yml).
Le site est servi en local ; Google/Firebase est simulé (aucun appel réseau réel)."""
import json, os, socket, subprocess, sys, time, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
FAILS, ERRS = [], []

def check(label, ok, extra=''):
    print(('  ok   ' if ok else '  ÉCHEC ') + label + (f'  ({extra})' if extra and not ok else ''))
    if not ok: FAILS.append(label)

def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p

PORT = free_port(); URL = f'http://127.0.0.1:{PORT}/'
SRV = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '-b', '127.0.0.1', '-d', str(ROOT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.0)

# ---------- Firebase simulé ----------
MOCK = {
 'app': "export function initializeApp(c){return{c}}",
 'auth': """const st=window.__fbAuth||(window.__fbAuth={user:JSON.parse(localStorage.getItem('mock-user')||'null'),cbs:[]});
export function getAuth(){return st}
export function onAuthStateChanged(a,cb){st.cbs.push(cb);setTimeout(()=>cb(st.user),5);return()=>{}}
export class GoogleAuthProvider{setCustomParameters(){}static credential(){return{}}}
export async function signInWithPopup(){const u={uid:'TESTUSER0000000000000000001',email:'test@example.com',displayName:'Testeur'};st.user=u;localStorage.setItem('mock-user',JSON.stringify(u));st.cbs.forEach(c=>c(u));return{user:u}}
export async function signInWithRedirect(){} export async function getRedirectResult(){return null} export async function signInWithCredential(){}
export async function deleteUser(u){window.__deleted=u.uid;st.user=null} export async function reauthenticateWithPopup(){} export async function reauthenticateWithCredential(){}
export async function signOut(){st.user=null;localStorage.removeItem('mock-user');st.cbs.forEach(c=>c(null))}""",
 'firestore': """const key=p=>p.join('/');const db=()=>JSON.parse(localStorage.getItem('mock-db')||'{}');const put=d=>localStorage.setItem('mock-db',JSON.stringify(d));
export function getFirestore(){return{}} export function doc(D,...p){return{p}} export function collection(D,...p){return{p}}
export async function getDoc(r){const d=db()[key(r.p)];return{exists:()=>d!==undefined,data:()=>d}}
export async function getDocs(c){const pre=key(c.p)+'/';const d=db();const docs=Object.keys(d).filter(k=>k.startsWith(pre)&&!k.slice(pre.length).includes('/')).map(k=>({id:k.slice(pre.length),data:()=>d[k]}));return{docs}}
export async function setDoc(r,v){const d=db();d[key(r.p)]=JSON.parse(JSON.stringify(v));put(d)}
export async function deleteDoc(r){const d=db();delete d[key(r.p)];put(d)}
export function writeBatch(){const ops=[];return{set:(r,v)=>ops.push(['s',r,v]),delete:r=>ops.push(['d',r]),commit:async()=>{const d=db();for(const[o,r,v]of ops){if(o==='s')d[key(r.p)]=JSON.parse(JSON.stringify(v));else delete d[key(r.p)]}put(d)}}}"""}

def fulfill(body):
    def h(route, request=None):
        route.fulfill(body=body, content_type='text/javascript', headers={'Access-Control-Allow-Origin': '*'})
    return h

NOW = int(time.time() * 1000); D = 864e5
def W(i, days, exs, h=1.0):
    st = int(NOW - days * D); return {"id": f"w{i}", "name": f"Séance {i}", "start": st, "end": int(st + h * 36e5), "exercises": exs, "prs": []}
S_ = lambda id, a, b, n=3, rir=None: {"exId": id, "sets": [dict({"t": "n", "a": a, "b": b, "done": True}, **({"rir": rir} if rir is not None else {}))] * n}
OLD_SAVE = {"v": 1, "settings": {"theme": "dark", "rest": 120, "onboarded": 1, "lastReport": "2099-01", "repLo": 8, "repHi": 12, "suggest": True},
  "custom": [{"id": "perso1", "name": "Mon exo perso", "muscle": "Dos", "equip": "Machine", "type": "w"}],
  "routines": [{"id": "r1", "name": "Push", "exercises": [{"exId": "developpe-couche-barre", "rest": 120, "sets": [{"t": "n", "a": "", "b": "8"}]}, {"exId": "pompe", "rest": 60, "sets": [{"t": "n", "a": "", "b": "15"}]}]}],
  "history": [W(1, 2, [S_("developpe-couche-barre", 80, 12), S_("pompe", 0, 15), S_("perso1", 40, 10)]), W(2, 5, [S_("squat-barre-haute", 100, 5, rir=0)]), W(3, 9, [S_("developpe-couche-barre", 77.5, 10)])],
  "active": None, "body": [{"id": "b1", "t": NOW, "kg": 80}], "goals": {"pompe": 30}, "measures": [], "fav": ["squat-barre-haute"]}

with sync_playwright() as p:
    b = p.chromium.launch()
    def page(seed=None, w=390, mock=True):
        ctx = b.new_context(viewport={'width': w, 'height': 844}, service_workers='block')
        if seed is not None:
            ctx.add_init_script("if(!sessionStorage.getItem('seeded')){localStorage.setItem('carnet-fonte-v1',%s);sessionStorage.setItem('seeded','1')}" % json.dumps(json.dumps(seed)))
        if mock:
            for n, body in MOCK.items():
                ctx.route(f'https://www.gstatic.com/firebasejs/**/firebase-{n}.js', fulfill(body))
        pg = ctx.new_page(); pg.on('pageerror', lambda e: ERRS.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(1200); return pg

    print('Chargement et données')
    pg = page(OLD_SAVE)
    check('version affichée', pg.evaluate("APP_VERSION") >= '3.0')
    pg.evaluate("closeDlg();save()"); new = json.loads(pg.evaluate("localStorage.getItem('carnet-fonte-v1')"))
    check('historique conservé (séries identiques)', [[s for s in e['sets']] for w in new['history'] for e in w['exercises']] == [[s for s in e['sets']] for w in OLD_SAVE['history'] for e in w['exercises']])
    check('ancien identifiant redirigé (historique, routine, objectif)', new['history'][0]['exercises'][1]['exId'] == 'pompes' and new['routines'][0]['exercises'][1]['exId'] == 'pompes' and new['goals'].get('pompes') == 30)
    check('aucun « Exercice supprimé »', 'Exercice supprimé' not in pg.evaluate("S.history.flatMap(w=>w.exercises.map(e=>ex(e.exId).name))"))
    check('exercice perso et favoris conservés', new['custom'] == OLD_SAVE['custom'] and new['fav'] == OLD_SAVE['fav'])
    check('identifiants d\'exercices uniques', pg.evaluate("BUILTIN.length===new Set(BUILTIN.map(e=>e.id)).size"))
    n_vis = pg.evaluate("filterEx('','Tous','').length"); n_novis = pg.evaluate("filterEx('','Tous','').filter(e=>{const i=INFO[e.id]||{};return!i.img&&!i.rp}).length")
    check(f'annuaire : {n_vis} exercices affichés, presque tous illustrés', n_vis > 900 and n_novis < 40, f'{n_novis} sans visuel')
    urls = pg.evaluate("mediaUrls()"); from urllib.parse import unquote
    missing = [u for u in urls if not (ROOT / unquote(u)).exists()]
    check(f'les {len(urls)} images référencées existent', not missing, str(missing[:5]))
    check('aucun média tiers interdit', not (ROOT / 'media' / 'edb').exists())

    print('Progression')
    g = pg.evaluate("suggestFor({exId:'developpe-couche-barre',sets:[{t:'n'}]},0)")
    check('12 reps au couché → charge augmentée', g and g['a'] == 82.5 and g['b'] == 8, str(g))
    g = pg.evaluate("suggestFor({exId:'squat-barre-haute',sets:[{t:'n'}]},0)")
    check('échec (RIR 0) sous la fourchette → charge baissée', g and g.get('down') and g['a'] == 97.5, str(g))
    pg.evaluate("S.settings.deloadUntil=Date.now()+864e5")
    g = pg.evaluate("suggestFor({exId:'developpe-couche-barre',sets:[{t:'n'}]},0)")
    check('semaine de décharge → environ −15 %', g and g.get('dl') and 67 <= g['a'] <= 70, str(g))
    pg.evaluate("S.settings.deloadUntil=0")

    print('Générateur, partage, sauvegardes')
    gw = pg.evaluate("genWorkout({dur:45,zone:'haut',eq:['Haltères','Poids du corps']})")
    eqs = pg.evaluate("g=>[...new Set(g.exercises.map(e=>ex(e.exId).equip))]", gw)
    check('générateur : bon nombre d\'exercices et matériel respecté', len(gw['exercises']) == 5 and set(eqs) <= {'Haltères', 'Poids du corps'}, str(eqs))
    code = pg.evaluate("routineCode(S.routines[0])")
    pg.evaluate("c=>importRoutineData(parseRoutineCode(c))", code)
    check('partage de routine : import d\'un code', pg.evaluate("S.routines.length") == 2)
    pg.evaluate("bkSave()"); pg.wait_for_timeout(300)
    snaps = pg.evaluate("bkAll().then(L=>L.map(x=>x.k))")
    check('copie datée enregistrée sur le téléphone', len(snaps) >= 1, str(snaps))
    pg.evaluate("S.history=[];save()"); pg.evaluate("k=>bkRestore('l',k)", snaps[0]); pg.wait_for_timeout(500)
    check('restauration d\'une copie datée', pg.evaluate("S.history.length") == 3)

    print('Compte Google (simulé)')
    pg.evaluate("ui.tab='reglages';renderMain()"); pg.click('[data-act="fb-login"]'); pg.wait_for_timeout(1500); pg.evaluate("closeDlg()")
    db = json.loads(pg.evaluate("localStorage.getItem('mock-db')") or '{}')
    check('connexion et sauvegarde en ligne', pg.evaluate("fbOn()") and any(k.startswith('users/TESTUSER') for k in db))
    pg.evaluate("fbBackupDaily()"); pg.wait_for_timeout(600)
    db = json.loads(pg.evaluate("localStorage.getItem('mock-db')"))
    check('copie datée en ligne', any('/days/' in k for k in db))
    pg.evaluate("fbDeleteAccount()"); pg.wait_for_timeout(1000)
    db = json.loads(pg.evaluate("localStorage.getItem('mock-db')") or '{}')
    check('suppression du compte : plus rien en ligne', not any('TESTUSER' in k for k in db) and pg.evaluate("S.history.length") == 3, str(list(db)[:4]))

    print('Premier lancement et affichage')
    for w in (320, 390):
        pn = page(None, w)
        check(f'questionnaire d\'accueil affiché ({w}px)', pn.evaluate("ui.detail.some(d=>d.kind==='onb')"))
        pn.click('[data-act="onb-next"]')
        for v in ('muscle', 'deb', 'maison'): pn.click(f'[data-act$=":{v}"]')
        pn.click('[data-act="onb-pick:days:3"]'); pn.click('[data-act="onb-build"]'); pn.click('[data-act="onb-done"]'); pn.wait_for_timeout(300)
        check(f'programme créé ({w}px)', pn.evaluate("S.routines.length===3&&Object.keys(S.plan).length===3"))
        for tab in ('seance', 'historique', 'exercices', 'reglages'):
            pn.evaluate(f"ui.tab='{tab}';renderMain()"); pn.wait_for_timeout(150)
            over = pn.evaluate("(()=>{const W=document.documentElement.clientWidth;const clip=e=>{for(let a=e.parentElement;a&&a.id!=='main';a=a.parentElement){const o=getComputedStyle(a).overflowX;if(o!=='visible')return true}return false};return[...document.querySelectorAll('#main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>W+1&&!clip(e)}).length})()")
            check(f'onglet {tab} sans débordement à {w}px', over == 0, f'{over} élément(s)')
    b.close()

SRV.terminate()
check('aucune erreur JavaScript', not ERRS, ' | '.join(ERRS[:3]))
print(f"\n{'TOUT EST BON' if not FAILS else str(len(FAILS)) + ' ÉCHEC(S)'}")
sys.exit(1 if FAILS else 0)
