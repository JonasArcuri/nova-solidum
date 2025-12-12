# 🖼️ Backend Proxy para Tinify

Backend simples em Node.js que faz proxy das requisições para a API do Tinify, resolvendo problemas de CORS.

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
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` e adicione sua API key do Tinify:
   ```
   TINIFY_API_KEY=sua_api_key_aqui
   PORT=3000
   FRONTEND_URL=http://localhost:5500
   ```

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

### Comprimir Imagem
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

### Opções de Deploy:

1. **Heroku:**
   ```bash
   heroku create
   heroku config:set TINIFY_API_KEY=sua_api_key
   git push heroku main
   ```

2. **Vercel:**
   - Conecte seu repositório
   - Configure variáveis de ambiente
   - Deploy automático

3. **Railway:**
   - Conecte repositório
   - Configure variáveis de ambiente
   - Deploy automático

4. **Servidor próprio:**
   - Use PM2 para gerenciar o processo
   - Configure nginx como reverse proxy
   - Use SSL/HTTPS

### Variáveis de Ambiente em Produção:

- `TINIFY_API_KEY`: Sua API key do Tinify
- `PORT`: Porta do servidor (geralmente definida pelo serviço)
- `FRONTEND_URL`: URL do seu frontend (ex: https://seusite.com)

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

