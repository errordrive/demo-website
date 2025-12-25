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
// 1. HOME PAGE LOGIC (Responsive Cards)
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
    // Better Fallback Image
    const fallbackImage = 'https://cdn-icons-png.flaticon.com/512/104/104663.png'; // Default Android Icon

    // Responsive Classes:
    // Logo: w-14 h-14 (Mobile) -> md:w-20 md:h-20 (PC)
    // Card: p-3 (Mobile) -> md:p-5 (PC)
    
    const card = `
        <div onclick="window.location.href='app-details.html?id=${id}'" class="group bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col items-center text-center relative overflow-hidden">
            
            <div class="relative z-10 mb-2 md:mb-3">
                <img src="${app.iconUrl}" 
                     onerror="this.src='${fallbackImage}'; this.onerror=null;" 
                     alt="${app.name}" 
                     class="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl shadow-sm object-cover bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform duration-300">
            </div>

            <div class="w-full relative z-10 flex flex-col items-center flex-1">
                <h3 class="font-bold text-gray-800 text-xs md:text-base leading-tight line-clamp-2 h-8 md:h-10 flex items-center justify-center group-hover:text-green-600 transition-colors" title="${app.name}">
                    ${app.name}
                </h3>
                
                <p class="hidden md:block text-[10px] text-gray-400 mt-1 truncate w-full">${app.developer || 'Unknown'}</p>

                <div class="flex items-center gap-1 md:gap-2 mt-2 text-[9px] md:text-[10px] text-gray-500 font-medium">
                    <span class="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">v${app.version}</span>
                    <span class="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">${app.size}</span>
                </div>
            </div>

            <div class="mt-3 w-full relative z-10">
                <button class="w-full flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-white bg-green-600 py-2 md:py-2.5 rounded-lg md:rounded-xl shadow-sm group-hover:bg-green-700 transition-colors">
                    Download <i class="ph-bold ph-download-simple hidden md:inline"></i>
                </button>
            </div>
        </div>
    `;
    container.innerHTML += card;
}

// ==========================================
// 2. DETAILS PAGE LOGIC (Responsive Screenshots)
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
    // Fix: Handle empty screenshots or errors gracefully
    if(app.screenshots && app.screenshots.trim() !== '') {
        const shots = app.screenshots.split(',').filter(url => url.trim().length > 0);
        
        if (shots.length > 0) {
            screenshotsHtml = `<div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-6 md:mb-8 snap-x snap-mandatory">` + 
                shots.map(url => `
                    <img src="${url.trim()}" 
                         onerror="this.style.display='none'"
                         class="h-48 md:h-64 rounded-lg md:rounded-xl shadow-md border bg-gray-50 object-cover snap-center shrink-0">
                `).join('') + 
                `</div>`;
        }
    }

    const techHtml = generateTechHtml(app.techData);
    const fallbackImage = 'https://cdn-icons-png.flaticon.com/512/104/104663.png';

    container.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6 md:gap-8 mb-6 md:mb-8 items-center md:items-start border-b border-gray-100 pb-6 md:pb-8">
            <img src="${app.iconUrl}" onerror="this.src='${fallbackImage}'" class="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2rem] shadow-lg bg-white object-cover border border-gray-100">
            <div class="text-center md:text-left flex-1">
                <h1 class="text-2xl md:text-4xl font-extrabold text-gray-900 mb-1 md:mb-2">${app.name}</h1>
                <p class="text-xs md:text-base text-green-600 font-bold mb-2 flex items-center justify-center md:justify-start gap-1">
                    ${app.developer} <i class="ph-fill ph-check-circle"></i>
                </p>
                <p class="text-[10px] md:text-sm text-gray-400 font-mono mb-4 md:mb-6">${app.packageName}</p>
                
                <div class="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                    <span class="bg-gray-100 px-3 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold text-gray-600 text-xs md:text-sm">v${app.version}</span>
                    <span class="bg-gray-100 px-3 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold text-gray-600 text-xs md:text-sm">${app.size}</span>
                    <span class="bg-blue-50 text-blue-600 px-3 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm">${app.category}</span>
                </div>
            </div>
        </div>

        <a href="${app.apkUrl}" target="_blank" onclick="trackDownload('${id}')" 
           class="flex items-center justify-center gap-2 md:gap-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm md:text-lg py-4 md:py-5 rounded-xl md:rounded-2xl shadow-xl shadow-green-200 transition transform hover:-translate-y-1 mb-8 md:mb-10">
           <i class="ph-bold ph-download-simple text-lg md:text-2xl"></i> Download APK Now
        </a>

        ${screenshotsHtml ? `<h3 class="font-bold text-gray-900 text-lg md:text-xl mb-3 md:mb-4">Preview</h3>` + screenshotsHtml : ''}

        <div class="bg-gray-50 rounded-xl md:rounded-2xl p-5 md:p-6 border border-gray-100 mb-6 md:mb-8">
            <h3 class="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-lg">About this app</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line text-xs md:text-base">${app.description || 'No description provided.'}</p>
        </div>

        <div class="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="bg-gray-50 px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
                <h3 class="font-bold text-gray-900 flex items-center gap-2 text-xs md:text-base">
                    <i class="ph-fill ph-code text-blue-600"></i> Technical Information
                </h3>
            </div>
            <div class="p-5 md:p-6">
                ${techHtml}
            </div>
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
        const fallbackImage = 'https://cdn-icons-png.flaticon.com/512/104/104663.png';

        snapshot.forEach((doc) => {
            if(doc.id !== currentId && count < 5) {
                const app = doc.data();
                const card = `
                    <div onclick="window.location.href='app-details.html?id=${doc.id}'" class="flex items-center gap-3 p-2 md:p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-100 group">
                        <img src="${app.iconUrl}" onerror="this.src='${fallbackImage}'" class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-100 object-cover shadow-sm">
                        <div class="min-w-0 flex-1">
                            <h4 class="font-bold text-gray-900 text-xs md:text-sm truncate group-hover:text-green-600 transition">${app.name}</h4>
                            <div class="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 mt-0.5">
                                <span class="bg-gray-100 px-1.5 rounded">${app.size}</span>
                                <span>🔥 ${app.downloads || 0}</span>
                            </div>
                        </div>
                    </div>`;
                grid.innerHTML += card;
                count++;
            }
        });
        if(count === 0) grid.innerHTML = '<div class="text-gray-400 text-xs text-center">No recommendations.</div>';
    } catch (e) { console.error(e); }
}

function generateTechHtml(d) {
    if(!d) return '<div class="text-gray-400 italic text-xs">No details.</div>';
    const row = (k, v) => `<div class="flex justify-between py-1.5 md:py-2 border-b border-gray-50 text-xs md:text-sm"><span class="font-bold text-gray-700">${k}</span><span class="font-mono text-gray-600 text-right">${v || '-'}</span></div>`;
    
    return `
        <div class="space-y-4 md:space-y-6">
            <div><div class="font-bold text-blue-800 text-[10px] md:text-xs uppercase mb-1 md:mb-2">Build Info</div>${row('Version Code', d.verCode)}${row('Release Date', d.date)}${row('Compression', d.compress)}</div>
            <div><div class="font-bold text-blue-800 text-[10px] md:text-xs uppercase mb-1 md:mb-2">Environment</div>${row('Min SDK', d.minSdk)}${row('Target SDK', d.targetSdk)}${row('Compile SDK', d.compileSdk)}</div>
            <div><div class="font-bold text-blue-800 text-[10px] md:text-xs uppercase mb-1 md:mb-2">Architecture</div><div class="text-xs md:text-sm text-gray-600 mb-1"><span class="font-bold">ABI:</span> ${d.abi}</div>${row('Devices', d.devices)}</div>
            <div><div class="font-bold text-blue-800 text-[10px] md:text-xs uppercase mb-1 md:mb-2">Signature</div>
            <div class="flex gap-2 md:gap-3 mb-2 text-[10px] md:text-xs"><span class="${d.v1?'text-green-600 font-bold':'text-gray-300'}">V1</span><span class="${d.v2?'text-green-600 font-bold':'text-gray-300'}">V2</span><span class="${d.v3?'text-green-600 font-bold':'text-gray-300'}">V3</span><span class="${d.v4?'text-green-600 font-bold':'text-gray-300'}">V4</span></div>
            <div class="text-[9px] md:text-[10px] text-gray-500 break-all font-mono bg-gray-50 p-1.5 md:p-2 border rounded mb-1">SHA-1: ${d.sha1 || '-'}</div>
            <div class="text-[9px] md:text-[10px] text-gray-500 break-all font-mono bg-gray-50 p-1.5 md:p-2 border rounded">SHA-256: ${d.sha256 || '-'}</div>
            </div>
        </div>
    `;
}

window.trackDownload = (id) => updateDoc(doc(db, "apps", id), { downloads: increment(1) });

// ADMIN LOGIC (Edit Fix)
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

// ... Rest of admin functions (handleFormSubmit, loadAdminList, editApp) remain same as previous step ...
async function handleFormSubmit(e) { /* Previous code */ }
async function loadAdminList() { /* Previous code */ }
window.closeSuccessScreen = () => { /* Previous code */ }
window.deleteApp = async (id) => { /* Previous code */ };
window.editApp = async (id) => { /* Previous code */ };
window.logout = () => signOut(auth);