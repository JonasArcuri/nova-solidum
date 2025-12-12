# 🖼️ Backend - Nova Solidum

Backend em Node.js com duas funcionalidades principais:
1. **Envio de emails com anexos reais** (usando Nodemailer)
2. **Proxy para API do Tinify** (resolve problemas de CORS)

## 📋 Pré-requisitos

- Node.js 14+ instalado
- NPM ou Yarn
- API Key do Tinify (gratuita em https://tinypng.com/developers)

## 🚀 Instalação

1. **Instale as dependências:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   - Copie `ENV_EXAMPLE.txt` para `.env`
   - Edite o arquivo `.env` com suas credenciais
   
   **Para envio de emails (obrigatório):**
   - Veja `EMAIL_SETUP.md` para instruções detalhadas
   - Configure: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
   
   **Para Tinify (opcional):**
   - Configure: `TINIFY_API_KEY`

## ▶️ Como Executar

### Modo Desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Modo Produção:
```bash
npm start
```

O servidor estará rodando em: `http://localhost:3000`

## 📡 Endpoints

### Health Check
```
GET /health
```
Retorna status do servidor.

### Enviar Email com Anexos
```
POST /api/email/send
Content-Type: multipart/form-data
Body: { 
  formData: JSON,
  documentFront: File (opcional),
  documentBack: File (opcional),
  ... outros arquivos
}
```

**Nota:** Veja `EMAIL_SETUP.md` para configuração completa.

### Comprimir Imagem (Tinify)
```
POST /api/tinify/compress
Content-Type: multipart/form-data
Body: { image: File }
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "originalSize": 196608,
  "compressedSize": 45824,
  "base64": "data:image/jpeg;base64,/9j/4AAQ...",
  "mimeType": "image/jpeg"
}
```

**Resposta de erro:**
```json
{
  "error": "Mensagem de erro"
}
```

## 🔧 Configuração do Frontend

Após iniciar o backend, atualize o `script.js` para usar o backend:

```javascript
const TINIFY_CONFIG = {
    enabled: true,
    apiKey: 'sua_api_key', // Não é mais necessário, mas pode manter
    apiUrl: 'https://api.tinify.com/shrink',
    backendUrl: 'http://localhost:3000/api/tinify/compress' // Adicione esta linha
};
```

## 🌐 Deploy em Produção

### 🚀 Guias de Deploy:

- **📖 Guia Completo:** Veja [`DEPLOY.md`](./DEPLOY.md) - Todas as opções detalhadas
- **⚡ Quick Start:** Veja [`QUICK_START.md`](./QUICK_START.md) - Deploy rápido em 5 minutos

### Opções Recomendadas:

1. **🚂 Railway** (Mais fácil - Gratuito)
   - Deploy em 5 minutos
   - Suporta variáveis de ambiente
   - Deploy automático

2. **🎨 Render** (Gratuito)
   - Fácil de configurar
   - Deploy automático

3. **🖥️ VPS** (DigitalOcean, Linode)
   - Controle total
   - Melhor performance

### Variáveis de Ambiente em Produção:

- `EMAIL_HOST`: Servidor SMTP (ex: smtp.gmail.com)
- `EMAIL_PORT`: Porta SMTP (ex: 587)
- `EMAIL_SECURE`: true/false
- `EMAIL_USER`: Seu email
- `EMAIL_PASS`: Senha de App
- `COMPANY_EMAIL`: Email da empresa
- `FRONTEND_URL`: URL do frontend
- `PORT`: Porta (geralmente definida pela plataforma)
- `TINIFY_API_KEY`: (Opcional) API key do Tinify

## 🔒 Segurança

- ✅ CORS configurado para permitir apenas seu frontend
- ✅ Validação de tipo de arquivo
- ✅ Limite de tamanho (10MB upload, 5MB Tinify)
- ⚠️ Em produção, configure `FRONTEND_URL` com a URL exata do seu site

## 📊 Limites do Tinify

- **Gratuito:** 500 compressions/mês
- **Tamanho máximo:** 5MB por imagem
- **Formatos:** JPG, PNG, WebP

## 🐛 Troubleshooting

### Erro: "TINIFY_API_KEY não configurada"
- Verifique se o arquivo `.env` existe
- Verifique se a variável está correta

### Erro: "CORS"
- Configure `FRONTEND_URL` no `.env` com a URL exata do frontend

### Erro: "Limite excedido"
- Você usou todas as 500 compressions gratuitas do mês
- Aguarde o próximo mês ou atualize para plano pago

### Porta já em uso
- Mude a porta no `.env`: `PORT=3001`

## 📝 Logs

O servidor mostra logs no console:
- `📤 Comprimindo imagem: ...` - Quando recebe requisição
- `✅ Compressão concluída: ...` - Quando completa com sucesso
- `❌ Erro ao comprimir imagem: ...` - Quando há erro

