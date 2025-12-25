import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, increment, serverTimestamp, getDoc, limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
// 🚀 INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on
    if (document.getElementById('loginScreen')) {
        initAdmin();
    } else {
        // User Pages
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
// 🖼️ SLIDER (User Side)
// ==========================================
export async function initSlider() {
    const track = document.getElementById('heroSlider');
    const dotsContainer = document.getElementById('sliderDots');
    if (!track) return;

    try {
        const q = query(collection(db, "slides"), orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        let slides = [];
        snapshot.forEach(doc => slides.push(doc.data()));
        
        // Fallback slide if empty
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

        // Animation
        let index = 0;
        const total = slides.length;
        const update = () => {
            track.style.transform = `translateX(-${index * 100}%)`;
            if(dotsContainer) Array.from(dotsContainer.children).forEach((d, i) => d.className = `w-2 h-2 rounded-full bg-white/50 transition ${i===index?'bg-white w-4':''}`);
        };
        
        let interval = setInterval(() => { index = (index + 1) % total; update(); }, 4000);
        
        // Touch
        let startX = 0;
        track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; clearInterval(interval); });
        track.addEventListener('touchend', e => {
            if(Math.abs(startX - e.changedTouches[0].clientX) > 50) {
                index = (startX > e.changedTouches[0].clientX) ? (index + 1) % total : (index - 1 + total) % total;
                update();
            }
            interval = setInterval(() => { index = (index + 1) % total; update(); }, 4000);
        });
    } catch(e) { console.error(e); }
}

// ==========================================
// 💸 ADS (Sticky + Re-show)
// ==========================================
function initAds() {
    // Flow Ad
    setTimeout(() => {
        if(document.getElementById('flowAd')) return;
        const div = document.createElement('div');
        div.id = 'flowAd';
        div.className = "fixed bottom-0 left-0 w-full bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50 p-3 transform translate-y-full transition-transform duration-500 border-t border-gray-100";
        div.innerHTML = `
            <div class="max-w-4xl mx-auto flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=VPN&background=0D8ABC&color=fff" class="w-10 h-10 rounded-lg shadow-sm">
                    <div><h4 class="font-bold text-sm text-gray-800">Fast VPN</h4><p class="text-xs font-normal text-gray-500">Secure browsing.</p></div>
                </div>
                <div class="flex gap-2">
                    <button class="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow hover:bg-green-700 transition">Open</button>
                    <button id="closeAd" class="text-gray-400 text-xl hover:text-red-500 p-1"><i class="ph-bold ph-x-circle"></i></button>
                </div>
            </div>`;
        document.body.appendChild(div);
        
        setTimeout(() => div.classList.remove('translate-y-full'), 1000);
        
        document.getElementById('closeAd').onclick = () => {
            div.classList.add('translate-y-full');
            // Re-show after 30 seconds
            setTimeout(() => { div.remove(); initAds(); }, 30000);
        };
    }, 5000); // Initial delay 5s
}

// ==========================================
// 📱 APPS (User Side)
// ==========================================
export async function loadApps(cat='All', search='') {
    const grid = document.getElementById('appGrid');
    if(!grid) return;
    grid.innerHTML = '';
    
    // Simple query to avoid index errors
    const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
    const snap = await getDocs(q);
    
    let hasRes = false;
    snap.forEach(doc => {
        const d = doc.data();
        if((cat==='All'||d.category===cat) && (search===''||d.name.toLowerCase().includes(search.toLowerCase()))) {
            hasRes = true;
            grid.innerHTML += `
                <div onclick="window.location.href='app-details.html?id=${doc.id}'" class="group bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition text-center relative overflow-hidden">
                    <div class="relative z-10 mb-2"><img src="${d.iconUrl}" onerror="this.src='https://ui-avatars.com/api/?name=${d.name}'" class="w-14 h-14 rounded-xl mx-auto mb-2 shadow-sm object-cover"></div>
                    <h3 class="font-bold text-gray-800 text-xs line-clamp-2 h-8 group-hover:text-green-600 transition">${d.name}</h3>
                    <div class="text-[9px] text-gray-500 mt-1">${d.size}</div>
                    <button class="mt-2 w-full bg-green-600 text-white text-[10px] font-bold py-1.5 rounded-lg group-hover:bg-green-700 transition">Download</button>
                </div>`;
        }
    });
    if(!hasRes) grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-20 text-sm">No apps found.</div>';
}

export async function loadAppDetails(id) {
    const c = document.getElementById('detailsContainer');
    if(!c) return;
    try {
        const d = await getDoc(doc(db, "apps", id));
        if(d.exists()) {
            const a = d.data();
            const tech = a.techData || {};
            const shots = a.screenshots ? `<div class="flex gap-2 overflow-x-auto pb-4 snap-x">${a.screenshots.split(',').map(u=>`<img src="${u}" class="h-48 rounded-lg border snap-center object-cover">`).join('')}</div>` : '';
            c.innerHTML = `
                <div class="flex gap-4 mb-6"><img src="${a.iconUrl}" class="w-20 h-20 rounded-2xl shadow-lg border object-cover"><div><h1 class="text-2xl font-bold">${a.name}</h1><p class="text-xs text-green-600 font-bold flex items-center gap-1">${a.developer} <i class="ph-fill ph-check-circle"></i></p><p class="text-xs text-gray-400">${a.packageName}</p></div></div>
                <a href="${a.apkUrl}" class="block w-full bg-green-600 text-white text-center font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 mb-6 hover:bg-green-700 transition transform hover:-translate-y-1">Download APK</a>
                ${shots}
                <div class="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 leading-relaxed mb-6 whitespace-pre-line">${a.description || 'No description provided.'}</div>
                <div class="bg-white border rounded-xl overflow-hidden"><div class="bg-gray-50 px-5 py-3 border-b"><h3 class="font-bold text-xs text-gray-800">Technical Specs</h3></div><div class="p-5 grid grid-cols-2 gap-4 text-xs"><div class="font-bold text-gray-500">Version: <span class="font-mono text-gray-800">${a.version}</span></div><div class="font-bold text-gray-500">Size: <span class="font-mono text-gray-800">${a.size}</span></div><div class="font-bold text-gray-500">Ver. Code: <span class="font-mono text-gray-800">${tech.verCode||'-'}</span></div><div class="font-bold text-gray-500">Min SDK: <span class="font-mono text-gray-800">${tech.minSdk||'-'}</span></div><div class="col-span-2 font-bold text-gray-500 border-t pt-2 mt-1">SHA1: <span class="font-mono text-gray-800 break-all">${tech.sha1||'-'}</span></div></div></div>`;
            loadRecommendedApps(id);
        }
    } catch(e) { c.innerHTML = '<p class="text-center py-20 text-red-500">App not found.</p>'; }
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
            grid.innerHTML += `<div onclick="window.location.href='app-details.html?id=${d.id}'" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-100 group"><img src="${a.iconUrl}" class="w-10 h-10 rounded-lg object-cover bg-gray-100"><div class="flex-1"><h4 class="font-bold text-xs truncate group-hover:text-green-600 transition">${a.name}</h4><div class="text-[10px] text-gray-500">${a.size}</div></div></div>`;
        }
    });
}
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });

// ==========================================
// 🛠️ ADMIN LOGIC
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
    
    // Auth
    const lf = document.getElementById('loginForm');
    if(lf) lf.addEventListener('submit', e => { e.preventDefault(); signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value).catch(err=>alert("Login Failed: "+err.code)); });
    
    // Forms
    const uf = document.getElementById('uploadForm');
    if(uf) uf.addEventListener('submit', handleFormSubmit);
    
    const sf = document.getElementById('sliderForm');
    if(sf) sf.addEventListener('submit', handleSlideSubmit);
}

// Global Tab Switcher
window.switchTab = (tab) => {
    document.querySelectorAll('[id^="section-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id^="tab-"]').forEach(el => el.className = "px-4 py-3 text-sm font-bold text-gray-500 hover:text-green-600 transition");
    document.getElementById(`section-${tab}`).classList.remove('hidden');
    document.getElementById(`tab-${tab}`).className = "px-4 py-3 text-sm font-bold text-green-600 border-b-2 border-green-600 transition";
};

// Slider Admin
async function handleSlideSubmit(e) {
    e.preventDefault();
    const img = document.getElementById('slideImg').value;
    const link = document.getElementById('slideLink').value;
    try { 
        await addDoc(collection(db, "slides"), { img, link, uploadedAt: serverTimestamp() }); 
        document.getElementById('sliderForm').reset(); 
        loadSlideList(); 
        alert("Slide added!");
    } catch(e){ alert(e.message); }
}
async function loadSlideList() {
    const list = document.getElementById('sliderList'); if(!list) return;
    const s = await getDocs(query(collection(db, "slides"), orderBy("uploadedAt", "desc")));
    list.innerHTML = '';
    if(s.empty) list.innerHTML = '<li class="p-4 text-xs text-gray-400 text-center">No slides found.</li>';
    s.forEach(d => list.innerHTML += `<li class="flex justify-between p-3 bg-gray-50 rounded mb-2 border items-center"><div class="flex gap-3"><img src="${d.data().img}" class="w-12 h-8 rounded object-cover"><span class="text-xs text-gray-500 truncate max-w-[150px]">${d.data().link}</span></div><button onclick="deleteSlide('${d.id}')" class="text-red-500 text-xs font-bold px-2 py-1 bg-white border rounded hover:bg-red-50">Delete</button></li>`);
}
window.deleteSlide = async (id) => { if(confirm("Delete slide?")) { await deleteDoc(doc(db, "slides", id)); loadSlideList(); } };

// Apps Admin
async function loadAdminList() {
    const list = document.getElementById('adminAppList'); if(!list) return;
    list.innerHTML = '<li class="p-6 text-center text-gray-400 text-xs">Loading...</li>';
    try {
        const s = await getDocs(query(collection(db, "apps"), orderBy("uploadedAt", "desc")));
        list.innerHTML = '';
        if(s.empty) list.innerHTML = '<li class="p-6 text-center text-gray-400 text-xs">No apps found. Add one!</li>';
        s.forEach(d => {
            const a = d.data();
            list.innerHTML += `<li class="p-3 flex justify-between items-center hover:bg-gray-50 border-b last:border-0"><div class="flex gap-3 items-center"><img src="${a.iconUrl}" class="w-8 h-8 rounded bg-gray-100 object-cover"><div><div class="font-bold text-xs text-gray-800">${a.name}</div><div class="text-[10px] text-gray-500 font-mono">${a.packageName}</div></div></div><div class="flex gap-2"><button onclick="editApp('${d.id}')" class="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded">Edit</button><button onclick="deleteApp('${d.id}')" class="text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">Del</button></div></li>`;
        });
    } catch(e) { list.innerHTML = `<li class="p-4 text-center text-red-500 text-xs">Error: ${e.message}</li>`; }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('uploadingScreen').classList.remove('hidden');
    
    const fd = (id) => document.getElementById(id) ? document.getElementById(id).value : '';
    const fc = (id) => document.getElementById(id) ? document.getElementById(id).checked : false;
    
    const appData = {
        name: fd('appName'), packageName: fd('packageName'), developer: fd('developer'), category: fd('category'), size: fd('size'), version: fd('version'), apkUrl: fd('apkUrl'), iconUrl: fd('iconUrl'), screenshots: fd('screenshots'), description: fd('description'),
        techData: { verCode: fd('t_verCode'), minSdk: fd('t_minSdk'), targetSdk: fd('t_targetSdk'), sha1: fd('t_sha1'), sha256: fd('t_sha256'), v1: fc('t_v1'), v2: fc('t_v2'), v3: fc('t_v3') },
        updatedAt: serverTimestamp()
    };
    
    try {
        if(isEditMode) await updateDoc(doc(db, "apps", currentEditId), appData); else { appData.downloads=0; await addDoc(collection(db, "apps"), appData); }
        document.getElementById('uploadingScreen').classList.add('hidden'); 
        document.getElementById('successScreen').classList.remove('hidden');
        loadAdminList();
    } catch(e) { alert(e.message); document.getElementById('uploadingScreen').classList.add('hidden'); }
}

window.editApp = async (id) => {
    const d = await getDoc(doc(db, "apps", id));
    if(d.exists()) {
        const data = d.data(); const t = data.techData || {};
        isEditMode = true; currentEditId = id;
        
        const setVal = (i,v) => { if(document.getElementById(i)) document.getElementById(i).value=v||''; }
        
        setVal('appName', data.name); setVal('packageName', data.packageName); setVal('developer', data.developer); setVal('category', data.category); setVal('size', data.size); setVal('version', data.version); setVal('apkUrl', data.apkUrl); setVal('iconUrl', data.iconUrl); setVal('screenshots', data.screenshots); setVal('description', data.description);
        setVal('t_verCode', t.verCode); setVal('t_minSdk', t.minSdk); setVal('t_targetSdk', t.targetSdk); setVal('t_sha1', t.sha1); setVal('t_sha256', t.sha256);
        
        document.getElementById('uploadBtn').innerText = "Update App";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
window.deleteApp = async (id) => { if(confirm("Delete this app?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); } };
window.closeSuccessScreen = () => { document.getElementById('successScreen').classList.add('hidden'); window.resetForm(); };
window.resetForm = () => { document.getElementById('uploadForm').reset(); isEditMode=false; document.getElementById('uploadBtn').innerText="Save App"; };
window.logout = () => signOut(auth);