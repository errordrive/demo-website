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

// Edit Mode State
let isEditMode = false;
let currentEditId = null;

window.setupAdmin = async () => {
    try { await createUserWithEmailAndPassword(auth, "admin@admin.com", "admin123"); alert("Admin Created!"); } catch (e) { alert(e.message); }
};

// ==========================================
// 1. HOME: COMPACT CARD DESIGN (Fixed Text Size)
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

    // Compact Card: Logo Top, Text Bottom, Small Text
    const card = `
        <div onclick="window.location.href='app-details.html?id=${id}'" class="group bg-white rounded-xl p-3 shadow-sm hover:shadow-md border border-gray-100 cursor-pointer h-full flex flex-col items-center text-center relative overflow-hidden transition-all duration-200">
            
            <div class="relative z-10 mb-2">
                <img src="${app.iconUrl}" 
                     onerror="this.src='${fallbackImage}'" 
                     alt="${app.name}" 
                     class="w-16 h-16 rounded-[1rem] shadow-sm object-cover bg-gray-50 border border-gray-100">
            </div>

            <div class="w-full relative z-10 flex flex-col items-center">
                <h3 class="font-bold text-gray-800 text-xs leading-tight line-clamp-2 h-8 flex items-center justify-center group-hover:text-green-600 transition-colors" title="${app.name}">
                    ${app.name}
                </h3>
                
                <div class="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-medium">
                    <span class="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">v${app.version}</span>
                    <span class="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">${app.size}</span>
                </div>
            </div>

            <div class="mt-3 w-full relative z-10">
                <button class="w-full text-[10px] font-bold text-white bg-green-600 py-1.5 rounded-lg shadow-sm group-hover:bg-green-700 transition-colors">
                    Download
                </button>
            </div>
        </div>
    `;
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
    } catch (e) {
        container.innerHTML = '<div class="text-center py-20 text-red-500 text-sm">Error loading app.</div>';
    }
}

function renderFullDetails(id, app, container) {
    let screenshotsHtml = '';
    if(app.screenshots) {
        const shots = app.screenshots.split(',');
        screenshotsHtml = `<div class="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">` + 
            shots.map(url => `<img src="${url.trim()}" class="h-56 rounded-lg shadow border bg-gray-50 object-cover">`).join('') + 
            `</div>`;
    }

    const techHtml = generateTechHtml(app.techData);

    container.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6 mb-6 items-center md:items-start border-b border-gray-100 pb-6">
            <img src="${app.iconUrl}" onerror="this.src='https://ui-avatars.com/api/?name=${app.name}'" class="w-28 h-28 rounded-3xl shadow-lg bg-white object-cover border border-gray-100">
            <div class="text-center md:text-left flex-1">
                <h1 class="text-2xl font-extrabold text-gray-900 mb-1">${app.name}</h1>
                <p class="text-xs text-green-600 font-bold mb-1 flex items-center justify-center md:justify-start gap-1">
                    ${app.developer} <i class="ph-fill ph-check-circle"></i>
                </p>
                <p class="text-[10px] text-gray-400 font-mono mb-4">${app.packageName}</p>
                <div class="flex flex-wrap justify-center md:justify-start gap-2">
                    <span class="bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-600 text-xs">v${app.version}</span>
                    <span class="bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-600 text-xs">${app.size}</span>
                    <span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold text-xs">${app.category}</span>
                </div>
            </div>
        </div>
        <a href="${app.apkUrl}" target="_blank" onclick="trackDownload('${id}')" 
           class="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-green-200 transition transform hover:-translate-y-1 mb-8">
           <i class="ph-bold ph-download-simple text-lg"></i> Download APK Now
        </a>
        ${screenshotsHtml ? `<h3 class="font-bold text-gray-900 text-base mb-3">Preview</h3>` + screenshotsHtml : ''}
        <div class="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
            <h3 class="font-bold text-gray-900 mb-2 text-sm">About this app</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line text-xs">${app.description || 'No description provided.'}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <h3 class="font-bold text-gray-900 flex items-center gap-2 text-xs"><i class="ph-fill ph-code text-blue-600"></i> Technical Information</h3>
            </div>
            <div class="p-5">${techHtml}</div>
        </div>
    `;
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
                grid.innerHTML += `
                    <div onclick="window.location.href='app-details.html?id=${doc.id}'" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-100 group">
                        <img src="${app.iconUrl}" class="w-10 h-10 rounded-lg bg-gray-100 object-cover shadow-sm">
                        <div class="min-w-0 flex-1">
                            <h4 class="font-bold text-gray-900 text-xs truncate group-hover:text-green-600">${app.name}</h4>
                            <div class="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                <span class="bg-gray-100 px-1 rounded">${app.size}</span>
                                <span>🔥 ${app.downloads || 0}</span>
                            </div>
                        </div>
                    </div>`;
                count++;
            }
        });
        if(count === 0) grid.innerHTML = '<div class="text-gray-400 text-xs text-center">No recommendations.</div>';
    } catch (e) { console.error(e); }
}

function generateTechHtml(d) {
    if(!d) return '<div class="text-gray-400 italic text-xs">No details.</div>';
    const row = (k, v) => `<div class="flex justify-between py-1.5 border-b border-gray-50 text-xs"><span class="font-bold text-gray-700">${k}</span><span class="font-mono text-gray-600 text-right">${v || '-'}</span></div>`;
    return `
        <div class="space-y-4">
            <div><div class="font-bold text-blue-800 text-[10px] uppercase mb-1">Build</div>${row('Version Code', d.verCode)}${row('Date', d.date)}${row('Compress', d.compress)}</div>
            <div><div class="font-bold text-blue-800 text-[10px] uppercase mb-1">SDK</div>${row('Min SDK', d.minSdk)}${row('Target', d.targetSdk)}${row('Compile', d.compileSdk)}</div>
            <div><div class="font-bold text-blue-800 text-[10px] uppercase mb-1">System</div><div class="text-xs text-gray-600 mb-1"><span class="font-bold">ABI:</span> ${d.abi}</div>${row('Devices', d.devices)}</div>
            <div><div class="font-bold text-blue-800 text-[10px] uppercase mb-1">Signature</div>
            <div class="flex gap-2 mb-2 text-[10px]"><span class="${d.v1?'text-green-600 font-bold':'text-gray-300'}">V1</span><span class="${d.v2?'text-green-600 font-bold':'text-gray-300'}">V2</span><span class="${d.v3?'text-green-600 font-bold':'text-gray-300'}">V3</span><span class="${d.v4?'text-green-600 font-bold':'text-gray-300'}">V4</span></div>
            <div class="text-[9px] text-gray-500 break-all font-mono bg-gray-50 p-1.5 border rounded mb-1">SHA-1: ${d.sha1 || '-'}</div>
            <div class="text-[9px] text-gray-500 break-all font-mono bg-gray-50 p-1.5 border rounded">SHA-256: ${d.sha256 || '-'}</div>
            </div>
        </div>
    `;
}

window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });

// ==========================================
// ADMIN LOGIC (Edit Fix)
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
            signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value).catch(err => alert(err.code));
        });
    }
    const uploadForm = document.getElementById('uploadForm');
    if(uploadForm) uploadForm.addEventListener('submit', handleFormSubmit);
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
        if (isEditMode && currentEditId) await updateDoc(doc(db, "apps", currentEditId), appData);
        else { appData.downloads = 0; appData.uploadedAt = serverTimestamp(); await addDoc(collection(db, "apps"), appData); }
        setTimeout(() => { document.getElementById('successScreen').classList.remove('hidden'); document.getElementById('uploadingScreen').classList.add('hidden'); loadAdminList(); }, 500);
    } catch (error) { alert("Error: " + error.message); document.getElementById('uploadingScreen').classList.add('hidden'); }
}

async function loadAdminList() {
    const list = document.getElementById('adminAppList');
    list.innerHTML = 'Loading...';
    const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
    const snapshot = await getDocs(q);
    list.innerHTML = '';
    snapshot.forEach(doc => {
        const app = doc.data();
        list.innerHTML += `<li class="p-4 bg-gray-50 rounded flex justify-between mb-2 border">
            <div class="flex items-center gap-3"><img src="${app.iconUrl}" onerror="this.src='https://via.placeholder.com/32'" class="w-10 h-10 rounded shadow object-cover"><div><div class="font-bold text-xs">${app.name}</div></div></div>
            <div class="flex gap-2"><button onclick="editApp('${doc.id}')" class="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold">Edit</button><button onclick="deleteApp('${doc.id}')" class="px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">Del</button></div></li>`;
    });
}

window.closeSuccessScreen = () => { document.getElementById('successScreen').classList.add('hidden'); document.getElementById('uploadForm').reset(); isEditMode = false; currentEditId = null; document.getElementById('uploadBtn').innerText = "Save Data"; }
window.deleteApp = async (id) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); }};

// 🔥 FIXED EDIT FUNCTION 🔥
window.editApp = async (id) => {
    const docSnap = await getDoc(doc(db, "apps", id));
    if (docSnap.exists()) {
        const data = docSnap.data();
        isEditMode = true; currentEditId = id;
        document.getElementById('appName').value = data.name; document.getElementById('packageName').value = data.packageName; document.getElementById('developer').value = data.developer; document.getElementById('category').value = data.category; document.getElementById('version').value = data.version; document.getElementById('size').value = data.size; document.getElementById('apkUrl').value = data.apkUrl; document.getElementById('iconUrl').value = data.iconUrl; document.getElementById('screenshots').value = data.screenshots || '';
        
        const t = data.techData || {};
        document.getElementById('t_verCode').value = t.verCode||''; document.getElementById('t_date').value = t.date||''; document.getElementById('t_compress').value = t.compress||'Enabled'; document.getElementById('t_minSdk').value = t.minSdk||''; document.getElementById('t_targetSdk').value = t.targetSdk||''; document.getElementById('t_compileSdk').value = t.compileSdk||''; document.getElementById('t_abi').value = t.abi||''; document.getElementById('t_devices').value = t.devices||''; document.getElementById('t_v1').checked = t.v1||false; document.getElementById('t_v2').checked = t.v2||false; document.getElementById('t_v3').checked = t.v3||false; document.getElementById('t_v4').checked = t.v4||false; document.getElementById('t_algo').value = t.algo||''; document.getElementById('t_sha1').value = t.sha1||''; document.getElementById('t_sha256').value = t.sha256||''; document.getElementById('t_issuer').value = t.issuer||''; document.getElementById('t_proguard').value = t.proguard||'Enabled'; document.getElementById('t_obfus').value = t.obfus||'Enabled'; document.getElementById('t_debug').value = t.debug||'False'; document.getElementById('t_perms').value = t.perms||'';

        document.getElementById('uploadBtn').innerText = "Update Data"; document.getElementById('dashboard').scrollIntoView();
    }
};
window.logout = () => signOut(auth);