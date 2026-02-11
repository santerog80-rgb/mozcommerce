// ==============================================
// SISTEMA DE PAGAMENTOS MOZCOMMERCE
// Integração com M-Pesa, E-Mola, M-Kesh, Visa, Mastercard
// ==============================================

class PaymentSystem {
    constructor() {
        this.escrowTransactions = new Map();
        this.pendingPayments = new Map();
        this.webhookHandlers = new Map();
        this.init();
    }

    init() {
        HELPERS.log('info', 'Sistema de pagamentos inicializado');
        this.setupWebhookHandlers();
    }

    // ==============================================
    // INICIAR PAGAMENTO
    // ==============================================

    async initiatePayment(orderData, paymentMethod) {
        try {
            HELPERS.log('info', `Iniciando pagamento via ${paymentMethod}`, orderData);

            // Validar dados do pedido
            if (!this.validateOrderData(orderData)) {
                throw new Error('Dados do pedido inválidos');
            }

            // Calcular comissão
            const commission = HELPERS.calculateCommission(
                orderData.amount,
                orderData.isPremium,
                orderData.isService
            );

            // Criar transação no banco de dados
            const transaction = await db.createTransaction({
                orderId: orderData.orderId,
                amount: orderData.amount,
                paymentMethod: paymentMethod,
                providerReference: HELPERS.generateId('PAY-')
            });

            if (!transaction.success) {
                throw new Error('Erro ao criar transação');
            }

            // Processar de acordo com o método de pagamento
            let result;
            switch (paymentMethod) {
                case 'mpesa':
                    result = await this.processMPesa(orderData, transaction.data[0]);
                    break;
                case 'emola':
                    result = await this.processEMola(orderData, transaction.data[0]);
                    break;
                case 'mkesh':
                    result = await this.processMKesh(orderData, transaction.data[0]);
                    break;
                case 'visa':
                case 'mastercard':
                    result = await this.processCard(orderData, transaction.data[0], paymentMethod);
                    break;
                default:
                    throw new Error('Método de pagamento não suportado');
            }

            // Adicionar ao escrow
            if (result.success) {
                this.addToEscrow(transaction.data[0].transaction_id, {
                    amount: orderData.amount,
                    commission: commission,
                    sellerId: orderData.sellerId,
                    orderId: orderData.orderId,
                    status: 'pending'
                });
            }

            return result;
        } catch (error) {
            HELPERS.log('error', 'Erro ao iniciar pagamento', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // M-PESA INTEGRATION
    // ==============================================

    async processMPesa(orderData, transaction) {
        try {
            // URL da API do M-Pesa Moçambique
            const apiUrl = CONFIG.payment.methods.mpesa.apiUrl;
            const publicKey = CONFIG.payment.methods.mpesa.publicKey;
            const apiKey = CONFIG.payment.methods.mpesa.apiKey;
            const serviceProviderCode = CONFIG.payment.methods.mpesa.serviceProviderCode;

            // Preparar request
            const requestData = {
                input_TransactionReference: transaction.transaction_id,
                input_CustomerMSISDN: orderData.phone.replace(/\D/g, ''),
                input_Amount: orderData.amount.toFixed(2),
                input_ThirdPartyReference: transaction.transaction_id,
                input_ServiceProviderCode: serviceProviderCode
            };

            HELPERS.log('info', 'Enviando requisição M-Pesa', requestData);

            // Em produção, fazer chamada real à API
            // const response = await fetch(`${apiUrl}/c2b/v1/transactions`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${apiKey}`,
            //         'Origin': window.location.origin
            //     },
            //     body: JSON.stringify(requestData)
            // });

            // Simulação de resposta (remover em produção)
            const simulatedResponse = {
                output_ResponseCode: 'INS-0',
                output_ResponseDesc: 'Requisição aceita para processamento',
                output_TransactionID: 'MP' + Date.now(),
                output_ConversationID: 'CONV' + Date.now(),
                output_ThirdPartyReference: transaction.transaction_id
            };

            // Salvar referência do provedor
            await db.updateTransaction(transaction.transaction_id, {
                provider_reference: simulatedResponse.output_TransactionID,
                provider_response: simulatedResponse
            });

            // Adicionar aos pagamentos pendentes
            this.pendingPayments.set(transaction.transaction_id, {
                method: 'mpesa',
                orderData: orderData,
                transaction: transaction,
                timestamp: Date.now()
            });

            // Mostrar mensagem ao usuário
            this.showPaymentInstruction('mpesa', orderData.phone, orderData.amount);

            return {
                success: true,
                message: 'Requisição M-Pesa enviada. Aguardando confirmação do cliente.',
                transactionId: transaction.transaction_id,
                providerReference: simulatedResponse.output_TransactionID
            };
        } catch (error) {
            HELPERS.log('error', 'Erro ao processar M-Pesa', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // E-MOLA INTEGRATION
    // ==============================================

    async processEMola(orderData, transaction) {
        try {
            const apiUrl = CONFIG.payment.methods.emola.apiUrl;
            const merchantId = CONFIG.payment.methods.emola.merchantId;
            const apiKey = CONFIG.payment.methods.emola.apiKey;

            const requestData = {
                merchantId: merchantId,
                amount: orderData.amount,
                currency: 'MZN',
                description: `Pedido ${orderData.orderId}`,
                transactionRef: transaction.transaction_id,
                customerPhone: orderData.phone.replace(/\D/g, ''),
                callbackUrl: `${window.location.origin}/api/webhooks/emola`
            };

            HELPERS.log('info', 'Enviando requisição E-Mola', requestData);

            // Simulação de resposta (em produção, fazer chamada real)
            const simulatedResponse = {
                success: true,
                transactionId: 'EM' + Date.now(),
                status: 'PENDING',
                message: 'Aguardando confirmação do cliente'
            };

            await db.updateTransaction(transaction.transaction_id, {
                provider_reference: simulatedResponse.transactionId,
                provider_response: simulatedResponse
            });

            this.pendingPayments.set(transaction.transaction_id, {
                method: 'emola',
                orderData: orderData,
                transaction: transaction,
                timestamp: Date.now()
            });

            this.showPaymentInstruction('emola', orderData.phone, orderData.amount);

            return {
                success: true,
                message: 'Requisição E-Mola enviada. Aguardando confirmação.',
                transactionId: transaction.transaction_id,
                providerReference: simulatedResponse.transactionId
            };
        } catch (error) {
            HELPERS.log('error', 'Erro ao processar E-Mola', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // M-KESH INTEGRATION
    // ==============================================

    async processMKesh(orderData, transaction) {
        try {
            const apiUrl = CONFIG.payment.methods.mkesh.apiUrl;
            const merchantId = CONFIG.payment.methods.mkesh.merchantId;
            const apiKey = CONFIG.payment.methods.mkesh.apiKey;

            const requestData = {
                merchant_id: merchantId,
                amount: orderData.amount,
                reference: transaction.transaction_id,
                phone_number: orderData.phone.replace(/\D/g, ''),
                description: `Pedido ${orderData.orderId}`,
                callback_url: `${window.location.origin}/api/webhooks/mkesh`
            };

            HELPERS.log('info', 'Enviando requisição M-Kesh', requestData);

            // Simulação
            const simulatedResponse = {
                status: 'success',
                transaction_id: 'MK' + Date.now(),
                status_code: '200',
                message: 'Solicitação enviada ao cliente'
            };

            await db.updateTransaction(transaction.transaction_id, {
                provider_reference: simulatedResponse.transaction_id,
                provider_response: simulatedResponse
            });

            this.pendingPayments.set(transaction.transaction_id, {
                method: 'mkesh',
                orderData: orderData,
                transaction: transaction,
                timestamp: Date.now()
            });

            this.showPaymentInstruction('mkesh', orderData.phone, orderData.amount);

            return {
                success: true,
                message: 'Requisição M-Kesh enviada. Aguardando confirmação.',
                transactionId: transaction.transaction_id,
                providerReference: simulatedResponse.transaction_id
            };
        } catch (error) {
            HELPERS.log('error', 'Erro ao processar M-Kesh', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // CARTÕES (VISA/MASTERCARD) via STRIPE
    // ==============================================

    async processCard(orderData, transaction, cardType) {
        try {
            // Em produção, integrar com Stripe ou gateway local
            HELPERS.log('info', `Processando pagamento com cartão ${cardType}`, orderData);

            // Mostrar formulário de cartão
            this.showCardForm(orderData, transaction, cardType);

            return {
                success: true,
                message: 'Aguardando dados do cartão',
                transactionId: transaction.transaction_id,
                requiresInput: true
            };
        } catch (error) {
            HELPERS.log('error', 'Erro ao processar cartão', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // SISTEMA DE ESCROW
    // ==============================================

    addToEscrow(transactionId, escrowData) {
        escrowData.escrowDate = new Date();
        escrowData.releaseDate = new Date(Date.now() + (CONFIG.payment.escrowPeriod * 24 * 60 * 60 * 1000));
        
        this.escrowTransactions.set(transactionId, escrowData);
        
        HELPERS.log('info', 'Transação adicionada ao escrow', escrowData);
    }

    async releaseEscrow(transactionId, reason = 'delivery_confirmed') {
        try {
            const escrowData = this.escrowTransactions.get(transactionId);
            
            if (!escrowData) {
                throw new Error('Transação não encontrada no escrow');
            }

            // Calcular valores
            const sellerAmount = escrowData.amount - escrowData.commission;

            // Atualizar transação
            await db.updateTransaction(transactionId, {
                status: 'completed',
                escrow_released: true,
                release_reason: reason,
                seller_amount: sellerAmount,
                platform_commission: escrowData.commission
            });

            // Atualizar pedido
            await db.updateOrderStatus(escrowData.orderId, 'completed', {
                payment_released_at: new Date().toISOString()
            });

            // Remover do escrow
            this.escrowTransactions.delete(transactionId);

            HELPERS.log('info', 'Pagamento liberado do escrow', {
                transactionId,
                sellerAmount,
                commission: escrowData.commission
            });

            return { success: true, sellerAmount, commission: escrowData.commission };
        } catch (error) {
            HELPERS.log('error', 'Erro ao liberar escrow', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // WEBHOOKS
    // ==============================================

    setupWebhookHandlers() {
        // M-Pesa Webhook
        this.webhookHandlers.set('mpesa', async (data) => {
            try {
                const transactionId = data.input_ThirdPartyReference;
                const status = data.output_ResponseCode === 'INS-0' ? 'completed' : 'failed';

                await this.handlePaymentConfirmation(transactionId, 'mpesa', status, data);
            } catch (error) {
                HELPERS.log('error', 'Erro no webhook M-Pesa', error);
            }
        });

        // E-Mola Webhook
        this.webhookHandlers.set('emola', async (data) => {
            try {
                const transactionId = data.transactionRef;
                const status = data.status === 'COMPLETED' ? 'completed' : 'failed';

                await this.handlePaymentConfirmation(transactionId, 'emola', status, data);
            } catch (error) {
                HELPERS.log('error', 'Erro no webhook E-Mola', error);
            }
        });

        // M-Kesh Webhook
        this.webhookHandlers.set('mkesh', async (data) => {
            try {
                const transactionId = data.reference;
                const status = data.status === 'success' ? 'completed' : 'failed';

                await this.handlePaymentConfirmation(transactionId, 'mkesh', status, data);
            } catch (error) {
                HELPERS.log('error', 'Erro no webhook M-Kesh', error);
            }
        });
    }

    async handlePaymentConfirmation(transactionId, method, status, providerData) {
        try {
            HELPERS.log('info', `Confirmação de pagamento ${method}`, { transactionId, status });

            // Atualizar transação
            await db.updateTransaction(transactionId, {
                status: status,
                confirmed_at: new Date().toISOString(),
                provider_confirmation: providerData
            });

            // Buscar dados do pagamento pendente
            const pendingPayment = this.pendingPayments.get(transactionId);
            
            if (!pendingPayment) {
                HELPERS.log('warn', 'Pagamento pendente não encontrado', transactionId);
                return;
            }

            if (status === 'completed') {
                // Atualizar pedido para "pago"
                await db.updateOrderStatus(pendingPayment.orderData.orderId, 'paid', {
                    paid_at: new Date().toISOString(),
                    payment_method: method
                });

                // Aplicar comissão automaticamente
                const commission = HELPERS.calculateCommission(
                    pendingPayment.orderData.amount,
                    pendingPayment.orderData.isPremium,
                    pendingPayment.orderData.isService
                );

                // Notificar vendedor
                await this.notifyPaymentSuccess(pendingPayment.orderData, commission);

                // Remover dos pendentes
                this.pendingPayments.delete(transactionId);

                HELPERS.log('info', 'Pagamento confirmado e processado com sucesso');
            } else {
                // Pagamento falhou
                await db.updateOrderStatus(pendingPayment.orderData.orderId, 'payment_failed');
                
                this.pendingPayments.delete(transactionId);
                
                HELPERS.log('warn', 'Pagamento falhou', providerData);
            }
        } catch (error) {
            HELPERS.log('error', 'Erro ao processar confirmação de pagamento', error);
        }
    }

    // ==============================================
    // SISTEMA ANTIFRAUDE
    // ==============================================

    async checkFraud(orderData) {
        try {
            let riskScore = 0;
            const checks = [];

            // Verificar valor do pedido
            if (orderData.amount > CONFIG.antifraud.maxOrderValue) {
                riskScore += 30;
                checks.push('Valor acima do limite');
            }

            // Verificar número de pedidos por dia (simulated)
            // Em produção, verificar no banco de dados
            const ordersToday = 3; // simulação
            if (ordersToday > CONFIG.antifraud.maxOrdersPerDay) {
                riskScore += 25;
                checks.push('Muitos pedidos no dia');
            }

            // Verificar palavras suspeitas
            const searchText = `${orderData.productName} ${orderData.buyerName}`.toLowerCase();
            for (const keyword of CONFIG.antifraud.suspiciousKeywords) {
                if (searchText.includes(keyword)) {
                    riskScore += 20;
                    checks.push(`Palavra suspeita: ${keyword}`);
                }
            }

            // Verificar telefone verificado
            if (!orderData.phoneVerified) {
                riskScore += 15;
                checks.push('Telefone não verificado');
            }

            // Verificação de IP (em produção)
            // riskScore += await this.checkIPReputation(orderData.ip);

            HELPERS.log('info', 'Verificação antifraude', { riskScore, checks });

            // Requer verificação manual se score alto
            if (riskScore >= CONFIG.antifraud.riskScoreThreshold) {
                return {
                    approved: false,
                    requiresReview: true,
                    riskScore,
                    checks,
                    message: 'Esta transação requer verificação manual'
                };
            }

            // Requer verificação adicional se valor alto
            if (orderData.amount > CONFIG.antifraud.requireVerificationAbove) {
                return {
                    approved: false,
                    requiresVerification: true,
                    riskScore,
                    message: 'Verificação adicional necessária para valores altos'
                };
            }

            return {
                approved: true,
                riskScore,
                checks
            };
        } catch (error) {
            HELPERS.log('error', 'Erro na verificação antifraude', error);
            return {
                approved: false,
                error: error.message
            };
        }
    }

    // ==============================================
    // HELPERS
    // ==============================================

    validateOrderData(orderData) {
        if (!orderData.orderId || !orderData.amount || !orderData.phone) {
            return false;
        }
        if (orderData.amount <= 0) {
            return false;
        }
        if (!HELPERS.isValidPhone(orderData.phone)) {
            return false;
        }
        return true;
    }

    showPaymentInstruction(method, phone, amount) {
        const methodConfig = CONFIG.payment.methods[method];
        
        const modal = document.createElement('div');
        modal.className = 'payment-instruction-modal';
        modal.innerHTML = `
            <div class="payment-instruction-content">
                <div class="payment-icon" style="color: ${methodConfig.color}">
                    <i class="${methodConfig.icon} fa-3x"></i>
                </div>
                <h3>Pagamento via ${methodConfig.name}</h3>
                <p class="payment-amount">${HELPERS.formatCurrency(amount)}</p>
                <div class="payment-steps">
                    <p><strong>Instruções:</strong></p>
                    <ol>
                        <li>Abra a aplicação ${methodConfig.name} no seu telemóvel</li>
                        <li>Verá uma notificação de pagamento</li>
                        <li>Confirme o pagamento de ${HELPERS.formatCurrency(amount)}</li>
                        <li>Aguarde a confirmação</li>
                    </ol>
                </div>
                <div class="payment-waiting">
                    <div class="spinner"></div>
                    <p>Aguardando confirmação do pagamento...</p>
                </div>
                <button class="btn-secondary" onclick="this.closest('.payment-instruction-modal').remove()">
                    Cancelar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showCardForm(orderData, transaction, cardType) {
        // Implementar formulário de cartão
        // Em produção, usar Stripe Elements ou similar
        HELPERS.log('info', 'Mostrar formulário de cartão', { cardType, orderData });
    }

    async notifyPaymentSuccess(orderData, commission) {
        // Implementar notificações (email, SMS, push)
        HELPERS.log('info', 'Notificar sucesso do pagamento', { orderData, commission });
        
        // Exemplo: enviar notificação ao vendedor
        // await this.sendNotification(orderData.sellerId, {
        //     type: 'payment_received',
        //     orderId: orderData.orderId,
        //     amount: orderData.amount - commission,
        //     commission: commission
        // });
    }
}

// Instanciar sistema de pagamentos
const paymentSystem = new PaymentSystem();
