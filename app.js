import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, increment, serverTimestamp, getDoc, limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjiNy8apBFdLQOAiG1nCtv94DfaRwZEuM",
  authDomain: "apkverse-bjyjs.firebaseapp.com",
  projectId: "apkverse-bjyjs",
  messagingSenderId: "433058399647",
  appId: "1:433058399647:web:80aae884dbbd0aff94e9aa",
  measurementId: "G-6HXXD1W0KN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let isEditMode = false;
let currentEditId = null;

// INIT
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginScreen')) {
        initAdmin();
    } else {
        initAds();
        if(document.getElementById('heroSlider')) initSlider();
        if(document.getElementById('appGrid')) loadApps();
        if(document.getElementById('detailsContainer')) {
            const id = new URLSearchParams(window.location.search).get('id');
            if(id) loadAppDetails(id);
        }
    }
});

// ==========================================
// 🛠️ ADMIN LOGIC (LOGIN FIXED)
// ==========================================
export function initAdmin() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            loadAdminList();
            loadSlideList();
        } else {
            document.getElementById('loginScreen').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');
        }
    });

    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value)
                .catch(err => alert("Login Failed: " + err.message));
        });
    }

    if(document.getElementById('uploadForm')) document.getElementById('uploadForm').addEventListener('submit', handleFormSubmit);
    if(document.getElementById('sliderForm')) document.getElementById('sliderForm').addEventListener('submit', handleSlideSubmit);
}

// APP ADMIN
async function loadAdminList() {
    const list = document.getElementById('adminAppList'); if(!list) return;
    list.innerHTML = 'Loading...';
    try {
        const s = await getDocs(query(collection(db, "apps"), orderBy("uploadedAt", "desc")));
        list.innerHTML = '';
        s.forEach(d => {
            const a = d.data();
            list.innerHTML += `<li class="p-3 flex justify-between items-center hover:bg-gray-50"><div class="flex items-center gap-3"><img src="${a.iconUrl}" class="w-8 h-8 rounded"><div><div class="font-bold text-sm">${a.name}</div><div class="text-xs text-gray-500">${a.packageName}</div></div></div><div class="flex gap-2"><button onclick="editApp('${d.id}')" class="text-blue-600 text-xs font-bold">Edit</button><button onclick="deleteApp('${d.id}')" class="text-red-600 text-xs font-bold">Del</button></div></li>`;
        });
    } catch(e) { list.innerHTML = 'Error loading apps.'; }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('uploadingScreen').classList.remove('hidden');
    const fd = (id) => document.getElementById(id) ? document.getElementById(id).value : '';
    const fc = (id) => document.getElementById(id) ? document.getElementById(id).checked : false;

    const appData = {
        name: fd('appName'), packageName: fd('packageName'), developer: fd('developer'), category: fd('category'), size: fd('size'), version: fd('version'), apkUrl: fd('apkUrl'), iconUrl: fd('iconUrl'), screenshots: fd('screenshots'), description: fd('description'),
        techData: { verCode: fd('t_verCode'), minSdk: fd('t_minSdk'), targetSdk: fd('t_targetSdk'), abi: fd('t_abi'), sha1: fd('t_sha1'), sha256: fd('t_sha256'), v1: fc('t_v1'), v2: fc('t_v2'), v3: fc('t_v3') },
        updatedAt: serverTimestamp()
    };

    try {
        if(isEditMode) await updateDoc(doc(db, "apps", currentEditId), appData); else { appData.downloads=0; await addDoc(collection(db, "apps"), appData); }
        document.getElementById('uploadingScreen').classList.add('hidden'); loadAdminList(); resetForm();
    } catch(e) { alert(e.message); document.getElementById('uploadingScreen').classList.add('hidden'); }
}

window.editApp = async (id) => {
    const d = await getDoc(doc(db, "apps", id));
    if(d.exists()) {
        const data = d.data(); const t = data.techData || {};
        isEditMode = true; currentEditId = id;
        const setVal = (i,v) => document.getElementById(i).value = v || '';
        setVal('appName', data.name); setVal('packageName', data.packageName); setVal('developer', data.developer); setVal('category', data.category); setVal('size', data.size); setVal('version', data.version); setVal('apkUrl', data.apkUrl); setVal('iconUrl', data.iconUrl); setVal('screenshots', data.screenshots); setVal('description', data.description);
        setVal('t_verCode', t.verCode); setVal('t_minSdk', t.minSdk); setVal('t_targetSdk', t.targetSdk); setVal('t_abi', t.abi); setVal('t_sha1', t.sha1); setVal('t_sha256', t.sha256);
        document.getElementById('t_v1').checked = t.v1; document.getElementById('t_v2').checked = t.v2; document.getElementById('t_v3').checked = t.v3;
        document.getElementById('uploadBtn').innerText = "Update App"; window.scrollTo({top:0, behavior:'smooth'});
    }
};
window.deleteApp = async (id) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); } };
window.resetForm = () => { document.getElementById('uploadForm').reset(); isEditMode=false; document.getElementById('uploadBtn').innerText="Save Application"; };
window.logout = () => signOut(auth);

// SLIDER ADMIN
async function handleSlideSubmit(e) {
    e.preventDefault();
    try { await addDoc(collection(db, "slides"), { img: document.getElementById('slideImg').value, link: document.getElementById('slideLink').value, uploadedAt: serverTimestamp() }); document.getElementById('sliderForm').reset(); loadSlideList(); } catch(e){ alert(e.message); }
}
async function loadSlideList() {
    const list = document.getElementById('sliderList'); if(!list) return;
    const s = await getDocs(query(collection(db, "slides"), orderBy("uploadedAt", "desc")));
    list.innerHTML = '';
    s.forEach(d => list.innerHTML += `<li class="flex justify-between p-2 bg-white rounded border"><img src="${d.data().img}" class="w-12 h-8 rounded"><button onclick="deleteSlide('${d.id}')" class="text-red-500 text-xs">Del</button></li>`);
}
window.deleteSlide = async (id) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "slides", id)); loadSlideList(); } };

// ==========================================
// 📱 USER LOGIC (SLIDER + ADS + APPS)
// ==========================================
export async function initSlider() {
    const track = document.getElementById('heroSlider');
    const dots = document.getElementById('sliderDots');
    if (!track) return;
    try {
        const s = await getDocs(query(collection(db, "slides"), orderBy("uploadedAt", "desc")));
        let data = []; s.forEach(d=>data.push(d.data()));
        if(data.length===0) data.push({img:'https://via.placeholder.com/800x400', link:'#'});
        
        track.innerHTML = ''; dots.innerHTML = '';
        data.forEach((slide, i) => {
            track.innerHTML += `<div class="slide" onclick="if('${slide.link}') location.href='${slide.link}'" style="min-width:100%"><img src="${slide.img}" class="w-full h-full object-cover"></div>`;
            dots.innerHTML += `<div class="w-2 h-2 rounded-full bg-white/50 transition ${i===0?'w-4 bg-white':''}"></div>`;
        });

        let idx = 0;
        setInterval(() => {
            idx = (idx + 1) % data.length;
            track.style.transform = `translateX(-${idx * 100}%)`;
            Array.from(dots.children).forEach((d, i) => d.className = `w-2 h-2 rounded-full bg-white/50 transition ${i===idx?'w-4 bg-white':''}`);
        }, 4000);
    } catch(e){}
}

function initAds() {
    setTimeout(() => {
        if(document.getElementById('flowAd')) return;
        const div = document.createElement('div');
        div.id = 'flowAd';
        div.className = "fixed bottom-0 left-0 w-full bg-white shadow-xl z-50 p-3 transform translate-y-full transition-transform duration-500";
        div.innerHTML = `<div class="max-w-4xl mx-auto flex justify-between items-center"><div class="flex items-center gap-3"><img src="https://ui-avatars.com/api/?name=VPN" class="w-10 h-10 rounded-lg"><div class="text-sm font-bold">Secure VPN<p class="text-xs font-normal text-gray-500">Fast & Secure</p></div></div><div class="flex gap-2"><button class="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Install</button><button id="closeAd" class="text-gray-400 text-xl"><i class="ph-bold ph-x-circle"></i></button></div></div>`;
        document.body.appendChild(div);
        setTimeout(() => div.classList.remove('translate-y-full'), 1000);
        document.getElementById('closeAd').onclick = () => { div.classList.add('translate-y-full'); setTimeout(() => { div.remove(); initAds(); }, 30000); };
    }, 5000);
}

export async function loadApps(cat='All', search='') {
    const grid = document.getElementById('appGrid');
    if(!grid) return;
    grid.innerHTML = '';
    const snap = await getDocs(query(collection(db, "apps"), orderBy("uploadedAt", "desc")));
    snap.forEach(doc => {
        const d = doc.data();
        if((cat==='All'||d.category===cat) && (search===''||d.name.toLowerCase().includes(search.toLowerCase()))) {
            grid.innerHTML += `<div onclick="window.location.href='app-details.html?id=${doc.id}'" class="group bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition text-center relative"><img src="${d.iconUrl}" class="w-14 h-14 rounded-xl mx-auto mb-2 shadow-sm"><h3 class="font-bold text-gray-800 text-xs line-clamp-2 h-8 group-hover:text-green-600 transition">${d.name}</h3><div class="text-[9px] text-gray-500 mt-1">${d.size}</div><button class="mt-2 w-full bg-green-600 text-white text-[10px] font-bold py-1.5 rounded-lg group-hover:bg-green-700">Download</button></div>`;
        }
    });
}

export async function loadAppDetails(id) {
    const c = document.getElementById('detailsContainer'); if(!c) return;
    try {
        const d = await getDoc(doc(db, "apps", id));
        if(d.exists()) {
            const a = d.data(); const tech = a.techData || {};
            const shots = a.screenshots ? `<div class="flex gap-2 overflow-x-auto pb-4 snap-x">${a.screenshots.split(',').map(u=>`<img src="${u}" class="h-48 rounded border snap-center">`).join('')}</div>` : '';
            c.innerHTML = `<div class="flex gap-4 mb-6"><img src="${a.iconUrl}" class="w-20 h-20 rounded-2xl shadow-lg border"><div><h1 class="text-2xl font-bold">${a.name}</h1><p class="text-xs text-green-600 font-bold">${a.developer}</p><p class="text-xs text-gray-400">${a.packageName}</p></div></div><a href="${a.apkUrl}" class="block w-full bg-green-600 text-white text-center font-bold py-3 rounded-xl shadow-lg mb-6 hover:bg-green-700">Download APK</a>${shots}<div class="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 leading-relaxed mb-6">${a.description||'No desc'}</div><div class="bg-white border rounded-xl overflow-hidden"><div class="bg-gray-50 px-5 py-3 border-b"><h3 class="font-bold text-xs">Technical</h3></div><div class="p-5 grid grid-cols-2 gap-4 text-xs"><div class="font-bold text-gray-600">Ver: <span class="text-gray-800">${tech.verCode||'-'}</span></div><div class="font-bold text-gray-600">SDK: <span class="text-gray-800">${tech.minSdk||'-'}</span></div></div></div>`;
            const q = query(collection(db, "apps"), limit(6));
            const s = await getDocs(q);
            document.getElementById('recommendedGrid').innerHTML = '';
            s.forEach(d => { if(d.id!==id) document.getElementById('recommendedGrid').innerHTML += `<div onclick="window.location.href='app-details.html?id=${d.id}'" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"><img src="${d.data().iconUrl}" class="w-10 h-10 rounded-lg"><div class="flex-1"><h4 class="font-bold text-xs truncate">${d.data().name}</h4><div class="text-[10px] text-gray-500">${d.data().size}</div></div></div>`; });
        }
    } catch(e) {}
}
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });