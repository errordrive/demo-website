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

// INIT
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalFooter();
    if(!document.getElementById('loginScreen')) initAds(); // Load ads on user pages
    
    if(document.getElementById('heroSlider')) initSlider();
    if(document.getElementById('appGrid')) loadApps();
    if(document.getElementById('loginScreen')) initAdmin();
    if(document.getElementById('detailsContainer')) {
        const id = new URLSearchParams(window.location.search).get('id');
        if(id) loadAppDetails(id);
    }
});

// ==========================================
// 1. HERO SLIDER LOGIC (Dynamic & Touch)
// ==========================================

export async function initSlider() {
    const track = document.getElementById('heroSlider');
    const dotsContainer = document.getElementById('sliderDots');
    if (!track) return;

    try {
        // Fetch Slides from DB
        const q = query(collection(db, "slides"), orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        
        track.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        let slidesData = [];
        if (snapshot.empty) {
            // Default Slide
            slidesData.push({ img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070', link: '#' });
        } else {
            snapshot.forEach(doc => slidesData.push(doc.data()));
        }

        // Render Slides
        slidesData.forEach((s, i) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.onclick = () => { if(s.link && s.link !== '#') window.location.href = s.link; };
            slide.innerHTML = `<img src="${s.img}" class="cursor-pointer">`;
            track.appendChild(slide);

            const dot = document.createElement('div');
            dot.className = `w-2 h-2 rounded-full bg-white/50 transition ${i===0?'bg-white w-4':''}`;
            dotsContainer.appendChild(dot);
        });

        // Slider Animation
        let index = 0;
        const total = slidesData.length;
        const updateSlide = () => {
            track.style.transform = `translateX(-${index * 100}%)`;
            Array.from(dotsContainer.children).forEach((d, i) => {
                d.className = `w-2 h-2 rounded-full bg-white/50 transition ${i===index?'bg-white w-4':''}`;
            });
        };

        // Auto Play
        let interval = setInterval(() => { index = (index + 1) % total; updateSlide(); }, 4000);

        // Touch Swipe Support
        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            clearInterval(interval); // Pause auto play on touch
        });

        track.addEventListener('touchmove', (e) => {
            if(!isDragging) return;
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            // Prevent scrolling page while swiping slider
            if(Math.abs(diff) > 10) e.preventDefault(); 
        });

        track.addEventListener('touchend', (e) => {
            isDragging = false;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (diff > 50) { // Swipe Left
                index = (index + 1) % total;
            } else if (diff < -50) { // Swipe Right
                index = (index - 1 + total) % total;
            }
            updateSlide();
            interval = setInterval(() => { index = (index + 1) % total; updateSlide(); }, 4000); // Resume
        });

    } catch (e) { console.error("Slider error:", e); }
}

// ==========================================
// 2. ADS LOGIC (Reappearing Banner)
// ==========================================

function initAds() {
    // 1. Static Ad (Random Insert)
    const main = document.querySelector('main');
    if(main) {
        const adDiv = document.createElement('div');
        adDiv.className = "my-8 mx-auto max-w-4xl p-2";
        adDiv.innerHTML = `<div class="bg-gray-100 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"><div class="flex items-center gap-4"><div class="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold"><i class="ph-fill ph-lightning"></i></div><div><h4 class="font-bold text-gray-800 text-sm">Boost Speed</h4><p class="text-xs text-gray-500">Get premium download speeds.</p></div></div><button class="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg">Check Now</button></div>`;
        const sections = main.querySelectorAll('section');
        if(sections.length > 0) main.insertBefore(adDiv, sections[0]); else main.appendChild(adDiv);
    }

    // 2. Flow Ad (Sticky & Reappearing)
    showFlowAd();
}

function showFlowAd() {
    if(document.getElementById('flowAd')) return; // Already exists

    const flow = document.createElement('div');
    flow.id = "flowAd";
    flow.className = "fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.15)] z-[100] transform translate-y-full transition-transform duration-500 p-3";
    flow.innerHTML = `
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="https://ui-avatars.com/api/?name=VPN&background=000&color=fff" class="w-10 h-10 rounded-lg shadow-sm">
                <div><h4 class="font-bold text-sm text-gray-800">Secure VPN</h4><p class="text-[10px] text-gray-500">Protect your privacy now.</p></div>
            </div>
            <div class="flex gap-2">
                <button class="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm">Install</button>
                <button id="closeAdBtn" class="text-gray-400 text-xl hover:text-red-500"><i class="ph-bold ph-x-circle"></i></button>
            </div>
        </div>`;
    document.body.appendChild(flow);
    
    setTimeout(() => flow.classList.remove('translate-y-full'), 1000); // Slide up after 1s

    // Reappear Logic
    document.getElementById('closeAdBtn').addEventListener('click', () => {
        flow.classList.add('translate-y-full'); // Hide
        setTimeout(() => {
            flow.remove(); // Remove DOM
            setTimeout(showFlowAd, 30000); // Re-create after 30s
        }, 500);
    });
}

// ==========================================
// 3. ADMIN LOGIC (With Slider Manager)
// ==========================================

export function initAdmin() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            loadAdminList();
            loadSlideList(); // Load slides
        } else {
            document.getElementById('loginScreen').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');
        }
    });

    if(document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value).catch(err => alert(err.code));
        });
    }
    if(document.getElementById('uploadForm')) document.getElementById('uploadForm').addEventListener('submit', handleFormSubmit);
    if(document.getElementById('sliderForm')) document.getElementById('sliderForm').addEventListener('submit', handleSlideSubmit);
}

// Slider Admin Functions
async function handleSlideSubmit(e) {
    e.preventDefault();
    const img = document.getElementById('slideImg').value;
    const link = document.getElementById('slideLink').value;
    if(!img) return;

    try {
        await addDoc(collection(db, "slides"), { img, link, uploadedAt: serverTimestamp() });
        document.getElementById('sliderForm').reset();
        loadSlideList();
        alert("Slide Added!");
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
                <li class="flex items-center justify-between bg-gray-50 p-2 rounded border">
                    <img src="${s.img}" class="w-10 h-6 object-cover rounded">
                    <button onclick="deleteSlide('${doc.id}')" class="text-red-500 text-xs font-bold hover:underline">Del</button>
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

// ... (Rest of Admin App List & Edit Logic - SAME AS BEFORE) ...
async function handleFormSubmit(e) { /* Copy from previous response */ e.preventDefault(); document.getElementById('uploadingScreen').classList.remove('hidden'); const appData = { name: document.getElementById('appName').value, packageName: document.getElementById('packageName').value, developer: document.getElementById('developer').value, category: document.getElementById('category').value, size: document.getElementById('size').value, version: document.getElementById('version').value, apkUrl: document.getElementById('apkUrl').value, iconUrl: document.getElementById('iconUrl').value, screenshots: "", techData: { verCode: '', date: '', minSdk: '', targetSdk: '', compileSdk: '', abi: '', devices: '', sha1: '', sha256: '', v1: false, v2: false, v3: false, v4: false, compress: 'Enabled', algo: '', issuer: '', proguard: 'Enabled', obfus: 'Enabled', debug: 'False', perms: '' }, updatedAt: serverTimestamp() }; try { if (isEditMode && currentEditId) { await updateDoc(doc(db, "apps", currentEditId), appData); } else { appData.downloads = 0; appData.uploadedAt = serverTimestamp(); await addDoc(collection(db, "apps"), appData); } setTimeout(() => { document.getElementById('successScreen').classList.remove('hidden'); document.getElementById('uploadingScreen').classList.add('hidden'); loadAdminList(); }, 500); } catch (error) { alert("Error: " + error.message); document.getElementById('uploadingScreen').classList.add('hidden'); } }
async function loadAdminList() { const list = document.getElementById('adminAppList'); if(!list) return; list.innerHTML = 'Loading...'; try { const q = query(collection(db, "apps")); const s = await getDocs(q); list.innerHTML = ''; s.forEach(doc => { const a = doc.data(); list.innerHTML += `<li class="p-4 bg-white border-b flex justify-between items-center"><div class="flex gap-3"><img src="${a.iconUrl}" class="w-8 h-8 rounded"><div><div class="font-bold text-sm">${a.name}</div></div></div><div class="flex gap-2"><button onclick="editApp('${doc.id}')" class="text-blue-600 text-xs font-bold">Edit</button><button onclick="deleteApp('${doc.id}')" class="text-red-600 text-xs font-bold">Del</button></div></li>`; }); } catch(e){} }
window.closeSuccessScreen = () => { document.getElementById('successScreen').classList.add('hidden'); window.resetForm(); }
window.deleteApp = async (id) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); }};
window.editApp = async (id) => { const d = await getDoc(doc(db, "apps", id)); if (d.exists()) { const data = d.data(); isEditMode = true; currentEditId = id; document.getElementById('appName').value = data.name; document.getElementById('packageName').value = data.packageName; document.getElementById('developer').value = data.developer; document.getElementById('category').value = data.category; document.getElementById('version').value = data.version; document.getElementById('size').value = data.size; document.getElementById('apkUrl').value = data.apkUrl; document.getElementById('iconUrl').value = data.iconUrl; document.getElementById('uploadBtn').innerText = "Update"; } };
window.resetForm = () => { document.getElementById('uploadForm').reset(); isEditMode = false; document.getElementById('uploadBtn').innerText = "Save"; };
window.logout = () => signOut(auth);

// ... (LoadApps, RenderCard, LoadDetails - SAME AS BEFORE) ...
function loadGlobalFooter() { /* ...Same as previous... */ }
export async function loadApps(category='All', searchQuery='') { /* ...Same as previous... */ }
function renderAppCard(id, app, container) { /* ...Same as previous... */ }
export async function loadAppDetails(id) { /* ...Same as previous... */ }
function renderFullDetails(id, app, container) { /* ...Same as previous... */ }
function generateTechHtml(d) { /* ...Same as previous... */ }
async function loadRecommendedApps(currentId) { /* ...Same as previous... */ }
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });