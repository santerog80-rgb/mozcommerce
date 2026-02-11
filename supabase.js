// ==============================================
// SUPABASE DATABASE MODULE
// Conexão e operações com o banco de dados
// ==============================================

// Importar Supabase Client
// Em produção, use: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

class SupabaseDB {
    constructor() {
        this.client = null;
        this.user = null;
        this.session = null;
        this.init();
    }

    // Inicializar Supabase
    init() {
        try {
            // Criar cliente Supabase
            this.client = supabase.createClient(
                CONFIG.supabase.url,
                CONFIG.supabase.anonKey
            );

            HELPERS.log('info', 'Supabase inicializado com sucesso');
            
            // Verificar sessão existente
            this.checkSession();
        } catch (error) {
            HELPERS.log('error', 'Erro ao inicializar Supabase', error);
        }
    }

    // Verificar sessão do usuário
    async checkSession() {
        try {
            const { data: { session } } = await this.client.auth.getSession();
            
            if (session) {
                this.session = session;
                this.user = session.user;
                HELPERS.log('info', 'Sessão ativa encontrada', this.user);
            }
        } catch (error) {
            HELPERS.log('error', 'Erro ao verificar sessão', error);
        }
    }

    // ==============================================
    // AUTENTICAÇÃO
    // ==============================================

    // Registrar novo usuário
    async signUp(email, password, userData) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: userData.fullName,
                        phone: userData.phone,
                        user_type: userData.userType || 'buyer'
                    }
                }
            });

            if (error) throw error;

            // Criar perfil do usuário
            if (data.user) {
                await this.createUserProfile(data.user.id, userData);
            }

            HELPERS.log('info', 'Usuário registrado com sucesso', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao registrar usuário', error);
            return { success: false, error: error.message };
        }
    }

    // Login
    async signIn(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            this.session = data.session;
            this.user = data.user;

            HELPERS.log('info', 'Login realizado com sucesso', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao fazer login', error);
            return { success: false, error: error.message };
        }
    }

    // Logout
    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            
            if (error) throw error;

            this.session = null;
            this.user = null;

            HELPERS.log('info', 'Logout realizado com sucesso');
            return { success: true };
        } catch (error) {
            HELPERS.log('error', 'Erro ao fazer logout', error);
            return { success: false, error: error.message };
        }
    }

    // Resetar senha
    async resetPassword(email) {
        try {
            const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;

            HELPERS.log('info', 'Email de recuperação enviado');
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao enviar email de recuperação', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // PERFIS DE USUÁRIO
    // ==============================================

    // Criar perfil do usuário
    async createUserProfile(userId, userData) {
        try {
            const { data, error } = await this.client
                .from('users')
                .insert([
                    {
                        id: userId,
                        full_name: userData.fullName,
                        email: userData.email,
                        phone: userData.phone,
                        user_type: userData.userType || 'buyer',
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;

            HELPERS.log('info', 'Perfil criado com sucesso', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao criar perfil', error);
            return { success: false, error: error.message };
        }
    }

    // Buscar perfil do usuário
    async getUserProfile(userId) {
        try {
            const { data, error } = await this.client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao buscar perfil', error);
            return { success: false, error: error.message };
        }
    }

    // Atualizar perfil
    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await this.client
                .from('users')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select();

            if (error) throw error;

            HELPERS.log('info', 'Perfil atualizado com sucesso', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao atualizar perfil', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // PRODUTOS
    // ==============================================

    // Criar produto
    async createProduct(productData) {
        try {
            const { data, error } = await this.client
                .from('products')
                .insert([
                    {
                        seller_id: this.user.id,
                        name: productData.name,
                        description: productData.description,
                        price: productData.price,
                        old_price: productData.oldPrice,
                        category: productData.category,
                        subcategory: productData.subcategory,
                        images: productData.images,
                        stock: productData.stock,
                        sku: productData.sku || HELPERS.generateId('SKU-'),
                        status: 'pending', // pending, active, rejected
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;

            HELPERS.log('info', 'Produto criado com sucesso', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao criar produto', error);
            return { success: false, error: error.message };
        }
    }

    // Buscar produtos
    async getProducts(filters = {}, page = 1, limit = 20) {
        try {
            let query = this.client
                .from('products')
                .select('*, seller:users!seller_id(full_name, phone, is_verified)', { count: 'exact' });

            // Aplicar filtros
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            if (filters.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }
            if (filters.minPrice) {
                query = query.gte('price', filters.minPrice);
            }
            if (filters.maxPrice) {
                query = query.lte('price', filters.maxPrice);
            }
            if (filters.sellerId) {
                query = query.eq('seller_id', filters.sellerId);
            }

            // Status ativo
            query = query.eq('status', 'active');

            // Paginação
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            query = query.range(from, to);

            // Ordenação
            query = query.order('created_at', { ascending: false });

            const { data, error, count } = await query;

            if (error) throw error;

            return {
                success: true,
                data,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            HELPERS.log('error', 'Erro ao buscar produtos', error);
            return { success: false, error: error.message };
        }
    }

    // Buscar produto por ID
    async getProductById(productId) {
        try {
            const { data, error } = await this.client
                .from('products')
                .select('*, seller:users!seller_id(*)')
                .eq('id', productId)
                .single();

            if (error) throw error;

            // Incrementar visualizações
            await this.incrementProductViews(productId);

            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao buscar produto', error);
            return { success: false, error: error.message };
        }
    }

    // Atualizar produto
    async updateProduct(productId, updates) {
        try {
            const { data, error } = await this.client
                .from('products')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', productId)
                .eq('seller_id', this.user.id) // Apenas o vendedor pode atualizar
                .select();

            if (error) throw error;

            HELPERS.log('info', 'Produto atualizado com sucesso', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao atualizar produto', error);
            return { success: false, error: error.message };
        }
    }

    // Deletar produto
    async deleteProduct(productId) {
        try {
            const { error } = await this.client
                .from('products')
                .delete()
                .eq('id', productId)
                .eq('seller_id', this.user.id);

            if (error) throw error;

            HELPERS.log('info', 'Produto deletado com sucesso');
            return { success: true };
        } catch (error) {
            HELPERS.log('error', 'Erro ao deletar produto', error);
            return { success: false, error: error.message };
        }
    }

    // Incrementar visualizações
    async incrementProductViews(productId) {
        try {
            const { error } = await this.client.rpc('increment_product_views', {
                product_id: productId
            });

            if (error) throw error;
        } catch (error) {
            HELPERS.log('error', 'Erro ao incrementar visualizações', error);
        }
    }

    // ==============================================
    // PEDIDOS
    // ==============================================

    // Criar pedido
    async createOrder(orderData) {
        try {
            const orderId = HELPERS.generateId('ORD-');
            
            const { data, error } = await this.client
                .from('orders')
                .insert([
                    {
                        order_id: orderId,
                        buyer_id: this.user.id,
                        seller_id: orderData.sellerId,
                        product_id: orderData.productId,
                        quantity: orderData.quantity,
                        total_amount: orderData.totalAmount,
                        commission: orderData.commission,
                        shipping_cost: orderData.shippingCost,
                        payment_method: orderData.paymentMethod,
                        shipping_address: orderData.shippingAddress,
                        status: 'pending', // pending, paid, processing, shipped, delivered, cancelled
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;

            HELPERS.log('info', 'Pedido criado com sucesso', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao criar pedido', error);
            return { success: false, error: error.message };
        }
    }

    // Buscar pedidos do usuário
    async getUserOrders(userId, role = 'buyer') {
        try {
            const field = role === 'buyer' ? 'buyer_id' : 'seller_id';
            
            const { data, error } = await this.client
                .from('orders')
                .select('*, product:products(*), buyer:users!buyer_id(*), seller:users!seller_id(*)')
                .eq(field, userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao buscar pedidos', error);
            return { success: false, error: error.message };
        }
    }

    // Atualizar status do pedido
    async updateOrderStatus(orderId, status, additionalData = {}) {
        try {
            const { data, error } = await this.client
                .from('orders')
                .update({
                    status: status,
                    ...additionalData,
                    updated_at: new Date().toISOString()
                })
                .eq('order_id', orderId)
                .select();

            if (error) throw error;

            HELPERS.log('info', 'Status do pedido atualizado', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao atualizar status do pedido', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // TRANSAÇÕES DE PAGAMENTO
    // ==============================================

    // Criar transação
    async createTransaction(transactionData) {
        try {
            const transactionId = HELPERS.generateId('TXN-');
            
            const { data, error } = await this.client
                .from('transactions')
                .insert([
                    {
                        transaction_id: transactionId,
                        order_id: transactionData.orderId,
                        amount: transactionData.amount,
                        payment_method: transactionData.paymentMethod,
                        status: 'pending', // pending, completed, failed, refunded
                        provider_reference: transactionData.providerReference,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;

            HELPERS.log('info', 'Transação criada com sucesso', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao criar transação', error);
            return { success: false, error: error.message };
        }
    }

    // Atualizar transação
    async updateTransaction(transactionId, updates) {
        try {
            const { data, error } = await this.client
                .from('transactions')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('transaction_id', transactionId)
                .select();

            if (error) throw error;

            HELPERS.log('info', 'Transação atualizada', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao atualizar transação', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // AVALIAÇÕES
    // ==============================================

    // Criar avaliação
    async createReview(reviewData) {
        try {
            const { data, error } = await this.client
                .from('reviews')
                .insert([
                    {
                        product_id: reviewData.productId,
                        user_id: this.user.id,
                        rating: reviewData.rating,
                        comment: reviewData.comment,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;

            // Atualizar rating médio do produto
            await this.updateProductRating(reviewData.productId);

            HELPERS.log('info', 'Avaliação criada com sucesso', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao criar avaliação', error);
            return { success: false, error: error.message };
        }
    }

    // Buscar avaliações do produto
    async getProductReviews(productId) {
        try {
            const { data, error } = await this.client
                .from('reviews')
                .select('*, user:users(full_name)')
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao buscar avaliações', error);
            return { success: false, error: error.message };
        }
    }

    // Atualizar rating médio do produto
    async updateProductRating(productId) {
        try {
            const { error } = await this.client.rpc('update_product_rating', {
                product_id: productId
            });

            if (error) throw error;
        } catch (error) {
            HELPERS.log('error', 'Erro ao atualizar rating', error);
        }
    }

    // ==============================================
    // LISTA DE DESEJOS
    // ==============================================

    // Adicionar à lista de desejos
    async addToWishlist(productId) {
        try {
            const { data, error } = await this.client
                .from('wishlist')
                .insert([
                    {
                        user_id: this.user.id,
                        product_id: productId,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;

            HELPERS.log('info', 'Produto adicionado à lista de desejos', data);
            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao adicionar à lista de desejos', error);
            return { success: false, error: error.message };
        }
    }

    // Remover da lista de desejos
    async removeFromWishlist(productId) {
        try {
            const { error } = await this.client
                .from('wishlist')
                .delete()
                .eq('user_id', this.user.id)
                .eq('product_id', productId);

            if (error) throw error;

            HELPERS.log('info', 'Produto removido da lista de desejos');
            return { success: true };
        } catch (error) {
            HELPERS.log('error', 'Erro ao remover da lista de desejos', error);
            return { success: false, error: error.message };
        }
    }

    // Buscar lista de desejos
    async getWishlist() {
        try {
            const { data, error } = await this.client
                .from('wishlist')
                .select('*, product:products(*)')
                .eq('user_id', this.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            HELPERS.log('error', 'Erro ao buscar lista de desejos', error);
            return { success: false, error: error.message };
        }
    }
}

// Instanciar Supabase DB
const db = new SupabaseDB();
