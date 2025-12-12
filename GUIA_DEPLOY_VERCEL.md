# 🚀 Guia Rápido - Deploy no Vercel

Este guia mostra como fazer o deploy do backend no Vercel de forma simples.

## ✅ Pré-requisitos

- ✅ Repositório criado no GitHub
- ✅ Código commitado e enviado para o GitHub
- ✅ Conta no Vercel (gratuita)

---

## 📝 Passo a Passo

### 1. Conectar Repositório ao Vercel

1. Acesse: https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"Add New..."** > **"Project"**
4. Selecione seu repositório `back-end-nova` (ou o nome que você deu)
5. Clique em **"Import"**

### 2. Configurar o Projeto

O Vercel deve detectar automaticamente que é um projeto Node.js. Configure:

- **Framework Preset:** Deixe como está (ou selecione "Other")
- **Root Directory:** Deixe vazio (ou coloque `./` se necessário)
- **Build Command:** Deixe vazio (não precisa build)
- **Output Directory:** Deixe vazio
- **Install Command:** `cd backend && npm install`
- **Development Command:** Deixe vazio

### 3. Configurar Variáveis de Ambiente

**IMPORTANTE:** Antes de fazer o deploy, configure as variáveis de ambiente:

1. Na tela de configuração do projeto, role até **"Environment Variables"**
2. Adicione cada variável clicando em **"Add"**:

```
PORT = 3000
FRONTEND_URL = https://seu-frontend.vercel.app
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_SECURE = false
EMAIL_USER = seu_email@gmail.com
EMAIL_PASS = sua_senha_de_app
COMPANY_EMAIL = novasolidum@gmail.com
TINIFY_API_KEY = sua_api_key (opcional)
NODE_ENV = production
```

**⚠️ Importante:**
- Para Gmail, você precisa criar uma **"Senha de App"** em: https://myaccount.google.com/apppasswords
- Substitua `seu-frontend.vercel.app` pela URL real do seu frontend
- Não use espaços ao redor do `=` ao adicionar no Vercel

### 4. Fazer o Deploy

1. Clique em **"Deploy"**
2. Aguarde o processo (pode levar 1-2 minutos)
3. Quando terminar, você verá uma URL como: `https://back-end-nova.vercel.app`

### 5. Testar o Deploy

Após o deploy, teste os endpoints:

- **Health Check:** `https://seu-projeto.vercel.app/health`
- **Raiz:** `https://seu-projeto.vercel.app/`
- **API Email:** `https://seu-projeto.vercel.app/api/email/send`
- **API Tinify:** `https://seu-projeto.vercel.app/api/tinify/compress`

---

## 🔄 Deploy Automático

O Vercel faz deploy automático sempre que você fizer push para o GitHub:

1. Faça alterações no código
2. Commit e push:
   ```bash
   git add .
   git commit -m "Atualização"
   git push origin main
   ```
3. O Vercel detecta automaticamente e faz um novo deploy

---

## 🔧 Atualizar Variáveis de Ambiente

Se precisar atualizar variáveis de ambiente depois:

1. Vá em: **Vercel Dashboard** > Seu Projeto > **Settings** > **Environment Variables**
2. Edite ou adicione novas variáveis
3. Clique em **"Save"**
4. Vá em **Deployments** > Clique nos **3 pontos** do último deploy > **Redeploy**

---

## 📱 Atualizar Frontend

Depois do deploy, atualize a URL do backend no seu frontend:

```javascript
const BACKEND_CONFIG = {
    enabled: true,
    url: 'https://seu-projeto.vercel.app/api/email/send'
};
```

---

## ⚠️ Limitações do Vercel (Plano Gratuito)

- **Timeout:** 10 segundos por requisição
- **Payload máximo:** 4.5MB
- **Cold Start:** Primeira requisição pode demorar ~1-2 segundos

**💡 Dica:** Se você tiver problemas com uploads grandes ou timeouts, considere usar **Railway** ou **Render** (veja `DEPLOY.md`).

---

## 🐛 Troubleshooting

### Erro 404: NOT_FOUND

1. Verifique se o arquivo `vercel.json` está na **raiz** do projeto
2. Verifique se o `server.js` exporta o app: `module.exports = app;`
3. Faça um redeploy

### Erro: Variáveis de ambiente não encontradas

1. Vá em **Settings** > **Environment Variables**
2. Verifique se todas as variáveis estão configuradas
3. Faça um redeploy após adicionar variáveis

### Erro: Timeout

- Uploads grandes podem exceder o limite de 10 segundos
- Considere usar Railway ou Render para este caso

### Email não envia

1. Verifique as credenciais de email
2. Para Gmail, use **Senha de App** (não a senha normal)
3. Verifique os logs no Vercel: **Deployments** > Clique no deploy > **Logs**

---

## 📊 Ver Logs

Para ver os logs do seu backend:

1. Vá em **Vercel Dashboard** > Seu Projeto
2. Clique em **Deployments**
3. Clique no último deploy
4. Role até **"Function Logs"** ou **"Build Logs"**

---

## ✅ Checklist Final

- [ ] Repositório conectado ao Vercel
- [ ] `vercel.json` criado na raiz
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Endpoint `/health` funcionando
- [ ] Frontend atualizado com a nova URL
- [ ] Teste de envio de email funcionando

---

## 🎉 Pronto!

Seu backend está rodando no Vercel! 🚀

A URL será algo como: `https://back-end-nova.vercel.app`

**Lembre-se:** Sempre que fizer push no GitHub, o Vercel fará um novo deploy automaticamente.

---

## 📚 Mais Informações

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- Veja `DEPLOY.md` para outras opções de hospedagem

