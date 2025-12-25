import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, increment, serverTimestamp, getDoc, limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// ==========================================
// 🔥 CONFIGURATION
// ==========================================
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

// Global State
let isEditMode = false;
let currentEditId = null;

// ==========================================
// 🚀 INITIALIZATION (Entry Point)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Footer Everywhere
    loadGlobalFooter();

    // 2. Route Logic
    if (document.getElementById('loginScreen')) {
        // We are on Admin Panel
        initAdmin();
    } else {
        // We are on User Site
        initAds(); // Start Ads
        if(document.getElementById('heroSlider')) initSlider();
        if(document.getElementById('appGrid')) loadApps();
        
        // Check for Details Page
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if(id && document.getElementById('detailsContainer')) loadAppDetails(id);
    }
});

// ==========================================
// 🖼️ HERO SLIDER LOGIC (User Side)
// ==========================================

export async function initSlider() {
    const track = document.getElementById('heroSlider');
    const dotsContainer = document.getElementById('sliderDots');
    if (!track) return;

    try {
        const q = query(collection(db, "slides"), orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        
        let slidesData = [];
        if (snapshot.empty) {
            // Default placeholder if no slides
            slidesData.push({ img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070', link: '#' });
        } else {
            snapshot.forEach(doc => slidesData.push(doc.data()));
        }

        track.innerHTML = '';
        if(dotsContainer) dotsContainer.innerHTML = '';

        // Render Slides
        slidesData.forEach((s, i) => {
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

        // Animation & Logic
        let index = 0;
        const total = slidesData.length;
        
        const updateSlide = () => {
            track.style.transform = `translateX(-${index * 100}%)`;
            if(dotsContainer) {
                Array.from(dotsContainer.children).forEach((d, i) => {
                    d.className = `w-2 h-2 rounded-full bg-white/50 transition ${i===index?'bg-white w-4':''}`;
                });
            }
        };

        // Auto Play
        let interval = setInterval(() => { index = (index + 1) % total; updateSlide(); }, 4000);

        // Touch Swipe Logic
        let startX = 0;
        track.addEventListener('touchstart', e => { 
            startX = e.touches[0].clientX; 
            clearInterval(interval); 
        });
        
        track.addEventListener('touchend', e => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if(Math.abs(diff) > 50) {
                if(diff > 0) index = (index + 1) % total; // Swipe Left
                else index = (index - 1 + total) % total; // Swipe Right
                updateSlide();
            }
            interval = setInterval(() => { index = (index + 1) % total; updateSlide(); }, 4000);
        });

    } catch (e) { console.error("Slider Error:", e); }
}

// ==========================================
// 💸 SMART ADS SYSTEM
// ==========================================

function initAds() {
    // 1. Static Ad (Randomly placed in content)
    const main = document.querySelector('main');
    if(main) {
        const adDiv = document.createElement('div');
        adDiv.className = "my-8 mx-auto max-w-4xl p-2";
        adDiv.innerHTML = `
            <div class="bg-gray-100 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm cursor-pointer group hover:bg-gray-50 transition">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg"><i class="ph-bold ph-lightning"></i></div>
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm">Turbo Speed</h4>
                        <p class="text-xs text-gray-500">Download files 5x faster.</p>
                    </div>
                </div>
                <button class="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg group-hover:bg-gray-800 transition">Check Now</button>
            </div>`;
        
        const sections = main.querySelectorAll('section');
        if(sections.length > 0) main.insertBefore(adDiv, sections[0]);
        else main.appendChild(adDiv);
    }

    // 2. Flow Ad (Sticky with Auto Re-show)
    showFlowAd();
}

function showFlowAd() {
    if(document.getElementById('flowAd')) return;

    const flow = document.createElement('div');
    flow.id = "flowAd";
    flow.className = "fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-5px_30px_rgba(0,0,0,0.1)] z-[100] transform translate-y-full transition-transform duration-500 p-3";
    flow.innerHTML = `
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="https://ui-avatars.com/api/?name=VPN&background=000&color=fff" class="w-10 h-10 rounded-lg shadow-sm">
                <div><h4 class="font-bold text-sm text-gray-900">Secure VPN</h4><p class="text-[10px] text-gray-500">Hide your IP address.</p></div>
            </div>
            <div class="flex gap-2">
                <button class="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition">Install</button>
                <button id="closeAdBtn" class="text-gray-400 text-xl hover:text-red-500 p-1"><i class="ph-bold ph-x-circle"></i></button>
            </div>
        </div>`;
    
    document.body.appendChild(flow);
    
    // Slide Up
    setTimeout(() => flow.classList.remove('translate-y-full'), 2000);

    // Close Logic
    document.getElementById('closeAdBtn').addEventListener('click', () => {
        flow.classList.add('translate-y-full');
        setTimeout(() => {
            flow.remove();
            setTimeout(showFlowAd, 30000); // Reappear after 30 seconds
        }, 500);
    });
}

// ==========================================
// 🛠️ ADMIN LOGIC (Fixed)
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

    // Forms
    const loginForm = document.getElementById('loginForm');
    if(loginForm) loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value)
        .catch(err => alert(err.code));
    });

    const uploadForm = document.getElementById('uploadForm');
    if(uploadForm) uploadForm.addEventListener('submit', handleFormSubmit);

    const sliderForm = document.getElementById('sliderForm');
    if(sliderForm) sliderForm.addEventListener('submit', handleSlideSubmit);
}

// --- ADMIN TABS ---
export function switchTab(tab) {
    document.querySelectorAll('[id^="section-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id^="tab-"]').forEach(el => el.className = "px-4 py-2 text-sm font-bold text-gray-500 hover:text-green-600 transition");
    
    document.getElementById(`section-${tab}`).classList.remove('hidden');
    document.getElementById(`tab-${tab}`).className = "px-4 py-2 text-sm font-bold text-green-600 border-b-2 border-green-600 transition";
}
window.switchTab = switchTab;

// --- ADMIN SLIDER ---
async function handleSlideSubmit(e) {
    e.preventDefault(); // Prevents Page Refresh
    const img = document.getElementById('slideImg').value;
    const link = document.getElementById('slideLink').value;
    
    if(!img) return alert("Image URL is required!");

    try {
        await addDoc(collection(db, "slides"), { img, link, uploadedAt: serverTimestamp() });
        document.getElementById('sliderForm').reset();
        alert("Slide added successfully!");
        loadSlideList();
    } catch(e) { alert(e.message); }
}

async function loadSlideList() {
    const list = document.getElementById('sliderList');
    if(!list) return;
    try {
        const q = query(collection(db, "slides"), orderBy("uploadedAt", "desc"));
        const snap = await getDocs(q);
        list.innerHTML = '';
        snap.forEach(doc => {
            const s = doc.data();
            list.innerHTML += `
                <li class="flex items-center justify-between p-3 bg-gray-50 rounded border mb-2">
                    <div class="flex items-center gap-3">
                        <img src="${s.img}" class="w-12 h-8 object-cover rounded shadow-sm">
                        <div class="text-xs text-gray-500 truncate max-w-[150px]">${s.link || 'No Link'}</div>
                    </div>
                    <button onclick="deleteSlide('${doc.id}')" class="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-white border rounded">Delete</button>
                </li>`;
        });
    } catch(e) {}
}

window.deleteSlide = async (id) => {
    if(confirm("Delete this slide?")) {
        await deleteDoc(doc(db, "slides", id));
        loadSlideList();
    }
}

// --- ADMIN APPS ---
async function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('uploadingScreen').classList.remove('hidden');
    
    const fd = (id) => document.getElementById(id) ? document.getElementById(id).value : '';
    const fc = (id) => document.getElementById(id) ? document.getElementById(id).checked : false;

    const appData = {
        name: fd('appName'), packageName: fd('packageName'), developer: fd('developer'),
        category: fd('category'), size: fd('size'), version: fd('version'),
        apkUrl: fd('apkUrl'), iconUrl: fd('iconUrl'), screenshots: fd('screenshots'),
        description: "", 
        techData: { 
            verCode: fd('t_verCode'), date: fd('t_date'), minSdk: fd('t_minSdk'),
            targetSdk: fd('t_targetSdk'), compileSdk: fd('t_compileSdk'), abi: fd('t_abi'),
            devices: fd('t_devices'), sha1: fd('t_sha1'), sha256: fd('t_sha256'),
            compress: fd('t_compress'), algo: fd('t_algo'), issuer: fd('t_issuer'),
            proguard: fd('t_proguard'), obfus: fd('t_obfus'), debug: fd('t_debug'), perms: fd('t_perms'),
            v1: fc('t_v1'), v2: fc('t_v2'), v3: fc('t_v3'), v4: fc('t_v4')
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
                <li class="p-3 bg-white flex justify-between items-center border-b hover:bg-gray-50 transition">
                    <div class="flex items-center gap-3">
                        <img src="${a.iconUrl}" class="w-10 h-10 rounded bg-gray-100 object-cover">
                        <div>
                            <div class="font-bold text-sm text-gray-800">${a.name}</div>
                            <div class="text-[10px] text-gray-500 font-mono">${a.packageName}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editApp('${doc.id}')" class="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100">Edit</button>
                        <button onclick="deleteApp('${doc.id}')" class="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100">Del</button>
                    </div>
                </li>`;
        });
    } catch(e) { list.innerHTML = `<li class="p-4 text-center text-red-500 text-xs">Error: ${e.message}</li>`; }
}

// Global Helpers
window.editApp = async (id) => {
    const d = await getDoc(doc(db, "apps", id));
    if(d.exists()) {
        const data = d.data();
        const t = data.techData || {};
        isEditMode = true; currentEditId = id;
        
        const setV = (i, v) => { if(document.getElementById(i)) document.getElementById(i).value = v || ''; };
        const setC = (i, v) => { if(document.getElementById(i)) document.getElementById(i).checked = v || false; };

        setV('appName', data.name); setV('packageName', data.packageName); setV('developer', data.developer);
        setV('category', data.category); setV('version', data.version); setV('size', data.size);
        setV('apkUrl', data.apkUrl); setV('iconUrl', data.iconUrl); setV('screenshots', data.screenshots);
        
        setV('t_verCode', t.verCode); setV('t_date', t.date); setV('t_minSdk', t.minSdk);
        setV('t_targetSdk', t.targetSdk); setV('t_compileSdk', t.compileSdk); setV('t_abi', t.abi);
        setV('t_devices', t.devices); setV('t_sha1', t.sha1); setV('t_sha256', t.sha256);
        setC('t_v1', t.v1); setC('t_v2', t.v2); setC('t_v3', t.v3); setC('t_v4', t.v4);

        document.getElementById('uploadBtn').innerText = "Update App";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
window.deleteApp = async (id) => { if(confirm("Delete app?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); } };
window.closeSuccessScreen = () => { document.getElementById('successScreen').classList.add('hidden'); window.resetForm(); };
window.resetForm = () => { document.getElementById('uploadForm').reset(); isEditMode=false; document.getElementById('uploadBtn').innerText="Save App"; };
window.logout = () => signOut(auth);

// ==========================================
// 4. UI: LOAD APPS & FOOTER
// ==========================================

function loadGlobalFooter() {
    const f = document.getElementById('main-footer');
    if(f) f.innerHTML = `<div class="bg-white border-t border-gray-200 pt-10 pb-6 mt-10 text-center"><p class="text-xs text-gray-400">&copy; 2025 APKVerse. All rights reserved.</p></div>`;
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
            const shots = a.screenshots ? `<div class="flex gap-2 overflow-x-auto pb-4 snap-x">${a.screenshots.split(',').map(u=>`<img src="${u}" class="h-40 rounded border snap-center">`).join('')}</div>` : '';
            c.innerHTML = `
                <div class="flex gap-4 mb-6"><img src="${a.iconUrl}" class="w-20 h-20 rounded-2xl shadow-lg bg-white"><div><h1 class="text-2xl font-bold">${a.name}</h1><p class="text-xs text-green-600 font-bold">${a.developer}</p><p class="text-xs text-gray-400">${a.packageName}</p></div></div>
                <a href="${a.apkUrl}" class="block w-full bg-green-600 text-white text-center font-bold py-3 rounded-xl shadow-lg mb-6">Download APK</a>
                ${shots ? '<h3 class="font-bold mb-2">Preview</h3>'+shots : ''}
                <div class="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 leading-relaxed">${a.description || 'No description.'}</div>`;
        }
    } catch(e) { c.innerHTML = 'Error loading app.'; }
}