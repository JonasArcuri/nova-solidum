# ⚡ Quick Start - Deploy Rápido

## 🚂 Railway (Mais Fácil - 5 minutos)

1. **Acesse:** https://railway.app
2. **Login com GitHub**
3. **New Project** > **Deploy from GitHub repo**
4. **Selecione seu repositório**
5. **Variables** > Adicione:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=sua_senha_de_app
   COMPANY_EMAIL=novasolidum@gmail.com
   FRONTEND_URL=https://seu-frontend.vercel.app
   ```
6. **Settings** > **Generate Domain**
7. **Copie a URL** e atualize no frontend:
   ```javascript
   const BACKEND_CONFIG = {
       enabled: true,
       url: 'https://seu-projeto.up.railway.app/api/email/send'
   };
   ```

✅ **Pronto!** Railway faz deploy automático a cada push.

---

## 🎨 Render (Alternativa - 5 minutos)

1. **Acesse:** https://render.com
2. **Login com GitHub**
3. **New +** > **Web Service**
4. **Conecte repositório**
5. **Configure:**
   - Name: `nova-solidum-backend`
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`
6. **Environment** > Adicione variáveis
7. **Create Web Service**

✅ **Pronto!** Render faz deploy automático.

---

## 📝 Checklist Antes do Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Senha de App do Gmail criada (se usar Gmail)
- [ ] `BACKEND_CONFIG.url` atualizado no frontend
- [ ] Testado localmente (`npm start`)

---

## 🔗 Links Úteis

- **Guia Completo:** Veja `DEPLOY.md`
- **Configuração de Email:** Veja `EMAIL_SETUP.md`
- **Troubleshooting:** Veja `DEPLOY.md` > Troubleshooting

---

## 🆘 Problemas Comuns

**"Email não envia"**
→ Verifique credenciais no painel da plataforma

**"CORS error"**
→ Configure `FRONTEND_URL` com URL exata do frontend

**"Backend não responde"**
→ Verifique logs na plataforma (Railway/Render mostram logs)

---

**Dica:** Railway é a opção mais fácil para começar! 🚀

