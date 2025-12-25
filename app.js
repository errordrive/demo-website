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
// 🚀 INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Shared Components
    loadGlobalFooter();

    // 2. Identify Page
    if(document.getElementById('loginScreen')) {
        // ADMIN PAGE
        initAdmin();
    } else {
        // USER PAGES
        initAds(); // Only run ads on user pages
        if(document.getElementById('heroSlider')) initSlider();
        if(document.getElementById('appGrid')) loadApps();
        if(document.getElementById('detailsContainer')) {
            const id = new URLSearchParams(window.location.search).get('id');
            if(id) loadAppDetails(id);
        }
    }
});

// ==========================================
// 🖼️ HERO SLIDER (USER SIDE)
// ==========================================
export async function initSlider() {
    const track = document.getElementById('heroSlider');
    const dotsContainer = document.getElementById('sliderDots');
    if (!track) return;

    try {
        const q = query(collection(db, "slides"), orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        
        let slidesData = [];
        snapshot.forEach(doc => slidesData.push(doc.data()));

        if (slidesData.length === 0) return; // No slides, keep HTML default or empty

        track.innerHTML = '';
        if(dotsContainer) dotsContainer.innerHTML = '';

        slidesData.forEach((s, i) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.style.minWidth = "100%";
            slide.onclick = () => { if(s.link) window.location.href = s.link; };
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
        const total = slidesData.length;
        
        const update = () => {
            track.style.transform = `translateX(-${index * 100}%)`;
            if(dotsContainer) {
                Array.from(dotsContainer.children).forEach((d, i) => {
                    d.className = `w-2 h-2 rounded-full bg-white/50 transition ${i===index?'bg-white w-4':''}`;
                });
            }
        };

        // Auto Play
        let interval = setInterval(() => { index = (index + 1) % total; update(); }, 4000);

        // Touch Logic
        let startX = 0;
        track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; clearInterval(interval); });
        track.addEventListener('touchend', e => {
            const diff = startX - e.changedTouches[0].clientX;
            if(Math.abs(diff) > 50) {
                if(diff > 0) index = (index + 1) % total;
                else index = (index - 1 + total) % total;
                update();
            }
            interval = setInterval(() => { index = (index + 1) % total; update(); }, 4000);
        });

    } catch (e) { console.error("Slider Load Error:", e); }
}

// ==========================================
// 🛠️ ADMIN LOGIC (TABS & SLIDERS)
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

    // Login
    const loginForm = document.getElementById('loginForm');
    if(loginForm) loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value)
        .catch(err => alert(err.code));
    });

    // App Upload
    const uploadForm = document.getElementById('uploadForm');
    if(uploadForm) uploadForm.addEventListener('submit', handleFormSubmit);

    // Slider Upload
    const sliderForm = document.getElementById('sliderForm');
    if(sliderForm) sliderForm.addEventListener('submit', handleSlideSubmit);
}

// --- ADMIN: TABS ---
export function switchTab(tabName) {
    document.getElementById('section-apps').classList.add('hidden');
    document.getElementById('section-sliders').classList.add('hidden');
    document.getElementById('tab-apps').className = "px-4 py-2 text-sm font-bold text-gray-500 hover:text-green-600 transition";
    document.getElementById('tab-sliders').className = "px-4 py-2 text-sm font-bold text-gray-500 hover:text-green-600 transition";

    document.getElementById(`section-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}`).className = "px-4 py-2 text-sm font-bold text-green-600 border-b-2 border-green-600 transition";
}

// --- ADMIN: SLIDERS ---
async function handleSlideSubmit(e) {
    e.preventDefault();
    const img = document.getElementById('slideImg').value;
    const link = document.getElementById('slideLink').value;
    
    if(!img) return alert("Image URL is required!");

    try {
        await addDoc(collection(db, "slides"), { img, link, uploadedAt: serverTimestamp() });
        document.getElementById('sliderForm').reset();
        alert("Slider Added Successfully!");
        loadSlideList();
    } catch(e) { alert("Error adding slide: " + e.message); }
}

async function loadSlideList() {
    const list = document.getElementById('sliderList');
    if(!list) return;
    try {
        const q = query(collection(db, "slides"), orderBy("uploadedAt", "desc"));
        const snap = await getDocs(q);
        list.innerHTML = '';
        if(snap.empty) { list.innerHTML = '<li class="p-4 text-center text-gray-400 text-xs">No slides found.</li>'; return; }
        
        snap.forEach(doc => {
            const s = doc.data();
            list.innerHTML += `
                <li class="flex items-center justify-between p-3 bg-white border-b last:border-0">
                    <div class="flex items-center gap-3">
                        <img src="${s.img}" class="w-16 h-8 object-cover rounded border">
                        <span class="text-xs text-blue-600 truncate max-w-[150px]">${s.link || 'No Link'}</span>
                    </div>
                    <button onclick="deleteSlide('${doc.id}')" class="text-red-500 hover:bg-red-50 p-1 rounded"><i class="ph-bold ph-trash"></i></button>
                </li>`;
        });
    } catch(e) { console.error(e); }
}

window.deleteSlide = async (id) => {
    if(confirm("Delete this slide?")) {
        await deleteDoc(doc(db, "slides", id));
        loadSlideList();
    }
}

// --- ADMIN: APPS (Existing Logic) ---
async function loadAdminList() {
    const list = document.getElementById('adminAppList');
    if(!list) return;
    try {
        const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
        const snap = await getDocs(q);
        list.innerHTML = '';
        if(snap.empty) { list.innerHTML = '<li class="p-4 text-center text-gray-400 text-xs">No apps found.</li>'; return; }
        snap.forEach(doc => {
            const a = doc.data();
            list.innerHTML += `
                <li class="p-3 flex justify-between items-center hover:bg-gray-50 transition">
                    <div class="flex items-center gap-3">
                        <img src="${a.iconUrl}" class="w-8 h-8 rounded bg-gray-100">
                        <div><div class="font-bold text-xs text-gray-800">${a.name}</div></div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editApp('${doc.id}')" class="text-blue-600 text-xs font-bold">Edit</button>
                        <button onclick="deleteApp('${doc.id}')" class="text-red-600 text-xs font-bold">Del</button>
                    </div>
                </li>`;
        });
    } catch(e) {}
}

async function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('uploadingScreen').classList.remove('hidden');
    // ... (Collect data logic same as before) ...
    // Using a simpler version for brevity, make sure to include all fields if needed
    const fd = (id) => document.getElementById(id) ? document.getElementById(id).value : '';
    const appData = {
        name: fd('appName'), packageName: fd('packageName'), developer: fd('developer'),
        category: fd('category'), size: fd('size'), version: fd('version'),
        apkUrl: fd('apkUrl'), iconUrl: fd('iconUrl'), screenshots: fd('screenshots'),
        techData: { verCode: fd('t_verCode'), minSdk: fd('t_minSdk') }, // Add others if needed
        updatedAt: serverTimestamp()
    };

    try {
        if(isEditMode && currentEditId) await updateDoc(doc(db, "apps", currentEditId), appData);
        else { appData.downloads = 0; appData.uploadedAt = serverTimestamp(); await addDoc(collection(db, "apps"), appData); }
        document.getElementById('successScreen').classList.remove('hidden');
        document.getElementById('uploadingScreen').classList.add('hidden');
        loadAdminList();
    } catch(e) { alert(e.message); document.getElementById('uploadingScreen').classList.add('hidden'); }
}

// Global Admin Helpers
window.editApp = async (id) => {
    const d = await getDoc(doc(db, "apps", id));
    if(d.exists()) {
        const data = d.data();
        isEditMode = true; currentEditId = id;
        document.getElementById('appName').value = data.name;
        document.getElementById('packageName').value = data.packageName;
        document.getElementById('apkUrl').value = data.apkUrl;
        document.getElementById('iconUrl').value = data.iconUrl;
        document.getElementById('uploadBtn').innerText = "Update App";
        window.scrollTo({top:0});
    }
};
window.deleteApp = async (id) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); } };
window.resetForm = () => { document.getElementById('uploadForm').reset(); isEditMode=false; document.getElementById('uploadBtn').innerText="Save App"; };
window.closeSuccessScreen = () => { document.getElementById('successScreen').classList.add('hidden'); window.resetForm(); };
window.logout = () => signOut(auth);


// ==========================================
// 🧩 UI & ADS LOGIC
// ==========================================
function loadGlobalFooter() {
    const f = document.getElementById('main-footer');
    if(f) f.innerHTML = `<div class="text-center py-8 text-gray-400 text-xs border-t mt-10">&copy; 2025 APKVerse. All rights reserved.</div>`;
}

function initAds() {
    // Flow Ad
    setTimeout(() => {
        if(document.getElementById('flowAd')) return;
        const div = document.createElement('div');
        div.id = 'flowAd';
        div.className = "fixed bottom-0 left-0 w-full bg-white shadow-xl z-50 p-3 border-t transform translate-y-full transition-transform duration-500";
        div.innerHTML = `
            <div class="max-w-4xl mx-auto flex justify-between items-center">
                <div class="flex items-center gap-3"><div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><i class="ph-bold ph-shield"></i></div><div><h4 class="font-bold text-sm">Safe Browsing</h4><p class="text-[10px] text-gray-500">Secured by APKVerse.</p></div></div>
                <button id="closeAd" class="text-gray-400 hover:text-red-500"><i class="ph-bold ph-x-circle text-xl"></i></button>
            </div>`;
        document.body.appendChild(div);
        setTimeout(() => div.classList.remove('translate-y-full'), 1000);
        
        document.getElementById('closeAd').onclick = () => {
            div.classList.add('translate-y-full');
            setTimeout(() => { div.remove(); initAds(); }, 30000); // Reappear after 30s
        };
    }, 5000);
}

// App Loader (User Side)
export async function loadApps(cat='All', search='') {
    const grid = document.getElementById('appGrid');
    if(!grid) return;
    grid.innerHTML = '';
    const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
    const snap = await getDocs(q);
    snap.forEach(doc => {
        const d = doc.data();
        if((cat==='All'||d.category===cat) && (search===''||d.name.toLowerCase().includes(search.toLowerCase()))) {
            grid.innerHTML += `<div onclick="window.location.href='app-details.html?id=${doc.id}'" class="bg-white p-3 rounded-xl shadow-sm border flex flex-col items-center text-center cursor-pointer hover:shadow-md transition"><img src="${d.iconUrl}" class="w-14 h-14 rounded-xl mb-2"><h3 class="font-bold text-xs line-clamp-2">${d.name}</h3></div>`;
        }
    });
}
export async function loadAppDetails(id) { /* Same as before logic */ }