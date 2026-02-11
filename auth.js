// ==============================================
// SISTEMA DE AUTENTICAÇÃO
// ==============================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Botões de login/registro
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('vendaBtn')?.addEventListener('click', () => this.showSellerRegister());
        document.getElementById('registoVendedor')?.addEventListener('click', () => this.showSellerRegister());

        // Modais
        document.getElementById('closeLoginModal')?.addEventListener('click', () => this.closeModal('loginModal'));
        document.getElementById('closeRegisterModal')?.addEventListener('click', () => this.closeModal('registerModal'));
        
        // Trocar entre modais
        document.getElementById('showRegisterModal')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('loginModal');
            this.showRegisterModal();
        });
        
        document.getElementById('showLoginModal')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('registerModal');
            this.showLoginModal();
        });

        // Forms
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));

        // Click fora do modal para fechar
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    async checkAuth() {
        try {
            if (db.session) {
                this.currentUser = db.user;
                this.updateUI(true);
                HELPERS.log('info', 'Usuário autenticado', this.currentUser);
            }
        } catch (error) {
            HELPERS.log('error', 'Erro ao verificar autenticação', error);
        }
    }

    showLoginModal() {
        document.getElementById('loginModal').classList.add('active');
    }

    showRegisterModal() {
        document.getElementById('registerModal').classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const username = formData.get('username');
        const password = formData.get('password');
        const remember = formData.get('remember');

        try {
            // Mostrar loading
            this.setFormLoading(form, true);

            // Tentar login
            const result = await db.signIn(username, password);

            if (result.success) {
                this.currentUser = result.data.user;
                this.updateUI(true);
                this.closeModal('loginModal');
                this.showNotification('Login realizado com sucesso!', 'success');
                
                // Redirecionar baseado no tipo de usuário
                const profile = await db.getUserProfile(this.currentUser.id);
                if (profile.success && profile.data.user_type === 'seller') {
                    window.location.href = '/seller/dashboard.html';
                }
            } else {
                this.showNotification(result.error || 'Erro ao fazer login', 'error');
            }
        } catch (error) {
            this.showNotification('Erro ao fazer login', 'error');
            HELPERS.log('error', 'Erro no login', error);
        } finally {
            this.setFormLoading(form, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const fullName = formData.get('fullname');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');
        const terms = formData.get('terms');

        try {
            // Validações
            if (!terms) {
                this.showNotification('Você deve aceitar os termos e condições', 'warning');
                return;
            }

            if (password !== confirmPassword) {
                this.showNotification('As senhas não coincidem', 'warning');
                return;
            }

            if (!HELPERS.isValidEmail(email)) {
                this.showNotification('Email inválido', 'warning');
                return;
            }

            if (!HELPERS.isValidPhone(phone)) {
                this.showNotification(CONFIG.validation.phone.message, 'warning');
                return;
            }

            // Mostrar loading
            this.setFormLoading(form, true);

            // Registrar usuário
            const result = await db.signUp(email, password, {
                fullName: fullName,
                email: email,
                phone: phone,
                userType: 'buyer'
            });

            if (result.success) {
                this.showNotification('Conta criada com sucesso! Verifique seu email.', 'success');
                this.closeModal('registerModal');
                this.showLoginModal();
            } else {
                this.showNotification(result.error || 'Erro ao criar conta', 'error');
            }
        } catch (error) {
            this.showNotification('Erro ao criar conta', 'error');
            HELPERS.log('error', 'Erro no registro', error);
        } finally {
            this.setFormLoading(form, false);
        }
    }

    async logout() {
        try {
            const result = await db.signOut();
            
            if (result.success) {
                this.currentUser = null;
                this.updateUI(false);
                this.showNotification('Logout realizado com sucesso', 'success');
                window.location.href = '/';
            }
        } catch (error) {
            HELPERS.log('error', 'Erro ao fazer logout', error);
        }
    }

    updateUI(isAuthenticated) {
        const loginBtn = document.getElementById('loginBtn');
        
        if (isAuthenticated && this.currentUser) {
            // Atualizar botão de login para menu do usuário
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <i class="fas fa-user-circle"></i>
                    <span>${this.currentUser.user_metadata?.full_name?.split(' ')[0] || 'Conta'}</span>
                `;
                loginBtn.onclick = () => this.showUserMenu();
            }
        } else {
            // Mostrar botão de login
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-user"></i> Entrar';
                loginBtn.onclick = () => this.showLoginModal();
            }
        }
    }

    showUserMenu() {
        // Implementar menu dropdown do usuário
        const menu = document.createElement('div');
        menu.className = 'user-dropdown-menu';
        menu.innerHTML = `
            <div class="user-menu-header">
                <div class="user-avatar">
                    <i class="fas fa-user-circle fa-3x"></i>
                </div>
                <div class="user-info">
                    <h4>${this.currentUser.user_metadata?.full_name || 'Usuário'}</h4>
                    <p>${this.currentUser.email}</p>
                </div>
            </div>
            <ul class="user-menu-items">
                <li><a href="/account/profile.html"><i class="fas fa-user"></i> Meu Perfil</a></li>
                <li><a href="/account/orders.html"><i class="fas fa-shopping-bag"></i> Meus Pedidos</a></li>
                <li><a href="/account/wishlist.html"><i class="fas fa-heart"></i> Lista de Desejos</a></li>
                <li><a href="/account/addresses.html"><i class="fas fa-map-marker-alt"></i> Endereços</a></li>
                <li><a href="/account/settings.html"><i class="fas fa-cog"></i> Configurações</a></li>
                <li class="divider"></li>
                <li><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
            </ul>
        `;

        // Remover menu existente
        document.querySelector('.user-dropdown-menu')?.remove();

        // Adicionar novo menu
        document.querySelector('.header-actions').appendChild(menu);

        // Adicionar evento de logout
        menu.querySelector('#logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Fechar ao clicar fora
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !document.getElementById('loginBtn').contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    showSellerRegister() {
        if (!this.currentUser) {
            this.showNotification('Por favor, faça login primeiro', 'warning');
            this.showLoginModal();
            return;
        }

        window.location.href = '/seller/register.html';
    }

    setFormLoading(form, loading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, button');

        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            inputs.forEach(input => input.disabled = true);
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Enviar';
            inputs.forEach(input => input.disabled = false);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => notification.classList.add('show'), 100);

        // Remover após 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Inicializar gerenciador de autenticação
const authManager = new AuthManager();
