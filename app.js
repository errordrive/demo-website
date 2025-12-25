import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, increment, serverTimestamp, getDoc, limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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

// ==========================================
// 🚀 INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginScreen')) {
        // ADMIN PANEL
        initAdmin();
    } else {
        // USER SITE
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
// 🛠️ ADMIN LOGIC (FULL FEATURES RESTORED)
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
                .catch(err => alert("Login Error: " + err.code));
        });
    }

    if(document.getElementById('uploadForm')) document.getElementById('uploadForm').addEventListener('submit', handleFormSubmit);
    if(document.getElementById('sliderForm')) document.getElementById('sliderForm').addEventListener('submit', handleSlideSubmit);
}

// 1. APP MANAGEMENT
async function loadAdminList() {
    const list = document.getElementById('adminAppList');
    if(!list) return;
    list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm animate-pulse">Loading apps...</li>';
    try {
        const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
        const snap = await getDocs(q);
        list.innerHTML = '';
        
        if(snap.empty) { list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm">No apps found.</li>'; return; }

        snap.forEach(doc => {
            const a = doc.data();
            list.innerHTML += `
                <li class="p-4 bg-white flex justify-between items-center border-b hover:bg-gray-50 transition">
                    <div class="flex items-center gap-3">
                        <img src="${a.iconUrl}" class="w-10 h-10 rounded-lg bg-gray-100 object-cover shadow-sm">
                        <div>
                            <div class="font-bold text-sm text-gray-800">${a.name}</div>
                            <div class="text-[10px] text-gray-500 font-mono">${a.packageName}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editApp('${doc.id}')" class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100 transition">Edit</button>
                        <button onclick="deleteApp('${doc.id}')" class="px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100 transition">Del</button>
                    </div>
                </li>`;
        });
    } catch(e) { list.innerHTML = `<li class="p-4 text-center text-red-500 text-xs">Error: ${e.message}</li>`; }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('uploadingScreen').classList.remove('hidden');
    
    // Helpers to get values safely
    const fd = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const fc = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };

    const appData = {
        name: fd('appName'),
        packageName: fd('packageName'),
        developer: fd('developer'),
        category: fd('category'),
        size: fd('size'),
        version: fd('version'),
        apkUrl: fd('apkUrl'),
        iconUrl: fd('iconUrl'),
        screenshots: fd('screenshots'),
        description: fd('description'),
        
        // Full Technical Specs
        techData: { 
            verCode: fd('t_verCode'),
            minSdk: fd('t_minSdk'),
            targetSdk: fd('t_targetSdk'),
            abi: fd('t_abi'),
            sha1: fd('t_sha1'),
            sha256: fd('t_sha256'),
            v1: fc('t_v1'),
            v2: fc('t_v2'),
            v3: fc('t_v3'),
            // Hidden fields (if they exist in HTML)
            compileSdk: fd('t_compileSdk'),
            devices: fd('t_devices'),
            compress: fd('t_compress'),
            proguard: fd('t_proguard'),
            obfus: fd('t_obfus'),
            debug: fd('t_debug'),
            perms: fd('t_perms')
        },
        updatedAt: serverTimestamp()
    };

    try {
        if (isEditMode && currentEditId) {
            await updateDoc(doc(db, "apps", currentEditId), appData);
        } else {
            appData.downloads = 0;
            appData.uploadedAt = serverTimestamp();
            await addDoc(collection(db, "apps"), appData);
        }
        
        document.getElementById('successScreen').classList.remove('hidden');
        document.getElementById('uploadingScreen').classList.add('hidden');
        loadAdminList();
    } catch(e) { 
        alert("Error saving: " + e.message); 
        document.getElementById('uploadingScreen').classList.add('hidden'); 
    }
}

// Global Edit Function
window.editApp = async (id) => {
    const d = await getDoc(doc(db, "apps", id));
    if(d.exists()) {
        const data = d.data();
        const t = data.techData || {};
        isEditMode = true; currentEditId = id;
        
        const setV = (i, v) => { const el = document.getElementById(i); if(el) el.value = v || ''; };
        const setC = (i, v) => { const el = document.getElementById(i); if(el) el.checked = v || false; };

        // Basic
        setV('appName', data.name); setV('packageName', data.packageName); 
        setV('developer', data.developer); setV('category', data.category); 
        setV('size', data.size); setV('version', data.version);
        setV('apkUrl', data.apkUrl); setV('iconUrl', data.iconUrl);
        setV('screenshots', data.screenshots); setV('description', data.description);
        
        // Tech
        setV('t_verCode', t.verCode); setV('t_minSdk', t.minSdk); setV('t_targetSdk', t.targetSdk);
        setV('t_abi', t.abi); setV('t_sha1', t.sha1); setV('t_sha256', t.sha256);
        setC('t_v1', t.v1); setC('t_v2', t.v2); setC('t_v3', t.v3);

        document.getElementById('uploadBtn').innerText = "Update App Data";
        document.getElementById('formTitle').innerText = "Editing: " + data.name;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.deleteApp = async (id) => { if(confirm("Delete this app?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); } };
window.resetForm = () => { document.getElementById('uploadForm').reset(); isEditMode=false; document.getElementById('uploadBtn').innerText="Save Application"; document.getElementById('formTitle').innerText="Add New App"; };
window.closeSuccessScreen = () => { document.getElementById('successScreen').classList.add('hidden'); window.resetForm(); };
window.logout = () => signOut(auth);

// 2. SLIDER MANAGEMENT
async function handleSlideSubmit(e) {
    e.preventDefault();
    const img = document.getElementById('slideImg').value;
    const link = document.getElementById('slideLink').value;
    
    if(!img) return alert("Image URL required");

    try {
        await addDoc(collection(db, "slides"), { img, link, uploadedAt: serverTimestamp() });
        document.getElementById('sliderForm').reset();
        loadSlideList();
        alert("Slide added!");
    } catch(e) { alert(e.message); }
}

async function loadSlideList() {
    const list = document.getElementById('sliderList');
    if(!list) return;
    const q = query(collection(db, "slides"), orderBy("uploadedAt", "desc"));
    const snap = await getDocs(q);
    list.innerHTML = '';
    
    if(snap.empty) { list.innerHTML = '<li class="text-center text-xs text-gray-400">No slides found.</li>'; return; }

    snap.forEach(doc => {
        const s = doc.data();
        list.innerHTML += `
            <li class="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                <div class="flex items-center gap-3">
                    <img src="${s.img}" class="w-16 h-10 object-cover rounded border">
                    <div class="text-xs text-gray-500 truncate max-w-[150px]">${s.link || 'No Link'}</div>
                </div>
                <button onclick="deleteSlide('${doc.id}')" class="text-red-500 hover:bg-red-50 p-1.5 rounded"><i class="ph-bold ph-trash"></i></button>
            </li>`;
    });
}
window.deleteSlide = async (id) => { if(confirm("Delete slide?")) { await deleteDoc(doc(db, "slides", id)); loadSlideList(); } };

// TAB SWITCHING
window.switchTab = (tab) => {
    document.getElementById('section-apps').classList.add('hidden');
    document.getElementById('section-sliders').classList.add('hidden');
    document.getElementById('tab-apps').className = "px-5 py-3 text-sm font-bold text-gray-500 hover:text-green-600 transition bg-gray-50 rounded-t-lg";
    document.getElementById('tab-sliders').className = "px-5 py-3 text-sm font-bold text-gray-500 hover:text-green-600 transition bg-gray-50 rounded-t-lg";

    document.getElementById(`section-${tab}`).classList.remove('hidden');
    document.getElementById(`tab-${tab}`).className = "px-5 py-3 text-sm font-bold text-green-600 border-b-2 border-green-600 transition bg-white rounded-t-lg";
};

// ==========================================
// 📱 USER SIDE LOGIC (SLIDER + ADS + APPS)
// ==========================================

// HERO SLIDER
export async function initSlider() {
    const track = document.getElementById('heroSlider');
    const dotsContainer = document.getElementById('sliderDots');
    if (!track) return;

    try {
        const q = query(collection(db, "slides"), orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        let slides = [];
        snapshot.forEach(doc => slides.push(doc.data()));
        
        if (slides.length === 0) slides.push({ img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070', link: '#' });

        track.innerHTML = '';
        if(dotsContainer) dotsContainer.innerHTML = '';

        slides.forEach((s, i) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.style.minWidth = "100%";
            slide.onclick = () => { if(s.link && s.link !== '#') window.location.href = s.link; };
            slide.innerHTML = `<img src="${s.img}" class="w-full h-full object-cover cursor-pointer">`;
            track.appendChild(slide);

            if(dotsContainer) {
                const dot = document.createElement('div');
                dot.className = `w-2 h-2 rounded-full bg-white/50 transition ${i===0?'bg-white w-4':''}`;
                dotsContainer.appendChild(dot);
            }
        });

        let index = 0;
        const total = slides.length;
        const update = () => {
            track.style.transform = `translateX(-${index * 100}%)`;
            if(dotsContainer) Array.from(dotsContainer.children).forEach((d, i) => d.className = `w-2 h-2 rounded-full bg-white/50 transition ${i===index?'bg-white w-4':''}`);
        };
        
        let interval = setInterval(() => { index = (index + 1) % total; update(); }, 4000);
        
        let startX = 0;
        track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; clearInterval(interval); });
        track.addEventListener('touchend', e => {
            if(Math.abs(startX - e.changedTouches[0].clientX) > 50) {
                index = (startX > e.changedTouches[0].clientX) ? (index + 1) % total : (index - 1 + total) % total;
                update();
            }
            interval = setInterval(() => { index = (index + 1) % total; update(); }, 4000);
        });
    } catch(e) {}
}

// ADS
function initAds() {
    setTimeout(() => {
        if(document.getElementById('flowAd')) return;
        const div = document.createElement('div');
        div.id = 'flowAd';
        div.className = "fixed bottom-0 left-0 w-full bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50 p-3 transform translate-y-full transition-transform duration-500 border-t";
        div.innerHTML = `
            <div class="max-w-4xl mx-auto flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=VPN&background=000&color=fff" class="w-10 h-10 rounded-lg shadow-sm">
                    <div><h4 class="font-bold text-sm text-gray-800">Secure VPN</h4><p class="text-[10px] text-gray-500">Fast & Anonymous</p></div>
                </div>
                <div class="flex gap-2">
                    <button class="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm">Install</button>
                    <button id="closeAd" class="text-gray-400 text-xl hover:text-red-500"><i class="ph-bold ph-x-circle"></i></button>
                </div>
            </div>`;
        document.body.appendChild(div);
        setTimeout(() => div.classList.remove('translate-y-full'), 1000);
        
        document.getElementById('closeAd').onclick = () => {
            div.classList.add('translate-y-full');
            setTimeout(() => { div.remove(); initAds(); }, 30000); // 30s Loop
        };
    }, 5000);
}

// LOAD APPS
export async function loadApps(cat='All', search='') {
    const grid = document.getElementById('appGrid');
    if(!grid) return;
    grid.innerHTML = '';
    const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
    const snap = await getDocs(q);
    
    let found = false;
    snap.forEach(doc => {
        const d = doc.data();
        if((cat==='All'||d.category===cat) && (search===''||d.name.toLowerCase().includes(search.toLowerCase()))) {
            found = true;
            grid.innerHTML += `
                <div onclick="window.location.href='app-details.html?id=${doc.id}'" class="group bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition text-center relative overflow-hidden">
                    <div class="relative z-10 mb-2"><img src="${d.iconUrl}" class="w-14 h-14 rounded-xl mx-auto shadow-sm"></div>
                    <h3 class="font-bold text-gray-800 text-xs line-clamp-2 h-8 group-hover:text-green-600 transition">${d.name}</h3>
                    <div class="text-[9px] text-gray-500 mt-1">${d.size}</div>
                    <button class="mt-2 w-full bg-green-600 text-white text-[10px] font-bold py-1.5 rounded-lg group-hover:bg-green-700">Download</button>
                </div>`;
        }
    });
    if(!found) grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-10 text-sm">No apps found.</div>';
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
            c.innerHTML = `
                <div class="flex gap-4 mb-6"><img src="${a.iconUrl}" class="w-20 h-20 rounded-2xl shadow-lg border"><div><h1 class="text-2xl font-bold">${a.name}</h1><p class="text-xs text-green-600 font-bold">${a.developer}</p><p class="text-xs text-gray-400 font-mono">${a.packageName}</p></div></div>
                <a href="${a.apkUrl}" class="block w-full bg-green-600 text-white text-center font-bold py-3 rounded-xl shadow-lg mb-6 hover:bg-green-700 transition">Download APK</a>
                ${shots}
                <div class="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 leading-relaxed mb-6">${a.description || 'No description provided.'}</div>
                <div class="bg-white border rounded-xl overflow-hidden"><div class="bg-gray-50 px-5 py-3 border-b"><h3 class="font-bold text-xs uppercase tracking-wider">Technical Specs</h3></div>
                <div class="p-5 grid grid-cols-2 gap-4 text-xs">
                    <div class="font-bold text-gray-600">Ver. Code: <span class="font-mono text-gray-800">${tech.verCode||'-'}</span></div>
                    <div class="font-bold text-gray-600">Min SDK: <span class="font-mono text-gray-800">${tech.minSdk||'-'}</span></div>
                    <div class="col-span-2 font-bold text-gray-600 border-t pt-2 mt-2">SHA1 Signature:<br><span class="font-mono text-gray-800 break-all bg-gray-50 p-1 block mt-1 rounded">${tech.sha1||'-'}</span></div>
                </div></div>`;
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