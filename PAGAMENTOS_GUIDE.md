# Guia de Integração de Pagamentos - MozCommerce

## 🇲🇿 Sistemas de Pagamento em Moçambique

Este guia detalha a integração com os principais métodos de pagamento em Moçambique.

---

## 1. M-Pesa Moçambique 📱

### Sobre
M-Pesa é o método de pagamento móvel mais popular em Moçambique, operado pela Vodacom.

### Registro
1. Acesse: https://developer.mpesa.vm.co.mz/
2. Crie uma conta de desenvolvedor
3. Registre sua aplicação
4. Aguarde aprovação (2-5 dias úteis)

### Credenciais Necessárias
```javascript
{
    publicKey: "MIICIjANBgkqhkiG9w...", // Chave pública RSA
    apiKey: "your-api-key",
    serviceProviderCode: "171717" // Código do comerciante
}
```

### Endpoints
- **Sandbox**: `https://api.sandbox.vm.co.mz/ipg/v1x/`
- **Produção**: `https://api.mpesa.vm.co.mz/ipg/v1x/`

### Fluxo de Pagamento

#### 1. C2B (Customer to Business) - Cliente paga ao comerciante
```javascript
// Request
POST /c2b/v1/transactions
{
    "input_Amount": "100.00",
    "input_CustomerMSISDN": "258840000000",
    "input_Country": "MZB",
    "input_Currency": "MZN",
    "input_ServiceProviderCode": "171717",
    "input_ThirdPartyReference": "TXN123456",
    "input_TransactionReference": "ORDER-001",
    "input_PurchasedItemsDesc": "Produto XYZ"
}

// Response
{
    "output_ResponseCode": "INS-0",
    "output_ResponseDesc": "Request processed successfully",
    "output_TransactionID": "MP210512.1234.A12345",
    "output_ConversationID": "CONV-12345",
    "output_ThirdPartyReference": "TXN123456"
}
```

#### 2. Verificar Status da Transação
```javascript
POST /query/v1/transactions
{
    "input_QueryReference": "TXN123456",
    "input_ServiceProviderCode": "171717",
    "input_ThirdPartyReference": "TXN123456",
    "input_Country": "MZB"
}
```

### Webhooks
Configure o webhook para receber confirmações:
```
URL: https://seu-dominio.com/api/webhooks/mpesa
Method: POST
```

Estrutura do webhook:
```javascript
{
    "input_Amount": "100.00",
    "input_TransactionReference": "ORDER-001",
    "input_ThirdPartyReference": "TXN123456",
    "output_TransactionID": "MP210512.1234.A12345",
    "output_ResponseCode": "INS-0",
    "output_ResponseDesc": "Transaction successful"
}
```

### Códigos de Resposta
- `INS-0`: Sucesso
- `INS-1`: Falha interna
- `INS-5`: Transação duplicada
- `INS-6`: Saldo insuficiente
- `INS-9`: Timeout
- `INS-10`: Transação cancelada

### Segurança
1. **Encriptação RSA**: Use a chave pública fornecida
2. **Bearer Token**: Inclua no header `Authorization`
3. **IP Whitelist**: Configure IPs permitidos
4. **Validação de Webhooks**: Verifique origem

### Taxas
- Taxa do comerciante: 2-3% por transação
- Mínimo: 10 MZN
- Máximo por transação: 100,000 MZN

---

## 2. E-Mola 💳

### Sobre
E-Mola é uma carteira digital e sistema de pagamento da Movitel.

### Registro
1. Contacte comercial@emola.co.mz
2. Preencha formulário de registro comercial
3. Forneça documentos da empresa
4. Aguarde aprovação (5-10 dias úteis)

### Credenciais
```javascript
{
    merchantId: "MOZ-MERCHANT-123",
    apiKey: "your-api-key",
    secretKey: "your-secret-key"
}
```

### Endpoints
- **Sandbox**: `https://sandbox-api.emola.co.mz/v1/`
- **Produção**: `https://api.emola.co.mz/v1/`

### Fluxo de Pagamento

#### 1. Iniciar Pagamento
```javascript
POST /payments/initiate
{
    "merchantId": "MOZ-MERCHANT-123",
    "amount": 100.00,
    "currency": "MZN",
    "description": "Compra de produto XYZ",
    "transactionRef": "ORDER-001",
    "customerPhone": "258840000000",
    "callbackUrl": "https://seu-dominio.com/api/webhooks/emola",
    "returnUrl": "https://seu-dominio.com/payment/success"
}

// Response
{
    "success": true,
    "transactionId": "EMOLA-TXN-12345",
    "status": "PENDING",
    "message": "Aguardando confirmação do cliente",
    "paymentUrl": "https://pay.emola.co.mz/checkout/12345"
}
```

#### 2. Confirmar Pagamento
O cliente confirma via:
- App E-Mola
- USSD: *170#
- Web: paymentUrl retornado

### Webhooks
```javascript
// Estrutura do webhook
{
    "merchantId": "MOZ-MERCHANT-123",
    "transactionRef": "ORDER-001",
    "transactionId": "EMOLA-TXN-12345",
    "amount": 100.00,
    "status": "COMPLETED", // COMPLETED, FAILED, CANCELLED
    "customerPhone": "258840000000",
    "timestamp": "2024-01-15T10:30:00Z",
    "signature": "abc123..." // HMAC-SHA256
}
```

### Validação de Webhooks
```javascript
const crypto = require('crypto');

function validateWebhook(payload, signature, secretKey) {
    const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return computedSignature === signature;
}
```

### Taxas
- Taxa comercial: 2.5% por transação
- Sem taxa mínima
- Máximo por transação: 50,000 MZN

---

## 3. M-Kesh 🏦

### Sobre
M-Kesh é a carteira digital do Standard Bank Moçambique.

### Registro
1. Visite agência Standard Bank
2. Solicite conta comercial M-Kesh
3. Preencha documentação
4. Receba credenciais de API

### Credenciais
```javascript
{
    merchantId: "MKESH-123456",
    apiKey: "your-api-key",
    merchantSecret: "your-merchant-secret"
}
```

### Endpoints
- **Sandbox**: `https://sandbox.mkesh.co.mz/api/v1/`
- **Produção**: `https://api.mkesh.co.mz/api/v1/`

### Fluxo de Pagamento

#### 1. Criar Pedido de Pagamento
```javascript
POST /payments/request
Headers:
    Authorization: Bearer {access_token}
    Content-Type: application/json

{
    "merchant_id": "MKESH-123456",
    "amount": 100.00,
    "reference": "ORDER-001",
    "phone_number": "258840000000",
    "description": "Pagamento de compra",
    "callback_url": "https://seu-dominio.com/api/webhooks/mkesh"
}

// Response
{
    "status": "success",
    "transaction_id": "MKESH-TXN-789",
    "status_code": "200",
    "message": "Solicitação enviada ao cliente"
}
```

#### 2. Cliente Confirma
- Recebe SMS/Push notification
- Abre app M-Kesh
- Confirma pagamento com PIN

### Webhooks
```javascript
{
    "merchant_id": "MKESH-123456",
    "reference": "ORDER-001",
    "transaction_id": "MKESH-TXN-789",
    "amount": 100.00,
    "status": "success", // success, failed, cancelled
    "phone_number": "258840000000",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### Taxas
- Taxa comercial: 2.8%
- Taxa mínima: 5 MZN
- Máximo: 30,000 MZN por transação

---

## 4. Cartões (Visa/Mastercard) via Stripe 💳

### Integração Stripe
```javascript
// Inicializar Stripe
const stripe = Stripe('pk_test_...');

// Criar Payment Intent
const paymentIntent = await stripe.paymentIntents.create({
    amount: 10000, // Em centavos
    currency: 'mzn',
    payment_method_types: ['card'],
    metadata: {
        order_id: 'ORDER-001'
    }
});

// Frontend - Confirmar pagamento
const {error} = await stripe.confirmCardPayment(
    paymentIntent.client_secret,
    {
        payment_method: {
            card: cardElement,
            billing_details: {
                name: 'Nome do Cliente',
                email: 'email@example.com'
            }
        }
    }
);
```

### Taxas Stripe
- Internacional: 2.9% + $0.30 por transação
- Moçambique: Consultar taxas locais

---

## Sistema de Escrow (Garantia)

### Como Funciona
1. Cliente paga → Valor vai para escrow
2. Vendedor envia produto
3. Cliente confirma recebimento
4. Após 14 dias (ou confirmação), pagamento liberado ao vendedor

### Implementação
```javascript
async function releaseEscrow(transactionId) {
    // Verificar se passou período de escrow
    const transaction = await getTransaction(transactionId);
    const escrowPeriod = 14 * 24 * 60 * 60 * 1000; // 14 dias
    
    if (Date.now() - transaction.createdAt > escrowPeriod) {
        // Liberar pagamento ao vendedor
        const sellerAmount = transaction.amount - transaction.commission;
        
        await transferToSeller(transaction.sellerId, sellerAmount);
        await updateTransaction(transactionId, {
            status: 'completed',
            escrowReleased: true,
            releasedAt: new Date()
        });
    }
}
```

---

## Sistema Antifraude

### Verificações Implementadas

#### 1. Validação de Telefone
```javascript
function validateMozambiquePhone(phone) {
    // Formato: 258 XX XXX XXXX
    const pattern = /^258(82|83|84|85|86|87)\d{7}$/;
    return pattern.test(phone.replace(/\s+/g, ''));
}
```

#### 2. Limite de Transações
- Máximo 10 pedidos por dia por cliente
- Máximo 50,000 MZN por transação
- Tempo mínimo entre pedidos: 5 minutos

#### 3. Score de Risco
```javascript
function calculateRiskScore(order) {
    let score = 0;
    
    // Valor alto
    if (order.amount > 10000) score += 20;
    
    // Telefone não verificado
    if (!order.phoneVerified) score += 30;
    
    // Primeira compra
    if (order.isFirstPurchase) score += 15;
    
    // Horário suspeito (madrugada)
    const hour = new Date().getHours();
    if (hour >= 0 && hour <= 5) score += 10;
    
    return score; // >75 = Alto risco
}
```

#### 4. Verificação KYC (Vendedores)
- Documento de identidade
- Comprovante de endereço
- NUIT (Número de Contribuinte)
- Foto do vendedor

---

## Testes

### Números de Teste M-Pesa
```
Sucesso: 258840000000
Falha: 258840000001
Timeout: 258840000002
```

### Números de Teste E-Mola
```
Sucesso: 258860000000
Saldo insuficiente: 258860000001
Cancelado: 258860000002
```

### Cartões de Teste Stripe
```
Sucesso: 4242 4242 4242 4242
Recusado: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

---

## Monitoramento

### Métricas Importantes
- Taxa de sucesso de pagamentos
- Tempo médio de confirmação
- Chargebacks/Disputas
- Fraudes detectadas
- Transações pendentes

### Alertas Configurar
- Falha de webhook
- Taxa de erro alta (>5%)
- Transação suspeita
- Escrow próximo ao vencimento

---

## Suporte Técnico

### M-Pesa
- Email: developersupport@vm.co.mz
- Telefone: +258 84 300 0000
- Horário: Segunda-Sexta, 8h-17h

### E-Mola
- Email: suporte@emola.co.mz
- Telefone: +258 86 300 0000

### M-Kesh
- Email: mkesh@standardbank.co.mz
- Telefone: +258 21 352 000

---

**Última atualização**: Janeiro 2026
**Versão**: 1.0.0
