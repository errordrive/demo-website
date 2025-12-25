import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, increment, serverTimestamp, getDoc, limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// CONFIGURATION
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
    // Admin Check
    if (document.getElementById('loginScreen')) {
        initAdmin();
    } else {
        // User Side
        initAds();
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
    // Auth State Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            loadAdminList();
        } else {
            document.getElementById('loginScreen').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');
        }
    });

    // Login Event
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            signInWithEmailAndPassword(auth, email, password)
                .then(() => console.log("Login Success"))
                .catch((error) => alert("Login Failed: " + error.message));
        });
    }

    // Upload Event
    const uploadForm = document.getElementById('uploadForm');
    if(uploadForm) uploadForm.addEventListener('submit', handleFormSubmit);
}

// App List
async function loadAdminList() {
    const list = document.getElementById('adminAppList');
    if(!list) return;
    list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm">Loading apps...</li>';
    try {
        const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
        const snap = await getDocs(q);
        list.innerHTML = '';
        if(snap.empty) { list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm">No apps found.</li>'; return; }
        
        snap.forEach(doc => {
            const a = doc.data();
            list.innerHTML += `
                <li class="p-3 bg-white flex justify-between items-center border-b hover:bg-gray-50">
                    <div class="flex items-center gap-3">
                        <img src="${a.iconUrl}" class="w-10 h-10 rounded bg-gray-100 object-cover">
                        <div>
                            <div class="font-bold text-sm text-gray-800">${a.name}</div>
                            <div class="text-[10px] text-gray-500">${a.packageName}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editApp('${doc.id}')" class="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold">Edit</button>
                        <button onclick="deleteApp('${doc.id}')" class="px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">Del</button>
                    </div>
                </li>`;
        });
    } catch(e) { list.innerHTML = `<li class="p-4 text-center text-red-500 text-xs">Error: ${e.message}</li>`; }
}

// Save/Update
async function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('uploadingScreen').classList.remove('hidden');
    
    const fd = (id) => document.getElementById(id) ? document.getElementById(id).value : '';
    const fc = (id) => document.getElementById(id) ? document.getElementById(id).checked : false;

    const appData = {
        name: fd('appName'), packageName: fd('packageName'), developer: fd('developer'),
        category: fd('category'), size: fd('size'), version: fd('version'),
        apkUrl: fd('apkUrl'), iconUrl: fd('iconUrl'), screenshots: fd('screenshots'),
        description: fd('description'), 
        techData: { 
            verCode: fd('t_verCode'), minSdk: fd('t_minSdk'), targetSdk: fd('t_targetSdk'),
            sha1: fd('t_sha1'), sha256: fd('t_sha256'), v1: fc('t_v1'), v2: fc('t_v2')
        },
        updatedAt: serverTimestamp()
    };

    try {
        if (isEditMode && currentEditId) { await updateDoc(doc(db, "apps", currentEditId), appData); }
        else { appData.downloads = 0; appData.uploadedAt = serverTimestamp(); await addDoc(collection(db, "apps"), appData); }
        
        document.getElementById('successScreen').classList.remove('hidden');
        document.getElementById('uploadingScreen').classList.add('hidden');
        loadAdminList();
    } catch(e) { 
        alert("Error: " + e.message); 
        document.getElementById('uploadingScreen').classList.add('hidden'); 
    }
}

// Global Helpers
window.editApp = async (id) => {
    const d = await getDoc(doc(db, "apps", id));
    if(d.exists()) {
        const data = d.data(); const t = data.techData || {};
        isEditMode = true; currentEditId = id;
        const setV = (i, v) => { if(document.getElementById(i)) document.getElementById(i).value = v || ''; };
        
        setV('appName', data.name); setV('packageName', data.packageName); setV('developer', data.developer);
        setV('category', data.category); setV('version', data.version); setV('size', data.size);
        setV('apkUrl', data.apkUrl); setV('iconUrl', data.iconUrl); setV('screenshots', data.screenshots);
        setV('description', data.description);
        setV('t_verCode', t.verCode); setV('t_minSdk', t.minSdk); setV('t_targetSdk', t.targetSdk);
        
        document.getElementById('uploadBtn').innerText = "Update App";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
window.deleteApp = async (id) => { if(confirm("Delete app?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); } };
window.closeSuccessScreen = () => { document.getElementById('successScreen').classList.add('hidden'); window.resetForm(); };
window.resetForm = () => { document.getElementById('uploadForm').reset(); isEditMode=false; document.getElementById('uploadBtn').innerText="Save App"; };
window.logout = () => signOut(auth);

// ==========================================
// 🚀 USER SIDE LOGIC
// ==========================================

function initAds() {
    setTimeout(() => {
        if(document.getElementById('flowAd')) return;
        const div = document.createElement('div');
        div.id = 'flowAd';
        div.className = "fixed bottom-0 left-0 w-full bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50 p-3 transform translate-y-full transition-transform duration-500";
        div.innerHTML = `<div class="max-w-4xl mx-auto flex justify-between items-center"><div class="flex items-center gap-3"><img src="https://ui-avatars.com/api/?name=VPN" class="w-10 h-10 rounded-lg"><div class="text-sm font-bold">Secure VPN<p class="text-xs font-normal text-gray-500">Fast & Secure</p></div></div><div class="flex gap-2"><button class="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Install</button><button id="closeAd" class="text-gray-400 text-xl"><i class="ph-bold ph-x-circle"></i></button></div></div>`;
        document.body.appendChild(div);
        setTimeout(() => div.classList.remove('translate-y-full'), 1000);
        document.getElementById('closeAd').onclick = () => {
            div.classList.add('translate-y-full');
            setTimeout(() => { div.remove(); initAds(); }, 30000);
        };
    }, 5000);
}

export async function loadApps(cat='All', search='') {
    const grid = document.getElementById('appGrid');
    if(!grid) return;
    grid.innerHTML = '';
    const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
    const snap = await getDocs(q);
    
    let hasRes = false;
    snap.forEach(doc => {
        const d = doc.data();
        if((cat==='All'||d.category===cat) && (search===''||d.name.toLowerCase().includes(search.toLowerCase()))) {
            hasRes = true;
            grid.innerHTML += `
                <div onclick="window.location.href='app-details.html?id=${doc.id}'" class="group bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition text-center relative overflow-hidden">
                    <div class="relative z-10 mb-2"><img src="${d.iconUrl}" onerror="this.src='https://ui-avatars.com/api/?name=${d.name}'" class="w-14 h-14 rounded-xl mx-auto shadow-sm"></div>
                    <h3 class="font-bold text-gray-800 text-xs line-clamp-2 h-8 group-hover:text-green-600 transition">${d.name}</h3>
                    <div class="text-[9px] text-gray-500 mt-1">${d.size}</div>
                    <button class="mt-2 w-full bg-green-600 text-white text-[10px] font-bold py-1.5 rounded-lg group-hover:bg-green-700">Download</button>
                </div>`;
        }
    });
    if(!hasRes) grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-10 text-sm">No apps found.</div>';
}

export async function loadAppDetails(id) {
    const c = document.getElementById('detailsContainer');
    if(!c) return;
    try {
        const d = await getDoc(doc(db, "apps", id));
        if(d.exists()) {
            const a = d.data();
            const tech = a.techData || {};
            const shots = a.screenshots ? `<div class="flex gap-2 overflow-x-auto pb-4 snap-x">${a.screenshots.split(',').map(u=>`<img src="${u}" class="h-48 rounded border snap-center">`).join('')}</div>` : '';
            c.innerHTML = `<div class="flex gap-4 mb-6"><img src="${a.iconUrl}" class="w-20 h-20 rounded-2xl shadow-lg border"><div><h1 class="text-2xl font-bold">${a.name}</h1><p class="text-xs text-green-600 font-bold">${a.developer}</p><p class="text-xs text-gray-400">${a.packageName}</p></div></div><a href="${a.apkUrl}" class="block w-full bg-green-600 text-white text-center font-bold py-3 rounded-xl shadow-lg mb-6">Download APK</a>${shots}<div class="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 leading-relaxed mb-6">${a.description || 'No description.'}</div><div class="bg-white border rounded-xl overflow-hidden"><div class="bg-gray-50 px-5 py-3 border-b"><h3 class="font-bold text-xs">Technical Specs</h3></div><div class="p-5 grid grid-cols-2 gap-4 text-xs"><div class="font-bold text-gray-600">Version Code: <span class="font-mono text-gray-800">${tech.verCode||'-'}</span></div><div class="font-bold text-gray-600">Min SDK: <span class="font-mono text-gray-800">${tech.minSdk||'-'}</span></div><div class="col-span-2 font-bold text-gray-600">SHA1: <span class="font-mono text-gray-800 break-all">${tech.sha1||'-'}</span></div></div></div>`;
            loadRecommendedApps(id);
        }
    } catch(e) {}
}

async function loadRecommendedApps(currentId) {
    const grid = document.getElementById('recommendedGrid');
    if(!grid) return;
    const q = query(collection(db, "apps"), limit(6));
    const s = await getDocs(q);
    grid.innerHTML = '';
    s.forEach(d => {
        if(d.id !== currentId) {
            const a = d.data();
            grid.innerHTML += `<div onclick="window.location.href='app-details.html?id=${d.id}'" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-100"><img src="${a.iconUrl}" class="w-10 h-10 rounded-lg"><div class="flex-1"><h4 class="font-bold text-xs truncate">${a.name}</h4><div class="text-[10px] text-gray-500">${a.size}</div></div></div>`;
        }
    });
}
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });