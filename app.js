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

// ==========================================
// 1. HOME PAGE LOGIC (Index.html)
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

        if (!hasResults) grid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-10 text-lg">No apps found.</div>`;
    } catch (e) { console.error(e); }
}

// 🟢 CARD CLICK -> NEW PAGE
function renderAppCard(id, app, container) {
    const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=random&size=128`;

    const card = `
        <div onclick="window.location.href='app-details.html?id=${id}'" class="group bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative flex items-start gap-4 z-10">
                <div class="shrink-0 relative">
                    <img src="${app.iconUrl}" onerror="this.src='${fallbackImage}'" alt="${app.name}" class="w-20 h-20 rounded-2xl shadow-sm object-cover bg-white border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                </div>
                <div class="flex-1 min-w-0 pt-1">
                    <h3 class="font-bold text-gray-900 text-lg leading-tight truncate group-hover:text-green-600 transition-colors">${app.name}</h3>
                    <p class="text-xs text-gray-500 font-medium truncate mt-1 flex items-center gap-1">
                        ${app.developer ? `<i class="ph-fill ph-check-circle text-green-500 text-[10px]"></i> ${app.developer}` : 'Unknown Developer'}
                    </p>
                    <div class="flex flex-wrap gap-2 mt-2.5">
                        <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">${app.category}</span>
                        <span class="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">v${app.version}</span>
                    </div>
                </div>
            </div>
            <div class="mt-4 pt-3 border-t border-dashed border-gray-200 flex justify-between items-center z-10 relative">
                <span class="text-xs text-gray-400 font-mono flex items-center gap-1"><i class="ph-bold ph-hard-drives"></i> ${app.size}</span>
                <span class="flex items-center gap-1.5 text-xs font-bold text-white bg-green-600 px-4 py-2 rounded-full shadow-lg shadow-green-200 group-hover:bg-green-700 transition-colors">Download</span>
            </div>
        </div>
    `;
    container.innerHTML += card;
}

// ==========================================
// 2. DETAILS PAGE LOGIC (app-details.html)
// ==========================================

export async function loadAppDetails(id) {
    const container = document.getElementById('detailsContainer');
    if(!container) return; // Not on details page

    try {
        const docSnap = await getDoc(doc(db, "apps", id));
        if (docSnap.exists()) {
            const app = docSnap.data();
            
            // Render Main Details
            renderFullDetails(id, app, container);
            
            // Load Recommendations (Pass current ID to exclude it)
            loadRecommendedApps(id);
        } else {
            container.innerHTML = '<div class="text-center py-20 text-red-500">App not found!</div>';
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="text-center py-20 text-red-500">Error loading app.</div>';
    }
}

function renderFullDetails(id, app, container) {
    let screenshotsHtml = '';
    if(app.screenshots) {
        const shots = app.screenshots.split(',');
        screenshotsHtml = `<div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-8">` + 
            shots.map(url => `<img src="${url.trim()}" class="h-64 rounded-xl shadow-md border bg-gray-50 object-cover">`).join('') + 
            `</div>`;
    }

    const techHtml = generateTechHtml(app.techData);

    container.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8 mb-8 items-center md:items-start border-b border-gray-100 pb-8">
            <img src="${app.iconUrl}" onerror="this.src='https://ui-avatars.com/api/?name=${app.name}'" class="w-32 h-32 rounded-[2rem] shadow-xl bg-white object-cover border border-gray-100">
            <div class="text-center md:text-left flex-1">
                <h1 class="text-4xl font-extrabold text-gray-900 mb-2">${app.name}</h1>
                <p class="text-base text-green-600 font-bold mb-2 flex items-center justify-center md:justify-start gap-1">
                    ${app.developer} <i class="ph-fill ph-check-circle"></i>
                </p>
                <p class="text-sm text-gray-400 font-mono mb-6">${app.packageName}</p>
                
                <div class="flex flex-wrap justify-center md:justify-start gap-3">
                    <span class="bg-gray-100 px-4 py-2 rounded-xl font-bold text-gray-600 text-sm">v${app.version}</span>
                    <span class="bg-gray-100 px-4 py-2 rounded-xl font-bold text-gray-600 text-sm">${app.size}</span>
                    <span class="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm">${app.category}</span>
                </div>
            </div>
        </div>

        <a href="${app.apkUrl}" target="_blank" onclick="trackDownload('${id}')" 
           class="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-5 rounded-2xl shadow-xl shadow-green-200 transition transform hover:-translate-y-1 mb-10">
           <i class="ph-bold ph-download-simple text-2xl"></i> Download APK Now
        </a>

        ${screenshotsHtml ? `<h3 class="font-bold text-gray-900 text-xl mb-4">Preview</h3>` + screenshotsHtml : ''}

        <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
            <h3 class="font-bold text-gray-900 mb-3 text-lg">About this app</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line text-base">${app.description || 'No description provided.'}</p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 class="font-bold text-gray-900 flex items-center gap-2">
                    <i class="ph-fill ph-code text-blue-600"></i> Technical Information
                </h3>
            </div>
            <div class="p-6">
                ${techHtml}
            </div>
        </div>
    `;
}

// 🟢 RECOMMENDED APPS LOGIC
async function loadRecommendedApps(currentId) {
    const grid = document.getElementById('recommendedGrid');
    if(!grid) return;

    try {
        // Query: Sort by downloads, limit to 5
        const q = query(collection(db, "apps"), orderBy("downloads", "desc"), limit(6));
        const snapshot = await getDocs(q);
        
        grid.innerHTML = '';
        let count = 0;

        snapshot.forEach((doc) => {
            if(doc.id !== currentId && count < 5) { // Exclude current app
                const app = doc.data();
                renderSmallCard(doc.id, app, grid);
                count++;
            }
        });

        if(count === 0) grid.innerHTML = '<div class="text-gray-400 text-sm text-center">No other apps found.</div>';

    } catch (e) { console.error(e); }
}

function renderSmallCard(id, app, container) {
    const card = `
        <div onclick="window.location.href='app-details.html?id=${id}'" class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition border border-transparent hover:border-gray-100 group">
            <img src="${app.iconUrl}" class="w-12 h-12 rounded-lg bg-gray-100 object-cover shadow-sm">
            <div class="min-w-0 flex-1">
                <h4 class="font-bold text-gray-900 text-sm truncate group-hover:text-green-600 transition">${app.name}</h4>
                <div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span class="bg-gray-100 px-1.5 rounded">${app.size}</span>
                    <span class="text-[10px]">🔥 ${app.downloads || 0} DLs</span>
                </div>
            </div>
            <button class="text-green-600 bg-green-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"><i class="ph-bold ph-caret-right"></i></button>
        </div>
    `;
    container.innerHTML += card;
}

// ==========================================
// HELPERS (Unchanged)
// ==========================================

function formatTechInfo(text) { /* Keep existing function */ return text; } // Simplified for brevity in this response, keep your existing logic

function generateTechHtml(d) {
    if(!d) return '<div class="text-gray-400 italic">No details.</div>';
    const row = (k, v) => `<div class="flex justify-between py-2 border-b border-gray-50 text-sm"><span class="font-bold text-gray-700">${k}</span><span class="font-mono text-gray-600 text-right">${v || '-'}</span></div>`;
    
    return `
        <div class="space-y-6">
            <div><div class="font-bold text-blue-800 text-xs uppercase mb-2">Build Info</div>${row('Version Code', d.verCode)}${row('Release Date', d.date)}${row('Compression', d.compress)}</div>
            <div><div class="font-bold text-blue-800 text-xs uppercase mb-2">Environment</div>${row('Min SDK', d.minSdk)}${row('Target SDK', d.targetSdk)}</div>
            <div><div class="font-bold text-blue-800 text-xs uppercase mb-2">Architecture</div><div class="text-sm text-gray-600 mb-1"><span class="font-bold">ABI:</span> ${d.abi}</div>${row('Devices', d.devices)}</div>
            <div><div class="font-bold text-blue-800 text-xs uppercase mb-2">Signature</div>
            <div class="flex gap-3 mb-2 text-xs"><span class="${d.v1?'text-green-600 font-bold':'text-gray-400'}">V1</span><span class="${d.v2?'text-green-600 font-bold':'text-gray-400'}">V2</span><span class="${d.v3?'text-green-600 font-bold':'text-gray-400'}">V3</span></div>
            <div class="text-[10px] text-gray-500 break-all font-mono bg-gray-50 p-2 border rounded">SHA-1: ${d.sha1 || 'N/A'}</div>
            </div>
        </div>
    `;
}

// Global functions for tracking
window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });

// ADMIN LOGIC (Keep existing admin logic inside initAdmin)
let isEditMode = false;
let currentEditId = null;

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

// Keep handleFormSubmit and loadAdminList exactly as they were in previous steps
// (They are for Admin Panel, not affected by User View changes)
async function handleFormSubmit(e) { /* Keep existing */ }
async function loadAdminList() { /* Keep existing */ }