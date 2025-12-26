// ==========================================
// 1. FIREBASE CONFIGURATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, increment, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
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
const storage = getStorage(app);
const auth = getAuth(app);

let isEditMode = false;
let currentEditId = null;

window.setupAdmin = async () => {
    try { await createUserWithEmailAndPassword(auth, "admin@admin.com", "admin123"); alert("Admin Created!"); } catch (e) { alert(e.message); }
};

// ==========================================
// 2. USER WEBSITE LOGIC
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
                <img src="${app.iconUrl}" class="w-16 h-16 rounded-2xl object-cover bg-gray-50 shadow-inner">
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

// === NEW: SMART FORMATTER WITH ICONS ===
function formatTechInfo(text) {
    if (!text) return '';

    // Icon Mapping based on keywords
    const getIcon = (line) => {
        const lower = line.toLowerCase();
        if (lower.includes('package')) return 'ph-package';
        if (lower.includes('version')) return 'ph-git-branch';
        if (lower.includes('size')) return 'ph-hard-drives';
        if (lower.includes('date')) return 'ph-calendar-check';
        if (lower.includes('android') || lower.includes('sdk')) return 'ph-android-logo';
        if (lower.includes('cpu') || lower.includes('architectures')) return 'ph-cpu';
        if (lower.includes('signature') || lower.includes('certificate')) return 'ph-certificate';
        if (lower.includes('permission')) return 'ph-shield-check';
        if (lower.includes('screen')) return 'ph-device-mobile';
        if (lower.includes('build')) return 'ph-wrench';
        return 'ph-info'; // Default
    };

    return text.split('\n').map(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return ''; 

        // 1. If line is "Key: Value"
        if (cleanLine.includes(':')) {
            const parts = cleanLine.split(':');
            const key = parts[0].trim();
            const val = parts.slice(1).join(':').trim();
            const icon = getIcon(key);
            
            // If it's a Header line ending in colon (e.g. "Supported Architectures:")
            if(!val) {
                 return `
                    <div class="mt-4 mb-2 flex items-center gap-2 text-green-700 font-bold border-b border-green-100 pb-1">
                        <i class="ph-fill ${icon} text-lg"></i>
                        <span>${key}</span>
                    </div>`;
            }

            // Standard Key: Value
            return `
                <div class="flex items-start gap-3 py-2 border-b border-gray-50 hover:bg-gray-50 px-2 rounded transition">
                    <div class="text-gray-400 mt-0.5"><i class="ph-bold ${icon}"></i></div>
                    <div class="flex-1 text-sm">
                        <span class="font-bold text-gray-700">${key}:</span>
                        <span class="text-gray-600 ml-1 font-mono text-xs">${val}</span>
                    </div>
                </div>`;
        }
        
        // 2. If line is a list item (starts with -)
        if (cleanLine.startsWith('-')) {
            return `
                <div class="flex items-center gap-2 ml-8 py-1 text-xs text-gray-600">
                    <i class="ph-fill ph-caret-right text-green-500"></i>
                    <span>${cleanLine.replace('-','').trim()}</span>
                </div>`;
        }

        return `<div class="text-xs text-gray-500 py-1">${cleanLine}</div>`;
    }).join('');
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
            screenshotsHtml = `<div class="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">` + 
                shots.map(url => `<img src="${url.trim()}" class="h-48 rounded-lg shadow-sm border bg-gray-50">`).join('') + 
                `</div>`;
        }

        // Generate the Icon-Rich Tech Info
        const techInfoHtml = formatTechInfo(app.techInfo);

        content.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6 mb-6">
                <img src="${app.iconUrl}" class="w-24 h-24 rounded-3xl shadow-md bg-white mx-auto md:mx-0 object-cover">
                <div class="text-center md:text-left flex-1">
                    <h2 class="text-3xl font-bold text-gray-900">${app.name}</h2>
                    <p class="text-sm text-green-600 font-bold mb-1">${app.developer} <i class="ph-fill ph-check-circle"></i></p>
                    <div class="flex justify-center md:justify-start gap-3 text-sm mt-3">
                        <span class="bg-gray-100 px-3 py-1 rounded-lg">v${app.version}</span>
                        <span class="bg-gray-100 px-3 py-1 rounded-lg">${app.size} MB</span>
                    </div>
                </div>
            </div>

            <a href="${app.apkUrl}" target="_blank" onclick="trackDownload('${id}')" 
               class="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition transform hover:-translate-y-1 mb-8">
               <i class="ph-bold ph-download-simple text-xl"></i> Download APK
            </a>

            ${screenshotsHtml ? `<h3 class="font-bold text-gray-900 mb-3">Preview</h3>` + screenshotsHtml : ''}

            <div class="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
                <h3 class="font-bold text-gray-900 mb-2 flex items-center gap-2"><i class="ph-fill ph-text-align-left text-green-600"></i> Description</h3>
                <p class="text-gray-600 text-sm leading-relaxed whitespace-pre-line">${app.description || 'No description.'}</p>
            </div>

            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                    <i class="ph-fill ph-terminal-window text-blue-600"></i> App Information
                </h3>
                <div class="space-y-1">
                    ${techInfoHtml || '<div class="text-gray-400 text-center text-sm italic">No technical details available.</div>'}
                </div>
            </div>
        `;
    }
}

window.closeModal = () => document.getElementById('appModal').classList.add('hidden');
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });

// ==========================================
// 3. ADMIN FUNCTIONS
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
    if(loginForm) loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value)
            .catch(err => alert("Login Error: " + err.code));
    });

    const uploadForm = document.getElementById('uploadForm');
    if(uploadForm) uploadForm.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const screen = document.getElementById('uploadingScreen');
    screen.classList.remove('hidden');

    const appName = document.getElementById('appName').value;
    const developer = document.getElementById('developer').value;
    const category = document.getElementById('category').value;
    const version = document.getElementById('version').value;
    const size = document.getElementById('size').value;
    const description = document.getElementById('description').value;
    const apkUrl = document.getElementById('apkUrl').value;
    const screenshots = document.getElementById('screenshots').value;
    const techInfo = document.getElementById('techInfo').value; // Single Field
    
    const iconFile = document.getElementById('iconFile').files[0];

    try {
        let iconUrl = document.getElementById('currentIconUrl')?.value || '';

        if (iconFile) {
            const iconRef = ref(storage, `icons/${Date.now()}_${iconFile.name}`);
            const uploadTask = await uploadBytesResumable(iconRef, iconFile);
            iconUrl = await getDownloadURL(uploadTask.ref);
        }

        const appData = {
            name: appName, developer, category, version, size, description,
            iconUrl, apkUrl, screenshots, techInfo,
            updatedAt: serverTimestamp()
        };

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
        
        document.getElementById('appName').value = data.name;
        document.getElementById('developer').value = data.developer;
        document.getElementById('category').value = data.category;
        document.getElementById('version').value = data.version;
        document.getElementById('size').value = data.size;
        document.getElementById('description').value = data.description;
        document.getElementById('apkUrl').value = data.apkUrl;
        document.getElementById('screenshots').value = data.screenshots || '';
        document.getElementById('techInfo').value = data.techInfo || ''; // Fill Single Field

        let oldIcon = document.getElementById('currentIconUrl');
        if(!oldIcon) {
            oldIcon = document.createElement('input');
            oldIcon.type = 'hidden';
            oldIcon.id = 'currentIconUrl';
            document.getElementById('uploadForm').appendChild(oldIcon);
        }
        oldIcon.value = data.iconUrl;

        document.getElementById('uploadBtn').innerText = "Update App";
        document.getElementById('dashboard').scrollIntoView();
    }
};
window.logout = () => signOut(auth);