// Copie l'appli web (dossier parent) dans www/ pour Capacitor
const fs=require('fs'),path=require('path');
const src=path.join(__dirname,'..'),dst=path.join(__dirname,'www');
fs.rmSync(dst,{recursive:true,force:true});fs.mkdirSync(dst,{recursive:true});
for(const f of ['index.html','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png'])fs.copyFileSync(path.join(src,f),path.join(dst,f));
fs.cpSync(path.join(src,'media'),path.join(dst,'media'),{recursive:true});
for(const d of ['lib','css','js'])fs.cpSync(path.join(src,d),path.join(dst,d),{recursive:true});
console.log('www/ prêt');
