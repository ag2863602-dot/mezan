/* firebase-init.js — نسخة كلاسيكية: ممنوع كتابة import أو export في الملف ده */
window.ADMIN_EMAIL = "ag2863602@gmail.com"; // ← حط جيميل الأدمن الحقيقي هنا
window.MZ_ERROR = null;
window.MZ_AUTH  = null;
window.MZ_DB    = null;
(function(){
  var firebaseConfig = {
    apiKey: "AIzaSyCXyv41U1NqzANncr4O4pU2quVIB_J5YcA",
    authDomain: "mezan-984c6.firebaseapp.com",
    projectId: "mezan-984c6",
    storageBucket: "mezan-984c6.firebasestorage.app",
    messagingSenderId: "851299861366",
    appId: "1:851299861366:web:a574afce5ba5be92ccb057"
  };
  try{
    if (typeof firebase === 'undefined') { window.MZ_ERROR = 'NET'; return; }
    if (firebaseConfig.apiKey.indexOf('حط_') !== -1 || firebaseConfig.apiKey.indexOf('الصق') !== -1) { window.MZ_ERROR = 'CONFIG'; return; }
    firebase.initializeApp(firebaseConfig);
    window.MZ_AUTH = firebase.auth();
    window.MZ_DB   = firebase.firestore();
  }catch(e){ window.MZ_ERROR = e.message || 'FIREBASE'; }
})();
/* ===== ربط الحساب بجهاز واحد ===== */
window.MZ_DEVICE = (function(){
  var d = localStorage.getItem('mz_device');
  if(!d){ d = 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('mz_device', d); }
  return d;
})();
window.mzCheckDevice = function(user, cb){
  if(!window.MZ_DB) return cb('ok');
  var ref = MZ_DB.collection('users').doc(user.uid);
  ref.get().then(function(snap){
    var data = snap.exists ? snap.data() : {};
    if(!data.deviceId){
      return ref.set({deviceId: window.MZ_DEVICE, deviceSetAt: Date.now()}, {merge:true}).then(function(){ cb('ok'); });
    }
    if(data.deviceId === window.MZ_DEVICE) return cb('ok');
    cb('blocked');
  }).catch(function(){ cb('ok'); });
};
/* ===== مزامنة المحتوى بين الأدمن والزوار ===== */
window.mzPublish=function(){
  if(!window.MZ_DB)return;
  function get(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
  MZ_DB.collection('data').doc('content').set({
    courses:get('meezan_courses_v2'),bundles:get('meezan_bundles_v1'),jobs:get('meezan_jobs_v1'),
    teachers:get('meezan_teachers_v1'),social:get('meezan_social_v1'),updatedAt:Date.now()
  },{merge:true}).catch(function(){});
};
window.mzPublishSoon=function(){clearTimeout(window._mzPubT);window._mzPubT=setTimeout(function(){if(window.mzPublish)window.mzPublish();},800);};
window.mzSync=function(cb){
  if(!window.MZ_DB){cb(false);return;}
  MZ_DB.collection('data').doc('content').get().then(function(s){
    if(!s.exists){cb(false);return;}
    var d=s.data(),changed=false;
    function put(k,v){
      if(!v)return;
      try{
        var nxt=JSON.stringify(v);
        if(nxt.length>3000000)return;
        if(localStorage.getItem(k)!==nxt){localStorage.setItem(k,nxt);changed=true;}
      }catch(e){}
    }
    put('meezan_courses_v2',d.courses);put('meezan_bundles_v1',d.bundles);put('meezan_jobs_v1',d.jobs);
    put('meezan_teachers_v1',d.teachers);put('meezan_social_v1',d.social);
    cb(changed);
  }).catch(function(){cb(false);});
};