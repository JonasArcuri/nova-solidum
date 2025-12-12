# 📧 Configuração de Email - Backend

Este guia explica como configurar o envio de emails com anexos reais usando o backend.

## 🚀 Instalação

1. **Instalar dependências:**
```bash
cd backend
npm install
```

2. **Configurar variáveis de ambiente:**
   - Copie o arquivo `.env.example` para `.env`
   - Edite o arquivo `.env` com suas credenciais

## ⚙️ Configuração do Email

### Para Gmail:

1. **Ative a verificação em duas etapas** na sua conta Google
2. **Crie uma Senha de App:**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "App" e "Email"
   - Selecione "Outro (nome personalizado)" e digite "Nova Solidum Backend"
   - Copie a senha gerada (16 caracteres)

3. **Configure o `.env`:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_aqui
COMPANY_EMAIL=novasolidum@gmail.com
```

### Para Outlook/Hotmail:

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu_email@outlook.com
EMAIL_PASS=sua_senha
COMPANY_EMAIL=novasolidum@gmail.com
```

### Para outros provedores:

Consulte a documentação do seu provedor de email para os valores corretos de `EMAIL_HOST` e `EMAIL_PORT`.

## 🏃 Executando o Servidor

```bash
npm start
```

Ou em modo desenvolvimento (com auto-reload):
```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

## 📡 Endpoints

- **Health Check:** `GET http://localhost:3000/health`
- **Enviar Email:** `POST http://localhost:3000/api/email/send`
- **Comprimir Imagem (Tinify):** `POST http://localhost:3000/api/tinify/compress`

## 🔧 Configuração do Frontend

No arquivo `script.js`, certifique-se de que:

```javascript
const BACKEND_CONFIG = {
    enabled: true, // Ativado para usar backend
    url: 'http://localhost:3000/api/email/send'
};
```

## ✅ Testando

1. Inicie o servidor backend
2. Abra o formulário no navegador
3. Preencha o formulário e anexe arquivos
4. Envie o formulário
5. Verifique os logs do servidor e o email recebido

## 🐛 Troubleshooting

### Erro: "Servidor de email não configurado"
- Verifique se todas as variáveis de email estão no `.env`
- Reinicie o servidor após alterar o `.env`

### Erro: "Authentication failed"
- Para Gmail: Use uma Senha de App, não sua senha normal
- Verifique se a verificação em duas etapas está ativada

### Erro: "Connection timeout"
- Verifique se `EMAIL_HOST` e `EMAIL_PORT` estão corretos
- Verifique se seu firewall não está bloqueando a conexão

### Arquivos não estão sendo anexados
- Verifique os logs do servidor
- Certifique-se de que os arquivos não excedem 10MB cada

## 📝 Notas Importantes

- **Limite de tamanho:** 10MB por arquivo
- **Anexos reais:** Os arquivos são enviados como anexos reais, não base64
- **Sem limite de 50KB:** Não há mais o limite do EmailJS
- **Qualidade preservada:** As imagens não são comprimidas quando enviadas via backend

