# MozCommerce - O Maior Marketplace de Moçambique 🇲🇿

## 📋 Sobre o Projeto

MozCommerce é uma plataforma de marketplace 100% moçambicana, escalável e preparada para milhões de usuários. Permite compra e venda de produtos físicos e serviços, com integração total com sistemas de pagamento locais (M-Pesa, E-Mola, M-Kesh) e WhatsApp.

## ✨ Funcionalidades Principais

### Para Compradores
- ✅ Navegação por categorias e busca avançada
- ✅ Lista de desejos e carrinho de compras
- ✅ Múltiplos métodos de pagamento (M-Pesa, E-Mola, M-Kesh, Visa, Mastercard)
- ✅ Integração WhatsApp para contato direto com vendedores
- ✅ Sistema de avaliações e reviews
- ✅ Rastreamento de pedidos em tempo real
- ✅ Notificações de status do pedido

### Para Vendedores
- ✅ Dashboard profissional com estatísticas
- ✅ Gestão completa de produtos e estoque
- ✅ Upload múltiplo de imagens
- ✅ Sistema de comissões automático
- ✅ Planos Gratuito e Premium
- ✅ Integração WhatsApp Business
- ✅ Relatórios de vendas exportáveis
- ✅ Verificação KYC e selo de verificação

### Para Administradores
- ✅ Dashboard com métricas em tempo real
- ✅ Gestão de usuários e vendedores
- ✅ Sistema de aprovação de produtos
- ✅ Gestão de disputas e denúncias
- ✅ Controle de comissões e taxas
- ✅ Sistema antifraude avançado
- ✅ Logs de atividades
- ✅ Relatórios financeiros

## 🏗️ Arquitetura Técnica

### Frontend
- **HTML5, CSS3, JavaScript (Vanilla)**
- Design responsivo mobile-first
- PWA-ready com Service Workers
- Lazy loading de imagens
- Otimizado para performance

### Backend
- **Supabase** - PostgreSQL Database
- Autenticação integrada
- Real-time subscriptions
- Row Level Security (RLS)
- Storage para imagens

### Pagamentos
- **M-Pesa** - API Oficial Moçambique
- **E-Mola** - Integração completa
- **M-Kesh** - Sistema de pagamentos
- **Stripe** - Visa/Mastercard
- Sistema de Escrow (14 dias)
- Webhooks para confirmação

### Segurança
- ✅ Sistema antifraude
- ✅ Validação de telefone
- ✅ KYC para vendedores
- ✅ Rate limiting
- ✅ HTTPS obrigatório
- ✅ Content Security Policy

## 📦 Instalação

### 1. Configurar Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Execute o script SQL abaixo no SQL Editor
4. Copie as credenciais (URL e Anon Key)

### 2. Configurar o Projeto

1. Clone os arquivos
2. Abra `js/config.js`
3. Substitua as credenciais do Supabase:

```javascript
supabase: {
    url: 'SUA_URL_SUPABASE',
    anonKey: 'SUA_ANON_KEY'
}
```

4. Configure as credenciais dos sistemas de pagamento (M-Pesa, E-Mola, M-Kesh)

### 3. Estrutura de Arquivos

```
mozcommerce/
├── index.html              # Página principal
├── product.html            # Detalhes do produto
├── cart.html               # Carrinho de compras
├── checkout.html           # Finalização de compra
├── styles/
│   ├── main.css           # Estilos principais
│   └── responsive.css     # Estilos responsivos
├── js/
│   ├── config.js          # Configurações gerais
│   ├── supabase.js        # Integração Supabase
│   ├── auth.js            # Autenticação
│   ├── products.js        # Gestão de produtos
│   ├── payments.js        # Sistema de pagamentos
│   └── main.js            # JavaScript principal
├── admin/
│   └── dashboard.html     # Dashboard admin
├── seller/
│   ├── dashboard.html     # Dashboard vendedor
│   ├── products.html      # Gestão de produtos
│   └── register.html      # Registro de vendedor
└── assets/
    └── images/            # Imagens da plataforma
```

## 🗄️ Estrutura do Banco de Dados (Supabase)

Execute este SQL no Supabase SQL Editor:

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    user_type TEXT CHECK (user_type IN ('buyer', 'seller', 'admin')) DEFAULT 'buyer',
    is_verified BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Vendedores
CREATE TABLE sellers (
    id UUID PRIMARY KEY REFERENCES users(id),
    business_name TEXT NOT NULL,
    business_type TEXT,
    tax_id TEXT,
    plan_type TEXT CHECK (plan_type IN ('free', 'premium')) DEFAULT 'free',
    commission_rate DECIMAL(5,4) DEFAULT 0.05,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
    verification_documents JSONB,
    bank_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    old_price DECIMAL(12,2),
    category TEXT NOT NULL,
    subcategory TEXT,
    images TEXT[],
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    status TEXT CHECK (status IN ('pending', 'active', 'rejected', 'out_of_stock')) DEFAULT 'pending',
    views INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Pedidos
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    commission DECIMAL(12,2) NOT NULL,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    payment_method TEXT NOT NULL,
    shipping_address JSONB,
    status TEXT CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed')) DEFAULT 'pending',
    tracking_number TEXT,
    paid_at TIMESTAMPTZ,
    payment_released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Transações
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT UNIQUE NOT NULL,
    order_id TEXT REFERENCES orders(order_id),
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    provider_reference TEXT,
    provider_response JSONB,
    provider_confirmation JSONB,
    escrow_released BOOLEAN DEFAULT false,
    release_reason TEXT,
    seller_amount DECIMAL(12,2),
    platform_commission DECIMAL(12,2),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Avaliações
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[],
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Lista de Desejos
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Tabela de Denúncias
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id),
    reported_type TEXT CHECK (reported_type IN ('product', 'seller', 'review')),
    reported_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Notificações
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FUNÇÕES

-- Incrementar visualizações do produto
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE products
    SET views = views + 1
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Atualizar rating do produto
CREATE OR REPLACE FUNCTION update_product_rating(product_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE products p
    SET 
        rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviews.product_id = p.id),
        reviews_count = (SELECT COUNT(*) FROM reviews WHERE reviews.product_id = p.id)
    WHERE p.id = product_id;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ÍNDICES para Performance

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- ROW LEVEL SECURITY

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies: Users podem ver seus próprios dados
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policies: Produtos ativos são públicos
CREATE POLICY "Active products are viewable by everyone" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage own products" ON products
    FOR ALL USING (seller_id = auth.uid());

-- Policies: Pedidos visíveis para comprador e vendedor
CREATE POLICY "Orders viewable by buyer and seller" ON orders
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
```

## 🔧 Configuração dos Pagamentos

### M-Pesa

1. Registre-se no [Portal de Desenvolvedores M-Pesa](https://developer.mpesa.vm.co.mz/)
2. Crie uma aplicação
3. Obtenha suas credenciais (Public Key, API Key, Service Provider Code)
4. Configure em `js/config.js`

### E-Mola

1. Contacte E-Mola para conta comercial
2. Obtenha Merchant ID e API Key
3. Configure webhooks: `https://seu-dominio.com/api/webhooks/emola`

### M-Kesh

1. Registre-se como comerciante M-Kesh
2. Obtenha credenciais da API
3. Configure webhooks: `https://seu-dominio.com/api/webhooks/mkesh`

## 🚀 Deploy

### Opções de Hospedagem

1. **Vercel** (Recomendado)
   - Conecte seu repositório GitHub
   - Deploy automático
   - CDN global

2. **Netlify**
   - Drag & drop ou Git integration
   - Formulários e funções serverless

3. **Servidor Próprio**
   - Nginx ou Apache
   - Certbot para SSL
   - PM2 para Node.js (se usar)

## 📱 PWA (Progressive Web App)

Crie `sw.js` na raiz:

```javascript
const CACHE_NAME = 'mozcommerce-v1';
const urlsToCache = [
    '/',
    '/styles/main.css',
    '/styles/responsive.css',
    '/js/main.js',
    '/js/config.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

E `manifest.json`:

```json
{
    "name": "MozCommerce",
    "short_name": "MozCommerce",
    "description": "O maior marketplace de Moçambique",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#FFFFFF",
    "theme_color": "#FF6B35",
    "icons": [
        {
            "src": "/assets/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/assets/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

## 🔒 Segurança

### Checklist de Segurança
- [ ] HTTPS ativado
- [ ] Headers de segurança configurados
- [ ] Rate limiting implementado
- [ ] Validação de inputs
- [ ] Proteção contra XSS
- [ ] Proteção contra CSRF
- [ ] Backups automáticos
- [ ] Logs de auditoria

## 📊 Monitoramento

Integre ferramentas de análise:
- Google Analytics
- Hotjar (mapas de calor)
- Sentry (tracking de erros)
- Uptime monitoring

## 🤝 Suporte

Para questões técnicas ou comerciais:
- 📧 Email: suporte@mozcommerce.co.mz
- 📱 WhatsApp: +258 84 123 4567
- 🌐 Website: www.mozcommerce.co.mz

## 📄 Licença

© 2026 MozCommerce. Todos os direitos reservados.

---

**Desenvolvido com ❤️ em Moçambique**
