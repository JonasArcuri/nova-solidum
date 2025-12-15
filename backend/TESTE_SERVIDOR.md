# 🧪 Como Testar se o Servidor Está Funcionando

## 1. Verificar se o Servidor Está Rodando

Abra no navegador: **http://localhost:3000**

Deve aparecer:
```json
{
  "status": "ok",
  "service": "Tinify Proxy Backend",
  "message": "Servidor está rodando!",
  "endpoints": {
    "health": "/health",
    "compress": "POST /api/tinify/compress"
  }
}
```

## 2. Testar Health Check

Abra no navegador: **http://localhost:3000/health**

Deve aparecer:
```json
{
  "status": "ok",
  "service": "Tinify Proxy"
}
```

## 3. Testar Endpoint de Compressão (via POST)

O endpoint `/api/tinify/compress` **só aceita POST**, não GET.

Se você acessar no navegador (GET), verá:
```json
{
  "error": "Method Not Allowed",
  "message": "Este endpoint aceita apenas requisições POST"
}
```

Isso é **normal**! O endpoint só funciona via POST com FormData.

## 4. Testar com cURL (Terminal)

```bash
curl -X POST http://localhost:3000/api/tinify/compress \
  -F "image=@caminho/para/sua/imagem.jpg"
```

## 5. Verificar Logs do Servidor

Quando o servidor está rodando, você deve ver no terminal:
```
🚀 Servidor Tinify Proxy rodando na porta 3000
📡 Health check: http://localhost:3000/health
🔧 Endpoint: http://localhost:3000/api/tinify/compress
```

## ❌ Problemas Comuns

### "Cannot GET /api/tinify/compress"
- ✅ **Normal!** Este endpoint só aceita POST
- ✅ Teste acessando: http://localhost:3000 (deve funcionar)
- ✅ O frontend faz POST automaticamente, não precisa testar manualmente

### Servidor não inicia
- Verifique se instalou as dependências: `npm install`
- Verifique se a porta 3000 está livre
- Verifique se o Node.js está instalado: `node --version`

### Erro ao iniciar
- Verifique se o arquivo `.env` existe
- Verifique se a `TINIFY_API_KEY` está configurada

