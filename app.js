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

// ... (loadApps & renderAppCard & loadAppDetails remain same as previous step for User Panel) ...
// (You can copy loadApps, renderAppCard, loadAppDetails from the previous response or keep them if they are working)
// I will provide the ADMIN functions which need fixing here.

// ==========================================
// ADMIN LOGIC (FIXED)
// ==========================================

export function initAdmin() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            loadAdminList(); // Call immediately on login
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

// SAVE DATA
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
        if (isEditMode && currentEditId) {
            await updateDoc(doc(db, "apps", currentEditId), appData);
        } else {
            appData.downloads = 0;
            appData.uploadedAt = serverTimestamp();
            await addDoc(collection(db, "apps"), appData);
        }
        
        setTimeout(() => { 
            document.getElementById('successScreen').classList.remove('hidden'); 
            document.getElementById('uploadingScreen').classList.add('hidden'); 
            loadAdminList(); // Refresh list after save
        }, 500);
    } catch (error) { 
        alert("Error: " + error.message); 
        document.getElementById('uploadingScreen').classList.add('hidden'); 
    }
}

// 🔥 LIST LOADING (FIXED) 🔥
async function loadAdminList() {
    const list = document.getElementById('adminAppList');
    if(!list) return;
    
    list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm">Loading apps...</li>';
    
    try {
        const q = query(collection(db, "apps"), orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        
        list.innerHTML = '';
        
        if (snapshot.empty) {
            list.innerHTML = '<li class="p-6 text-center text-gray-400 text-sm">No apps found. Add one above!</li>';
            return;
        }

        snapshot.forEach(doc => {
            const app = doc.data();
            const item = `
                <li class="p-4 bg-white hover:bg-gray-50 flex justify-between items-center transition">
                    <div class="flex items-center gap-4">
                        <img src="${app.iconUrl}" onerror="this.src='https://via.placeholder.com/40'" class="w-10 h-10 rounded-lg shadow-sm object-cover border border-gray-200">
                        <div>
                            <div class="font-bold text-gray-800 text-sm">${app.name}</div>
                            <div class="text-xs text-gray-500 font-mono">${app.packageName} • v${app.version}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editApp('${doc.id}')" class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition">Edit</button>
                        <button onclick="deleteApp('${doc.id}')" class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition">Delete</button>
                    </div>
                </li>`;
            list.innerHTML += item;
        });
    } catch (e) {
        console.error(e);
        list.innerHTML = '<li class="p-6 text-center text-red-400 text-sm">Error loading list. Check console.</li>';
    }
}

// RESET FORM
window.resetForm = () => {
    document.getElementById('uploadForm').reset();
    isEditMode = false;
    currentEditId = null;
    document.getElementById('uploadBtn').innerText = "Save Data";
    document.getElementById('formTitle').innerHTML = '<i class="ph-bold ph-plus-circle text-green-600"></i> Add New App';
}

window.closeSuccessScreen = () => { 
    document.getElementById('successScreen').classList.add('hidden'); 
    window.resetForm();
}

window.deleteApp = async (id) => { 
    if(confirm("Are you sure you want to delete this app?")) { 
        await deleteDoc(doc(db, "apps", id)); 
        loadAdminList(); 
    }
};

// 🔥 EDIT FUNCTION (FIXED) 🔥
window.editApp = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "apps", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            isEditMode = true; 
            currentEditId = id;
            
            // Basic Fields
            document.getElementById('appName').value = data.name || ''; 
            document.getElementById('packageName').value = data.packageName || ''; 
            document.getElementById('developer').value = data.developer || ''; 
            document.getElementById('category').value = data.category || ''; 
            document.getElementById('version').value = data.version || ''; 
            document.getElementById('size').value = data.size || ''; 
            document.getElementById('apkUrl').value = data.apkUrl || ''; 
            document.getElementById('iconUrl').value = data.iconUrl || ''; 
            document.getElementById('screenshots').value = data.screenshots || '';
            
            // Tech Fields
            const t = data.techData || {};
            document.getElementById('t_verCode').value = t.verCode || ''; 
            document.getElementById('t_date').value = t.date || ''; 
            document.getElementById('t_compress').value = t.compress || 'Enabled'; 
            document.getElementById('t_minSdk').value = t.minSdk || ''; 
            document.getElementById('t_targetSdk').value = t.targetSdk || ''; 
            document.getElementById('t_compileSdk').value = t.compileSdk || ''; 
            document.getElementById('t_abi').value = t.abi || ''; 
            document.getElementById('t_devices').value = t.devices || ''; 
            document.getElementById('t_v1').checked = t.v1 || false; 
            document.getElementById('t_v2').checked = t.v2 || false; 
            document.getElementById('t_v3').checked = t.v3 || false; 
            document.getElementById('t_v4').checked = t.v4 || false; 
            document.getElementById('t_algo').value = t.algo || ''; 
            document.getElementById('t_sha1').value = t.sha1 || ''; 
            document.getElementById('t_sha256').value = t.sha256 || ''; 
            document.getElementById('t_issuer').value = t.issuer || ''; 
            document.getElementById('t_proguard').value = t.proguard || 'Enabled'; 
            document.getElementById('t_obfus').value = t.obfus || 'Enabled'; 
            document.getElementById('t_debug').value = t.debug || 'False'; 
            document.getElementById('t_perms').value = t.perms || '';

            // Update UI
            document.getElementById('uploadBtn').innerText = "Update App Data"; 
            document.getElementById('formTitle').innerHTML = `<i class="ph-bold ph-pencil-simple text-blue-600"></i> Editing: ${data.name}`;
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (e) {
        alert("Error loading edit data: " + e.message);
    }
};

window.logout = () => signOut(auth);