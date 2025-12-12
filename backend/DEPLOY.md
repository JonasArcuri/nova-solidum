# 🚀 Guia de Hospedagem do Backend

Este guia mostra como hospedar o backend em diferentes plataformas.

## 📋 Índice

1. [Railway (Recomendado - Gratuito)](#railway)
2. [Render (Gratuito)](#render)
3. [Vercel (Serverless)](#vercel)
4. [Heroku](#heroku)
5. [Servidor Próprio (VPS)](#vps)
6. [Outras Opções](#outras-opcoes)

---

## 🚂 Railway (Recomendado)

**Vantagens:** Gratuito, fácil, suporta variáveis de ambiente, logs em tempo real

### Passo a Passo:

1. **Criar conta:**
   - Acesse: https://railway.app
   - Faça login com GitHub

2. **Criar novo projeto:**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte seu repositório

3. **Configurar variáveis de ambiente:**
   - No projeto, vá em "Variables"
   - Adicione todas as variáveis do `.env`:
     ```
     PORT=3000
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_SECURE=false
     EMAIL_USER=seu_email@gmail.com
     EMAIL_PASS=sua_senha_de_app
     COMPANY_EMAIL=novasolidum@gmail.com
     FRONTEND_URL=https://seu-frontend.vercel.app
     TINIFY_API_KEY=sua_key (opcional)
     ```

4. **Configurar domínio (opcional):**
   - Vá em "Settings" > "Generate Domain"
   - Railway gerará uma URL como: `seu-projeto.up.railway.app`
   - Atualize `BACKEND_CONFIG.url` no frontend

5. **Deploy automático:**
   - Railway detecta automaticamente Node.js
   - O deploy acontece automaticamente a cada push

### Atualizar Frontend:

```javascript
const BACKEND_CONFIG = {
    enabled: true,
    url: 'https://seu-projeto.up.railway.app/api/email/send'
};
```

---

## 🎨 Render

**Vantagens:** Gratuito, fácil, suporta variáveis de ambiente

### Passo a Passo:

1. **Criar conta:**
   - Acesse: https://render.com
   - Faça login com GitHub

2. **Criar novo Web Service:**
   - Clique em "New +" > "Web Service"
   - Conecte seu repositório
   - Selecione o branch (geralmente `main`)

3. **Configurar:**
   - **Name:** `nova-solidum-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** (deixe vazio)

4. **Variáveis de ambiente:**
   - Vá em "Environment"
   - Adicione todas as variáveis do `.env`

5. **Deploy:**
   - Clique em "Create Web Service"
   - Render fará o deploy automaticamente

6. **Configurar domínio:**
   - Render fornece uma URL: `seu-projeto.onrender.com`
   - Atualize `BACKEND_CONFIG.url` no frontend

### Nota Importante:
Render coloca serviços gratuitos em "sleep" após 15 minutos de inatividade. A primeira requisição pode demorar ~30 segundos para "acordar".

---

## ▲ Vercel (Serverless)

**Vantagens:** Gratuito, muito rápido, CDN global

### Passo a Passo:

1. **Criar arquivo `vercel.json` na raiz do projeto:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. **Instalar Vercel CLI:**
```bash
npm install -g vercel
```

3. **Deploy:**
```bash
cd backend
vercel
```

4. **Configurar variáveis de ambiente:**
   - No dashboard do Vercel: https://vercel.com/dashboard
   - Vá em "Settings" > "Environment Variables"
   - Adicione todas as variáveis

5. **Atualizar frontend:**
```javascript
const BACKEND_CONFIG = {
    enabled: true,
    url: 'https://seu-projeto.vercel.app/api/email/send'
};
```

### ⚠️ Limitações do Vercel:
- Funções serverless têm timeout de 10 segundos (plano gratuito)
- Pode não funcionar bem para uploads grandes
- Considere Railway ou Render para este caso

---

## 🟣 Heroku

**Vantagens:** Confiável, bem documentado

### Passo a Passo:

1. **Instalar Heroku CLI:**
   - Download: https://devcenter.heroku.com/articles/heroku-cli

2. **Login:**
```bash
heroku login
```

3. **Criar app:**
```bash
cd backend
heroku create nova-solidum-backend
```

4. **Configurar variáveis:**
```bash
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_SECURE=false
heroku config:set EMAIL_USER=seu_email@gmail.com
heroku config:set EMAIL_PASS=sua_senha_de_app
heroku config:set COMPANY_EMAIL=novasolidum@gmail.com
heroku config:set FRONTEND_URL=https://seu-frontend.vercel.app
```

5. **Criar `Procfile` na pasta `backend`:**
```
web: node server.js
```

6. **Deploy:**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

7. **Ver logs:**
```bash
heroku logs --tail
```

### ⚠️ Nota:
Heroku removeu o plano gratuito. Agora é pago ($5/mês mínimo).

---

## 🖥️ Servidor Próprio (VPS)

**Vantagens:** Controle total, sem limites

### Opções de VPS:
- **DigitalOcean:** $4/mês
- **Linode:** $5/mês
- **AWS EC2:** Pay-as-you-go
- **Google Cloud:** Pay-as-you-go

### Passo a Passo (Ubuntu/Debian):

1. **Conectar ao servidor:**
```bash
ssh root@seu-ip
```

2. **Instalar Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Instalar PM2 (gerenciador de processos):**
```bash
sudo npm install -g pm2
```

4. **Clonar repositório:**
```bash
git clone https://github.com/seu-usuario/nova-solidum.git
cd nova-solidum/backend
```

5. **Instalar dependências:**
```bash
npm install
```

6. **Configurar `.env`:**
```bash
nano .env
# Cole suas variáveis de ambiente
```

7. **Iniciar com PM2:**
```bash
pm2 start server.js --name nova-solidum-backend
pm2 save
pm2 startup
```

8. **Configurar Nginx (reverse proxy):**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/nova-solidum
```

**Conteúdo do arquivo:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

9. **Ativar site:**
```bash
sudo ln -s /etc/nginx/sites-available/nova-solidum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

10. **Configurar SSL (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### Comandos úteis PM2:
```bash
pm2 list              # Ver processos
pm2 logs              # Ver logs
pm2 restart all       # Reiniciar
pm2 stop all          # Parar
pm2 delete all        # Remover
```

---

## 🌐 Outras Opções

### Fly.io
- **URL:** https://fly.io
- **Vantagens:** Gratuito, rápido, global
- **Ideal para:** Aplicações que precisam de baixa latência

### Netlify Functions
- **URL:** https://netlify.com
- **Vantagens:** Integrado com frontend
- **Limitações:** Timeout de 10s (gratuito)

### AWS Lambda + API Gateway
- **URL:** https://aws.amazon.com
- **Vantagens:** Escalável, pay-as-you-go
- **Complexidade:** Média/Alta

### Google Cloud Run
- **URL:** https://cloud.google.com/run
- **Vantagens:** Escalável, pay-as-you-go
- **Complexidade:** Média

---

## 🔒 Segurança em Produção

### Checklist:

- [ ] Use HTTPS (SSL/TLS)
- [ ] Configure `FRONTEND_URL` com a URL exata do frontend
- [ ] Não commite o arquivo `.env` no Git
- [ ] Use senhas fortes para email
- [ ] Configure rate limiting (opcional)
- [ ] Monitore logs regularmente
- [ ] Faça backup das variáveis de ambiente

### Exemplo de Rate Limiting (opcional):

Adicione ao `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // máximo 100 requisições por IP
});

app.use('/api/', limiter);
```

---

## 📊 Comparação Rápida

| Plataforma | Gratuito | Facilidade | Performance | Recomendado |
|------------|----------|------------|-------------|-------------|
| Railway    | ✅ Sim   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Sim |
| Render     | ✅ Sim   | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Sim |
| Vercel     | ✅ Sim   | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ Limitações |
| Heroku     | ❌ Não   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ Pago |
| VPS        | ❌ Não   | ⭐⭐     | ⭐⭐⭐⭐⭐ | ✅ Controle total |

---

## 🎯 Recomendação Final

**Para começar rápido:** Use **Railway** ou **Render**
- Gratuito
- Fácil de configurar
- Deploy automático
- Suporta variáveis de ambiente

**Para produção séria:** Use **VPS** (DigitalOcean, Linode)
- Controle total
- Sem limites
- Melhor performance
- Mais trabalho de configuração

---

## 🆘 Troubleshooting

### Erro: "Cannot find module"
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` novamente

### Erro: "Port already in use"
- A maioria das plataformas define a porta automaticamente
- Use `process.env.PORT || 3000` no código (já está assim)

### Erro: "CORS"
- Configure `FRONTEND_URL` com a URL exata do frontend
- Em produção, não use `*` para CORS

### Email não envia
- Verifique as credenciais no `.env`
- Para Gmail, use Senha de App
- Verifique logs do servidor

---

## 📝 Próximos Passos

1. Escolha uma plataforma
2. Configure variáveis de ambiente
3. Faça o deploy
4. Atualize `BACKEND_CONFIG.url` no frontend
5. Teste o envio de emails
6. Configure domínio personalizado (opcional)

Boa sorte com o deploy! 🚀

