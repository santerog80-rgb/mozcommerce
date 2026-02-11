// ==============================================
// MOZCOMMERCE - MAIN JAVASCRIPT
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    HELPERS.log('info', 'Inicializando MozCommerce...');
    
    setupMobileMenu();
    setupScrollEffects();
    setupHeroSlider();
    loadInitialData();
    setupServiceWorker();
    
    HELPERS.log('info', 'MozCommerce inicializado com sucesso!');
}

// ==============================================
// MENU MOBILE
// ==============================================

function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            
            // Mudar ícone
            const icon = mobileMenuToggle.querySelector('i');
            if (mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Fechar ao clicar em um link
        mainNav.querySelectorAll('.nav-item a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // Mega menu no mobile
    const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                item.classList.toggle('active');
            }
        });
    });
}

// ==============================================
// EFEITOS DE SCROLL
// ==============================================

function setupScrollEffects() {
    let lastScroll = 0;
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Header sticky com efeito de esconder/mostrar
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        // Adicionar sombra quando scrollar
        if (currentScroll > 10) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }

        lastScroll = currentScroll;

        // Animações de entrada para elementos
        animateOnScroll();
    });
}

function animateOnScroll() {
    const elements = document.querySelectorAll('.category-card, .product-card, .seller-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// ==============================================
// HERO SLIDER
// ==============================================

function setupHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    if (slides.length > 1) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }
}

// ==============================================
// CARREGAR DADOS INICIAIS
// ==============================================

async function loadInitialData() {
    try {
        // Carregar estatísticas da plataforma
        await loadPlatformStats();
        
        // Carregar produtos em destaque
        if (productManager) {
            await productManager.loadProducts({ filter: 'trending' });
        }

        // Atualizar badges se usuário logado
        if (authManager && authManager.currentUser) {
            productManager.updateCartBadge();
            productManager.updateWishlistBadge();
        }
    } catch (error) {
        HELPERS.log('error', 'Erro ao carregar dados iniciais', error);
    }
}

async function loadPlatformStats() {
    // Implementar carregamento de estatísticas
    // Exemplo: total de produtos, vendedores, etc.
    HELPERS.log('info', 'Carregando estatísticas da plataforma...');
}

// ==============================================
// SERVICE WORKER
// ==============================================

function setupServiceWorker() {
    if ('serviceWorker' in navigator && CONFIG.features.notifications) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                HELPERS.log('info', 'Service Worker registrado', registration);
            })
            .catch(error => {
                HELPERS.log('error', 'Erro ao registrar Service Worker', error);
            });
    }
}

// ==============================================
// NOTIFICAÇÕES PUSH
// ==============================================

async function requestNotificationPermission() {
    if ('Notification' in window && CONFIG.features.notifications) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            HELPERS.log('info', 'Permissão de notificações concedida');
            subscribeToNotifications();
        }
    }
}

async function subscribeToNotifications() {
    try {
        const registration = await navigator.serviceWorker.ready;
        
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: CONFIG.notifications.push.vapidPublicKey
        });

        // Enviar subscription para o servidor
        HELPERS.log('info', 'Inscrito em notificações push', subscription);
    } catch (error) {
        HELPERS.log('error', 'Erro ao inscrever em notificações', error);
    }
}

// ==============================================
// UTILITÁRIOS DE UI
// ==============================================

// Smooth scroll para links âncora
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

// Lazy loading de imagens
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==============================================
// PERFORMANCE MONITORING
// ==============================================

if (CONFIG.debug) {
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        HELPERS.log('info', 'Performance Metrics:', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            pageLoad: perfData.loadEventEnd - perfData.loadEventStart,
            totalTime: perfData.loadEventEnd - perfData.fetchStart
        });
    });
}

// ==============================================
// ERROR HANDLING
// ==============================================

window.addEventListener('error', (event) => {
    HELPERS.log('error', 'Erro global capturado', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    HELPERS.log('error', 'Promise rejeitada não tratada', event.reason);
});

// ==============================================
// ANALYTICS
// ==============================================

function trackEvent(category, action, label = '', value = 0) {
    if (CONFIG.features.analytics && window.gtag) {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }

    HELPERS.log('info', 'Event tracked', { category, action, label, value });
}

// Tracking de eventos importantes
document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    
    if (target) {
        const action = target.getAttribute('data-track-action');
        const category = target.getAttribute('data-track-category');
        
        if (action && category) {
            trackEvent(category, action, target.textContent);
        }
    }
});

// ==============================================
// HELPERS DE UI ADICIONAIS
// ==============================================

// Copiar para clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        authManager.showNotification('Copiado para área de transferência!', 'success');
    }).catch(err => {
        HELPERS.log('error', 'Erro ao copiar', err);
    });
}

// Compartilhar
async function shareContent(title, text, url) {
    if (navigator.share) {
        try {
            await navigator.share({ title, text, url });
            trackEvent('Social', 'share', url);
        } catch (err) {
            HELPERS.log('error', 'Erro ao compartilhar', err);
        }
    } else {
        // Fallback: copiar link
        copyToClipboard(url);
    }
}

// Formatar input de telefone
document.querySelectorAll('input[name="phone"]').forEach(input => {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.length <= 2) {
                value = value;
            } else if (value.length <= 5) {
                value = `${value.slice(0, 2)} ${value.slice(2)}`;
            } else {
                value = `${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 9)}`;
            }
        }
        
        e.target.value = value;
    });
});

// Prevenir submit em forms vazios
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            e.preventDefault();
            authManager.showNotification('Por favor, preencha todos os campos obrigatórios', 'warning');
        }
    });
});

// ==============================================
// ONLINE/OFFLINE STATUS
// ==============================================

window.addEventListener('online', () => {
    authManager.showNotification('Conexão restaurada', 'success');
    loadInitialData();
});

window.addEventListener('offline', () => {
    authManager.showNotification('Sem conexão com a internet', 'warning');
});

// ==============================================
// KEYBOARD SHORTCUTS
// ==============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K para abrir busca
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput')?.focus();
    }

    // ESC para fechar modais
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// ==============================================
// AUTO SAVE (PARA FORMS)
// ==============================================

function setupAutoSave() {
    const forms = document.querySelectorAll('[data-autosave]');
    
    forms.forEach(form => {
        const formId = form.getAttribute('data-autosave');
        
        // Carregar dados salvos
        const savedData = localStorage.getItem(`form_${formId}`);
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = data[key];
            });
        }

        // Salvar ao digitar
        form.addEventListener('input', debounce(() => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            localStorage.setItem(`form_${formId}`, JSON.stringify(data));
        }, 1000));
    });
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==============================================
// EXPORTAR FUNÇÕES GLOBAIS
// ==============================================

window.MozCommerce = {
    trackEvent,
    shareContent,
    copyToClipboard,
    requestNotificationPermission
};

// Log de inicialização completa
HELPERS.log('info', '✓ MozCommerce carregado completamente');
