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
    n_vis = pg.evaluate("filterEx('','Tous','').length"); n_novis = pg.evaluate("filterEx('','Tous','').filter(e=>{const i=INFO[e.id]||{};return!i.img&&!i.rp&&!i.oe}).length")
    check(f'annuaire : {n_vis} exercices affichés, presque tous illustrés', n_vis > 1400 and n_novis < 40, f'{n_novis} sans visuel')
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

    st = pg.evaluate("t=>{const r=analyzeHevy(t);return{src:r.src,n:r.workouts.length,ex:r.workouts.map(w=>w.exercises.map(e=>e.exId+':'+e.sets.map(s=>s.t+s.a+'x'+s.b).join(','))),dur:r.workouts.map(w=>Math.round((w.end-w.start)/6e4)),cr:r.creates.map(c=>c.name)}}", (ROOT / 'tests' / 'strong-sample.csv').read_text())
    check('import Strong : séances, échauffement, durée, exercices reconnus', st['src'] == 'Strong' and st['n'] == 2 and sorted(st['dur']) == [52, 65] and any('developpe-couche-barre:w40x10,n80x8,n80x7' in x for w in st['ex'] for x in w) and st['cr'] == ['Machine Mystère Pro'], json.dumps(st, ensure_ascii=False)[:400])
    print('Compte Google (simulé)')
    pg.evaluate("ui.tab='reglages';renderMain()"); pg.wait_for_timeout(400); check('SDK Google préchargé dans Réglages (fenêtre ouverte au toucher)', pg.evaluate("!!FB"))
    pg.click('[data-act="fb-login"]'); pg.wait_for_timeout(1500); pg.evaluate("closeDlg()")
    p2 = page(OLD_SAVE); p2.evaluate("closeDlg();ui.tab='seance';renderMain()"); p2.evaluate("fbSignIn()"); p2.wait_for_timeout(600)
    check('SDK pas encore chargé → bouton « Continuer avec Google »', p2.evaluate("MODAL&&MODAL.title") == 'Connexion Google')
    p2.evaluate("MODAL.buttons[0].fn()"); p2.wait_for_timeout(800); check('connexion après « Continuer »', p2.evaluate("fbOn()"))
    db = json.loads(pg.evaluate("localStorage.getItem('mock-db')") or '{}')
    check('connexion et sauvegarde en ligne', pg.evaluate("fbOn()") and any(k.startswith('users/TESTUSER') for k in db))
    pg.evaluate("fbBackupDaily()"); pg.wait_for_timeout(600)
    db = json.loads(pg.evaluate("localStorage.getItem('mock-db')"))
    check('copie datée en ligne', any('/days/' in k for k in db))
    pg.evaluate("S.history=[];S.routines=[];save()"); pg.evaluate("fbPush()"); pg.wait_for_timeout(600)
    db = json.loads(pg.evaluate("localStorage.getItem('mock-db')"))
    check('téléphone vide : la sauvegarde Google n\'est pas écrasée', db['users/TESTUSER0000000000000000001']['sessions'] == 3 and pg.evaluate("MODAL&&MODAL.title") == 'Sauvegarde Google trouvée')
    pg.evaluate("MODAL.buttons[0].fn()"); pg.wait_for_timeout(800)
    check('récupération depuis le compte Google', pg.evaluate("S.history.length") == 3)
    pg.evaluate("closeDlg()")
    pg.evaluate("S.settings.lbFb=true;S.settings.lbName='Moi';S.friends=[];save()")
    pg.evaluate("lbAddFriend('POTEUSER00000000000000000001','Kevin')"); pg.wait_for_timeout(400)
    db = json.loads(pg.evaluate("localStorage.getItem('mock-db')"))
    check('classement : ajouter un pote le prévient', 'invites/POTEUSER00000000000000000001/from/TESTUSER0000000000000000001' in db)
    pg.evaluate("(()=>{const d=JSON.parse(localStorage.getItem('mock-db'));d['invites/TESTUSER0000000000000000001/from/SARAHUSER0000000000000000001']={name:'Sarah',t:1};localStorage.setItem('mock-db',JSON.stringify(d))})()")
    pg.evaluate("lbInbox()"); pg.wait_for_timeout(400)
    db = json.loads(pg.evaluate("localStorage.getItem('mock-db')"))
    check('classement : un pote qui t\'ajoute apparaît chez toi', pg.evaluate("S.friends.some(f=>f.id==='SARAHUSER0000000000000000001'&&f.name==='Sarah')") and not any(k.startswith('invites/TESTUSER') for k in db))
    pr = pg.evaluate("lbProfile()")
    check('classement : profil avec temps, séries et calories', all(k in pr['w'] and k in pr['m'] for k in ('n', 'vol', 'min', 'sets', 'kcal')))
    pg.evaluate("pushDetail({kind:'lb'})"); pg.click('[data-act="lb-sort:w:vol"]'); pg.wait_for_timeout(200)
    check('classement : filtre par critère', pg.evaluate("ui.lbSort.w") == 'vol' and pg.evaluate("document.querySelector('.lb-crit .chip.on').textContent") == 'Volume')
    pg.evaluate("ui.detail=[];renderDetail()")
    pg.evaluate("closeDlg()")
    pg.evaluate("fbDeleteAccount()"); pg.wait_for_timeout(1000)
    db = json.loads(pg.evaluate("localStorage.getItem('mock-db')") or '{}')
    check('suppression du compte : plus rien en ligne', not any('TESTUSER' in k for k in db) and pg.evaluate("S.history.length") == 3, str(list(db)[:4]))

    print('Appli Android (simulée)')
    NAT = '''window.__calls=[];const rec=n=>new Proxy({},{get:(t,k)=>k==='addListener'?((ev,cb)=>{(window.__l=window.__l||{})[n+'.'+ev]=cb;return Promise.resolve({remove(){}})}):(...a)=>{window.__calls.push([n+'.'+String(k),a[0]]);return Promise.resolve(k==='checkPermissions'?{display:'granted'}:k==='restGet'?{end:0,total:0}:k==='getLaunchUrl'?{}:{})}});
      window.Capacitor={isNativePlatform:()=>true,Plugins:{Fonte:rec('Fonte'),LocalNotifications:rec('LN'),InAppReview:rec('Review'),FirebaseCrashlytics:rec('Crash'),App:rec('App'),Filesystem:rec('FS'),Share:rec('Share')}};'''
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block')
    ctx.add_init_script(NAT)
    ctx.add_init_script("if(!sessionStorage.getItem('seeded')){localStorage.setItem('carnet-fonte-v1',%s);sessionStorage.setItem('seeded','1')}" % json.dumps(json.dumps(dict(OLD_SAVE, plan={'0': 'r1', '3': 'r1'}))))
    pa = ctx.new_page(); pa.on('pageerror', lambda e: ERRS.append(str(e))); pa.goto(URL); pa.wait_for_timeout(2500)
    calls = lambda: pa.evaluate("window.__calls.map(c=>c[0])")
    check('Android : widget mis à jour au démarrage', 'Fonte.widget' in calls())
    pa.evaluate("closeDlg();S.settings.remind={on:true,at:'07:30'};remindSync()"); pa.wait_for_timeout(300)
    sch = pa.evaluate("window.__calls.filter(c=>c[0]==='LN.schedule').pop()[1].notifications.map(n=>[n.schedule.on.weekday,n.schedule.on.hour,n.schedule.on.minute])")
    check('Android : rappels les jours du planning (lundi, jeudi à 7 h 30)', sorted(sch) == [[2, 7, 30], [5, 7, 30]], str(sch))
    pa.evaluate("startFrom(S.routines[0],'r1');startRest(90)"); pa.wait_for_timeout(200)
    st = pa.evaluate("window.__calls.filter(c=>c[0]==='Fonte.restStart').pop()")
    check('Android : minuteur de repos envoyé à l\'écran verrouillé', st and st[1]['total'] == 90 and 'Ensuite' in st[1]['body'], str(st))
    pa.evaluate("const e=S.active.rest.end;window.__l['Fonte.rest']({action:'plus',end:e+30000,total:120})")
    check('Android : bouton +30 s de la notification', pa.evaluate("S.active.rest.total") == 120)
    pa.evaluate("window.__l['Fonte.rest']({action:'skip'})")
    check('Android : bouton Passer de la notification', pa.evaluate("S.active.rest") is None)
    pa.evaluate("vib('pr')"); check('Android : vibreur natif', ['Fonte.haptic', {'type': 'pr'}] in pa.evaluate("window.__calls"))
    pa.evaluate("S.history=S.history.concat(S.history,S.history);S.settings.reviewAsked=0;finishWorkout&&0"); 
    pa.evaluate("MODAL=null;askReview()"); pa.wait_for_timeout(200)
    check('Android : demande d\'avis après 5 séances (une seule fois)', calls().count('Review.requestReview') == 1 and pa.evaluate("!!S.settings.reviewAsked"))
    pa.evaluate("askReview()"); pa.wait_for_timeout(100); check('Android : pas de deuxième demande d\'avis', calls().count('Review.requestReview') == 1)
    pa.evaluate("window.__l['App.appUrlOpen']({url:'carnetdefonte://ami/POTEUSER00000000000000000002.S2V2aW4'})"); pa.wait_for_timeout(200)
    check('Android : lien carnetdefonte:// ouvre l\'ajout de pote', pa.evaluate("MODAL&&MODAL.title") == 'Ajouter un pote')
    pa.evaluate("closeDlg();setTimeout(()=>{throw new Error('boum test')},0)"); pa.wait_for_timeout(300)
    check('Android : erreur JS envoyée à Crashlytics', any(c[0] == 'Crash.recordException' and 'boum' in c[1]['message'] for c in pa.evaluate("window.__calls")))
    ERRS[:] = [e for e in ERRS if 'boum test' not in e]
    ctx.close()

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
