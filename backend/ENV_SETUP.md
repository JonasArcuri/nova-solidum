# Configuração do Arquivo .env

Crie um arquivo `.env` na pasta `backend/` com o seguinte conteúdo:

```env
# Porta do servidor (opcional, padrão: 3000)
PORT=3000

# URL do frontend para CORS (opcional, padrão: *)
# Em produção, especifique a URL exata: http://localhost:5500 ou https://seusite.com
FRONTEND_URL=http://localhost:5500

# API Key do Tinify
# Obtenha em: https://tinypng.com/developers
TINIFY_API_KEY=rG1y8sHgfYxFZfsc3g9prpxFjWS7YHfx
```

## Passos:

1. Na pasta `backend/`, crie o arquivo `.env`
2. Cole o conteúdo acima
3. Substitua `TINIFY_API_KEY` pela sua API key do Tinify
4. Ajuste `FRONTEND_URL` se necessário (URL onde seu frontend está rodando)

