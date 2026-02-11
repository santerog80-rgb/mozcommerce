// ==============================================
// CONFIGURAÇÃO GERAL DO MOZCOMMERCE
// ==============================================

const CONFIG = {
    // Informações da Plataforma
    platform: {
        name: 'MozCommerce',
        version: '1.0.0',
        country: 'Moçambique',
        currency: 'MZN',
        currencySymbol: 'MT',
        language: 'pt-MZ',
        timezone: 'Africa/Maputo'
    },

    // Supabase Configuration
    supabase: {
        url: 'https://your-project.supabase.co',
        anonKey: 'your-anon-key-here',
        // Em produção, mova estas credenciais para variáveis de ambiente
    },

    // Configurações de Comissão
    commission: {
        standard: 0.05,        // 5% para vendedores padrão
        premium: 0.03,         // 3% para vendedores premium
        services: 0.10,        // 10% para serviços
        minimumAmount: 50      // Valor mínimo de comissão em MZN
    },

    // Planos de Vendedor
    sellerPlans: {
        free: {
            name: 'Gratuito',
            price: 0,
            commission: 0.05,
            maxProducts: 50,
            maxImages: 5,
            features: [
                'Loja básica',
                'Até 50 produtos',
                'Até 5 imagens por produto',
                'Comissão de 5%',
                'Suporte por email'
            ]
        },
        premium: {
            name: 'Premium',
            price: 2500,           // MZN por mês
            commission: 0.03,
            maxProducts: -1,       // Ilimitado
            maxImages: 15,
            features: [
                'Loja profissional',
                'Produtos ilimitados',
                'Até 15 imagens por produto',
                'Comissão reduzida (3%)',
                'Prioridade nos resultados',
                'Estatísticas avançadas',
                'Suporte prioritário',
                'Selo de verificação premium',
                'Ferramentas de marketing'
            ]
        }
    },

    // Configurações de Pagamento
    payment: {
        methods: {
            mpesa: {
                name: 'M-Pesa',
                enabled: true,
                icon: 'fab fa-mobile-alt',
                color: '#FF6B6B',
                apiUrl: 'https://api.mpesa.vm.co.mz',
                // Credenciais devem estar em variáveis de ambiente
                publicKey: 'your-mpesa-public-key',
                apiKey: 'your-mpesa-api-key',
                serviceProviderCode: 'your-service-provider-code'
            },
            emola: {
                name: 'E-Mola',
                enabled: true,
                icon: 'fas fa-wallet',
                color: '#4ECDC4',
                apiUrl: 'https://api.emola.co.mz',
                merchantId: 'your-emola-merchant-id',
                apiKey: 'your-emola-api-key'
            },
            mkesh: {
                name: 'M-Kesh',
                enabled: true,
                icon: 'fas fa-money-bill-wave',
                color: '#95E1D3',
                apiUrl: 'https://api.mkesh.co.mz',
                merchantId: 'your-mkesh-merchant-id',
                apiKey: 'your-mkesh-api-key'
            },
            visa: {
                name: 'Visa',
                enabled: true,
                icon: 'fab fa-cc-visa',
                color: '#1A1A2E'
            },
            mastercard: {
                name: 'Mastercard',
                enabled: true,
                icon: 'fab fa-cc-mastercard',
                color: '#0F3460'
            },
            paypal: {
                name: 'PayPal',
                enabled: false,
                icon: 'fab fa-paypal',
                color: '#0070BA'
            },
            stripe: {
                name: 'Stripe',
                enabled: false,
                icon: 'fab fa-stripe',
                color: '#635BFF'
            }
        },
        escrowPeriod: 14,          // Dias até liberação automática do pagamento
        refundPeriod: 30,          // Dias para solicitação de reembolso
        disputePeriod: 60          // Dias para resolução de disputas
    },

    // WhatsApp Configuration
    whatsapp: {
        countryCode: '258',
        businessApiEnabled: false,
        businessPhoneId: 'your-whatsapp-business-phone-id',
        accessToken: 'your-whatsapp-access-token',
        messageTemplate: {
            product: 'Olá, estou interessado no produto [PRODUCT_NAME] anunciado no MozCommerce. Link: [PRODUCT_URL]',
            order: 'Olá, gostaria de informações sobre o meu pedido #[ORDER_ID]',
            support: 'Olá, preciso de ajuda com [SUBJECT]'
        }
    },

    // Configurações de Logística
    logistics: {
        shippingMethods: {
            standard: {
                name: 'Entrega Padrão',
                days: '5-7 dias úteis',
                baseCost: 150,
                costPerKm: 5
            },
            express: {
                name: 'Entrega Express',
                days: '2-3 dias úteis',
                baseCost: 300,
                costPerKm: 10
            },
            pickup: {
                name: 'Recolher na Loja',
                days: 'Imediato',
                baseCost: 0,
                costPerKm: 0
            }
        },
        freeShippingThreshold: 2000,    // MZN
        maxShippingDistance: 500,        // km
        provinces: [
            'Maputo Cidade',
            'Maputo Província',
            'Gaza',
            'Inhambane',
            'Sofala',
            'Manica',
            'Tete',
            'Zambézia',
            'Nampula',
            'Niassa',
            'Cabo Delgado'
        ]
    },

    // Sistema Antifraude
    antifraud: {
        maxOrdersPerDay: 10,
        maxOrderValue: 50000,              // MZN
        minTimeBetweenOrders: 300,         // segundos
        suspiciousKeywords: [
                'teste',
                'test',
                'fake',
                'scam'
        ],
        requireVerificationAbove: 10000,    // MZN
        riskScoreThreshold: 75,
        ipCheckEnabled: true,
        phoneVerificationEnabled: true
    },

    // Categorias de Produtos
    categories: [
        {
            id: 'electronics',
            name: 'Electrónica',
            icon: 'fas fa-mobile-alt',
            subcategories: [
                'Telemóveis & Tablets',
                'Computadores & Laptops',
                'TVs & Audio',
                'Câmaras & Fotografia',
                'Acessórios',
                'Gaming',
                'Smart Home'
            ]
        },
        {
            id: 'fashion',
            name: 'Moda & Vestuário',
            icon: 'fas fa-tshirt',
            subcategories: [
                'Roupa Masculina',
                'Roupa Feminina',
                'Roupa Infantil',
                'Sapatos & Calçados',
                'Acessórios & Jóias',
                'Relógios',
                'Malas & Carteiras'
            ]
        },
        {
            id: 'home',
            name: 'Casa & Decoração',
            icon: 'fas fa-couch',
            subcategories: [
                'Mobiliário',
                'Cozinha & Jantar',
                'Decoração',
                'Iluminação',
                'Jardim & Exterior',
                'Têxteis',
                'Organização'
            ]
        },
        {
            id: 'beauty',
            name: 'Beleza & Saúde',
            icon: 'fas fa-spa',
            subcategories: [
                'Cuidados com a Pele',
                'Maquiagem',
                'Cuidados Capilares',
                'Perfumes & Fragrâncias',
                'Suplementos',
                'Equipamentos Fitness'
            ]
        },
        {
            id: 'sports',
            name: 'Desporto & Lazer',
            icon: 'fas fa-football-ball',
            subcategories: [
                'Roupa Desportiva',
                'Calçado Desportivo',
                'Equipamentos',
                'Camping & Outdoor',
                'Ciclismo',
                'Fitness'
            ]
        },
        {
            id: 'services',
            name: 'Serviços',
            icon: 'fas fa-concierge-bell',
            subcategories: [
                'Transporte & Logística',
                'Construção & Reparos',
                'Educação & Cursos',
                'Eventos & Festas',
                'Limpeza & Manutenção',
                'Consultoria',
                'Design & Marketing'
            ]
        }
    ],

    // Configurações de Imagens
    images: {
        maxSize: 5242880,              // 5MB em bytes
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        thumbnailSize: 300,
        mediumSize: 800,
        largeSize: 1200,
        quality: 85
    },

    // Validações
    validation: {
        phone: {
            pattern: /^(82|83|84|85|86|87)[0-9]{7}$/,
            message: 'Número de telefone inválido. Use o formato: 84 XXX XXXX'
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email inválido'
        },
        password: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumber: true,
            requireSpecial: false,
            message: 'A senha deve ter pelo menos 8 caracteres, incluir maiúsculas, minúsculas e números'
        }
    },

    // URLs e Endpoints
    urls: {
        api: '/api',
        uploads: '/uploads',
        assets: '/assets',
        cdn: 'https://cdn.mozcommerce.co.mz'
    },

    // Features Toggles
    features: {
        multiVendor: true,
        guestCheckout: true,
        wishlist: true,
        reviews: true,
        chat: true,
        notifications: true,
        analytics: true,
        seo: true,
        newsletter: true,
        affiliates: false,
        dropshipping: false
    },

    // Configurações de SEO
    seo: {
        siteName: 'MozCommerce - O Maior Marketplace de Moçambique',
        defaultTitle: 'MozCommerce | Comprar e Vender Online em Moçambique',
        defaultDescription: 'O maior marketplace digital de Moçambique. Milhões de produtos, milhares de vendedores, pagamentos seguros com M-Pesa, E-Mola e mais.',
        defaultKeywords: 'marketplace moçambique, comprar online moçambique, vender online, m-pesa, e-commerce moçambique',
        ogImage: '/assets/og-image.jpg',
        twitterHandle: '@mozcommerce'
    },

    // Analytics
    analytics: {
        googleAnalyticsId: 'UA-XXXXXXXXX-X',
        facebookPixelId: 'XXXXXXXXXXXXXXXXX',
        hotjarId: 'XXXXXXX'
    },

    // Rate Limiting
    rateLimits: {
        api: {
            windowMs: 900000,        // 15 minutos
            max: 100                 // máximo de requisições
        },
        auth: {
            windowMs: 900000,
            max: 5                   // tentativas de login
        },
        search: {
            windowMs: 60000,         // 1 minuto
            max: 30
        }
    },

    // Notificações
    notifications: {
        email: {
            enabled: true,
            from: 'noreply@mozcommerce.co.mz',
            fromName: 'MozCommerce'
        },
        sms: {
            enabled: true,
            provider: 'twilio',
            from: 'MozCommerce'
        },
        push: {
            enabled: true,
            vapidPublicKey: 'your-vapid-public-key'
        }
    },

    // Debug & Development
    debug: true,
    environment: 'development', // 'development' | 'staging' | 'production'
    logLevel: 'info'           // 'debug' | 'info' | 'warn' | 'error'
};

// Helpers para formatação
const HELPERS = {
    // Formatar moeda
    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 2
        }).format(amount);
    },

    // Formatar número de telefone
    formatPhone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 9) {
            return `+258 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
        }
        return phone;
    },

    // Gerar URL do WhatsApp
    generateWhatsAppUrl(phone, message) {
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('258') ? cleanPhone : '258' + cleanPhone;
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
    },

    // Calcular comissão
    calculateCommission(amount, isPremium = false, isService = false) {
        let rate = CONFIG.commission.standard;
        
        if (isService) {
            rate = CONFIG.commission.services;
        } else if (isPremium) {
            rate = CONFIG.commission.premium;
        }
        
        const commission = amount * rate;
        return Math.max(commission, CONFIG.commission.minimumAmount);
    },

    // Calcular custo de envio
    calculateShipping(distance, method = 'standard') {
        const shippingConfig = CONFIG.logistics.shippingMethods[method];
        if (!shippingConfig) return 0;
        
        if (method === 'pickup') return 0;
        
        return shippingConfig.baseCost + (distance * shippingConfig.costPerKm);
    },

    // Validar telefone moçambicano
    isValidPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return CONFIG.validation.phone.pattern.test(cleaned);
    },

    // Validar email
    isValidEmail(email) {
        return CONFIG.validation.email.pattern.test(email);
    },

    // Gerar ID único
    generateId(prefix = '') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `${prefix}${timestamp}${random}`.toUpperCase();
    },

    // Formatar data
    formatDate(date, format = 'full') {
        const d = new Date(date);
        const options = {
            full: { dateStyle: 'full', timeStyle: 'short' },
            date: { dateStyle: 'medium' },
            time: { timeStyle: 'short' },
            relative: { dateStyle: 'short' }
        };
        
        return new Intl.DateTimeFormat('pt-MZ', options[format] || options.full).format(d);
    },

    // Calcular tempo decorrido
    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        const intervals = {
            ano: 31536000,
            mês: 2592000,
            semana: 604800,
            dia: 86400,
            hora: 3600,
            minuto: 60,
            segundo: 1
        };
        
        for (const [name, value] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / value);
            if (interval >= 1) {
                return `há ${interval} ${name}${interval !== 1 ? 's' : ''}`;
            }
        }
        
        return 'agora mesmo';
    },

    // Calcular distância entre coordenadas (fórmula de Haversine)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    // Logger
    log(level, message, data = null) {
        if (!CONFIG.debug && level === 'debug') return;
        
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(CONFIG.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        
        if (messageLevelIndex >= currentLevelIndex) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
            
            console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](logMessage);
            if (data) console[level === 'error' ? 'error' : 'log'](data);
        }
    }
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, HELPERS };
}
