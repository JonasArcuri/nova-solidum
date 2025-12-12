# 🚀 Guia Rápido - Backend Tinify

## Passo a Passo para Usar Tinify com Backend

### 1️⃣ Instalar Dependências

```bash
cd backend
npm install
```

### 2️⃣ Configurar Variáveis de Ambiente

Crie o arquivo `.env` na pasta `backend/`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5500
TINIFY_API_KEY=rG1y8sHgfYxFZfsc3g9prpxFjWS7YHfx
```

**Ou use o arquivo `ENV_SETUP.md` como referência.**

### 3️⃣ Iniciar o Backend

```bash
npm start
```

Você verá:
```
🚀 Servidor Tinify Proxy rodando na porta 3000
📡 Health check: http://localhost:3000/health
🔧 Endpoint: http://localhost:3000/api/tinify/compress
```

### 4️⃣ Verificar se Está Funcionando

Abra no navegador: http://localhost:3000/health

Deve retornar:
```json
{"status":"ok","service":"Tinify Proxy"}
```

### 5️⃣ Testar o Frontend

1. Abra seu site (frontend)
2. Envie o formulário com uma imagem
3. No console, você verá:
   ```
   ✅ Tinify (via backend): 196.25 KB → 44.81 KB
   ```

## ✅ Pronto!

Agora o Tinify está funcionando através do backend, sem problemas de CORS!

## 🔧 Configuração do Frontend

O `script.js` já está configurado para usar:
```javascript
backendUrl: 'http://localhost:3000/api/tinify/compress'
```

Se você mudar a porta, atualize também no `script.js`.

## 🌐 Para Produção

1. **Deploy do Backend:**
   - Heroku, Vercel, Railway, ou servidor próprio
   - Configure as variáveis de ambiente no serviço

2. **Atualizar Frontend:**
   - Mude `backendUrl` no `script.js` para a URL do seu backend em produção
   - Exemplo: `https://seu-backend.herokuapp.com/api/tinify/compress`

## 🐛 Problemas Comuns

### "Backend não disponível"
- Verifique se o servidor está rodando: `npm start`
- Verifique se a porta está correta (3000)

### "CORS error"
- Configure `FRONTEND_URL` no `.env` com a URL exata do frontend

### "API key inválida"
- Verifique se a `TINIFY_API_KEY` está correta no `.env`
- Obtenha uma nova em: https://tinypng.com/developers

### "Limite excedido"
- Você usou todas as 500 compressions gratuitas
- Aguarde o próximo mês ou atualize para plano pago

## 📝 Logs

O backend mostra logs úteis:
- `📤 Comprimindo imagem: ...` - Quando recebe requisição
- `✅ Compressão concluída: ...` - Quando completa
- `❌ Erro ao comprimir imagem: ...` - Quando há erro

