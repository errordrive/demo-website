import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, increment, serverTimestamp, getDoc, limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// FIREBASE CONFIG
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

// GLOBAL VARIABLES
let isEditMode = false;
let currentEditId = null;

// ==========================================
// 🔥 GLOBAL INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadGlobalFooter(); 
    
    // Ads Activation
    initAds();

    if(document.getElementById('heroSlider')) initSlider();
    if(document.getElementById('appGrid')) loadApps();
    if(document.getElementById('loginScreen')) initAdmin();
});

// ==========================================
// 💸 FAKE ADS MODULE (NEW)
// ==========================================

function initAds() {
    // 1. STATIC AD (Random Position near bottom)
    const mainContent = document.querySelector('main');
    if (mainContent) {
        const adDiv = document.createElement('div');
        adDiv.className = "my-8 mx-auto max-w-4xl p-1";
        adDiv.innerHTML = `
            <div class="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition">
                <span class="absolute top-0 right-0 bg-gray-300 text-[10px] text-gray-600 px-2 py-0.5 rounded-bl">Sponsored</span>
                <div class="flex flex-col md:flex-row items-center justify-center gap-4">
                    <div class="bg-orange-500 text-white w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold"><i class="ph-bold ph-lightning"></i></div>
                    <div class="text-left">
                        <h4 class="font-bold text-gray-900 text-sm">Boost Your Download Speed!</h4>
                        <p class="text-xs text-gray-500">Get APKVerse Premium for 5x faster downloads.</p>
                    </div>
                    <button class="bg-black text-white text-xs px-4 py-2 rounded-full font-bold group-hover:bg-gray-800 transition">Learn More</button>
                </div>
            </div>
        `;

        // Randomly insert before or after the last section
        const sections = mainContent.querySelectorAll('section');
        if(sections.length > 0) {
            const randomPos = Math.floor(Math.random() * sections.length);
            mainContent.insertBefore(adDiv, sections[randomPos]);
        } else {
            mainContent.appendChild(adDiv);
        }
    }

    // 2. FLOW AD (Sticky Bottom Banner)
    // Only show on user pages (not admin)
    if (!document.getElementById('loginScreen')) {
        setTimeout(() => {
            const flowAd = document.createElement('div');
            flowAd.id = "flowAdBanner";
            flowAd.className = "fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[100] transform translate-y-full transition-transform duration-500 ease-out";
            flowAd.innerHTML = `
                <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <img src="https://ui-avatars.com/api/?name=VPN&background=0D8ABC&color=fff" class="w-10 h-10 rounded-lg shadow-sm">
                        <div>
                            <h4 class="font-bold text-gray-900 text-sm leading-tight">Secure VPN Proxy</h4>
                            <p class="text-[10px] text-gray-500">Protect your privacy while downloading.</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button class="bg-green-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow hover:bg-green-700 transition">Install</button>
                        <button onclick="document.getElementById('flowAdBanner').classList.add('translate-y-full')" class="text-gray-400 hover:text-red-500 text-xl"><i class="ph-bold ph-x-circle"></i></button>
                    </div>
                </div>
            `;
            document.body.appendChild(flowAd);
            
            // Slide Up Animation
            setTimeout(() => flowAd.classList.remove('translate-y-full'), 100);
        }, 3000); // Show after 3 seconds
    }
}

// ==========================================
// ... (Rest of the code: Slider, Footer, LoadApps, Admin - SAME AS BEFORE)
// ==========================================

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

function loadGlobalFooter() {
    const footerContainer = document.getElementById('main-footer');
    if (!footerContainer) return;
    footerContainer.innerHTML = `
        <div class="bg-white border-t border-gray-200 pt-12 pb-8 mt-12">
            <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div class="col-span-1 md:col-span-1">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-lg shadow"><i class="ph-fill ph-android-logo"></i></div>
                        <span class="text-lg font-bold">APK<span class="text-green-600">Verse</span></span>
                    </div>
                    <p class="text-xs text-gray-500 leading-relaxed mb-4">APKVerse is your trusted source for secure Android APK downloads.</p>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Discover</h4>
                    <ul class="space-y-2 text-xs text-gray-500 font-medium">
                        <li><a href="index.html" class="hover:text-green-600">Home</a></li>
                        <li><a href="#" onclick="filterCategory('Games')" class="hover:text-green-600">Games</a></li>
                        <li><a href="#" onclick="filterCategory('Social')" class="hover:text-green-600">Social</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Legal</h4>
                    <ul class="space-y-2 text-xs text-gray-500 font-medium">
                        <li><a href="legal.html?page=privacy" class="hover:text-green-600">Privacy Policy</a></li>
                        <li><a href="legal.html?page=dmca" class="hover:text-red-500">DMCA</a></li>
                        <li><a href="legal.html?page=terms" class="hover:text-green-600">Terms</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Security</h4>
                    <div class="bg-green-50 border border-green-100 p-4 rounded-xl">
                        <div class="flex items-center gap-2 mb-2 text-green-700 font-bold text-xs"><i class="ph-fill ph-shield-check text-lg"></i> Verified Safe</div>
                        <p class="text-[10px] text-green-800 leading-tight">All uploads are manually checked.</p>
                    </div>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-4 border-t border-gray-100 pt-6 text-center"><p class="text-[10px] text-gray-400">&copy; 2025 APKVerse. All rights reserved.</p></div>
        </div>`;
}

// APP LOGIC
export async function loadApps(category = 'All', searchQuery = '') {
    const grid = document.getElementById('appGrid');
    const loading = document.getElementById('loading');
    if(!grid) return;
    grid.innerHTML = '';
    loading.classList.remove('hidden');
    try {
        const q = query(collection(db, "apps"));
        const snapshot = await getDocs(q);
        loading.classList.add('hidden');
        let hasResults = false;
        snapshot.forEach((doc) => {
            const data = doc.data();
            if ((category === 'All' || data.category === category) && (searchQuery === '' || data.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
                hasResults = true; renderAppCard(doc.id, data, grid);
            }
        });
        if (!hasResults) grid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-10 text-sm">No apps found.</div>`;
    } catch (e) { console.error(e); }
}

function renderAppCard(id, app, container) {
    const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=random&size=128`;
    container.innerHTML += `
        <div onclick="window.location.href='app-details.html?id=${id}'" class="group bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col items-center text-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative z-10 mb-2 md:mb-3"><img src="${app.iconUrl}" onerror="this.src='${fallbackImage}'" alt="${app.name}" class="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl shadow-sm object-cover bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform duration-300"></div>
            <div class="w-full relative z-10 flex flex-col items-center flex-1">
                <h3 class="font-bold text-gray-800 text-xs md:text-base leading-tight line-clamp-2 h-8 md:h-10 flex items-center justify-center group-hover:text-green-600 transition-colors">${app.name}</h3>
                <div class="flex items-center gap-1 md:gap-2 mt-2 text-[9px] md:text-[10px] text-gray-500 font-medium"><span class="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">v${app.version}</span><span class="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">${app.size}</span></div>
            </div>
            <div class="mt-3 w-full relative z-10"><button class="w-full flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-white bg-green-600 py-2 md:py-2.5 rounded-lg md:rounded-xl shadow-sm group-hover:bg-green-700 transition-colors">Download</button></div>
        </div>`;
}

// DETAILS LOGIC
export async function loadAppDetails(id) {
    const container = document.getElementById('detailsContainer');
    if(!container) return; 
    try {
        const docSnap = await getDoc(doc(db, "apps", id));
        if (docSnap.exists()) {
            const app = docSnap.data();
            renderFullDetails(id, app, container);
            loadRecommendedApps(id);
        } else { container.innerHTML = '<div class="text-center py-20 text-red-500 text-sm">App not found!</div>'; }
    } catch (e) { container.innerHTML = '<div class="text-center py-20 text-red-500 text-sm">Error loading app.</div>'; }
}

function renderFullDetails(id, app, container) {
    let screenshotsHtml = '';
    if(app.screenshots && app.screenshots.trim() !== '') {
        const shots = app.screenshots.split(',');
        screenshotsHtml = `<div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-6 md:mb-8 snap-x snap-mandatory">` + shots.map(url => `<img src="${url.trim()}" class="h-48 md:h-64 rounded-lg md:rounded-xl shadow-md border bg-gray-50 object-cover snap-center shrink-0">`).join('') + `</div>`;
    }
    const techHtml = generateTechHtml(app.techData);
    container.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6 md:gap-8 mb-6 md:mb-8 items-center md:items-start border-b border-gray-100 pb-6 md:pb-8">
            <img src="${app.iconUrl}" onerror="this.src='https://ui-avatars.com/api/?name=${app.name}'" class="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2rem] shadow-lg bg-white object-cover border border-gray-100">
            <div class="text-center md:text-left flex-1"><h1 class="text-2xl md:text-4xl font-extrabold text-gray-900 mb-1 md:mb-2">${app.name}</h1><p class="text-xs md:text-base text-green-600 font-bold mb-2 flex items-center justify-center md:justify-start gap-1">${app.developer} <i class="ph-fill ph-check-circle"></i></p><p class="text-[10px] md:text-sm text-gray-400 font-mono mb-4 md:mb-6">${app.packageName}</p><div class="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3"><span class="bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-600 text-xs md:text-sm">v${app.version}</span><span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold text-xs md:text-sm">${app.category}</span></div></div>
        </div>
        <a href="${app.apkUrl}" target="_blank" onclick="trackDownload('${id}')" class="flex items-center justify-center gap-2 md:gap-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm md:text-lg py-4 md:py-5 rounded-xl md:rounded-2xl shadow-xl shadow-green-200 transition transform hover:-translate-y-1 mb-8 md:mb-10"><i class="ph-bold ph-download-simple text-lg md:text-2xl"></i> Download APK Now</a>
        ${screenshotsHtml ? `<h3 class="font-bold text-gray-900 text-lg md:text-xl mb-3 md:mb-4">Preview</h3>` + screenshotsHtml : ''}
        <div class="bg-gray-50 rounded-xl md:rounded-2xl p-5 md:p-6 border border-gray-100 mb-6 md:mb-8"><h3 class="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-lg">About this app</h3><p class="text-gray-600 leading-relaxed whitespace-pre-line text-xs md:text-base">${app.description || 'No description provided.'}</p></div>
        <div class="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden"><div class="bg-gray-50 px-5 md:px-6 py-3 md:py-4 border-b border-gray-200"><h3 class="font-bold text-gray-900 flex items-center gap-2 text-xs md:text-base"><i class="ph-fill ph-code text-blue-600"></i> Technical Information</h3></div><div class="p-5 md:p-6">${techHtml}</div></div>`;
}

function generateTechHtml(d) {
    if(!d) return '<div class="text-gray-400 italic text-xs">No details.</div>';
    const row = (k, v) => `<div class="flex justify-between py-1.5 md:py-2 border-b border-gray-50 text-xs md:text-sm"><span class="font-bold text-gray-700">${k}</span><span class="font-mono text-gray-600 text-right">${v || '-'}</span></div>`;
    return `<div class="space-y-4 md:space-y-6"><div><div class="font-bold text-blue-800 text-[10px] md:text-xs uppercase mb-1 md:mb-2">Build</div>${row('Version Code', d.verCode)}${row('Min SDK', d.minSdk)}</div></div>`;
}

async function loadRecommendedApps(currentId) {
    const grid = document.getElementById('recommendedGrid');
    if(!grid) return;
    try {
        const q = query(collection(db, "apps"), limit(6));
        const snapshot = await getDocs(q);
        grid.innerHTML = '';
        snapshot.forEach((doc) => {
            if(doc.id !== currentId) {
                const app = doc.data();
                grid.innerHTML += `<div onclick="window.location.href='app-details.html?id=${doc.id}'" class="flex items-center gap-3 p-2 md:p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-100 group"><img src="${app.iconUrl}" class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-100 object-cover shadow-sm"><div class="min-w-0 flex-1"><h4 class="font-bold text-gray-900 text-xs md:text-sm truncate group-hover:text-green-600">${app.name}</h4><div class="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 mt-0.5"><span class="bg-gray-100 px-1.5 rounded">${app.size}</span><span>🔥 ${app.downloads || 0}</span></div></div></div>`;
            }
        });
    } catch (e) { console.error(e); }
}
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });

// ADMIN & AUTH LOGIC
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
    list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm animate-pulse">Loading apps...</li>';
    try {
        const q = query(collection(db, "apps"));
        const snapshot = await getDocs(q);
        list.innerHTML = '';
        if (snapshot.empty) { list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm">No apps found.</li>'; return; }
        snapshot.forEach(doc => {
            const app = doc.data();
            list.innerHTML += `<li class="p-4 bg-white hover:bg-gray-50 flex justify-between items-center transition border-b border-gray-100 last:border-0"><div class="flex items-center gap-4"><img src="${app.iconUrl}" class="w-10 h-10 rounded-lg shadow-sm object-cover border border-gray-200"><div><div class="font-bold text-gray-800 text-sm">${app.name}</div><div class="text-xs text-gray-500 font-mono">${app.packageName}</div></div></div><div class="flex gap-2"><button onclick="editApp('${doc.id}')" class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold">Edit</button><button onclick="deleteApp('${doc.id}')" class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold">Delete</button></div></li>`;
        });
    } catch (e) { list.innerHTML = `<li class="p-6 text-center text-red-500 text-sm">Error: ${e.message}</li>`; }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('uploadingScreen').classList.remove('hidden');
    const appData = {
        name: document.getElementById('appName').value,
        packageName: document.getElementById('packageName').value,
        developer: document.getElementById('developer').value,
        category: document.getElementById('category').value,
        size: document.getElementById('size').value,
        version: document.getElementById('version').value,
        apkUrl: document.getElementById('apkUrl').value,
        iconUrl: document.getElementById('iconUrl').value,
        screenshots: document.getElementById('screenshots').value,
        techData: {
            verCode: document.getElementById('t_verCode').value,
            date: document.getElementById('t_date').value,
            minSdk: document.getElementById('t_minSdk').value,
            targetSdk: document.getElementById('t_targetSdk').value,
            compileSdk: document.getElementById('t_compileSdk').value,
            abi: document.getElementById('t_abi').value,
            devices: document.getElementById('t_devices').value,
            sha1: document.getElementById('t_sha1').value,
            sha256: document.getElementById('t_sha256').value,
            v1: document.getElementById('t_v1').checked,
            v2: document.getElementById('t_v2').checked,
            v3: document.getElementById('t_v3').checked,
            v4: document.getElementById('t_v4').checked,
            compress: document.getElementById('t_compress').value,
            algo: document.getElementById('t_algo').value,
            issuer: document.getElementById('t_issuer').value,
            proguard: document.getElementById('t_proguard').value,
            obfus: document.getElementById('t_obfus').value,
            debug: document.getElementById('t_debug').value,
            perms: document.getElementById('t_perms').value
        },
        updatedAt: serverTimestamp()
    };

    try {
        if (isEditMode && currentEditId) { await updateDoc(doc(db, "apps", currentEditId), appData); }
        else { appData.downloads = 0; appData.uploadedAt = serverTimestamp(); await addDoc(collection(db, "apps"), appData); }
        setTimeout(() => { document.getElementById('successScreen').classList.remove('hidden'); document.getElementById('uploadingScreen').classList.add('hidden'); loadAdminList(); }, 500);
    } catch (error) { alert("Error: " + error.message); document.getElementById('uploadingScreen').classList.add('hidden'); }
}

window.closeSuccessScreen = () => { document.getElementById('successScreen').classList.add('hidden'); window.resetForm(); }
window.deleteApp = async (id) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); }};
window.editApp = async (id) => {
    const docSnap = await getDoc(doc(db, "apps", id));
    if (docSnap.exists()) {
        const data = docSnap.data();
        isEditMode = true; currentEditId = id;
        document.getElementById('appName').value = data.name; document.getElementById('packageName').value = data.packageName; document.getElementById('developer').value = data.developer; document.getElementById('category').value = data.category; document.getElementById('version').value = data.version; document.getElementById('size').value = data.size; document.getElementById('apkUrl').value = data.apkUrl; document.getElementById('iconUrl').value = data.iconUrl; document.getElementById('screenshots').value = data.screenshots;
        const t = data.techData || {};
        document.getElementById('t_verCode').value = t.verCode||''; document.getElementById('t_date').value = t.date||''; document.getElementById('t_minSdk').value = t.minSdk||''; document.getElementById('t_targetSdk').value = t.targetSdk||''; document.getElementById('t_compileSdk').value = t.compileSdk||''; document.getElementById('t_abi').value = t.abi||''; document.getElementById('t_devices').value = t.devices||''; document.getElementById('t_sha1').value = t.sha1||''; document.getElementById('t_sha256').value = t.sha256||''; document.getElementById('t_v1').checked = t.v1||false; document.getElementById('t_v2').checked = t.v2||false; document.getElementById('t_v3').checked = t.v3||false; document.getElementById('t_v4').checked = t.v4||false;
        document.getElementById('uploadBtn').innerText = "Update App"; document.getElementById('formTitle').innerText = "Edit App"; window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
window.resetForm = () => { document.getElementById('uploadForm').reset(); isEditMode = false; currentEditId = null; document.getElementById('uploadBtn').innerText = "Save Data"; document.getElementById('formTitle').innerText = "Add New App"; };
window.logout = () => signOut(auth);