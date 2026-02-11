// ==============================================
// GERENCIAMENTO DE PRODUTOS
// ==============================================

class ProductManager {
    constructor() {
        this.products = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentFilters = {};
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Categorias
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleCategoryClick(e));
        });

        // Busca
        document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        document.querySelector('.search-btn')?.addEventListener('click', () => {
            this.handleSearch();
        });

        // Carregar mais
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.loadMoreProducts();
        });

        // Carrinho e Wishlist
        document.getElementById('cartBtn')?.addEventListener('click', () => this.showCart());
        document.getElementById('wishlistBtn')?.addEventListener('click', () => this.showWishlist());
    }

    async loadProducts(filters = {}) {
        try {
            const result = await db.getProducts(filters, this.currentPage, this.itemsPerPage);

            if (result.success) {
                this.products = result.data;
                this.renderProducts(result.data);
                this.updatePagination(result.pagination);
            }
        } catch (error) {
            HELPERS.log('error', 'Erro ao carregar produtos', error);
        }
    }

    renderProducts(products) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (products.length === 0) {
            grid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open fa-4x"></i>
                    <p>Nenhum produto encontrado</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(product => this.createProductCard(product)).join('');

        // Adicionar event listeners aos botões
        this.attachProductEventListeners();
    }

    createProductCard(product) {
        const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300';
        const isVerified = product.seller?.is_verified || false;

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${mainImage}" alt="${product.name}" loading="lazy">
                    ${discount > 0 ? `<div class="product-badge">-${discount}%</div>` : ''}
                    <button class="product-wishlist" data-product-id="${product.id}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-seller">
                        <span>${product.seller?.full_name || 'Vendedor'}</span>
                        ${isVerified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                    </div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating">
                        <div class="stars">
                            ${this.generateStars(product.rating || 4.5)}
                        </div>
                        <span class="reviews">(${product.reviews_count || 0})</span>
                    </div>
                    <div class="product-price">
                        <div>
                            <span class="price">${HELPERS.formatCurrency(product.price)}</span>
                            ${product.old_price ? `<span class="old-price">${HELPERS.formatCurrency(product.old_price)}</span>` : ''}
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart" data-product-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                            Comprar
                        </button>
                        <button class="btn-whatsapp" data-phone="${product.seller?.phone}" data-product-name="${product.name}">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }

    attachProductEventListeners() {
        // Click no card para ver detalhes
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const productId = card.dataset.productId;
                    window.location.href = `/product.html?id=${productId}`;
                }
            });
        });

        // Botões de adicionar ao carrinho
        document.querySelectorAll('.btn-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.productId;
                this.addToCart(productId);
            });
        });

        // Botões WhatsApp
        document.querySelectorAll('.btn-whatsapp').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const phone = btn.dataset.phone;
                const productName = btn.dataset.productName;
                this.contactWhatsApp(phone, productName);
            });
        });

        // Botões de wishlist
        document.querySelectorAll('.product-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.productId;
                this.toggleWishlist(productId, btn);
            });
        });
    }

    handleFilter(e) {
        const btn = e.target.closest('.filter-btn');
        const filter = btn.dataset.filter;

        // Atualizar UI
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Aplicar filtro
        this.currentFilters.filter = filter;
        this.currentPage = 1;
        this.loadProducts(this.currentFilters);
    }

    handleCategoryClick(e) {
        const card = e.currentTarget;
        const category = card.dataset.category;

        this.currentFilters.category = category;
        this.currentPage = 1;
        this.loadProducts(this.currentFilters);

        // Scroll para os produtos
        document.querySelector('.featured-products')?.scrollIntoView({ behavior: 'smooth' });
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput?.value.trim();

        if (searchTerm) {
            this.currentFilters.search = searchTerm;
            this.currentPage = 1;
            this.loadProducts(this.currentFilters);
        }
    }

    async loadMoreProducts() {
        this.currentPage++;
        
        try {
            const result = await db.getProducts(this.currentFilters, this.currentPage, this.itemsPerPage);

            if (result.success && result.data.length > 0) {
                this.products = [...this.products, ...result.data];
                
                const grid = document.getElementById('productsGrid');
                result.data.forEach(product => {
                    grid.insertAdjacentHTML('beforeend', this.createProductCard(product));
                });

                this.attachProductEventListeners();
                this.updatePagination(result.pagination);
            }
        } catch (error) {
            HELPERS.log('error', 'Erro ao carregar mais produtos', error);
        }
    }

    updatePagination(pagination) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        if (loadMoreBtn) {
            if (pagination.page >= pagination.totalPages) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        }
    }

    async addToCart(productId) {
        if (!authManager.currentUser) {
            authManager.showNotification('Por favor, faça login para adicionar ao carrinho', 'warning');
            authManager.showLoginModal();
            return;
        }

        try {
            // Buscar carrinho do localStorage
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // Verificar se produto já está no carrinho
            const existingItem = cart.find(item => item.productId === productId);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    productId: productId,
                    quantity: 1,
                    addedAt: new Date().toISOString()
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Atualizar badge do carrinho
            this.updateCartBadge();
            
            authManager.showNotification('Produto adicionado ao carrinho!', 'success');
        } catch (error) {
            HELPERS.log('error', 'Erro ao adicionar ao carrinho', error);
            authManager.showNotification('Erro ao adicionar ao carrinho', 'error');
        }
    }

    async toggleWishlist(productId, btn) {
        if (!authManager.currentUser) {
            authManager.showNotification('Por favor, faça login para adicionar à lista de desejos', 'warning');
            authManager.showLoginModal();
            return;
        }

        try {
            const icon = btn.querySelector('i');
            const isInWishlist = icon.classList.contains('fas');

            if (isInWishlist) {
                // Remover da wishlist
                await db.removeFromWishlist(productId);
                icon.classList.remove('fas');
                icon.classList.add('far');
                authManager.showNotification('Removido da lista de desejos', 'info');
            } else {
                // Adicionar à wishlist
                await db.addToWishlist(productId);
                icon.classList.remove('far');
                icon.classList.add('fas');
                authManager.showNotification('Adicionado à lista de desejos!', 'success');
            }

            this.updateWishlistBadge();
        } catch (error) {
            HELPERS.log('error', 'Erro ao atualizar wishlist', error);
            authManager.showNotification('Erro ao atualizar lista de desejos', 'error');
        }
    }

    contactWhatsApp(phone, productName) {
        const message = CONFIG.whatsapp.messageTemplate.product
            .replace('[PRODUCT_NAME]', productName)
            .replace('[PRODUCT_URL]', window.location.href);

        const url = HELPERS.generateWhatsAppUrl(phone, message);
        window.open(url, '_blank');
    }

    updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const badge = document.querySelector('#cartBtn .badge');
        if (badge) {
            badge.textContent = cart.length;
        }
    }

    async updateWishlistBadge() {
        if (!authManager.currentUser) return;

        try {
            const result = await db.getWishlist();
            const badge = document.querySelector('#wishlistBtn .badge');
            if (badge && result.success) {
                badge.textContent = result.data.length;
            }
        } catch (error) {
            HELPERS.log('error', 'Erro ao atualizar badge da wishlist', error);
        }
    }

    showCart() {
        if (!authManager.currentUser) {
            authManager.showNotification('Por favor, faça login primeiro', 'warning');
            authManager.showLoginModal();
            return;
        }

        window.location.href = '/cart.html';
    }

    showWishlist() {
        if (!authManager.currentUser) {
            authManager.showNotification('Por favor, faça login primeiro', 'warning');
            authManager.showLoginModal();
            return;
        }

        window.location.href = '/wishlist.html';
    }
}

// Inicializar gerenciador de produtos
const productManager = new ProductManager();
