import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, increment, serverTimestamp, getDoc, limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// ==========================================
// 1. FIREBASE CONFIGURATION
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

// Global Variables
let isEditMode = false;
let currentEditId = null;

// ==========================================
// 2. INITIALIZATION (Entry Point)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("App Started...");
    
    // 1. Load Footer (Everywhere)
    loadGlobalFooter();

    // 2. Load Ads (Only on User Pages)
    if (!document.getElementById('loginScreen')) {
        initAds();
    }

    // 3. Page Specific Logic
    if (document.getElementById('heroSlider')) initSlider();
    if (document.getElementById('appGrid')) loadApps();
    if (document.getElementById('loginScreen')) initAdmin();
    if (document.getElementById('detailsContainer')) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if(id) loadAppDetails(id);
    }
});

// ==========================================
// 3. UI COMPONENTS (Footer, Slider, Ads)
// ==========================================

function loadGlobalFooter() {
    const footer = document.getElementById('main-footer');
    if (!footer) return;
    footer.innerHTML = `
        <div class="bg-white border-t border-gray-200 pt-12 pb-8 mt-12">
            <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div class="col-span-1 md:col-span-1">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-lg shadow"><i class="ph-fill ph-android-logo"></i></div>
                        <span class="text-lg font-bold">APK<span class="text-green-600">Verse</span></span>
                    </div>
                    <p class="text-xs text-gray-500 leading-relaxed mb-4">APKVerse is your trusted source for secure Android APK downloads. Verified, fast, and free.</p>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Discover</h4>
                    <ul class="space-y-2 text-xs text-gray-500 font-medium">
                        <li><a href="index.html" class="hover:text-green-600 transition">Home</a></li>
                        <li><a href="#" onclick="window.location.href='index.html'" class="hover:text-green-600 transition">Games</a></li>
                        <li><a href="#" onclick="window.location.href='index.html'" class="hover:text-green-600 transition">Apps</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Legal</h4>
                    <ul class="space-y-2 text-xs text-gray-500 font-medium">
                        <li><a href="legal.html?page=privacy" class="hover:text-green-600 transition">Privacy Policy</a></li>
                        <li><a href="legal.html?page=dmca" class="hover:text-red-500 transition">DMCA</a></li>
                        <li><a href="legal.html?page=terms" class="hover:text-green-600 transition">Terms</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Security</h4>
                    <div class="bg-green-50 border border-green-100 p-4 rounded-xl">
                        <div class="flex items-center gap-2 mb-2 text-green-700 font-bold text-xs"><i class="ph-fill ph-shield-check text-lg"></i> Verified Safe</div>
                        <p class="text-[10px] text-green-800 leading-tight">All uploads are manually checked for malware.</p>
                    </div>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-4 border-t border-gray-100 pt-6 text-center"><p class="text-[10px] text-gray-400">&copy; 2025 APKVerse. All rights reserved.</p></div>
        </div>`;
}

export function initSlider() {
    const track = document.getElementById('heroSlider');
    if (!track) return;
    let index = 0;
    const slides = track.children;
    const totalSlides = slides.length;
    setInterval(() => {
        index = (index + 1) % totalSlides;
        track.style.transform = `translateX(-${index * 100}%)`;
    }, 4000);
}

function initAds() {
    // 1. Static Ad
    const main = document.querySelector('main');
    if(main) {
        const adDiv = document.createElement('div');
        adDiv.className = "my-8 mx-auto max-w-4xl p-2";
        adDiv.innerHTML = `
            <div class="bg-gray-100 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold"><i class="ph-fill ph-lightning"></i></div>
                    <div><h4 class="font-bold text-gray-800 text-sm">Premium Speed</h4><p class="text-xs text-gray-500">Get 5x faster downloads.</p></div>
                </div>
                <button class="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg">Upgrade</button>
            </div>`;
        const sections = main.querySelectorAll('section');
        if(sections.length > 0) main.insertBefore(adDiv, sections[0]); else main.appendChild(adDiv);
    }

    // 2. Flow Ad (Sticky)
    setTimeout(() => {
        const flow = document.createElement('div');
        flow.id = "flowAd";
        flow.className = "fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-2xl z-50 transform translate-y-full transition-transform duration-500 p-3";
        flow.innerHTML = `
            <div class="max-w-7xl mx-auto flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=VPN&background=random" class="w-10 h-10 rounded-lg shadow-sm">
                    <div><h4 class="font-bold text-sm">Secure VPN</h4><p class="text-[10px] text-gray-500">Protect your privacy.</p></div>
                </div>
                <div class="flex gap-2">
                    <button class="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Install</button>
                    <button onclick="document.getElementById('flowAd').remove()" class="text-gray-400 text-xl"><i class="ph-bold ph-x"></i></button>
                </div>
            </div>`;
        document.body.appendChild(flow);
        setTimeout(() => flow.classList.remove('translate-y-full'), 100);
    }, 3000);
}

// ==========================================
// 4. USER SIDE: APPS & DETAILS
// ==========================================

export async function loadApps(category = 'All', searchQuery = '') {
    const grid = document.getElementById('appGrid');
    const loading = document.getElementById('loading');
    if(!grid) return;

    grid.innerHTML = '';
    loading.classList.remove('hidden');

    try {
        const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        loading.classList.add('hidden');
        
        let hasResults = false;
        snapshot.forEach((doc) => {
            const data = doc.data();
            const matchesCat = category === 'All' || data.category === category;
            const matchesSearch = searchQuery === '' || data.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (matchesCat && matchesSearch) {
                hasResults = true;
                renderAppCard(doc.id, data, grid);
            }
        });

        if (!hasResults) grid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-10 text-sm">No apps found.</div>`;
    } catch (e) {
        console.error(e);
        loading.classList.add('hidden');
        // Fallback for index error
        if(e.message.includes("index")) {
            console.warn("Index missing, loading without sort");
            const q2 = query(collection(db, "apps"));
            const snap2 = await getDocs(q2);
            snap2.forEach(d => renderAppCard(d.id, d.data(), grid));
        }
    }
}

function renderAppCard(id, app, container) {
    const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}`;
    const card = `
        <div onclick="window.location.href='app-details.html?id=${id}'" class="group bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col items-center text-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative z-10 mb-2"><img src="${app.iconUrl}" onerror="this.src='${fallbackImage}'" class="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl shadow-sm object-cover bg-gray-50 border border-gray-100"></div>
            <div class="w-full relative z-10 flex flex-col items-center flex-1">
                <h3 class="font-bold text-gray-800 text-xs md:text-base leading-tight line-clamp-2 h-8 flex items-center justify-center group-hover:text-green-600 transition-colors">${app.name}</h3>
                <div class="flex items-center gap-1 mt-2 text-[9px] md:text-[10px] text-gray-500 font-medium"><span class="bg-gray-50 px-1.5 py-0.5 rounded border">v${app.version}</span><span class="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">${app.size}</span></div>
            </div>
            <div class="mt-3 w-full relative z-10"><button class="w-full flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-white bg-green-600 py-2 rounded-lg shadow-sm group-hover:bg-green-700 transition-colors">Download</button></div>
        </div>`;
    container.innerHTML += card;
}

export async function loadAppDetails(id) {
    const container = document.getElementById('detailsContainer');
    if(!container) return;
    try {
        const docSnap = await getDoc(doc(db, "apps", id));
        if (docSnap.exists()) {
            const app = docSnap.data();
            
            // Render Details
            let shots = '';
            if(app.screenshots) {
                shots = `<div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-6 snap-x">` + app.screenshots.split(',').map(u => `<img src="${u.trim()}" class="h-48 md:h-64 rounded-lg shadow border bg-gray-50 object-cover snap-center">`).join('') + `</div>`;
            }
            
            const tech = app.techData || {};
            const techHtml = `<div class="space-y-4 text-xs"><div><span class="font-bold text-blue-800 block mb-1">BUILD</span>Ver: ${tech.verCode||'-'} • SDK: ${tech.minSdk||'-'}</div><div><span class="font-bold text-blue-800 block mb-1">SIGNATURE</span>SHA1: ${tech.sha1||'-'}</div></div>`;

            container.innerHTML = `
                <div class="flex flex-col md:flex-row gap-6 mb-6 items-center md:items-start border-b border-gray-100 pb-6">
                    <img src="${app.iconUrl}" class="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-lg border">
                    <div class="text-center md:text-left flex-1"><h1 class="text-2xl font-bold mb-1">${app.name}</h1><p class="text-green-600 font-bold text-xs mb-2">${app.developer}</p><p class="text-gray-400 text-xs font-mono mb-4">${app.packageName}</p><div class="flex justify-center md:justify-start gap-2"><span class="bg-gray-100 px-3 py-1 rounded font-bold text-xs">v${app.version}</span><span class="bg-blue-50 text-blue-600 px-3 py-1 rounded font-bold text-xs">${app.size}</span></div></div>
                </div>
                <a href="${app.apkUrl}" target="_blank" onclick="trackDownload('${id}')" class="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-4 rounded-xl shadow-lg mb-8 transition transform hover:-translate-y-1">Download APK Now</a>
                ${shots ? '<h3 class="font-bold mb-3">Preview</h3>'+shots : ''}
                <div class="bg-gray-50 rounded-xl p-5 mb-6"><h3 class="font-bold mb-2 text-sm">Description</h3><p class="text-xs text-gray-600 whitespace-pre-line leading-relaxed">${app.description || 'No description.'}</p></div>
                <div class="bg-white border rounded-xl overflow-hidden"><div class="bg-gray-50 px-5 py-3 border-b"><h3 class="font-bold text-xs">Tech Specs</h3></div><div class="p-5">${techHtml}</div></div>`;
            
            loadRecommendedApps(id);
        } else { container.innerHTML = '<div class="text-center py-20 text-red-500">App not found!</div>'; }
    } catch (e) { container.innerHTML = '<div class="text-center py-20 text-red-500">Error loading data.</div>'; }
}

async function loadRecommendedApps(currentId) {
    const grid = document.getElementById('recommendedGrid');
    if(!grid) return;
    try {
        const q = query(collection(db, "apps"), limit(6));
        const s = await getDocs(q);
        grid.innerHTML = '';
        s.forEach(d => {
            if(d.id !== currentId) {
                const a = d.data();
                grid.innerHTML += `<div onclick="window.location.href='app-details.html?id=${d.id}'" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-100"><img src="${a.iconUrl}" class="w-10 h-10 rounded-lg bg-gray-100"><div class="flex-1"><h4 class="font-bold text-xs truncate">${a.name}</h4><div class="text-[10px] text-gray-500">${a.size}</div></div></div>`;
            }
        });
    } catch(e) {}
}
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });

// ==========================================
// 5. ADMIN LOGIC (FIXED)
// ==========================================

export function initAdmin() {
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

    if(document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value).catch(err => alert(err.code));
        });
    }
    if(document.getElementById('uploadForm')) document.getElementById('uploadForm').addEventListener('submit', handleFormSubmit);
}

async function loadAdminList() {
    const list = document.getElementById('adminAppList');
    if(!list) return;
    list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm">Loading...</li>';
    try {
        const q = query(collection(db, "apps")); // Removed orderBy to be safe
        const snapshot = await getDocs(q);
        list.innerHTML = '';
        if (snapshot.empty) { list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm">No apps found.</li>'; return; }
        snapshot.forEach(doc => {
            const app = doc.data();
            list.innerHTML += `<li class="p-4 bg-white hover:bg-gray-50 flex justify-between items-center border-b last:border-0"><div class="flex items-center gap-4"><img src="${app.iconUrl}" class="w-10 h-10 rounded bg-gray-100"><div><div class="font-bold text-sm">${app.name}</div><div class="text-xs text-gray-500">${app.packageName}</div></div></div><div class="flex gap-2"><button onclick="editApp('${doc.id}')" class="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold">Edit</button><button onclick="deleteApp('${doc.id}')" class="px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">Del</button></div></li>`;
        });
    } catch (e) { list.innerHTML = `<li class="p-6 text-center text-red-500 text-sm">Error: ${e.message}</li>`; }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('uploadingScreen').classList.remove('hidden');
    const fd = (id) => document.getElementById(id).value;
    const fc = (id) => document.getElementById(id).checked;
    
    const appData = {
        name: fd('appName'), packageName: fd('packageName'), developer: fd('developer'), category: fd('category'),
        size: fd('size'), version: fd('version'), apkUrl: fd('apkUrl'), iconUrl: fd('iconUrl'),
        screenshots: fd('screenshots'), description: "", // Add desc field in admin if needed
        techData: {
            verCode: fd('t_verCode'), date: fd('t_date'), compress: fd('t_compress'),
            minSdk: fd('t_minSdk'), targetSdk: fd('t_targetSdk'), compileSdk: fd('t_compileSdk'),
            abi: fd('t_abi'), devices: fd('t_devices'), sha1: fd('t_sha1'), sha256: fd('t_sha256'),
            algo: fd('t_algo'), issuer: fd('t_issuer'), proguard: fd('t_proguard'), obfus: fd('t_obfus'),
            debug: fd('t_debug'), perms: fd('t_perms'),
            v1: fc('t_v1'), v2: fc('t_v2'), v3: fc('t_v3'), v4: fc('t_v4')
        },
        updatedAt: serverTimestamp()
    };

    try {
        if (isEditMode && currentEditId) { await updateDoc(doc(db, "apps", currentEditId), appData); }
        else { appData.downloads = 0; appData.uploadedAt = serverTimestamp(); await addDoc(collection(db, "apps"), appData); }
        setTimeout(() => { document.getElementById('successScreen').classList.remove('hidden'); document.getElementById('uploadingScreen').classList.add('hidden'); loadAdminList(); }, 500);
    } catch (error) { alert(error.message); document.getElementById('uploadingScreen').classList.add('hidden'); }
}

window.closeSuccessScreen = () => { document.getElementById('successScreen').classList.add('hidden'); window.resetForm(); }
window.deleteApp = async (id) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); }};
window.editApp = async (id) => {
    const docSnap = await getDoc(doc(db, "apps", id));
    if (docSnap.exists()) {
        const d = docSnap.data();
        const t = d.techData || {};
        isEditMode = true; currentEditId = id;
        const setVal = (eid, val) => { if(document.getElementById(eid)) document.getElementById(eid).value = val || ''; }
        const setChk = (eid, val) => { if(document.getElementById(eid)) document.getElementById(eid).checked = val || false; }

        setVal('appName', d.name); setVal('packageName', d.packageName); setVal('developer', d.developer);
        setVal('category', d.category); setVal('version', d.version); setVal('size', d.size);
        setVal('apkUrl', d.apkUrl); setVal('iconUrl', d.iconUrl); setVal('screenshots', d.screenshots);
        
        setVal('t_verCode', t.verCode); setVal('t_date', t.date); setVal('t_minSdk', t.minSdk);
        setVal('t_targetSdk', t.targetSdk); setVal('t_compileSdk', t.compileSdk); setVal('t_abi', t.abi);
        setVal('t_devices', t.devices); setVal('t_sha1', t.sha1); setVal('t_sha256', t.sha256);
        setChk('t_v1', t.v1); setChk('t_v2', t.v2); setChk('t_v3', t.v3); setChk('t_v4', t.v4);

        document.getElementById('uploadBtn').innerText = "Update App"; 
        document.getElementById('formTitle').innerText = "Editing App";
        document.getElementById('dashboard').scrollIntoView({behavior: 'smooth'});
    }
};
window.resetForm = () => { document.getElementById('uploadForm').reset(); isEditMode = false; currentEditId = null; document.getElementById('uploadBtn').innerText = "Save Data"; };
window.logout = () => signOut(auth);