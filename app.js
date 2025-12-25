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
// 🔥 GLOBAL INITIALIZATION (Footer & Apps)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadGlobalFooter(); // Load footer on ALL pages
    
    // Load apps only if on homepage
    if(document.getElementById('appGrid')) {
        loadApps();
    }
    
    // Load admin if on admin page
    if(document.getElementById('loginScreen')) {
        initAdmin();
    }
});

// 🔥 DYNAMIC FOOTER SYSTEM 🔥
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
                    <p class="text-xs text-gray-500 leading-relaxed mb-4">
                        APKVerse is your #1 destination for safe, secure, and verified Android APKs. We ensure a seamless download experience without the hassle.
                    </p>
                    <div class="flex gap-3">
                        <a href="#" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition"><i class="ph-fill ph-facebook-logo"></i></a>
                        <a href="#" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-sky-500 hover:text-white transition"><i class="ph-fill ph-telegram-logo"></i></a>
                        <a href="#" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition"><i class="ph-fill ph-x-logo"></i></a>
                    </div>
                </div>

                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Discover</h4>
                    <ul class="space-y-2 text-xs text-gray-500 font-medium">
                        <li><a href="index.html" class="hover:text-green-600 transition">Home</a></li>
                        <li><a href="index.html" onclick="filterCategory('Games')" class="hover:text-green-600 transition">Popular Games</a></li>
                        <li><a href="index.html" onclick="filterCategory('Social')" class="hover:text-green-600 transition">Social Apps</a></li>
                        <li><a href="index.html" onclick="filterCategory('Tools')" class="hover:text-green-600 transition">Productivity Tools</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Legal & Support</h4>
                    <ul class="space-y-2 text-xs text-gray-500 font-medium">
                        <li><a href="legal.html?page=about" class="hover:text-green-600 transition">About Us</a></li>
                        <li><a href="legal.html?page=contact" class="hover:text-green-600 transition">Contact Us</a></li>
                        <li><a href="legal.html?page=privacy" class="hover:text-green-600 transition">Privacy Policy</a></li>
                        <li><a href="legal.html?page=dmca" class="hover:text-red-500 transition">DMCA Disclaimer</a></li>
                        <li><a href="legal.html?page=terms" class="hover:text-green-600 transition">Terms of Service</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">Safety First</h4>
                    <div class="bg-green-50 border border-green-100 p-4 rounded-xl">
                        <div class="flex items-center gap-2 mb-2 text-green-700 font-bold text-xs">
                            <i class="ph-fill ph-shield-check text-lg"></i> 100% Secure
                        </div>
                        <p class="text-[10px] text-green-800 leading-tight">
                            Every APK file is scanned for viruses and malware before being listed. Your security is our priority.
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="max-w-7xl mx-auto px-4 border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-[10px] text-gray-400">&copy; 2025 APKVerse. All rights reserved.</p>
                <p class="text-[10px] text-gray-300">Android is a trademark of Google LLC.</p>
            </div>
        </div>
    `;
}

// ==========================================
// 1. HOME PAGE LOGIC
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
            const matchesCategory = category === 'All' || data.category === category;
            const matchesSearch = searchQuery === '' || data.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (matchesCategory && matchesSearch) {
                hasResults = true;
                renderAppCard(doc.id, data, grid);
            }
        });

        if (!hasResults) grid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-10 text-sm">No apps found.</div>`;
    } catch (e) { console.error(e); }
}

function renderAppCard(id, app, container) {
    const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=random&size=128`;
    const card = `
        <div onclick="window.location.href='app-details.html?id=${id}'" class="group bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col items-center text-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative z-10 mb-2 md:mb-3">
                <img src="${app.iconUrl}" onerror="this.src='${fallbackImage}'" alt="${app.name}" class="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl shadow-sm object-cover bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform duration-300">
            </div>
            <div class="w-full relative z-10 flex flex-col items-center flex-1">
                <h3 class="font-bold text-gray-800 text-xs md:text-base leading-tight line-clamp-2 h-8 md:h-10 flex items-center justify-center group-hover:text-green-600 transition-colors">${app.name}</h3>
                <p class="hidden md:block text-[10px] text-gray-400 mt-1 truncate w-full">${app.developer || 'Unknown'}</p>
                <div class="flex items-center gap-1 md:gap-2 mt-2 text-[9px] md:text-[10px] text-gray-500 font-medium">
                    <span class="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">v${app.version}</span>
                    <span class="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">${app.size}</span>
                </div>
            </div>
            <div class="mt-3 w-full relative z-10">
                <button class="w-full flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-white bg-green-600 py-2 md:py-2.5 rounded-lg md:rounded-xl shadow-sm group-hover:bg-green-700 transition-colors">Download</button>
            </div>
        </div>`;
    container.innerHTML += card;
}

// ==========================================
// 2. DETAILS PAGE LOGIC
// ==========================================

export async function loadAppDetails(id) {
    const container = document.getElementById('detailsContainer');
    if(!container) return; 
    try {
        const docSnap = await getDoc(doc(db, "apps", id));
        if (docSnap.exists()) {
            const app = docSnap.data();
            renderFullDetails(id, app, container);
            loadRecommendedApps(id);
        } else {
            container.innerHTML = '<div class="text-center py-20 text-red-500 text-sm">App not found!</div>';
        }
    } catch (e) { container.innerHTML = '<div class="text-center py-20 text-red-500 text-sm">Error loading app.</div>'; }
}

function renderFullDetails(id, app, container) {
    let screenshotsHtml = '';
    if(app.screenshots && app.screenshots.trim() !== '') {
        const shots = app.screenshots.split(',').filter(url => url.trim().length > 0);
        if(shots.length > 0) {
            screenshotsHtml = `<div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-6 md:mb-8 snap-x snap-mandatory">` + 
                shots.map(url => `<img src="${url.trim()}" onerror="this.style.display='none'" class="h-48 md:h-64 rounded-lg md:rounded-xl shadow-md border bg-gray-50 object-cover snap-center shrink-0">`).join('') + `</div>`;
        }
    }
    const techHtml = generateTechHtml(app.techData);
    const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=random&size=128`;

    container.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6 md:gap-8 mb-6 md:mb-8 items-center md:items-start border-b border-gray-100 pb-6 md:pb-8">
            <img src="${app.iconUrl}" onerror="this.src='${fallbackImage}'" class="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2rem] shadow-lg bg-white object-cover border border-gray-100">
            <div class="text-center md:text-left flex-1">
                <h1 class="text-2xl md:text-4xl font-extrabold text-gray-900 mb-1 md:mb-2">${app.name}</h1>
                <p class="text-xs md:text-base text-green-600 font-bold mb-2 flex items-center justify-center md:justify-start gap-1">${app.developer} <i class="ph-fill ph-check-circle"></i></p>
                <p class="text-[10px] md:text-sm text-gray-400 font-mono mb-4 md:mb-6">${app.packageName}</p>
                <div class="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                    <span class="bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-600 text-xs md:text-sm">v${app.version}</span>
                    <span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold text-xs md:text-sm">${app.category}</span>
                </div>
            </div>
        </div>
        <a href="${app.apkUrl}" target="_blank" onclick="trackDownload('${id}')" class="flex items-center justify-center gap-2 md:gap-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm md:text-lg py-4 md:py-5 rounded-xl md:rounded-2xl shadow-xl shadow-green-200 transition transform hover:-translate-y-1 mb-8 md:mb-10"><i class="ph-bold ph-download-simple text-lg md:text-2xl"></i> Download APK Now</a>
        ${screenshotsHtml ? `<h3 class="font-bold text-gray-900 text-lg md:text-xl mb-3 md:mb-4">Preview</h3>` + screenshotsHtml : ''}
        <div class="bg-gray-50 rounded-xl md:rounded-2xl p-5 md:p-6 border border-gray-100 mb-6 md:mb-8">
            <h3 class="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-lg">About this app</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line text-xs md:text-base">${app.description || 'No description provided.'}</p>
        </div>
        <div class="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden"><div class="bg-gray-50 px-5 md:px-6 py-3 md:py-4 border-b border-gray-200"><h3 class="font-bold text-gray-900 flex items-center gap-2 text-xs md:text-base"><i class="ph-fill ph-code text-blue-600"></i> Technical Information</h3></div><div class="p-5 md:p-6">${techHtml}</div></div>`;
}

function generateTechHtml(d) {
    if(!d) return '<div class="text-gray-400 italic text-xs">No details.</div>';
    const row = (k, v) => `<div class="flex justify-between py-1.5 md:py-2 border-b border-gray-50 text-xs md:text-sm"><span class="font-bold text-gray-700">${k}</span><span class="font-mono text-gray-600 text-right">${v || '-'}</span></div>`;
    return `<div class="space-y-4 md:space-y-6"><div><div class="font-bold text-blue-800 text-[10px] md:text-xs uppercase mb-1 md:mb-2">Build</div>${row('Version Code', d.verCode)}${row('Min SDK', d.minSdk)}${row('Target SDK', d.targetSdk)}</div><div><div class="font-bold text-blue-800 text-[10px] md:text-xs uppercase mb-1 md:mb-2">Signature</div><div class="text-[9px] md:text-[10px] text-gray-500 break-all font-mono bg-gray-50 p-1.5 md:p-2 border rounded mb-1">SHA-1: ${d.sha1 || '-'}</div><div class="text-[9px] md:text-[10px] text-gray-500 break-all font-mono bg-gray-50 p-1.5 md:p-2 border rounded">SHA-256: ${d.sha256 || '-'}</div></div></div>`;
}

async function loadRecommendedApps(currentId) {
    const grid = document.getElementById('recommendedGrid');
    if(!grid) return;
    try {
        const q = query(collection(db, "apps"), orderBy("downloads", "desc"), limit(6));
        const snapshot = await getDocs(q);
        grid.innerHTML = '';
        let count = 0;
        snapshot.forEach((doc) => {
            if(doc.id !== currentId && count < 5) {
                const app = doc.data();
                grid.innerHTML += `<div onclick="window.location.href='app-details.html?id=${doc.id}'" class="flex items-center gap-3 p-2 md:p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-100 group"><img src="${app.iconUrl}" class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-100 object-cover shadow-sm"><div class="min-w-0 flex-1"><h4 class="font-bold text-gray-900 text-xs md:text-sm truncate group-hover:text-green-600 transition">${app.name}</h4><div class="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 mt-0.5"><span class="bg-gray-100 px-1.5 rounded">${app.size}</span><span>🔥 ${app.downloads || 0}</span></div></div></div>`;
                count++;
            }
        });
        if(count === 0) grid.innerHTML = '<div class="text-gray-400 text-xs text-center">No recommendations.</div>';
    } catch (e) { console.error(e); }
}
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });

// ==========================================
// 3. ADMIN LOGIC
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

    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value).catch(err => alert("Login Failed: " + err.code));
        });
    }
    const uploadForm = document.getElementById('uploadForm');
    if(uploadForm) uploadForm.addEventListener('submit', handleFormSubmit);
}

async function loadAdminList() {
    const list = document.getElementById('adminAppList');
    if(!list) return;
    list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm animate-pulse">Loading apps...</li>';
    try {
        const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        list.innerHTML = '';
        if (snapshot.empty) { list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm">No apps found.</li>'; return; }
        snapshot.forEach(doc => {
            const app = doc.data();
            list.innerHTML += `<li class="p-4 bg-white hover:bg-gray-50 flex justify-between items-center transition border-b border-gray-100 last:border-0"><div class="flex items-center gap-4"><img src="${app.iconUrl}" onerror="this.src='https://via.placeholder.com/40'" class="w-10 h-10 rounded-lg shadow-sm object-cover border border-gray-200 bg-gray-50"><div><div class="font-bold text-gray-800 text-sm">${app.name}</div><div class="text-xs text-gray-500 font-mono">${app.packageName}</div></div></div><div class="flex gap-2"><button onclick="editApp('${doc.id}')" class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition">Edit</button><button onclick="deleteApp('${doc.id}')" class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition">Delete</button></div></li>`;
        });
    } catch (error) { list.innerHTML = `<li class="p-6 text-center text-red-500 text-sm">Error: ${error.message}</li>`; }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('uploadingScreen').classList.remove('hidden');
    
    const techData = {
        verCode: document.getElementById('t_verCode').value,
        date: document.getElementById('t_date').value,
        compress: document.getElementById('t_compress').value,
        minSdk: document.getElementById('t_minSdk').value,
        targetSdk: document.getElementById('t_targetSdk').value,
        compileSdk: document.getElementById('t_compileSdk').value,
        abi: document.getElementById('t_abi').value,
        devices: document.getElementById('t_devices').value,
        v1: document.getElementById('t_v1').checked,
        v2: document.getElementById('t_v2').checked,
        v3: document.getElementById('t_v3').checked,
        v4: document.getElementById('t_v4').checked,
        algo: document.getElementById('t_algo').value,
        sha1: document.getElementById('t_sha1').value,
        sha256: document.getElementById('t_sha256').value,
        issuer: document.getElementById('t_issuer').value,
        proguard: document.getElementById('t_proguard').value,
        obfus: document.getElementById('t_obfus').value,
        debug: document.getElementById('t_debug').value,
        perms: document.getElementById('t_perms').value
    };

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
        techData: techData,
        updatedAt: serverTimestamp()
    };

    try {
        if (isEditMode && currentEditId) { await updateDoc(doc(db, "apps", currentEditId), appData); }
        else { appData.downloads = 0; appData.uploadedAt = serverTimestamp(); await addDoc(collection(db, "apps"), appData); }
        setTimeout(() => { document.getElementById('successScreen').classList.remove('hidden'); document.getElementById('uploadingScreen').classList.add('hidden'); loadAdminList(); }, 500);
    } catch (error) { alert("Error: " + error.message); document.getElementById('uploadingScreen').classList.add('hidden'); }
}

// Global scope
window.closeSuccessScreen = () => { document.getElementById('successScreen').classList.add('hidden'); window.resetForm(); }
window.deleteApp = async (id) => { if(confirm("Delete this app?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); }};
window.editApp = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "apps", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            isEditMode = true; currentEditId = id;
            document.getElementById('appName').value = data.name||''; document.getElementById('packageName').value = data.packageName||''; document.getElementById('developer').value = data.developer||''; document.getElementById('category').value = data.category||''; document.getElementById('version').value = data.version||''; document.getElementById('size').value = data.size||''; document.getElementById('apkUrl').value = data.apkUrl||''; document.getElementById('iconUrl').value = data.iconUrl||''; document.getElementById('screenshots').value = data.screenshots||'';
            const t = data.techData || {};
            document.getElementById('t_verCode').value = t.verCode||''; document.getElementById('t_date').value = t.date||''; document.getElementById('t_compress').value = t.compress||'Enabled'; document.getElementById('t_minSdk').value = t.minSdk||''; document.getElementById('t_targetSdk').value = t.targetSdk||''; document.getElementById('t_compileSdk').value = t.compileSdk||''; document.getElementById('t_abi').value = t.abi||''; document.getElementById('t_devices').value = t.devices||''; document.getElementById('t_v1').checked = t.v1||false; document.getElementById('t_v2').checked = t.v2||false; document.getElementById('t_v3').checked = t.v3||false; document.getElementById('t_v4').checked = t.v4||false; document.getElementById('t_algo').value = t.algo||''; document.getElementById('t_sha1').value = t.sha1||''; document.getElementById('t_sha256').value = t.sha256||''; document.getElementById('t_issuer').value = t.issuer||''; document.getElementById('t_proguard').value = t.proguard||'Enabled'; document.getElementById('t_obfus').value = t.obfus||'Enabled'; document.getElementById('t_debug').value = t.debug||'False'; document.getElementById('t_perms').value = t.perms||'';
            document.getElementById('uploadBtn').innerText = "Update App"; document.getElementById('formTitle').innerHTML = `<i class="ph-bold ph-pencil-simple text-blue-600"></i> Edit App`; window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch(e) { alert(e.message); }
};
window.resetForm = () => { document.getElementById('uploadForm').reset(); isEditMode = false; currentEditId = null; document.getElementById('uploadBtn').innerText = "Save Data"; document.getElementById('formTitle').innerText = "Add New App"; };
window.logout = () => signOut(auth);
window.setupAdmin = async () => { try { await createUserWithEmailAndPassword(auth, "admin@admin.com", "admin123"); alert("Admin Created!"); } catch (e) { alert(e.message); } };