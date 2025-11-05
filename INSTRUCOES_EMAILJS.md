# Instruções Simples - Configurar EmailJS

## Objetivo
Fazer com que os dados do formulário sejam enviados para `novasolidum@gmail.com`.

## Passo a Passo (5 minutos):

### 1. Criar Conta no EmailJS
- Acesse https://www.emailjs.com/
- Clique em "Sign Up" e crie uma conta gratuita (até 200 emails/mês)

### 2. Configurar Serviço de Email
- No dashboard, clique em "Email Services"
- Clique em "Add New Service"
- Escolha "Gmail" (ou outro provedor)
- Conecte sua conta Gmail
- **Anote o Service ID** que aparece (ex: `service_abc123`)

### 3. Criar Template de Email
- No dashboard, clique em "Email Templates"
- Clique em "Create New Template"
- Configure assim:

**To Email:** `novasolidum@gmail.com`

**Subject:** `Novo Registro - Nova Solidum Finances`

**Content (Corpo do Email):**
```
Olá,

Nova solicitação de registro recebida:

Nome: {{user_name}}
Email: {{user_email}}
Objetivo da Transação: {{transaction_objective}}

---
Responder para: {{reply_to}}
```

**Reply To:** `{{reply_to}}`

- Clique em "Save" e **anote o Template ID** (ex: `template_xyz789`)

### 4. Obter Public Key
- No dashboard, clique em "Account" → "General"
- Copie sua **Public Key** (ex: `abcdefghijklmnop`)

### 5. Configurar no Código
- Abra o arquivo `script.js`
- Encontre as linhas 149-152
- Substitua pelos valores que você copiou:

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'service_abc123',    // Cole aqui o Service ID
    templateID: 'template_xyz789', // Cole aqui o Template ID
    publicKey: 'abcdefghijklmnop'   // Cole aqui a Public Key
};
```

### 6. Pronto!
- Teste preenchendo o formulário no site
- Verifique se o email chegou em `novasolidum@gmail.com`

## Resumo dos IDs Necessários:
1. **Service ID** - Do serviço de email configurado
2. **Template ID** - Do template de email criado
3. **Public Key** - Da sua conta EmailJS

## Dica
Todos os IDs aparecem no dashboard do EmailJS. É só copiar e colar!
