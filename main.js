// ----------- Chargement des variables d'environnement publiques ----------- //
async function loadEnvironmentVariables() {
    try {
        const response = await fetch('/.netlify/functions/get-env');
        if (response.ok) {
            const envData = await response.json();
            window.ENV = envData;
            console.log('✅ Variables d\'environnement chargées depuis Netlify');
            return envData;
        }
    } catch (error) {
        console.log('⚠️ Impossible de charger les variables depuis Netlify, utilisation des valeurs par défaut');
    }
    window.ENV = {};
    return {};
}

// ----------- Configuration ----------- //
const ENV_CONFIG = {
    PAYDUNYA_PUBLIC_KEY: window.ENV?.PAYDUNYA_PUBLIC_KEY || 'live_public_NmQRTWBrtawr0yR2JFkVEvg5DAc',
    PAYDUNYA_MODE: window.ENV?.PAYDUNYA_MODE || 'live',
    SITE_URL: window.ENV?.SITE_URL || 'https://domstore.netlify.app',
    ADMIN_EMAIL: window.ENV?.ADMIN_EMAIL || 'domestudios.contact@gmail.com'
    // Jamais de clé privée ici !
};

const PAYDUNYA_CONFIG = {
    public_key: ENV_CONFIG.PAYDUNYA_PUBLIC_KEY,
    mode: ENV_CONFIG.PAYDUNYA_MODE,
    site_url: ENV_CONFIG.SITE_URL,
    ipn_url: `${ENV_CONFIG.SITE_URL}/.netlify/functions/ipn`,
    callback_url: `${ENV_CONFIG.SITE_URL}/.netlify/functions/payment-callback`,
    return_url: `${ENV_CONFIG.SITE_URL}/payment-success`,
    cancel_url: `${ENV_CONFIG.SITE_URL}/payment-cancel`
};

// ----------- Sécurité Admin par IP ----------- //
let authorizedIPs = JSON.parse(localStorage.getItem('authorizedIPs')) || ['127.0.0.1', 'localhost'];
let currentUserIP = '';
let isAdminAuthorized = true;

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        currentUserIP = data.ip;
    } catch {
        currentUserIP = 'localhost';
    }
    checkAdminAccess();
}

function checkAdminAccess() {
    isAdminAuthorized = authorizedIPs.includes(currentUserIP);
    const adminToggle = document.getElementById('adminToggle');
    if (adminToggle) adminToggle.style.display = isAdminAuthorized ? 'block' : 'none';
}

function renderAuthorizedIPs() {
    const ipsList = document.getElementById('authorizedIPsList');
    if (!ipsList) return;
    ipsList.innerHTML = authorizedIPs.map(ip => `
        <div class="flex justify-between items-center p-3 bg-gris-fonce rounded-lg border border-gray-600">
            <span class="text-white">${ip}</span>
            <button onclick="removeIP('${ip}')" class="text-red-400 hover:text-red-300 px-3 py-1 border border-red-400 rounded hover:bg-red-400 hover:text-white transition-colors">
                Supprimer
            </button>
        </div>
    `).join('');
}

function addNewIP() {
    const newIPInput = document.getElementById('newIP');
    const newIP = newIPInput.value.trim();
    if (newIP && !authorizedIPs.includes(newIP)) {
        authorizedIPs.push(newIP);
        localStorage.setItem('authorizedIPs', JSON.stringify(authorizedIPs));
        renderAuthorizedIPs();
        newIPInput.value = '';
        alert('IP ajoutée avec succès !');
    } else if (authorizedIPs.includes(newIP)) {
        alert('Cette IP est déjà autorisée !');
    } else {
        alert('Veuillez entrer une adresse IP valide !');
    }
}

function removeIP(ip) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'IP ${ip} ?`)) {
        authorizedIPs = authorizedIPs.filter(authorizedIP => authorizedIP !== ip);
        localStorage.setItem('authorizedIPs', JSON.stringify(authorizedIPs));
        renderAuthorizedIPs();
        checkAdminAccess();
    }
}

// ----------- Base produits ----------- //
let products = JSON.parse(localStorage.getItem('products')) || [
    {
        id: 1,
        name: "Guide Complet ChatGPT Pro",
        price: 29,
        type: "ebook",
        description: "200+ prompts professionnels pour maximiser votre productivité avec ChatGPT",
        color: "blue-purple",
        fileData: null,
        downloadLink: "https://drive.google.com/file/d/1example/view?usp=sharing",
        fileName: "chatgpt-pro-guide.pdf"
    },
    // ... autres produits ...
];

// ----------- Panier, Wishlist, Stats ----------- //
let cart = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
let newsletterSubscribers = JSON.parse(localStorage.getItem('newsletterSubscribers')) || [];
let siteStats = {
    visits: parseInt(localStorage.getItem('siteVisits')) || 0,
    sales: parseInt(localStorage.getItem('totalSales')) || 0,
    revenue: parseInt(localStorage.getItem('totalRevenue')) || 0,
    subscribers: newsletterSubscribers.length,
    popularProducts: JSON.parse(localStorage.getItem('popularProducts')) || {}
};

// ----------- Fonctions produits ----------- //
function generateProductHTML(product) {
    const colorGradients = {
        'blue-purple': 'from-cyan-400 to-purple-500',
        'green-blue': 'from-emerald-400 to-cyan-500',
        'purple-pink': 'from-purple-500 to-pink-500',
        'orange-red': 'from-orange-400 to-red-500',
        'teal-green': 'from-teal-400 to-emerald-500',
        'yellow-orange': 'from-yellow-400 to-orange-500'
    };
    const typeIcons = {
        ebook: `<svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
        template: `<svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>`
    };
    const gradient = colorGradients[product.color];
    const icon = typeIcons[product.type];
    const typeLabel = product.type === 'ebook' ? 'Ebook IA' : 'Template Notion';
    return `
        <div class="product-card ${product.type} card-hover rounded-xl overflow-hidden" data-id="${product.id}">
            <div class="h-48 bg-gradient-to-br ${gradient} flex items-center justify-center">
                <div class="text-white text-center">
                    ${icon}
                    <p class="font-semibold">${typeLabel}</p>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold font-montserrat text-white mb-2">${product.name}</h3>
                <p class="text-gray-300 mb-4">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold text-jaune">${product.price}€</span>
                    <div class="flex gap-2">
                        <button class="add-to-wishlist text-gray-400 hover:text-red-500 p-2" data-id="${product.id}" title="Ajouter aux favoris">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                        <button class="add-to-cart btn-primary px-6 py-2" data-product="${product.name}" data-price="${product.price}" data-type="${product.type}" data-id="${product.id}">Ajouter au panier</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    productsGrid.innerHTML = products.map(generateProductHTML).join('');
}

// ----------- Gestion du panier ----------- //
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.product === product.name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ product: product.name, price: product.price, type: product.type, quantity: 1 });
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    // À compléter selon ton HTML
}

// ----------- Gestion des favoris ----------- //
function addToWishlist(productId) {
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistDisplay();
    }
}

function updateWishlistDisplay() {
    // À compléter selon ton HTML
}

// ----------- Gestion des fichiers produits ----------- //
function handleFileSelection(file) {
    if (file.size > 50 * 1024 * 1024) {
        showNotification('Le fichier est trop volumineux (max 50MB)', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        // Stocker le fichier en base64 (attention, pas recommandé pour gros fichiers)
        fileBase64 = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ----------- Notification ----------- //
function showNotification(message, type = 'info') {
    // À compléter selon ton HTML
    alert(message);
}

// ----------- Initialisation ----------- //
document.addEventListener('DOMContentLoaded', async function() {
    await loadEnvironmentVariables();
    getUserIP();
    renderProducts();
    renderAuthorizedIPs();
    updateWishlistDisplay();
    // ... autres initialisations ...
});

window.addEventListener('error', function(e) {
    if (e.filename && (e.filename.includes('paydunya') || e.filename.includes('jsd'))) {
        console.log('Ressource externe non critique ignorée:', e.filename);
        return true;
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.log('Promesse rejetée gérée:', e.reason);
    e.preventDefault();
});


// ----------- Export des fonctions si besoin ----------- //
// export { addToCart, addToWishlist, ... }
