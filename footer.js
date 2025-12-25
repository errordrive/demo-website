document.addEventListener("DOMContentLoaded", function () {
    const footerContainer = document.getElementById("global-footer");

    if (footerContainer) {
        footerContainer.innerHTML = `
        <footer class="bg-white border-t border-gray-200 pt-16 pb-10 mt-20 font-sans relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>

            <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                
                <div class="space-y-5">
                    <a href="index.html" class="flex items-center gap-2.5 group">
                        <div class="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-green-200 group-hover:scale-110 transition duration-300">
                            <i class="ph-fill ph-android-logo"></i>
                        </div>
                        <span class="text-2xl font-extrabold tracking-tight text-gray-900">APK<span class="text-green-600">Verse</span></span>
                    </a>
                    <p class="text-sm text-gray-500 leading-relaxed">
                        Your #1 destination for safe, secure, and verified Android APK downloads. Experience the freedom of Android without restrictions.
                    </p>
                    <div class="flex gap-3 pt-2">
                        <a href="#" class="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition duration-300"><i class="ph-fill ph-facebook-logo text-xl"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition duration-300"><i class="ph-fill ph-telegram-logo text-xl"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:border-black transition duration-300"><i class="ph-fill ph-x-logo text-xl"></i></a>
                    </div>
                </div>

                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-6 uppercase tracking-widest border-b-2 border-green-100 inline-block pb-1">Discover</h4>
                    <ul class="space-y-3 text-sm font-medium text-gray-500">
                        <li><a href="index.html" class="hover:text-green-600 transition flex items-center gap-2 group"><i class="ph-bold ph-caret-right text-xs text-gray-300 group-hover:text-green-500"></i> Home</a></li>
                        <li><a href="index.html" class="hover:text-green-600 transition flex items-center gap-2 group"><i class="ph-bold ph-caret-right text-xs text-gray-300 group-hover:text-green-500"></i> Popular Games</a></li>
                        <li><a href="index.html" class="hover:text-green-600 transition flex items-center gap-2 group"><i class="ph-bold ph-caret-right text-xs text-gray-300 group-hover:text-green-500"></i> Social Apps</a></li>
                        <li><a href="index.html" class="hover:text-green-600 transition flex items-center gap-2 group"><i class="ph-bold ph-caret-right text-xs text-gray-300 group-hover:text-green-500"></i> New Arrivals</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-6 uppercase tracking-widest border-b-2 border-green-100 inline-block pb-1">Legal & Support</h4>
                    <ul class="space-y-3 text-sm font-medium text-gray-500">
                        <li><a href="legal.html?page=about" class="hover:text-green-600 transition flex items-center gap-2 group"><i class="ph-bold ph-info text-gray-400 group-hover:text-green-600"></i> About Us</a></li>
                        <li><a href="legal.html?page=contact" class="hover:text-green-600 transition flex items-center gap-2 group"><i class="ph-bold ph-envelope text-gray-400 group-hover:text-green-600"></i> Contact Us</a></li>
                        <li><a href="legal.html?page=privacy" class="hover:text-green-600 transition flex items-center gap-2 group"><i class="ph-bold ph-shield text-gray-400 group-hover:text-green-600"></i> Privacy Policy</a></li>
                        <li><a href="legal.html?page=dmca" class="hover:text-red-500 transition flex items-center gap-2 group"><i class="ph-bold ph-warning-circle text-gray-400 group-hover:text-red-500"></i> DMCA Disclaimer</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-6 uppercase tracking-widest border-b-2 border-green-100 inline-block pb-1">Safety First</h4>
                    <div class="bg-gradient-to-br from-green-50 to-white border border-green-100 p-6 rounded-2xl shadow-sm text-center relative overflow-hidden group">
                        <div class="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-green-100 rounded-full opacity-50 blur-xl"></div>
                        
                        <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-3 text-2xl group-hover:scale-110 transition duration-300">
                            <i class="ph-fill ph-shield-check"></i>
                        </div>
                        <h5 class="font-bold text-green-800 text-sm mb-2">100% Verified Secure</h5>
                        <p class="text-xs text-gray-500 leading-relaxed mb-4">
                            Every file is manually scanned for malware and viruses before being listed.
                        </p>
                        <span class="inline-block text-[10px] font-bold uppercase tracking-wider text-green-600 bg-white px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                            Secured by APKVerse
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="max-w-7xl mx-auto px-6 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-xs text-gray-400 font-medium">
                    &copy; 2025 <strong class="text-gray-600">APKVerse Inc</strong>. All rights reserved.
                </p>
                <div class="flex items-center gap-4 text-gray-300">
                    <i class="ph-fill ph-lock-key text-xl" title="SSL Secured"></i>
                    <i class="ph-fill ph-globe text-xl" title="Global Access"></i>
                </div>
            </div>
        </footer>`;
    }
});