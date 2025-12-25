import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, increment, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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

window.setupAdmin = async () => {
    try { await createUserWithEmailAndPassword(auth, "admin@admin.com", "admin123"); alert("Admin Created!"); } catch (e) { alert(e.message); }
};

// ==========================================
// USER: DISPLAY LOGIC
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

        if (!hasResults) grid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-10">No apps found.</div>`;
    } catch (e) { console.error(e); }
}

function renderAppCard(id, app, container) {
    const card = `
        <div onclick="openAppModal('${id}')" class="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all p-4 border border-gray-100 cursor-pointer group flex flex-col h-full">
            <div class="flex gap-4 mb-3">
                <img src="${app.iconUrl}" onerror="this.src='https://via.placeholder.com/64'" class="w-16 h-16 rounded-2xl object-cover bg-gray-50 shadow-inner">
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-900 truncate text-lg">${app.name}</h3>
                    <p class="text-[10px] text-gray-400 font-mono truncate">${app.developer || 'Dev'}</p>
                    <span class="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded mt-1 inline-block">${app.category}</span>
                </div>
            </div>
            <div class="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                <span>${app.size}</span>
                <span class="text-green-600 font-bold">Download</span>
            </div>
        </div>
    `;
    container.innerHTML += card;
}

// GENERATE OLD STYLE HTML FROM DATA OBJECT
function generateTechHtml(d) {
    if(!d) return '<div class="text-gray-400 italic">No details.</div>';
    
    // Helper for rows
    const row = (k, v) => `<div class="flex justify-between py-1 border-b border-gray-50 text-xs"><span class="font-bold text-gray-800">${k}:</span><span class="font-mono text-gray-600 text-right">${v || '-'}</span></div>`;
    
    return `
        <div class="space-y-4">
            <div>
                <div class="font-bold text-blue-800 text-xs uppercase mb-1">Build Info</div>
                ${row('Version Code', d.verCode)}
                ${row('Release Date', d.date)}
                ${row('Build Type', d.buildType)}
                ${row('Build System', d.buildSys)}
                ${row('Compression', d.compress)}
            </div>
            
            <div>
                <div class="font-bold text-blue-800 text-xs uppercase mb-1">Android Environment</div>
                ${row('Min SDK', d.minSdk)}
                ${row('Target SDK', d.targetSdk)}
                ${row('Compile SDK', d.compileSdk)}
            </div>

            <div>
                <div class="font-bold text-blue-800 text-xs uppercase mb-1">Architecture & Screen</div>
                <div class="text-xs text-gray-600 mb-1"><span class="font-bold">ABI:</span> ${d.abi}</div>
                <div class="text-xs text-gray-600 mb-1"><span class="font-bold">DPI:</span> ${d.dpi}</div>
                ${row('Devices', d.devices)}
            </div>

            <div>
                <div class="font-bold text-blue-800 text-xs uppercase mb-1">Signature</div>
                ${row('Scheme V1', d.v1 ? 'Yes' : 'No')}
                ${row('Scheme V2', d.v2 ? 'Yes' : 'No')}
                ${row('Scheme V3', d.v3 ? 'Yes' : 'No')}
                <div class="mt-1 text-[10px] text-gray-500 break-all font-mono bg-gray-50 p-1 border rounded">
                    SHA-256: ${d.sha || 'N/A'}
                </div>
            </div>

            <div>
                <div class="font-bold text-blue-800 text-xs uppercase mb-1">Security & Permissions</div>
                ${row('ProGuard', d.proguard)}
                ${row('Debuggable', d.debug)}
                <div class="mt-2 text-xs text-gray-600">
                    <span class="font-bold">Permissions:</span>
                    <p class="font-mono text-[10px] mt-1">${d.perms || 'None'}</p>
                </div>
            </div>
        </div>
    `;
}

window.openAppModal = async (id) => {
    const modal = document.getElementById('appModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');
    content.innerHTML = '<div class="text-center py-20"><i class="ph ph-spinner animate-spin text-4xl text-green-600"></i></div>';

    const docSnap = await getDoc(doc(db, "apps", id));
    if (docSnap.exists()) {
        const app = docSnap.data();
        
        let screenshotsHtml = '';
        if(app.screenshots) {
            const shots = app.screenshots.split(',');
            screenshotsHtml = `<div class="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">` + shots.map(url => `<img src="${url.trim()}" class="h-48 rounded-lg shadow-sm border bg-gray-50">`).join('') + `</div>`;
        }

        const techHtml = generateTechHtml(app.techData);

        content.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6 mb-6">
                <img src="${app.iconUrl}" onerror="this.src='https://via.placeholder.com/100'" class="w-24 h-24 rounded-3xl shadow-md bg-white mx-auto md:mx-0 object-cover">
                <div class="text-center md:text-left flex-1">
                    <h2 class="text-3xl font-bold text-gray-900">${app.name}</h2>
                    <p class="text-sm text-green-600 font-bold mb-1">${app.developer}</p>
                    <p class="text-xs text-gray-400 font-mono mb-3">${app.packageName}</p>
                    <div class="flex justify-center md:justify-start gap-3 text-sm">
                        <span class="bg-gray-100 px-3 py-1 rounded-lg">v${app.version}</span>
                        <span class="bg-gray-100 px-3 py-1 rounded-lg">${app.size}</span>
                    </div>
                </div>
            </div>
            <a href="${app.apkUrl}" target="_blank" onclick="trackDownload('${id}')" class="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 mb-8"><i class="ph-bold ph-download-simple text-xl"></i> Download APK</a>
            ${screenshotsHtml ? `<h3 class="font-bold text-gray-900 mb-3">Preview</h3>` + screenshotsHtml : ''}
            
            <div class="flex border-b mb-4">
                <button onclick="switchTab('tech')" id="tab-tech" class="px-4 py-2 text-sm font-bold text-green-600 border-b-2 border-green-600">Technical Specs</button>
            </div>
            
            <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                ${techHtml}
            </div>
        `;
    }
}

window.closeModal = () => document.getElementById('appModal').classList.add('hidden');
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });

// ==========================================
// ADMIN LOGIC
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
            signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value)
                .catch(err => alert("Login Error: " + err.code));
        });
    }

    const uploadForm = document.getElementById('uploadForm');
    if(uploadForm) uploadForm.addEventListener('submit', handleFormSubmit);
}

// COLLECT DATA FROM 30 FIELDS
async function handleFormSubmit(e) {
    e.preventDefault();
    const screen = document.getElementById('uploadingScreen');
    screen.classList.remove('hidden');

    const techData = {
        verCode: document.getElementById('t_verCode').value,
        date: document.getElementById('t_date').value,
        buildSys: document.getElementById('t_buildSys').value,
        buildType: document.getElementById('t_buildType').value,
        variant: document.getElementById('t_variant').value,
        compress: document.getElementById('t_compress').value,
        minSdk: document.getElementById('t_minSdk').value,
        targetSdk: document.getElementById('t_targetSdk').value,
        compileSdk: document.getElementById('t_compileSdk').value,
        abi: document.getElementById('t_abi').value,
        dpi: document.getElementById('t_dpi').value,
        devices: document.getElementById('t_devices').value,
        multi: document.getElementById('t_multi').value,
        v1: document.getElementById('t_v1').checked,
        v2: document.getElementById('t_v2').checked,
        v3: document.getElementById('t_v3').checked,
        v4: document.getElementById('t_v4').checked,
        algo: document.getElementById('t_algo').value,
        sha: document.getElementById('t_sha').value,
        issuer: document.getElementById('t_issuer').value,
        valid: document.getElementById('t_valid').value,
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
        iconUrl: document.getElementById('iconUrl').value,
        apkUrl: document.getElementById('apkUrl').value,
        screenshots: document.getElementById('screenshots').value,
        techData: techData, // Save object
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

        setTimeout(() => {
            screen.classList.add('hidden');
            document.getElementById('successScreen').classList.remove('hidden');
            loadAdminList();
        }, 500);

    } catch (error) {
        screen.classList.add('hidden');
        alert("Error: " + error.message);
    }
}

async function loadAdminList() {
    const list = document.getElementById('adminAppList');
    list.innerHTML = '<div class="p-4 text-center">Loading...</div>';
    
    const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
    const snapshot = await getDocs(q);
    list.innerHTML = '';
    snapshot.forEach(doc => {
        const app = doc.data();
        list.innerHTML += `
            <li class="p-4 bg-gray-50 rounded flex justify-between items-center mb-2 border border-gray-100">
                <div class="flex items-center gap-3">
                    <img src="${app.iconUrl}" class="w-10 h-10 rounded shadow-sm object-cover">
                    <div><div class="font-bold text-gray-800 text-sm">${app.name}</div><div class="text-xs text-gray-500">${app.version}</div></div>
                </div>
                <div class="flex gap-2"><button onclick="editApp('${doc.id}')" class="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold">Edit</button><button onclick="deleteApp('${doc.id}')" class="px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">Del</button></div>
            </li>`;
    });
}

window.closeSuccessScreen = () => {
    document.getElementById('successScreen').classList.add('hidden');
    document.getElementById('uploadForm').reset();
    isEditMode = false; currentEditId = null;
    document.getElementById('uploadBtn').innerText = "Save App Data";
}

window.deleteApp = async (id) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); }};

window.editApp = async (id) => {
    const docSnap = await getDoc(doc(db, "apps", id));
    if (docSnap.exists()) {
        const data = docSnap.data();
        isEditMode = true; currentEditId = id;
        
        document.getElementById('appName').value = data.name;
        document.getElementById('packageName').value = data.packageName;
        document.getElementById('developer').value = data.developer;
        document.getElementById('category').value = data.category;
        document.getElementById('size').value = data.size;
        document.getElementById('version').value = data.version;
        document.getElementById('apkUrl').value = data.apkUrl;
        document.getElementById('iconUrl').value = data.iconUrl;
        document.getElementById('screenshots').value = data.screenshots || '';

        // Fill Tech Specs
        const t = data.techData || {};
        document.getElementById('t_verCode').value = t.verCode || '';
        document.getElementById('t_date').value = t.date || '';
        document.getElementById('t_buildSys').value = t.buildSys || '';
        document.getElementById('t_buildType').value = t.buildType || 'Release';
        document.getElementById('t_variant').value = t.variant || '';
        document.getElementById('t_compress').value = t.compress || 'Enabled';
        document.getElementById('t_minSdk').value = t.minSdk || '';
        document.getElementById('t_targetSdk').value = t.targetSdk || '';
        document.getElementById('t_compileSdk').value = t.compileSdk || '';
        document.getElementById('t_abi').value = t.abi || '';
        document.getElementById('t_dpi').value = t.dpi || '';
        document.getElementById('t_devices').value = t.devices || '';
        document.getElementById('t_multi').value = t.multi || '';
        document.getElementById('t_v1').checked = t.v1 || false;
        document.getElementById('t_v2').checked = t.v2 || false;
        document.getElementById('t_v3').checked = t.v3 || false;
        document.getElementById('t_v4').checked = t.v4 || false;
        document.getElementById('t_algo').value = t.algo || '';
        document.getElementById('t_sha').value = t.sha || '';
        document.getElementById('t_issuer').value = t.issuer || '';
        document.getElementById('t_valid').value = t.valid || '';
        document.getElementById('t_proguard').value = t.proguard || 'Enabled';
        document.getElementById('t_obfus').value = t.obfus || 'Enabled';
        document.getElementById('t_debug').value = t.debug || 'False';
        document.getElementById('t_perms').value = t.perms || '';

        document.getElementById('uploadBtn').innerText = "Update App";
        document.getElementById('dashboard').scrollIntoView();
    }
};
window.logout = () => signOut(auth);