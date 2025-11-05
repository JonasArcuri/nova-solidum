# Instruções Simples - Configurar EmailJS

## Objetivo
Fazer com que os dados do formulário sejam enviados para `novasolidum@gmail.com` e o usuário receba um email de confirmação.

## Passo a Passo (10 minutos):

### 1. Criar Conta no EmailJS
- Acesse https://www.emailjs.com/
- Clique em "Sign Up" e crie uma conta gratuita (até 200 emails/mês)

### 2. Configurar Serviço de Email
- No dashboard, clique em "Email Services"
- Clique em "Add New Service"
- Escolha "Gmail" (ou outro provedor)
- Conecte sua conta Gmail
- **Anote o Service ID** que aparece (ex: `service_abc123`)

### 3. Criar Template de Email para a Empresa
- No dashboard, clique em "Email Templates"
- Clique em "Create New Template"
- Configure assim:

**Template Name:** `Registro para Empresa`

**To Email:** `novasolidum@gmail.com`

**Subject:** `Novo Registro - Nova Solidum Finances`

**Content (Corpo do Email):**
```
Olá,

Nova solicitação de registro recebida:

Nome: {{user_name}}
Email: {{user_email}}
Telefone: {{user_phone}}
Objetivo da Transação: {{transaction_objective}}

---
Responder para: {{reply_to}}
```

**Reply To:** `{{reply_to}}`

- Clique em "Save" e **anote o Template ID** (ex: `template_xyz789`)

### 4. Criar Template de Confirmação para o Usuário
- No dashboard, clique em "Email Templates"
- Clique em "Create New Template" novamente
- Configure assim:

**Template Name:** `Confirmação de Registro`

**To Email:** `{{to_email}}`

**Subject:** `Registro Confirmado - Nova Solidum Finances`

**Content (Corpo do Email):**
```
Olá {{user_name}},

Obrigado por se registrar na Nova Solidum Finances!

Recebemos seu registro com sucesso. Nossa equipe entrará em contato em breve para dar continuidade ao seu cadastro.

Atenciosamente,
Equipe Nova Solidum Finances
```

- Clique em "Save" e **anote o Template ID** (ex: `template_abc123`)

### 5. Obter Public Key
- No dashboard, clique em "Account" → "General"
- Copie sua **Public Key** (ex: `abcdefghijklmnop`)

### 6. Configurar no Código
- Abra o arquivo `script.js`
- Encontre as linhas 151-156
- Substitua pelos valores que você copiou:

```javascript
const EMAILJS_CONFIG = {
    serviceID: 'service_abc123',              // Cole aqui o Service ID
    templateIDCompany: 'template_xyz789',      // Cole aqui o Template ID para a empresa
    templateIDUser: 'template_abc123',         // Cole aqui o Template ID para confirmação do usuário
    publicKey: 'abcdefghijklmnop'              // Cole aqui a Public Key
};
```

### 7. Pronto!
- Teste preenchendo o formulário no site
- Verifique se o email chegou em `novasolidum@gmail.com`
- Verifique se o usuário recebeu o email de confirmação

## Resumo dos IDs Necessários:
1. **Service ID** - Do serviço de email configurado
2. **Template ID Company** - Do template de email para a empresa
3. **Template ID User** - Do template de confirmação para o usuário
4. **Public Key** - Da sua conta EmailJS

## Variáveis Disponíveis nos Templates:

### Template da Empresa:
- `{{user_name}}` - Nome completo do usuário
- `{{user_email}}` - Email do usuário
- `{{user_phone}}` - Telefone do usuário
- `{{transaction_objective}}` - Objetivo da transação
- `{{reply_to}}` - Email para resposta

### Template de Confirmação do Usuário:
- `{{to_email}}` - Email do destinatário (usuário)
- `{{user_name}}` - Nome completo do usuário

## Dica
Todos os IDs aparecem no dashboard do EmailJS. É só copiar e colar!
