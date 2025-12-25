document.addEventListener("DOMContentLoaded", function () {
    const footerContainer = document.getElementById("global-footer");

    if (footerContainer) {
        footerContainer.innerHTML = `
        <footer class="bg-white border-t border-gray-200 pt-16 pb-10 mt-20 font-sans relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>
            <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <div class="space-y-5">
                    <a href="index.html" class="flex items-center gap-2.5 group">
                        <div class="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg"><i class="ph-fill ph-android-logo"></i></div>
                        <span class="text-2xl font-extrabold tracking-tight text-gray-900">APK<span class="text-green-600">Verse</span></span>
                    </a>
                    <p class="text-sm text-gray-500 leading-relaxed">Your #1 destination for safe, secure, and verified Android APK downloads.</p>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-6 uppercase tracking-widest border-b-2 border-green-100 inline-block pb-1">Discover</h4>
                    <ul class="space-y-3 text-sm font-medium text-gray-500">
                        <li><a href="index.html" class="hover:text-green-600 transition">Home</a></li>
                        <li><a href="index.html" class="hover:text-green-600 transition">Popular Games</a></li>
                        <li><a href="index.html" class="hover:text-green-600 transition">Top Apps</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-6 uppercase tracking-widest border-b-2 border-green-100 inline-block pb-1">Legal</h4>
                    <ul class="space-y-3 text-sm font-medium text-gray-500">
                        <li><a href="legal.html?page=privacy" class="hover:text-green-600 transition">Privacy Policy</a></li>
                        <li><a href="legal.html?page=dmca" class="hover:text-green-600 transition">DMCA Disclaimer</a></li>
                        <li><a href="legal.html?page=contact" class="hover:text-green-600 transition">Contact Us</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900 text-sm mb-6 uppercase tracking-widest border-b-2 border-green-100 inline-block pb-1">Safety First</h4>
                    <div class="bg-green-50 border border-green-100 p-6 rounded-2xl shadow-sm">
                        <div class="flex items-center gap-2 mb-2 text-green-700 font-bold text-sm"><i class="ph-fill ph-shield-check text-2xl"></i> 100% Verified</div>
                        <p class="text-xs text-gray-500 leading-relaxed">Every file is manually scanned for malware and viruses.</p>
                    </div>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-6 border-t border-gray-100 pt-8 text-center"><p class="text-xs text-gray-400 font-medium">&copy; 2025 APKVerse Inc. All rights reserved.</p></div>
        </footer>`;
    }
});