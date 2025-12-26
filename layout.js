document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
    loadSidebar();
    loadFooter();
});

// 1. TOP NAVBAR (With Search)
function loadNavbar() {
    const nav = document.getElementById("global-navbar");
    if (nav) {
        nav.innerHTML = `
        <nav class="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
                <div class="flex items-center gap-3">
                    <button onclick="toggleMenu()" class="text-gray-600 hover:text-green-600 text-2xl"><i class="ph-bold ph-list"></i></button>
                    <a href="index.html" class="flex items-center gap-2 cursor-pointer select-none">
                        <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-xl shadow-lg"><i class="ph-fill ph-android-logo"></i></div>
                        <span class="text-lg font-bold tracking-tight hidden md:block">APK<span class="text-green-600">Verse</span></span>
                    </a>
                </div>
                
                <div class="flex-1 max-w-lg">
                    <div class="relative group">
                        <input type="text" id="globalSearch" placeholder="Search apps & games..." 
                            oninput="if(window.handleSearch) window.handleSearch(this.value)"
                            class="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 border border-transparent focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm">
                        <i class="ph-bold ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                <a href="admin.html" class="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-green-600 uppercase tracking-widest border border-gray-200 px-3 py-1.5 rounded-full transition whitespace-nowrap">
                    <i class="ph-bold ph-user-gear text-sm"></i> <span class="hidden sm:inline">Admin</span>
                </a>
            </div>
        </nav>`;
    }
}

// 2. SIDEBAR MENU
function loadSidebar() {
    const sidebar = document.getElementById("global-sidebar");
    if (sidebar) {
        sidebar.innerHTML = `
        <div id="sideMenuOverlay" onclick="toggleMenu()" class="fixed inset-0 bg-black/50 z-[60] hidden transition-opacity opacity-0"></div>
        <div id="sideMenu" class="fixed top-0 left-0 h-full w-80 bg-white z-[70] transform -translate-x-full transition-transform duration-300 shadow-2xl overflow-y-auto">
            <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <span class="text-lg font-extrabold text-gray-800">Menu</span>
                <button onclick="toggleMenu()" class="text-gray-500 hover:text-red-500 text-xl"><i class="ph-bold ph-x"></i></button>
            </div>
            <div class="p-4 space-y-2">
                <a href="index.html" class="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 hover:text-green-600 font-medium text-gray-700 transition"><i class="ph-bold ph-house text-lg"></i> Home</a>
                
                <h4 class="text-xs font-bold text-gray-400 uppercase mt-4 mb-2 px-3">Discover</h4>
                <button onclick="window.location.href='index.html'; setTimeout(()=>filterCategory('Games'), 500)" class="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition"><i class="ph-bold ph-game-controller text-lg"></i> Games</button>
                <button onclick="window.location.href='index.html'; setTimeout(()=>filterCategory('Social'), 500)" class="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition"><i class="ph-bold ph-users text-lg"></i> Social</button>
                <button onclick="window.location.href='index.html'; setTimeout(()=>filterCategory('Tools'), 500)" class="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition"><i class="ph-bold ph-wrench text-lg"></i> Tools</button>

                <h4 class="text-xs font-bold text-gray-400 uppercase mt-4 mb-2 px-3">Legal</h4>
                <a href="legal.html?page=about" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition"><i class="ph-bold ph-info text-lg"></i> About Us</a>
                <a href="legal.html?page=privacy" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition"><i class="ph-bold ph-shield-check text-lg"></i> Privacy Policy</a>
                <a href="legal.html?page=dmca" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition"><i class="ph-bold ph-warning-circle text-lg"></i> DMCA</a>
                <a href="legal.html?page=contact" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition"><i class="ph-bold ph-envelope text-lg"></i> Contact</a>
            </div>
        </div>`;
    }
}

// 3. FOOTER
function loadFooter() {
    const footer = document.getElementById("global-footer");
    if (footer) {
        footer.innerHTML = `
        <footer class="bg-white border-t border-gray-200 pt-16 pb-10 mt-20 font-sans relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>
            <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <div class="space-y-5">
                    <a href="index.html" class="flex items-center gap-2.5"><div class="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg"><i class="ph-fill ph-android-logo"></i></div><span class="text-2xl font-extrabold text-gray-900">APK<span class="text-green-600">Verse</span></span></a>
                    <p class="text-sm text-gray-500">Your #1 destination for safe, secure, and verified Android APK downloads.</p>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-6 uppercase tracking-widest border-b-2 border-green-100 inline-block pb-1">Discover</h4>
                    <ul class="space-y-3 text-sm font-medium text-gray-500">
                        <li><a href="index.html" class="hover:text-green-600 transition">Home</a></li>
                        <li><a href="#" onclick="filterCategory('Games')" class="hover:text-green-600 transition">Popular Games</a></li>
                        <li><a href="#" onclick="filterCategory('Apps')" class="hover:text-green-600 transition">Top Apps</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-6 uppercase tracking-widest border-b-2 border-green-100 inline-block pb-1">Legal</h4>
                    <ul class="space-y-3 text-sm font-medium text-gray-500">
                        <li><a href="legal.html?page=privacy" class="hover:text-green-600 transition">Privacy Policy</a></li>
                        <li><a href="legal.html?page=dmca" class="hover:text-green-600 transition">DMCA</a></li>
                        <li><a href="legal.html?page=contact" class="hover:text-green-600 transition">Contact Us</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-6 uppercase tracking-widest border-b-2 border-green-100 inline-block pb-1">Safety</h4>
                    <div class="bg-green-50 border border-green-100 p-6 rounded-2xl shadow-sm"><div class="flex items-center gap-2 mb-2 text-green-700 font-bold text-sm"><i class="ph-fill ph-shield-check text-2xl"></i> 100% Verified</div><p class="text-xs text-gray-500">Scanned for malware.</p></div>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-6 border-t border-gray-100 pt-8 text-center"><p class="text-xs text-gray-400 font-medium">&copy; 2025 APKVerse Inc. All rights reserved.</p></div>
        </footer>`;
    }
}

// Global UI Functions
window.toggleMenu = () => {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('sideMenuOverlay');
    if (menu) {
        menu.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
        overlay.classList.toggle('opacity-0');
    }
};