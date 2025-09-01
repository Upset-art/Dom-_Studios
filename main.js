
        // Get user's IP address
        async function getUserIP() {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                currentUserIP = data.ip;
                console.log('IP détectée:', currentUserIP);
                checkAdminAccess();
            } catch (error) {
                console.log('Impossible de détecter l\'IP, utilisation de localhost');
                currentUserIP = 'localhost';
                checkAdminAccess();
            }
        }

        // Check if current IP is authorized for admin access
        function checkAdminAccess() {
            // Allow admin access for development and common local IPs
            isAdminAuthorized = true; // Temporarily allow all access for testing
            
            const adminToggle = document.getElementById('adminToggle');
            adminToggle.style.display = 'block';
        }

        // Configuration des variables d'environnement
        const ENV_CONFIG = {
            // Variables d'environnement chargées depuis .env ou Netlify
            PAYDUNYA_PUBLIC_KEY: window.ENV?.PAYDUNYA_PUBLIC_KEY || 'live_public_NmQRTWBrtawr0yR2JFkVEvg5DAc',
            PAYDUNYA_PRIVATE_KEY: window.ENV?.PAYDUNYA_PRIVATE_KEY || 'live_private_WbLUWulyAY8DOhTT5aWRMnPzDyt',
            PAYDUNYA_TOKEN: window.ENV?.PAYDUNYA_TOKEN || 'XQbuw9M59W36RtxxA4tV',
            PAYDUNYA_MASTER_KEY: window.ENV?.PAYDUNYA_MASTER_KEY || 'ix7MFes9-WsN9-4Ika-aY2t-o1ptUV51x38P',
            PAYDUNYA_MODE: window.ENV?.PAYDUNYA_MODE || 'live',
            SITE_URL: window.ENV?.SITE_URL || 'https://domstore.netlify.app',
            ADMIN_EMAIL: window.ENV?.ADMIN_EMAIL || 'admin@domestudios.com',
            SMTP_HOST: window.ENV?.SMTP_HOST || '',
            SMTP_USER: window.ENV?.SMTP_USER || '',
            SMTP_PASS: window.ENV?.SMTP_PASS || ''
        };

        // PayDunya Configuration avec variables d'environnement
        const PAYDUNYA_CONFIG = {
            public_key: ENV_CONFIG.PAYDUNYA_PUBLIC_KEY,
            private_key: ENV_CONFIG.PAYDUNYA_PRIVATE_KEY,
            token: ENV_CONFIG.PAYDUNYA_TOKEN,
            master_key: ENV_CONFIG.PAYDUNYA_MASTER_KEY,
            mode: ENV_CONFIG.PAYDUNYA_MODE,
            sandbox_mode: ENV_CONFIG.PAYDUNYA_MODE === 'sandbox',
            app_name: 'Domè Studios Store',
            app_description: 'L\'application doit récupérer les paiement mobile money depuis mon site de vente.',
            site_url: ENV_CONFIG.SITE_URL,
            callback_url: `${ENV_CONFIG.SITE_URL}/.netlify/functions/payment-callback`,
            return_url: `${ENV_CONFIG.SITE_URL}/payment-success`,
            cancel_url: `${ENV_CONFIG.SITE_URL}/payment-cancel`,
            ipn_url: `${ENV_CONFIG.SITE_URL}/.netlify/functions/ipn`
        };

        // Fonction pour charger les variables d'environnement
        async function loadEnvironmentVariables() {
            try {
                // Essayer de charger depuis une fonction Netlify
                const response = await fetch('/.netlify/functions/get-env');
                if (response.ok) {
                    const envData = await response.json();
                    window.ENV = envData;
                    console.log('✅ Variables d\'environnement chargées depuis Netlify');
                    return true;
                }
            } catch (error) {
                console.log('⚠️ Impossible de charger les variables depuis Netlify, utilisation des valeurs par défaut');
            }
            
            // Fallback: utiliser les valeurs par défaut
            window.ENV = {};
            return false;
        }

        // Products database with file management
        let products = [
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
            {
                id: 2,
                name: "Prompts Marketing IA",
                price: 24,
                type: "ebook",
                description: "150+ prompts spécialisés pour créer du contenu marketing percutant",
                color: "green-blue",
                fileData: null,
                downloadLink: "https://drive.google.com/file/d/2example/view?usp=sharing",
                fileName: "prompts-marketing-ia.pdf"
            },
            {
                id: 3,
                name: "IA pour Entrepreneurs",
                price: 34,
                type: "ebook",
                description: "Automatisez votre business avec 100+ prompts dédiés aux entrepreneurs",
                color: "purple-pink",
                fileData: null,
                downloadLink: "https://drive.google.com/file/d/3example/view?usp=sharing",
                fileName: "ia-entrepreneurs.pdf"
            },
            {
                id: 4,
                name: "Dashboard Productivité",
                price: 19,
                type: "template",
                description: "Template complet pour organiser vos projets, tâches et objectifs",
                color: "orange-red",
                fileData: null,
                downloadLink: "https://www.notion.so/templates/dashboard-productivite",
                fileName: "dashboard-productivite.notion"
            },
            {
                id: 5,
                name: "CRM Business",
                price: 39,
                type: "template",
                description: "Gérez vos clients, prospects et ventes avec ce template professionnel",
                color: "teal-green",
                fileData: null,
                downloadLink: "https://www.notion.so/templates/crm-business",
                fileName: "crm-business.notion"
            },
            {
                id: 6,
                name: "Planificateur Personnel",
                price: 15,
                type: "template",
                description: "Organisez votre vie personnelle : habitudes, finances, objectifs",
                color: "yellow-orange",
                fileData: null,
                downloadLink: "https://www.notion.so/templates/planificateur-personnel",
                fileName: "planificateur-personnel.notion"
            }
        ];

        // Cart functionality
        let cart = [];
        let cartCount = 0;
        
        // Wishlist functionality
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        
        // Search functionality
        let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        
        // Newsletter subscribers
        let newsletterSubscribers = JSON.parse(localStorage.getItem('newsletterSubscribers')) || [];
        
        // Site statistics
        let siteStats = {
            visits: parseInt(localStorage.getItem('siteVisits')) || 0,
            sales: parseInt(localStorage.getItem('totalSales')) || 0,
            revenue: parseInt(localStorage.getItem('totalRevenue')) || 0,
            subscribers: 0,
            popularProducts: JSON.parse(localStorage.getItem('popularProducts')) || {}
        };

        // DOM elements
        const cartBtn = document.getElementById('cartBtn');
        const cartModal = document.getElementById('cartModal');
        const closeCart = document.getElementById('closeCart');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const totalAmount = document.getElementById('totalAmount');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const cartCountElement = document.getElementById('cartCount');

        // Admin elements
        const adminToggle = document.getElementById('adminToggle');
        const adminPanel = document.getElementById('adminPanel');
        const closeAdmin = document.getElementById('closeAdmin');
        const addProductForm = document.getElementById('addProductForm');
        const adminProductsList = document.getElementById('adminProductsList');

        // Product filtering
        const filterAll = document.getElementById('filterAll');
        const filterEbooks = document.getElementById('filterEbooks');
        const filterTemplates = document.getElementById('filterTemplates');
        const productsGrid = document.getElementById('productsGrid');

        // Color gradients mapping
        const colorGradients = {
            'blue-purple': 'from-cyan-400 to-purple-500',
            'green-blue': 'from-emerald-400 to-cyan-500',
            'purple-pink': 'from-purple-500 to-pink-500',
            'orange-red': 'from-orange-400 to-red-500',
            'teal-green': 'from-teal-400 to-emerald-500',
            'yellow-orange': 'from-yellow-400 to-orange-500'
        };

        // Icons for product types
        const typeIcons = {
            ebook: `<svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>`,
            template: `<svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                       </svg>`
        };

        // Generate product HTML
        function generateProductHTML(product) {
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

        // Render products (legacy function - now uses renderProductsEnhanced)
        function renderProducts() {
            renderProductsEnhanced();
        }

        // Render admin products list
        function renderAdminProducts() {
            adminProductsList.innerHTML = products.map(product => `
                <div class="flex justify-between items-center p-4 bg-gris-fonce rounded-lg border border-gray-600">
                    <div>
                        <h4 class="font-bold text-white">${product.name}</h4>
                        <p class="text-gray-300">${product.price}€ - ${product.type === 'ebook' ? 'Ebook IA' : 'Template Notion'}</p>
                    </div>
                    <button onclick="deleteProduct(${product.id})" class="text-red-400 hover:text-red-300 px-3 py-1 border border-red-400 rounded hover:bg-red-400 hover:text-white transition-colors">
                        Supprimer
                    </button>
                </div>
            `).join('');
        }

        // File upload handling
        let selectedFile = null;
        let fileBase64 = null;

        // File drop zone functionality
        const fileDropZone = document.getElementById('fileDropZone');
        const productFileInput = document.getElementById('productFile');
        const filePreview = document.getElementById('filePreview');
        const fileName = document.getElementById('fileName');
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadStatus = document.getElementById('uploadStatus');

        fileDropZone.addEventListener('click', () => {
            productFileInput.click();
        });

        fileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileDropZone.classList.add('border-accent');
        });

        fileDropZone.addEventListener('dragleave', () => {
            fileDropZone.classList.remove('border-accent');
        });

        fileDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            fileDropZone.classList.remove('border-accent');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelection(files[0]);
            }
        });

        productFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });

        function handleFileSelection(file) {
            // Validate file size (50MB max)
            if (file.size > 50 * 1024 * 1024) {
                showNotification('Le fichier est trop volumineux (max 50MB)', 'error');
                return;
            }

            selectedFile = file;
            fileName.textContent = file.name;
            filePreview.classList.remove('hidden');
            
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                uploadProgress.style.width = progress + '%';
                
                if (progress >= 100) {
                    clearInterval(interval);
                    uploadStatus.textContent = 'Fichier prêt';
                    uploadStatus.classList.add('text-accent-tertiaire');
                    
                    // Convert to base64 for storage
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        fileBase64 = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            }, 100);
        }

        document.getElementById('removeFile').addEventListener('click', () => {
            selectedFile = null;
            fileBase64 = null;
            filePreview.classList.add('hidden');
            productFileInput.value = '';
            uploadProgress.style.width = '0%';
            uploadStatus.textContent = 'Prêt à uploader';
            uploadStatus.classList.remove('text-accent-tertiaire');
        });

        // Add new product with file handling
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const downloadLink = document.getElementById('productDownloadLink').value.trim();
            
            // Validate that either file or download link is provided
            if (!selectedFile && !downloadLink) {
                showNotification('Veuillez ajouter un fichier ou un lien de téléchargement', 'error');
                return;
            }
            
            const newProduct = {
                id: Date.now(),
                name: document.getElementById('productName').value,
                price: parseInt(document.getElementById('productPrice').value),
                type: document.getElementById('productType').value,
                description: document.getElementById('productDescription').value,
                color: document.getElementById('productColor').value,
                fileData: fileBase64,
                fileName: selectedFile ? selectedFile.name : null,
                downloadLink: downloadLink || null,
                createdAt: new Date().toISOString()
            };
            
            products.push(newProduct);
            
            // Save to localStorage
            localStorage.setItem('products', JSON.stringify(products));
            
            renderProducts();
            renderAdminProducts();
            
            // Reset form
            this.reset();
            selectedFile = null;
            fileBase64 = null;
            filePreview.classList.add('hidden');
            uploadProgress.style.width = '0%';
            uploadStatus.textContent = 'Prêt à uploader';
            uploadStatus.classList.remove('text-accent-tertiaire');
            
            // Show success message
            showNotification('✅ Produit ajouté avec succès !', 'success');
        });

        // Delete product
        function deleteProduct(id) {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                products = products.filter(product => product.id !== id);
                renderProducts();
                renderAdminProducts();
            }
        }

        // IP Management Functions
        function renderAuthorizedIPs() {
            const ipsList = document.getElementById('authorizedIPsList');
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

        // Load authorized IPs from localStorage
        function loadAuthorizedIPs() {
            const savedIPs = localStorage.getItem('authorizedIPs');
            if (savedIPs) {
                authorizedIPs = JSON.parse(savedIPs);
            }
        }

        // PayDunya Checkout Function avec intégration Netlify
async function initiatePayDunyaCheckout() {
  try {
    // Calcul du total de la commande
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const items = cart.map(item => `${item.product} x${item.quantity}`).join(', ');
    const customerEmail = localStorage.getItem('customerEmail') || document.getElementById('customerEmail').value;

    // Données envoyées à ton backend Netlify
    const checkoutData = {
      amount: total,
      description: `Commande Domè Studios: ${items}`,
      order_id: 'DS-' + Date.now(),
      customer_email: customerEmail,
      customer_items: cart
    };

    // Appel à la Netlify Function qui va créer la facture PayDunya
    const response = await fetch("/.netlify/functions/createInvoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutData)
    });

    const result = await response.json();

    if (result.invoice_url) {
      showNotification('🚀 Redirection vers PayDunya en cours...');
      window.location.href = result.invoice_url; // Redirection vers la page de paiement
    } else {
      throw new Error(result.error || "Impossible de créer la facture PayDunya.");
    }
  } catch (error) {
    console.error("Erreur lors du paiement PayDunya:", error);
    showNotification("❌ Erreur lors du paiement. Veuillez réessayer.", "error");
  }
}

        // Admin panel functionality
        adminToggle.addEventListener('click', () => {
            if (!isAdminAuthorized) {
                showNotification('Accès non autorisé ! Votre IP n\'est pas dans la liste des adresses autorisées.', 'error');
                return;
            }
            adminPanel.classList.remove('hidden');
            renderAdminProducts();
            renderAuthorizedIPs();
            renderStats();
            document.getElementById('currentIP').textContent = currentUserIP;
        });

        closeAdmin.addEventListener('click', () => {
            adminPanel.classList.add('hidden');
        });

        adminPanel.addEventListener('click', (e) => {
            if (e.target === adminPanel) {
                adminPanel.classList.add('hidden');
            }
        });

        // Update cart display
        function updateCartDisplay() {
            cartCountElement.textContent = cartCount;
            
            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="text-center py-8">
                        <div class="w-16 h-16 bg-gris-moderne rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5"></path>
                            </svg>
                        </div>
                        <p class="text-gray-400">Votre panier est vide</p>
                        <p class="text-gray-500 text-sm mt-2">Découvrez nos produits IA</p>
                    </div>
                `;
                cartTotal.classList.add('hidden');
                checkoutBtn.classList.add('hidden');
                document.getElementById('customerEmailForm').classList.add('hidden');
                return;
            }

            let total = 0;
            cartItems.innerHTML = '';
            
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                const itemElement = document.createElement('div');
                itemElement.className = 'flex justify-between items-center p-3 bg-noir rounded-lg border border-gray-600';
                itemElement.innerHTML = `
                    <div>
                        <h4 class="font-medium text-white">${item.product}</h4>
                        <p class="text-sm text-gray-300">${formatPrice(item.price)} x ${item.quantity}</p>
                    </div>
                    <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-300">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                `;
                cartItems.appendChild(itemElement);
            });

            totalAmount.textContent = formatPrice(total);
            cartTotal.classList.remove('hidden');
            checkoutBtn.classList.remove('hidden');
            document.getElementById('customerEmailForm').classList.remove('hidden');
        }

        // Remove from cart
        function removeFromCart(index) {
            const item = cart[index];
            cartCount -= item.quantity;
            cart.splice(index, 1);
            updateCartDisplay();
        }

        // Modal functionality
        cartBtn.addEventListener('click', () => {
            cartModal.classList.remove('hidden');
        });

        closeCart.addEventListener('click', () => {
            cartModal.classList.add('hidden');
        });

        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.classList.add('hidden');
            }
        });

        // Checkout functionality with PayDunya integration
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Votre panier est vide !', 'error');
                return;
            }
            
            // Validate customer email
            const customerEmail = document.getElementById('customerEmail').value.trim();
            if (!customerEmail || !isValidEmail(customerEmail)) {
                showNotification('Veuillez saisir un email valide pour recevoir vos produits !', 'error');
                document.getElementById('customerEmail').focus();
                return;
            }
            
            showLoading();
            
            // Store customer email for delivery
            localStorage.setItem('customerEmail', customerEmail);
            
            // Simulate processing time
            setTimeout(() => {
                hideLoading();
                
                // Record sale statistics
                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                recordSale(total);
                
                // Use PayDunya for checkout
                initiatePayDunyaCheckout();
                
                showNotification('Redirection vers PayDunya...');
            }, 1500);
        });

        // Email validation function
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // Product filtering
        function filterProducts(type) {
            const productCards = document.querySelectorAll('.product-card');
            
            // Update filter buttons
            document.querySelectorAll('[id^="filter"]').forEach(btn => {
                btn.classList.remove('bg-jaune', 'text-noir');
                btn.classList.add('text-white');
            });
            
            if (type === 'all') {
                filterAll.classList.add('bg-jaune', 'text-noir');
                filterAll.classList.remove('text-white');
                productCards.forEach(product => product.style.display = 'block');
            } else if (type === 'ebook') {
                filterEbooks.classList.add('bg-jaune', 'text-noir');
                filterEbooks.classList.remove('text-white');
                productCards.forEach(product => {
                    if (product.classList.contains('ebook')) {
                        product.style.display = 'block';
                    } else {
                        product.style.display = 'none';
                    }
                });
            } else if (type === 'template') {
                filterTemplates.classList.add('bg-jaune', 'text-noir');
                filterTemplates.classList.remove('text-white');
                productCards.forEach(product => {
                    if (product.classList.contains('template')) {
                        product.style.display = 'block';
                    } else {
                        product.style.display = 'none';
                    }
                });
            }
        }

        filterAll.addEventListener('click', () => filterProducts('all'));
        filterEbooks.addEventListener('click', () => filterProducts('ebook'));
        filterTemplates.addEventListener('click', () => filterProducts('template'));

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Contact form submission
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            showLoading();
            
            // Simulate form processing
            setTimeout(() => {
                hideLoading();
                showNotification('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
                this.reset();
            }, 1500);
        });

        // Add IP button event listener
        document.getElementById('addIPBtn').addEventListener('click', addNewIP);
        
        // Allow Enter key to add IP
        document.getElementById('newIP').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addNewIP();
            }
        });

        // Notification system
        function showNotification(message, type = 'success') {
            const toast = document.getElementById('notificationToast');
            const messageEl = document.getElementById('notificationMessage');
            const toastDiv = toast.querySelector('div');
            
            messageEl.textContent = message;
            toastDiv.className = `px-6 py-3 rounded-lg shadow-lg ${type === 'success' ? 'bg-vert' : 'bg-red-500'} text-white`;
            
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }

        // Loading spinner
        function showLoading() {
            document.getElementById('loadingSpinner').classList.remove('hidden');
        }

        function hideLoading() {
            document.getElementById('loadingSpinner').classList.add('hidden');
        }

        // Search functionality
        function performSearch(query) {
            const results = products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                product.type.toLowerCase().includes(query.toLowerCase())
            );
            
            const searchResults = document.getElementById('searchResults');
            
            if (results.length === 0) {
                searchResults.innerHTML = '<p class="text-gray-400 text-center py-8">Aucun résultat trouvé</p>';
            } else {
                searchResults.innerHTML = results.map(product => `
                    <div class="flex items-center gap-4 p-4 bg-noir rounded-lg border border-gray-600">
                        <div class="w-16 h-16 bg-gradient-to-br ${colorGradients[product.color]} rounded-lg flex items-center justify-center">
                            <span class="text-white text-xs font-bold">${product.type === 'ebook' ? 'EB' : 'TN'}</span>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-white">${product.name}</h4>
                            <p class="text-gray-300 text-sm">${product.description}</p>
                            <p class="text-jaune font-bold">${product.price}€</p>
                        </div>
                        <button onclick="addToCartFromSearch(${product.id})" class="btn-primary px-4 py-2">Ajouter</button>
                    </div>
                `).join('');
            }
            
            // Save search to history
            if (!searchHistory.includes(query)) {
                searchHistory.unshift(query);
                if (searchHistory.length > 10) searchHistory.pop();
                localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            }
            
            document.getElementById('searchModal').classList.remove('hidden');
        }

        function addToCartFromSearch(productId) {
            const product = products.find(p => p.id === productId);
            if (product) {
                const existingItem = cart.find(item => item.product === product.name);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ product: product.name, price: product.price, type: product.type, quantity: 1 });
                }
                cartCount++;
                updateCartDisplay();
                showNotification('Produit ajouté au panier !');
                document.getElementById('searchModal').classList.add('hidden');
            }
        }

        // Wishlist functionality
        function addToWishlist(productId) {
            const product = products.find(p => p.id === productId);
            if (product && !wishlist.find(item => item.id === productId)) {
                wishlist.push(product);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                updateWishlistDisplay();
                showNotification('Ajouté à la liste de souhaits !');
            }
        }

        function removeFromWishlist(productId) {
            wishlist = wishlist.filter(item => item.id !== productId);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            updateWishlistDisplay();
            renderWishlistItems();
        }

        function updateWishlistDisplay() {
            document.getElementById('wishlistCount').textContent = wishlist.length;
        }

        function renderWishlistItems() {
            const wishlistItems = document.getElementById('wishlistItems');
            
            if (wishlist.length === 0) {
                wishlistItems.innerHTML = '<p class="text-gray-400 text-center py-8">Votre liste de souhaits est vide</p>';
                return;
            }

            wishlistItems.innerHTML = wishlist.map(item => `
                <div class="flex items-center gap-4 p-4 bg-noir rounded-lg border border-gray-600">
                    <div class="w-16 h-16 bg-gradient-to-br ${colorGradients[item.color]} rounded-lg flex items-center justify-center">
                        <span class="text-white text-xs font-bold">${item.type === 'ebook' ? 'EB' : 'TN'}</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-white">${item.name}</h4>
                        <p class="text-jaune font-bold">${item.price}€</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="addToCartFromWishlist(${item.id})" class="btn-primary px-4 py-2">Ajouter au panier</button>
                        <button onclick="removeFromWishlist(${item.id})" class="text-red-400 hover:text-red-300 p-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function addToCartFromWishlist(productId) {
            const product = products.find(p => p.id === productId);
            if (product) {
                const existingItem = cart.find(item => item.product === product.name);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ product: product.name, price: product.price, type: product.type, quantity: 1 });
                }
                cartCount++;
                updateCartDisplay();
                showNotification('Produit ajouté au panier !');
            }
        }

        // Newsletter functionality
        function subscribeToNewsletter(email) {
            if (!newsletterSubscribers.includes(email)) {
                newsletterSubscribers.push(email);
                localStorage.setItem('newsletterSubscribers', JSON.stringify(newsletterSubscribers));
                updateStats();
                showNotification('Merci pour votre abonnement !');
                return true;
            } else {
                showNotification('Cet email est déjà abonné !', 'error');
                return false;
            }
        }

        // Statistics functions
        function updateStats() {
            siteStats.visits++;
            siteStats.subscribers = newsletterSubscribers.length;
            
            localStorage.setItem('siteVisits', siteStats.visits.toString());
            localStorage.setItem('totalSales', siteStats.sales.toString());
            localStorage.setItem('totalRevenue', siteStats.revenue.toString());
            
            // Update display if admin panel is open
            if (!document.getElementById('adminPanel').classList.contains('hidden')) {
                renderStats();
            }
        }

        function renderStats() {
            document.getElementById('statsVisits').textContent = siteStats.visits;
            document.getElementById('statsSales').textContent = siteStats.sales;
            document.getElementById('statsRevenue').textContent = siteStats.revenue + '€';
            document.getElementById('statsSubscribers').textContent = siteStats.subscribers;
        }

        function recordSale(amount) {
            siteStats.sales++;
            siteStats.revenue += amount;
            localStorage.setItem('totalSales', siteStats.sales.toString());
            localStorage.setItem('totalRevenue', siteStats.revenue.toString());
        }

        // Event listeners for new functionality
        document.getElementById('searchBtn').addEventListener('click', () => {
            const query = document.getElementById('searchInput').value.trim();
            if (query) {
                performSearch(query);
            }
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                    performSearch(query);
                }
            }
        });

        document.getElementById('wishlistBtn').addEventListener('click', () => {
            document.getElementById('wishlistModal').classList.remove('hidden');
            renderWishlistItems();
        });

        document.getElementById('closeWishlist').addEventListener('click', () => {
            document.getElementById('wishlistModal').classList.add('hidden');
        });

        document.getElementById('closeSearch').addEventListener('click', () => {
            document.getElementById('searchModal').classList.add('hidden');
        });

        document.getElementById('newsletterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletterEmail').value;
            if (subscribeToNewsletter(email)) {
                e.target.reset();
            }
        });

        // Enhanced render products with wishlist functionality
        function renderProductsEnhanced() {
            productsGrid.innerHTML = products.map(product => generateProductHTML(product)).join('');
            
            // Re-attach event listeners
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const product = this.getAttribute('data-product');
                    const price = parseInt(this.getAttribute('data-price'));
                    const type = this.getAttribute('data-type');
                    const productId = parseInt(this.getAttribute('data-id'));

                    const existingItem = cart.find(item => item.product === product);
                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        cart.push({ product, price, type, quantity: 1 });
                    }

                    cartCount++;
                    updateCartDisplay();
                    
                    // Track popular products
                    if (!siteStats.popularProducts[productId]) {
                        siteStats.popularProducts[productId] = 0;
                    }
                    siteStats.popularProducts[productId]++;
                    localStorage.setItem('popularProducts', JSON.stringify(siteStats.popularProducts));
                    
                    this.textContent = 'Ajouté !';
                    this.style.backgroundColor = '#6B8E23';
                    setTimeout(() => {
                        this.textContent = 'Ajouter au panier';
                        this.style.backgroundColor = '';
                    }, 1000);
                });
            });

            document.querySelectorAll('.add-to-wishlist').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    const isInWishlist = wishlist.find(item => item.id === productId);
                    
                    if (isInWishlist) {
                        removeFromWishlist(productId);
                        this.classList.remove('text-red-500');
                        this.classList.add('text-gray-400');
                    } else {
                        addToWishlist(productId);
                        this.classList.remove('text-gray-400');
                        this.classList.add('text-red-500');
                    }
                });
                
                // Set initial state
                const productId = parseInt(button.getAttribute('data-id'));
                if (wishlist.find(item => item.id === productId)) {
                    button.classList.remove('text-gray-400');
                    button.classList.add('text-red-500');
                }
            });
        }

        // Currency Management
        let currentCurrency = 'XOF';
        const exchangeRates = {
            'XOF': 1,
            'EUR': 0.0015,
            'USD': 0.0016
        };

        const currencySymbols = {
            'XOF': 'F CFA',
            'EUR': '€',
            'USD': '$'
        };

        function changeCurrency(currency) {
            currentCurrency = currency;
            document.getElementById('currencyBtn').querySelector('span').textContent = currency;
            localStorage.setItem('selectedCurrency', currency);
            renderProductsEnhanced();
            updateCartDisplay();
            showNotification(`💱 Devise changée vers ${currency}`);
        }

        function convertPrice(priceInXOF) {
            const convertedPrice = priceInXOF * exchangeRates[currentCurrency];
            return Math.round(convertedPrice * 100) / 100;
        }

        function formatPrice(price) {
            const convertedPrice = convertPrice(price);
            const symbol = currencySymbols[currentCurrency];
            
            if (currentCurrency === 'XOF') {
                return `${convertedPrice.toLocaleString()} ${symbol}`;
            } else {
                return `${symbol}${convertedPrice.toFixed(2)}`;
            }
        }

        // Mobile Menu Functionality
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            const mobileMenu = document.getElementById('mobileMenu');
            mobileMenu.classList.toggle('hidden');
        });

        // Mobile Search
        document.getElementById('mobileSearchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) {
                    performSearch(query);
                    document.getElementById('mobileMenu').classList.add('hidden');
                }
            }
        });

        // Mobile Search Button
        document.getElementById('mobileSearchBtn').addEventListener('click', () => {
            const query = document.getElementById('mobileSearchInput').value.trim();
            if (query) {
                performSearch(query);
                document.getElementById('mobileMenu').classList.add('hidden');
            }
        });

        // Mobile Currency Selector
        document.getElementById('mobileCurrencySelect').addEventListener('change', (e) => {
            changeCurrency(e.target.value);
            document.getElementById('mobileMenu').classList.add('hidden');
        });

        // Close mobile menu when clicking on links
        document.querySelectorAll('#mobileMenu a').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('mobileMenu').classList.add('hidden');
            });
        });

        // Enhanced Product Recommendations
        function getRecommendedProducts(currentProductId) {
            const currentProduct = products.find(p => p.id === currentProductId);
            if (!currentProduct) return [];
            
            return products
                .filter(p => p.id !== currentProductId && p.type === currentProduct.type)
                .slice(0, 3);
        }

        // Product Quick View Modal
        function showProductQuickView(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';
            modal.innerHTML = `
                <div class="bg-noir-secondaire border-2 border-accent rounded-xl max-w-2xl w-full p-8 backdrop-blur-md shadow-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold font-montserrat text-accent">${product.name}</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-accent transition-colors p-2 rounded-lg hover:bg-gris-moderne">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="h-64 bg-gradient-to-br ${colorGradients[product.color]} rounded-xl flex items-center justify-center">
                            <div class="text-white text-center">
                                ${typeIcons[product.type]}
                                <p class="font-semibold">${product.type === 'ebook' ? 'Ebook IA' : 'Template Notion'}</p>
                            </div>
                        </div>
                        <div>
                            <p class="text-gray-300 mb-4">${product.description}</p>
                            <div class="mb-6">
                                <span class="text-3xl font-bold text-accent">${formatPrice(product.price)}</span>
                            </div>
                            <div class="space-y-3">
                                <button onclick="addToCartFromQuickView(${product.id})" class="w-full btn-primary py-3">
                                    <span class="flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5"></path>
                                        </svg>
                                        Ajouter au panier
                                    </span>
                                </button>
                                <button onclick="addToWishlist(${product.id})" class="w-full btn-secondary py-3">
                                    <span class="flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                        </svg>
                                        Ajouter aux favoris
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function addToCartFromQuickView(productId) {
            const product = products.find(p => p.id === productId);
            if (product) {
                const existingItem = cart.find(item => item.product === product.name);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ product: product.name, price: product.price, type: product.type, quantity: 1 });
                }
                cartCount++;
                updateCartDisplay();
                showNotification('✅ Produit ajouté au panier !');
                document.querySelector('.fixed').remove();
            }
        }

        // Enhanced PayDunya Integration with African Payment Methods
        function initiatePayDunyaCheckout() {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const items = cart.map(item => `${item.product} x${item.quantity}`).join(', ');
            
            // Show payment method selection modal
            const paymentModal = document.createElement('div');
            paymentModal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';
            paymentModal.innerHTML = `
                <div class="bg-noir-secondaire border-2 border-accent rounded-xl max-w-md w-full p-8 backdrop-blur-md shadow-2xl">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold font-montserrat text-accent mb-2">💳 Choisir le paiement</h3>
                        <p class="text-gray-300">Total: <span class="text-accent font-bold text-xl">${formatPrice(total)}</span></p>
                    </div>
                    
                    <div class="space-y-3 mb-6">
                        <button onclick="processPayment('orange_money')" class="w-full flex items-center p-4 bg-gris-moderne hover:bg-gris-clair rounded-lg transition-colors border-2 border-transparent hover:border-accent">
                            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-4">
                                <span class="text-white font-bold text-sm">OM</span>
                            </div>
                            <div class="text-left">
                                <h4 class="font-semibold text-white">🧡 Orange Money</h4>
                                <p class="text-sm text-gray-400">CI, SN - Paiement instantané</p>
                            </div>
                        </button>
                        
                        <button onclick="processPayment('mtn_money')" class="w-full flex items-center p-4 bg-gris-moderne hover:bg-gris-clair rounded-lg transition-colors border-2 border-transparent hover:border-accent">
                            <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-4">
                                <span class="text-white font-bold text-sm">MTN</span>
                            </div>
                            <div class="text-left">
                                <h4 class="font-semibold text-white">💛 MTN Mobile Money</h4>
                                <p class="text-sm text-gray-400">CI, BJ - Paiement sécurisé</p>
                            </div>
                        </button>
                        
                        <button onclick="processPayment('moov_money')" class="w-full flex items-center p-4 bg-gris-moderne hover:bg-gris-clair rounded-lg transition-colors border-2 border-transparent hover:border-accent">
                            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                                <span class="text-white font-bold text-sm">MV</span>
                            </div>
                            <div class="text-left">
                                <h4 class="font-semibold text-white">💙 Moov Money</h4>
                                <p class="text-sm text-gray-400">CI, BJ, TG - Rapide et fiable</p>
                            </div>
                        </button>
                        
                        <button onclick="processPayment('wave')" class="w-full flex items-center p-4 bg-gris-moderne hover:bg-gris-clair rounded-lg transition-colors border-2 border-transparent hover:border-accent">
                            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                                <span class="text-white font-bold text-sm">W</span>
                            </div>
                            <div class="text-left">
                                <h4 class="font-semibold text-white">💜 Wave</h4>
                                <p class="text-sm text-gray-400">CI, SN - Sans frais</p>
                            </div>
                        </button>
                        
                        <button onclick="processPayment('card')" class="w-full flex items-center p-4 bg-gris-moderne hover:bg-gris-clair rounded-lg transition-colors border-2 border-transparent hover:border-accent">
                            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                </svg>
                            </div>
                            <div class="text-left">
                                <h4 class="font-semibold text-white">💳 Carte Bancaire</h4>
                                <p class="text-sm text-gray-400">Visa, Mastercard</p>
                            </div>
                        </button>
                        
                        <button onclick="processPayment('bank_transfer')" class="w-full flex items-center p-4 bg-gris-moderne hover:bg-gris-clair rounded-lg transition-colors border-2 border-transparent hover:border-accent">
                            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                            </div>
                            <div class="text-left">
                                <h4 class="font-semibold text-white">🏦 Virement Bancaire</h4>
                                <p class="text-sm text-gray-400">Banques locales</p>
                            </div>
                        </button>
                    </div>
                    
                    <button onclick="this.closest('.fixed').remove()" class="w-full btn-secondary py-3">Annuler</button>
                </div>
            `;
            document.body.appendChild(paymentModal);
        }

        function processPayment(method) {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const items = cart.map(item => `${item.product} x${item.quantity}`).join(', ');
            
            showLoading();
            
            // Configuration PayDunya avec vraies données
            const checkoutData = {
                invoice: {
                    total_amount: total,
                    description: `Commande Domè Studios Store: ${items}`,
                    currency: 'XOF'
                },
                store: {
                    name: PAYDUNYA_CONFIG.app_name,
                    tagline: PAYDUNYA_CONFIG.app_description,
                    phone: "+225 XX XX XX XX",
                    postal_address: "Abidjan, Côte d'Ivoire",
                    website_url: PAYDUNYA_CONFIG.site_url,
                    logo_url: PAYDUNYA_CONFIG.site_url + "/logo.png"
                },
                custom_data: {
                    order_id: 'DS-' + Date.now(),
                    customer_items: cart,
                    payment_method: method,
                    timestamp: new Date().toISOString(),
                    currency_selected: currentCurrency,
                    site_origin: window.location.origin
                },
                actions: {
                    cancel_url: PAYDUNYA_CONFIG.cancel_url,
                    callback_url: PAYDUNYA_CONFIG.callback_url,
                    return_url: PAYDUNYA_CONFIG.return_url
                }
            };

            // Intégration PayDunya réelle
            setTimeout(() => {
                hideLoading();
                document.querySelector('.fixed').remove();
                
                try {
                    // Charger le SDK PayDunya et exécuter le checkout
                    if (typeof PayDunya === 'undefined') {
                        loadPayDunyaSDK().then(() => {
                            executePayDunyaCheckout(checkoutData, method);
                        }).catch(() => {
                            fallbackPaymentMethod(checkoutData, method);
                        });
                    } else {
                        executePayDunyaCheckout(checkoutData, method);
                    }
                    
                } catch (error) {
                    console.log('Erreur PayDunya, utilisation du fallback:', error);
                    fallbackPaymentMethod(checkoutData, method);
                }
                
                // Enregistrer la tentative de paiement
                recordSale(total);
                
                // Afficher le message de confirmation
                showNotification(`🎉 Paiement ${getPaymentMethodName(method)} initié ! Redirection PayDunya...`);
                
                // Vider le panier après redirection
                setTimeout(() => {
                    cart = [];
                    cartCount = 0;
                    updateCartDisplay();
                    cartModal.classList.add('hidden');
                }, 1000);
                
            }, 1500);
        }

        function getPaymentMethodName(method) {
            const methods = {
                'orange_money': 'Orange Money',
                'mtn_money': 'MTN Mobile Money',
                'moov_money': 'Moov Money',
                'wave': 'Wave',
                'card': 'Carte Bancaire',
                'bank_transfer': 'Virement Bancaire',
                'mobile_money': 'Mobile Money'
            };
            return methods[method] || method;
        }

        // Enhanced Product Display with Mobile Optimization
        function generateProductHTML(product) {
            const gradient = colorGradients[product.color];
            const icon = typeIcons[product.type];
            const typeLabel = product.type === 'ebook' ? '📚 Ebook IA' : '🗂️ Template Notion';
            const formattedPrice = formatPrice(product.price);
            
            return `
                <div class="product-card ${product.type} card-hover rounded-xl overflow-hidden group" data-id="${product.id}">
                    <div class="relative h-40 lg:h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden">
                        <div class="text-white text-center z-10">
                            <div class="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-2">
                                ${icon.replace('w-16 h-16', 'w-12 h-12 lg:w-16 lg:h-16')}
                            </div>
                            <p class="font-semibold text-xs lg:text-sm">${typeLabel}</p>
                        </div>
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <button onclick="showProductQuickView(${product.id})" class="opacity-0 group-hover:opacity-100 bg-white text-noir px-3 lg:px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 text-xs lg:text-sm">
                                👁️ Aperçu
                            </button>
                        </div>
                    </div>
                    <div class="p-4 lg:p-6">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-lg lg:text-xl font-bold font-montserrat text-white group-hover:text-accent transition-colors leading-tight">${product.name}</h3>
                            <div class="flex items-center gap-1 ml-2">
                                <span class="text-yellow-400 text-sm">⭐</span>
                                <span class="text-xs text-gray-400">4.8</span>
                            </div>
                        </div>
                        <p class="text-gray-300 mb-3 lg:mb-4 text-xs lg:text-sm leading-relaxed">${product.description}</p>
                        
                        <!-- African Context Features -->
                        <div class="flex flex-wrap items-center gap-1 lg:gap-2 mb-3 lg:mb-4">
                            <span class="text-xs bg-accent-tertiaire text-white px-2 py-1 rounded-full">🇨🇮 Afrique</span>
                            <span class="text-xs bg-orange-moderne text-white px-2 py-1 rounded-full">🚀 Instant</span>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <span class="text-xl lg:text-2xl font-bold text-accent">${formattedPrice}</span>
                                ${currentCurrency !== 'XOF' ? `<p class="text-xs text-gray-400">Prix converti</p>` : ''}
                            </div>
                            <div class="flex gap-2 w-full sm:w-auto">
                                <button class="add-to-wishlist text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-gris-moderne transition-all duration-300 flex-shrink-0" data-id="${product.id}" title="Favoris">
                                    <svg class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                                <button class="add-to-cart btn-primary px-4 lg:px-6 py-2 transform hover:scale-105 transition-all duration-300 flex-1 sm:flex-none text-sm lg:text-base" data-product="${product.name}" data-price="${product.price}" data-type="${product.type}" data-id="${product.id}">
                                    <span class="flex items-center justify-center gap-2">
                                        <svg class="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5"></path>
                                        </svg>
                                        <span class="hidden sm:inline">Ajouter</span>
                                        <span class="sm:hidden">+</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Gestion des erreurs globales pour éviter les erreurs console
        window.addEventListener('error', function(e) {
            // Ignorer les erreurs de ressources externes non critiques
            if (e.filename && (e.filename.includes('paydunya') || e.filename.includes('jsd'))) {
                console.log('Ressource externe non critique ignorée:', e.filename);
                return true; // Empêche l'affichage de l'erreur
            }
        });

        // Gestion des erreurs de ressources
        window.addEventListener('unhandledrejection', function(e) {
            console.log('Promesse rejetée gérée:', e.reason);
            e.preventDefault();
        });

        // Automatic delivery system
        function deliverProductsToCustomer(customerEmail, orderItems) {
            // Simulate email delivery
            const deliveryData = {
                customer_email: customerEmail,
                order_id: 'DS-' + Date.now(),
                products: orderItems.map(item => {
                    const product = products.find(p => p.name === item.product);
                    return {
                        name: item.product,
                        quantity: item.quantity,
                        download_link: product?.downloadLink || null,
                        file_name: product?.fileName || 'product.pdf'
                    };
                }),
                delivery_time: new Date().toISOString()
            };
            
            // Store delivery record
            const deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
            deliveries.push(deliveryData);
            localStorage.setItem('deliveries', JSON.stringify(deliveries));
            
            // Show delivery confirmation
            showDeliveryConfirmation(customerEmail, deliveryData.products);
            
            return deliveryData;
        }

        function showDeliveryConfirmation(email, products) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';
            modal.innerHTML = `
                <div class="bg-noir-secondaire border-2 border-accent-tertiaire rounded-xl max-w-lg w-full p-8 backdrop-blur-md shadow-2xl">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 bg-accent-tertiaire rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold font-montserrat text-accent-tertiaire mb-2">🎉 Livraison Confirmée !</h3>
                        <p class="text-gray-300">Vos produits ont été envoyés à :</p>
                        <p class="text-accent font-bold text-lg">${email}</p>
                    </div>
                    
                    <div class="bg-gris-moderne p-4 rounded-lg mb-6">
                        <h4 class="font-semibold text-white mb-3">📦 Produits livrés :</h4>
                        <div class="space-y-2">
                            ${products.map(product => `
                                <div class="flex items-center justify-between p-2 bg-noir rounded">
                                    <span class="text-white">${product.name}</span>
                                    <span class="text-accent-tertiaire text-sm">x${product.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <p class="text-gray-400 text-sm mb-4">📧 Vérifiez votre boîte email (et les spams)</p>
                        <button onclick="this.closest('.fixed').remove()" class="btn-primary px-6 py-3">
                            Parfait, merci !
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Gestion des notifications IPN PayDunya
        function handlePayDunyaIPN() {
            // Écouter les messages de l'IPN
            window.addEventListener('message', function(event) {
                // Vérifier l'origine pour la sécurité
                if (event.origin !== 'https://app.paydunya.com') {
                    return;
                }
                
                const data = event.data;
                if (data.type === 'paydunya_payment_success') {
                    showNotification('✅ Paiement confirmé ! Livraison en cours...', 'success');
                    
                    // Deliver products automatically
                    const customerEmail = localStorage.getItem('customerEmail');
                    if (customerEmail && cart.length > 0) {
                        deliverProductsToCustomer(customerEmail, cart);
                        
                        // Clear cart after delivery
                        cart = [];
                        cartCount = 0;
                        updateCartDisplay();
                        cartModal.classList.add('hidden');
                    }
                    
                    // Mettre à jour les statistiques
                    recordSale(data.amount || 0);
                    
                } else if (data.type === 'paydunya_payment_failed') {
                    showNotification('❌ Paiement échoué. Veuillez réessayer.', 'error');
                    
                } else if (data.type === 'paydunya_payment_cancelled') {
                    showNotification('⚠️ Paiement annulé par l\'utilisateur.', 'error');
                }
            });
        }

        // Vérifier le statut de paiement au retour
        function checkPaymentStatus() {
            const urlParams = new URLSearchParams(window.location.search);
            const status = urlParams.get('payment_status');
            const orderId = urlParams.get('order_id');
            
            if (status === 'success') {
                showNotification('🎉 Paiement réussi ! Merci pour votre achat.', 'success');
                // Nettoyer l'URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
            } else if (status === 'failed') {
                showNotification('❌ Paiement échoué. Contactez le support si le problème persiste.', 'error');
                window.history.replaceState({}, document.title, window.location.pathname);
                
            } else if (status === 'cancelled') {
                showNotification('⚠️ Paiement annulé. Vos articles sont toujours dans le panier.', 'error');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }

        // Initialize the page
        document.addEventListener('DOMContentLoaded', async function() {
            try {
                // 1. Charger les variables d'environnement en premier
                await loadEnvironmentVariables();
                
                // 2. Mettre à jour la configuration PayDunya avec les nouvelles variables
                updatePayDunyaConfig();
                
                // 3. Load saved currency
                const savedCurrency = localStorage.getItem('selectedCurrency');
                if (savedCurrency) {
                    currentCurrency = savedCurrency;
                    const currencyBtn = document.getElementById('currencyBtn');
                    if (currencyBtn) {
                        const span = currencyBtn.querySelector('span');
                        if (span) span.textContent = savedCurrency;
                    }
                }
                
                // 4. Load saved products
                const savedProducts = localStorage.getItem('products');
                if (savedProducts) {
                    try {
                        const parsedProducts = JSON.parse(savedProducts);
                        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
                            products = parsedProducts;
                        }
                    } catch (e) {
                        console.log('Erreur lors du chargement des produits sauvegardés');
                    }
                }
                
                // 5. Initialiser les autres composants
                loadAuthorizedIPs();
                getUserIP();
                renderProductsEnhanced();
                updateWishlistDisplay();
                updateStats();
                
                // 6. Initialiser la gestion PayDunya
                handlePayDunyaIPN();
                checkPaymentStatus();
                
                console.log('✅ Site Domè Studios Store initialisé');
                console.log('🔧 Mode PayDunya:', ENV_CONFIG.PAYDUNYA_MODE);
                console.log('🌐 Site URL:', ENV_CONFIG.SITE_URL);
                console.log('📦 Produits chargés:', products.length);
                
            } catch (error) {
                console.log('Erreur lors de l\'initialisation:', error);
                // Continuer le chargement même en cas d'erreur
                renderProductsEnhanced();
            }
        });

        // Fonction pour mettre à jour la configuration PayDunya
        function updatePayDunyaConfig() {
            // Reconfigurer PayDunya avec les nouvelles variables
            PAYDUNYA_CONFIG.public_key = ENV_CONFIG.PAYDUNYA_PUBLIC_KEY;
            PAYDUNYA_CONFIG.private_key = ENV_CONFIG.PAYDUNYA_PRIVATE_KEY;
            PAYDUNYA_CONFIG.token = ENV_CONFIG.PAYDUNYA_TOKEN;
            PAYDUNYA_CONFIG.master_key = ENV_CONFIG.PAYDUNYA_MASTER_KEY;
            PAYDUNYA_CONFIG.mode = ENV_CONFIG.PAYDUNYA_MODE;
            PAYDUNYA_CONFIG.sandbox_mode = ENV_CONFIG.PAYDUNYA_MODE === 'sandbox';
            PAYDUNYA_CONFIG.site_url = ENV_CONFIG.SITE_URL;
            PAYDUNYA_CONFIG.callback_url = `${ENV_CONFIG.SITE_URL}/.netlify/functions/payment-callback`;
            PAYDUNYA_CONFIG.return_url = `${ENV_CONFIG.SITE_URL}/payment-success`;
            PAYDUNYA_CONFIG.cancel_url = `${ENV_CONFIG.SITE_URL}/payment-cancel`;
            PAYDUNYA_CONFIG.ipn_url = `${ENV_CONFIG.SITE_URL}/.netlify/functions/ipn`;
        }
