import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, increment, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBjiNy8apBFdLQOAiG1nCtv94DfaRwZEuM",
  authDomain: "apkverse-bjyjs.firebaseapp.com",
  projectId: "apkverse-bjyjs",
  storageBucket: "apkverse-bjyjs.firebasestorage.app",
  messagingSenderId: "433058399647",
  appId: "1:433058399647:web:80aae884dbbd0aff94e9aa",
  measurementId: "G-6HXXD1W0KN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let isEditMode = false;
let currentEditId = null;

// Helper
window.setupAdmin = async () => {
    try { await createUserWithEmailAndPassword(auth, "admin@admin.com", "admin123"); alert("Admin Created!"); } catch (e) { alert(e.message); }
};

// ==========================================
// USER: DISPLAY APPS
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
                <span>${app.size} MB</span>
                <span class="text-green-600 font-bold">Download</span>
            </div>
        </div>
    `;
    container.innerHTML += card;
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

        const techHtml = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="flex justify-between border-b pb-1"><span class="text-gray-500">Version Code</span> <span class="font-mono text-gray-900">${app.versionCode || '-'}</span></div>
                <div class="flex justify-between border-b pb-1"><span class="text-gray-500">Min SDK</span> <span class="font-mono text-gray-900">${app.minSdk || '-'}</span></div>
                <div class="flex justify-between border-b pb-1"><span class="text-gray-500">Target SDK</span> <span class="font-mono text-gray-900">${app.targetSdk || '-'}</span></div>
                <div class="flex justify-between border-b pb-1"><span class="text-gray-500">Architecture</span> <span class="font-mono text-gray-900">${app.abi || '-'}</span></div>
                <div class="flex justify-between border-b pb-1"><span class="text-gray-500">Screen DPI</span> <span class="font-mono text-gray-900">${app.dpi || '-'}</span></div>
                <div class="col-span-full mt-2">
                    <div class="text-xs text-gray-500 font-bold mb-1">SHA-256 Signature</div>
                    <div class="bg-gray-100 p-2 rounded text-[10px] font-mono break-all text-gray-600 border">${app.sha256 || 'N/A'}</div>
                </div>
                 <div class="col-span-full mt-2">
                    <div class="text-xs text-gray-500 font-bold mb-1">Permissions</div>
                    <div class="text-xs text-gray-600">${app.permissions ? app.permissions.split(',').map(p => `<span class="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded mr-1 mb-1 border border-blue-100">${p.trim()}</span>`).join('') : 'None'}</div>
                </div>
            </div>
        `;

        content.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6 mb-6">
                <img src="${app.iconUrl}" onerror="this.src='https://via.placeholder.com/100'" class="w-24 h-24 rounded-3xl shadow-md bg-white mx-auto md:mx-0 object-cover">
                <div class="text-center md:text-left flex-1">
                    <h2 class="text-3xl font-bold text-gray-900">${app.name}</h2>
                    <p class="text-sm text-green-600 font-bold mb-1">${app.developer} <i class="ph-fill ph-check-circle"></i></p>
                    <p class="text-xs text-gray-400 font-mono mb-3">${app.packageName}</p>
                    <div class="flex justify-center md:justify-start gap-3 text-sm">
                        <span class="bg-gray-100 px-3 py-1 rounded-lg">v${app.version}</span>
                        <span class="bg-gray-100 px-3 py-1 rounded-lg">${app.size} MB</span>
                    </div>
                </div>
            </div>
            <a href="${app.apkUrl}" target="_blank" onclick="trackDownload('${id}')" class="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 mb-8"><i class="ph-bold ph-download-simple text-xl"></i> Download APK</a>
            ${screenshotsHtml ? `<h3 class="font-bold text-gray-900 mb-3">Preview</h3>` + screenshotsHtml : ''}
            <div class="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
                <h3 class="font-bold text-gray-900 mb-2">Description</h3>
                <p class="text-gray-600 text-sm leading-relaxed whitespace-pre-line">${app.description || 'No description.'}</p>
            </div>
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2"><i class="ph-fill ph-cpu text-blue-600"></i> Technical Specs</h3>
                ${techHtml}
            </div>
        `;
    }
}

window.closeModal = () => document.getElementById('appModal').classList.add('hidden');
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });

// ==========================================
// ADMIN: SAVE DATA (TEXT ONLY)
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

async function handleFormSubmit(e) {
    e.preventDefault();
    const screen = document.getElementById('uploadingScreen');
    screen.classList.remove('hidden');

    // Collect ALL inputs (Just Text)
    const appData = {
        name: document.getElementById('appName').value,
        packageName: document.getElementById('packageName').value,
        developer: document.getElementById('developer').value,
        category: document.getElementById('category').value,
        size: document.getElementById('size').value,
        version: document.getElementById('version').value,
        description: document.getElementById('description').value,
        
        versionCode: document.getElementById('versionCode').value,
        minSdk: document.getElementById('minSdk').value,
        targetSdk: document.getElementById('targetSdk').value,
        abi: document.getElementById('abi').value,
        dpi: document.getElementById('dpi').value,
        sha256: document.getElementById('sha256').value,
        permissions: document.getElementById('permissions').value,
        
        apkUrl: document.getElementById('apkUrl').value,
        iconUrl: document.getElementById('iconUrl').value, // Text URL
        screenshots: document.getElementById('screenshots').value,
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
                    <img src="${app.iconUrl}" onerror="this.src='https://via.placeholder.com/32'" class="w-10 h-10 rounded shadow-sm object-cover">
                    <div>
                        <div class="font-bold text-gray-800 text-sm">${app.name}</div>
                        <div class="text-xs text-gray-500">${app.version}</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="editApp('${doc.id}')" class="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold">Edit</button>
                    <button onclick="deleteApp('${doc.id}')" class="px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">Del</button>
                </div>
            </li>`;
    });
}

window.closeSuccessScreen = () => {
    document.getElementById('successScreen').classList.add('hidden');
    document.getElementById('uploadForm').reset();
    isEditMode = false; currentEditId = null;
    document.getElementById('uploadBtn').innerText = "Publish App";
}

window.deleteApp = async (id) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "apps", id)); loadAdminList(); }};

window.editApp = async (id) => {
    const docSnap = await getDoc(doc(db, "apps", id));
    if (docSnap.exists()) {
        const data = docSnap.data();
        isEditMode = true; currentEditId = id;
        
        // Fill All Fields
        document.getElementById('appName').value = data.name;
        document.getElementById('packageName').value = data.packageName;
        document.getElementById('developer').value = data.developer;
        document.getElementById('category').value = data.category;
        document.getElementById('size').value = data.size;
        document.getElementById('version').value = data.version;
        document.getElementById('description').value = data.description;
        
        document.getElementById('versionCode').value = data.versionCode || '';
        document.getElementById('minSdk').value = data.minSdk || '';
        document.getElementById('targetSdk').value = data.targetSdk || '';
        document.getElementById('abi').value = data.abi || '';
        document.getElementById('dpi').value = data.dpi || '';
        document.getElementById('sha256').value = data.sha256 || '';
        document.getElementById('permissions').value = data.permissions || '';

        document.getElementById('apkUrl').value = data.apkUrl;
        document.getElementById('iconUrl').value = data.iconUrl;
        document.getElementById('screenshots').value = data.screenshots || '';

        document.getElementById('uploadBtn').innerText = "Update App";
        document.getElementById('dashboard').scrollIntoView();
    }
};
window.logout = () => signOut(auth);
