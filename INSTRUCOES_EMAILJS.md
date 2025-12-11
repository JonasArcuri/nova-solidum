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

**Template Name:** `Registro KYC para Empresa`

**To Email:** `novasolidum@gmail.com`

**Subject:** `Novo Registro {{account_type}} - Nova Solidum Finances`

**Content (Corpo do Email):**

**OPÇÃO 1 - Template Simples SEM Handlebars (Recomendado - Mais compatível):**
```
Olá,

Nova solicitação de registro recebida:

Tipo de Cadastro: {{account_type}}

DADOS PRINCIPAIS:
Nome/Razão Social: {{user_name}}{{company_name}}
CPF/CNPJ: {{user_cpf}}{{company_cnpj}}
Email: {{user_email}}{{company_email}}
Telefone: {{user_phone}}{{company_phone}}

---
Responder para: {{reply_to}}

Atenciosamente,
Nova Solidum Finances
```

**Nota:** Este template não usa Handlebars ({{#if}}) para evitar erros. As variáveis vazias simplesmente não aparecem.

**OPÇÃO 2 - Template Detalhado COM Imagens SEM Handlebars (Recomendado - Mais Compatível):**
```
Olá,

Nova solicitação de registro KYC recebida:

===========================================
TIPO DE CADASTRO: {{account_type}}
===========================================

-------------------------------------------
DADOS PRINCIPAIS
-------------------------------------------

Nome/Razão Social: {{user_name}}{{company_name}}
CPF/CNPJ: {{user_cpf}}{{company_cnpj}}
Email: {{user_email}}{{company_email}}
Telefone: {{user_phone}}{{company_phone}}

-------------------------------------------
DOCUMENTOS ENVIADOS (até 10KB cada)
-------------------------------------------

RG/CNH - Frente: {{documentFront_name}}
{{documentFront_image}}

RG/CNH - Verso: {{documentBack_name}}
{{documentBack_image}}

Selfie: {{selfie_name}}
{{selfie_image}}

Comprovante de Endereço: {{proofOfAddress_name}}
{{proofOfAddress_image}}

RG/CNH Admin - Frente: {{adminIdFront_name}}
{{adminIdFront_image}}

RG/CNH Admin - Verso: {{adminIdBack_name}}
{{adminIdBack_image}}

Comprovante CNPJ: {{cnpjCard_name}}
{{cnpjCard_image}}

===========================================
NOTA: Apenas arquivos até 10KB são enviados como imagem.
Arquivos maiores terão apenas informações (nome, tipo, tamanho).
===========================================

---
Responder para: {{reply_to}}

Atenciosamente,
Nova Solidum Finances
```

**OPÇÃO 3 - Template COM Imagens HTML (Se Handlebars funcionar):**
```
Olá,

Nova solicitação de registro KYC recebida:

===========================================
TIPO DE CADASTRO: {{account_type}}
===========================================

-------------------------------------------
DADOS PRINCIPAIS
-------------------------------------------

Nome/Razão Social: {{user_name}}{{company_name}}
CPF/CNPJ: {{user_cpf}}{{company_cnpj}}
Email: {{user_email}}{{company_email}}
Telefone: {{user_phone}}{{company_phone}}

-------------------------------------------
DOCUMENTOS ENVIADOS (até 10KB cada)
-------------------------------------------

{{#if documentFront_image}}
RG/CNH - Frente: {{documentFront_name}}
<img src="{{documentFront_image}}" alt="RG/CNH Frente" style="max-width: 500px; border: 1px solid #ccc; margin: 10px 0;">
{{/if}}

{{#if documentBack_image}}
RG/CNH - Verso: {{documentBack_name}}
<img src="{{documentBack_image}}" alt="RG/CNH Verso" style="max-width: 500px; border: 1px solid #ccc; margin: 10px 0;">
{{/if}}

{{#if selfie_image}}
Selfie: {{selfie_name}}
<img src="{{selfie_image}}" alt="Selfie" style="max-width: 500px; border: 1px solid #ccc; margin: 10px 0;">
{{/if}}

{{#if proofOfAddress_image}}
Comprovante de Endereço: {{proofOfAddress_name}}
<img src="{{proofOfAddress_image}}" alt="Comprovante" style="max-width: 500px; border: 1px solid #ccc; margin: 10px 0;">
{{/if}}

{{#if adminIdFront_image}}
RG/CNH Admin - Frente: {{adminIdFront_name}}
<img src="{{adminIdFront_image}}" alt="Admin Frente" style="max-width: 500px; border: 1px solid #ccc; margin: 10px 0;">
{{/if}}

{{#if adminIdBack_image}}
RG/CNH Admin - Verso: {{adminIdBack_name}}
<img src="{{adminIdBack_image}}" alt="Admin Verso" style="max-width: 500px; border: 1px solid #ccc; margin: 10px 0;">
{{/if}}

{{#if cnpjCard_image}}
Comprovante CNPJ: {{cnpjCard_name}}
<img src="{{cnpjCard_image}}" alt="CNPJ" style="max-width: 500px; border: 1px solid #ccc; margin: 10px 0;">
{{/if}}

===========================================
NOTA: Apenas arquivos até 10KB são enviados como imagem.
Arquivos maiores terão apenas informações (nome, tipo, tamanho).
===========================================

---
Responder para: {{reply_to}}

Atenciosamente,
Nova Solidum Finances
```

**OPÇÃO 3 - Template Simples SEM Imagens (Se Handlebars não funcionar):**
```
Olá,

Nova solicitação de registro KYC recebida:

TIPO: {{account_type}}

DADOS:
Nome: {{user_name}}{{company_name}}
CPF/CNPJ: {{user_cpf}}{{company_cnpj}}
Email: {{user_email}}{{company_email}}
Telefone: {{user_phone}}{{company_phone}}

---
Responder para: {{reply_to}}
```

**Reply To:** `{{reply_to}}`

- Clique em "Save" e **anote o Template ID** (ex: `template_xyz789`)

**Nota:** O EmailJS suporta Handlebars ({{#if}}), mas se não funcionar, use apenas as variáveis simples como `{{user_name}}` e `{{company_name}}`.

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

### Template da Empresa (Registro KYC):

#### Variáveis Principais:
- `{{account_type}}` - Tipo de cadastro: "PF" ou "PJ"
- `{{form_data}}` - **Todos os dados em JSON formatado** (recomendado usar este)
- `{{reply_to}}` - Email para resposta

#### Variáveis para Pessoa Física (apenas se account_type = "PF"):
- `{{user_name}}` - Nome completo
- `{{user_email}}` - Email
- `{{user_phone}}` - Telefone (formato E.164: +5511999999999)
- `{{user_cpf}}` - CPF formatado

#### Variáveis para Pessoa Jurídica (apenas se account_type = "PJ"):
- `{{company_name}}` - Razão Social
- `{{company_email}}` - Email da empresa
- `{{company_phone}}` - Telefone da empresa
- `{{company_cnpj}}` - CNPJ formatado

#### Variáveis de Imagens (apenas se arquivo <= 10KB):
**Para Pessoa Física:**
- `{{documentFront_image}}` - Imagem base64 do RG/CNH frente
- `{{documentFront_name}}` - Nome do arquivo
- `{{documentBack_image}}` - Imagem base64 do RG/CNH verso
- `{{documentBack_name}}` - Nome do arquivo
- `{{selfie_image}}` - Imagem base64 da selfie (se enviada)
- `{{selfie_name}}` - Nome do arquivo
- `{{proofOfAddress_image}}` - Imagem base64 do comprovante de endereço
- `{{proofOfAddress_name}}` - Nome do arquivo

**Para Pessoa Jurídica:**
- `{{adminIdFront_image}}` - Imagem base64 do RG/CNH admin frente
- `{{adminIdFront_name}}` - Nome do arquivo
- `{{adminIdBack_image}}` - Imagem base64 do RG/CNH admin verso
- `{{adminIdBack_name}}` - Nome do arquivo
- `{{cnpjCard_image}}` - Imagem base64 do comprovante CNPJ
- `{{cnpjCard_name}}` - Nome do arquivo
- `{{companyProofOfAddress_image}}` - Imagem base64 do comprovante de endereço
- `{{companyProofOfAddress_name}}` - Nome do arquivo

**Como usar imagens no template:**
```html
{{#if documentFront_image}}
<img src="{{documentFront_image}}" alt="{{documentFront_name}}" style="max-width: 500px;">
{{/if}}
```

**Nota:** Se Handlebars ({{#if}}) não funcionar, você pode usar apenas `{{documentFront_image}}` diretamente, mas a imagem aparecerá mesmo se não houver arquivo (como string vazia).

#### Dados Completos no JSON (form_data):
O campo `{{form_data}}` contém TODOS os dados em formato JSON, incluindo:

**Para PF:**
- Dados básicos (nome, CPF, RG/CNH, data nascimento, nome da mãe, email, telefone)
- Status PEP (se aplicável)
- Endereço completo (CEP, logradouro, número, complemento, bairro, cidade, UF)
- Informações dos arquivos (nome, tipo, tamanho) - **arquivos não são enviados por email**

**Para PJ:**
- Dados da empresa (razão social, nome fantasia, CNPJ, data fundação, CNAE, email, telefone)
- Natureza jurídica (se informada)
- Endereço fiscal completo
- Dados do administrador/representante legal (nome, CPF, email, telefone)
- Informações dos arquivos (nome, tipo, tamanho) - **arquivos não são enviados por email**

### Template de Confirmação do Usuário:
- `{{to_email}}` - Email do destinatário (usuário)
- `{{to_name}}` - Nome do destinatário
- `{{user_name}}` - Nome completo do usuário (mesmo que to_name)

## ⚠️ IMPORTANTE - Limite de Tamanho do EmailJS

O EmailJS tem um limite de **50KB** para o tamanho total das variáveis. Por isso:

### Arquivos até 10KB:
- ✅ **SÃO enviados como base64** no email
- ✅ Aparecem como variáveis de imagem (ex: `{{documentFront_image}}`)
- ✅ Podem ser exibidos diretamente no template usando `<img src="{{documentFront_image}}">`

### Arquivos maiores que 10KB:
- ❌ **NÃO são enviados como base64** (apenas informações)
- ✅ Informações do arquivo são enviadas (nome, tipo, tamanho) no JSON
- ⚠️ Será necessário solicitar o arquivo por outro método ou implementar upload para servidor

### Limite de Upload:
- Máximo de **10MB** por arquivo para upload no formulário
- Apenas arquivos **até 10KB** serão convertidos e enviados por email

## 📋 Exemplo de form_data (JSON):

```json
{
  "accountType": "PF",
  "fullName": "João Silva Santos",
  "cpf": "123.456.789-09",
  "email": "joao@email.com",
  "phone": "+5511999999999",
  "address": {
    "cep": "01310-100",
    "street": "Avenida Paulista",
    "number": "1000",
    "district": "Bela Vista",
    "city": "São Paulo",
    "state": "SP"
  },
  "documentFront_name": "rg_frente.jpg",
  "documentFront_type": "image/jpeg",
  "documentFront_size": 8500,
  "documentFront_size_kb": "8.30 KB",
  "documentFront_sent": true,
  "documentFront_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "documentFront_note": "Arquivo enviado como anexo (base64)"
}
```

**Exemplo de arquivo grande (não enviado):**
```json
{
  "documentFront_name": "rg_frente.jpg",
  "documentFront_type": "image/jpeg",
  "documentFront_size": 245678,
  "documentFront_size_kb": "239.92 KB",
  "documentFront_sent": false,
  "documentFront_note": "Arquivo muito grande (239.92 KB). Máximo permitido: 10 KB. Será necessário solicitar por outro método."
}
```

## 💡 Dicas e Recomendações

### Como Usar o Template:

1. **Use o campo `{{form_data}}`** - Este campo contém TODOS os dados em JSON formatado. É a forma mais completa de receber as informações.

2. **Variáveis simples** - Use `{{user_name}}`, `{{company_name}}`, etc. para ter informações rápidas no topo do email.

3. **Imagens até 10KB** - Use `{{documentFront_image}}`, `{{documentBack_image}}`, etc. para exibir imagens diretamente no email. Exemplo:
   ```html
   {{#if documentFront_image}}
   <img src="{{documentFront_image}}" alt="{{documentFront_name}}" style="max-width: 500px;">
   {{/if}}
   ```

4. **Formatação do JSON** - O `{{form_data}}` já vem formatado (com quebras de linha e indentação) para facilitar a leitura.

5. **Arquivos grandes** - Arquivos > 10KB não são enviados como imagem. Apenas informações (nome, tipo, tamanho) estão no JSON. Você precisará solicitar por outro método.

### Exemplo de Template Mínimo (Funcional - SEM Handlebars):

```
Nova solicitação de registro {{account_type}}:

Nome/Razão Social: {{user_name}}{{company_name}}
CPF/CNPJ: {{user_cpf}}{{company_cnpj}}
Email: {{user_email}}{{company_email}}
Telefone: {{user_phone}}{{company_phone}}

Dados completos (JSON):
{{form_data}}

Responder para: {{reply_to}}
```

**Nota:** Se `{{form_data}}` ainda der erro, remova essa linha e use apenas as variáveis simples acima.

### Testando o Template:

1. Preencha o formulário no site
2. **Para testar imagens:** Use arquivos pequenos (até 10KB) para ver as imagens no email
3. Verifique se o email chegou em `novasolidum@gmail.com`
4. Abra o email e verifique se:
   - O tipo de cadastro está correto (PF ou PJ)
   - As variáveis simples aparecem (nome, email, etc.)
   - As imagens aparecem (se arquivos <= 10KB foram enviados)
   - O JSON completo está presente e formatado (se não deu erro)
   - Não há erros de variáveis não encontradas

### Dica para Testar Imagens:
- Crie uma imagem pequena (ex: screenshot de 800x600 pixels salvo como JPG com qualidade baixa)
- Ou use um arquivo de texto pequeno renomeado para .jpg (apenas para teste)
- Arquivos até 10KB aparecerão como `{{documentFront_image}}` no template
- Arquivos maiores terão apenas informações no JSON

## 🔧 Solução para Erro "Corrupted Variables"

Se você receber o erro **"One or more dynamic variables are corrupted"**, siga estes passos:

### Solução 1: Remover Handlebars ({{#if}})
O EmailJS pode não processar Handlebars corretamente. Use este template simplificado:

```
Olá,

Nova solicitação de registro KYC recebida:

TIPO DE CADASTRO: {{account_type}}

DADOS PRINCIPAIS:
Nome/Razão Social: {{user_name}}{{company_name}}
CPF/CNPJ: {{user_cpf}}{{company_cnpj}}
Email: {{user_email}}{{company_email}}
Telefone: {{user_phone}}{{company_phone}}

---
Responder para: {{reply_to}}

Atenciosamente,
Nova Solidum Finances
```

### Solução 2: Remover o campo {{form_data}}
Se o erro persistir, o problema pode ser o JSON muito grande. Use apenas as variáveis simples:

```
Olá,

Nova solicitação de registro KYC recebida:

TIPO: {{account_type}}

Nome: {{user_name}}{{company_name}}
CPF/CNPJ: {{user_cpf}}{{company_cnpj}}
Email: {{user_email}}{{company_email}}
Telefone: {{user_phone}}{{company_phone}}

---
Responder para: {{reply_to}}
```

### Solução 3: Usar template em modo texto puro
No EmailJS, tente mudar o formato do template para "Plain Text" ao invés de "HTML".

## 📝 Notas Importantes

- Todos os IDs aparecem no dashboard do EmailJS. É só copiar e colar!
- ⚠️ **O EmailJS pode NÃO suportar Handlebars ({{#if}}) corretamente** - use apenas variáveis simples se der erro
- O limite de 50KB do EmailJS é por email, não por variável
- **Arquivos até 10KB são enviados como base64** e podem ser exibidos diretamente no template
- **Arquivos > 10KB** não são enviados, apenas informações (nome, tipo, tamanho)
- Se o JSON (`{{form_data}}`) for muito grande ou contiver caracteres especiais, remova-o do template
- Para ver todos os dados, você pode verificar os logs do EmailJS ou implementar um backend para receber os dados
- **10KB é muito pequeno para fotos reais** - considere aumentar o limite ou implementar upload para servidor
