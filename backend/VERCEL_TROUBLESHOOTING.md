# 🔧 Troubleshooting - Vercel

## ❌ Erro 404: NOT_FOUND

### Problema:
Você está vendo um erro `404: NOT_FOUND` ao acessar o backend no Vercel.

### ✅ Solução:

1. **Verifique se o servidor exporta o app:**
   O `server.js` deve ter no final:
   ```javascript
   module.exports = app;
   ```

2. **Verifique o `vercel.json`:**
   Deve estar na raiz do projeto com:
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
       },
       {
         "src": "/health",
         "dest": "backend/server.js"
       }
     ]
   }
   ```

3. **Verifique as variáveis de ambiente:**
   - Vá em: Vercel Dashboard > Seu Projeto > Settings > Environment Variables
   - Adicione todas as variáveis necessárias:
     - `EMAIL_HOST`
     - `EMAIL_PORT`
     - `EMAIL_SECURE`
     - `EMAIL_USER`
     - `EMAIL_PASS`
     - `COMPANY_EMAIL`
     - `FRONTEND_URL`

4. **Redeploy:**
   - Faça um novo commit e push
   - Ou vá em: Deployments > ... > Redeploy

### ⚠️ Limitações do Vercel:

1. **Timeout:**
   - Plano gratuito: 10 segundos
   - Plano Pro: 60 segundos
   - Uploads grandes podem exceder o timeout

2. **Tamanho de payload:**
   - Máximo: 4.5MB (plano gratuito)
   - Máximo: 50MB (plano Pro)

3. **Cold Start:**
   - Primeira requisição pode demorar ~1-2 segundos

### 🚨 Se o problema persistir:

**Recomendação:** Use **Railway** ou **Render** ao invés do Vercel para este backend, pois:
- ✅ Não tem limite de timeout
- ✅ Suporta uploads maiores
- ✅ Melhor para APIs com uploads de arquivos
- ✅ Mais simples de configurar

### 📝 Checklist:

- [ ] `module.exports = app;` no final do `server.js`
- [ ] `vercel.json` na raiz do projeto
- [ ] Variáveis de ambiente configuradas
- [ ] Redeploy feito após mudanças
- [ ] URL correta no frontend (ex: `https://seu-projeto.vercel.app/api/email/send`)

### 🔗 Links Úteis:

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

---

## 💡 Alternativa Recomendada: Railway

Se você está tendo problemas com Vercel, considere usar **Railway**:

1. Acesse: https://railway.app
2. Login com GitHub
3. New Project > Deploy from GitHub repo
4. Configure variáveis de ambiente
5. Pronto!

**Vantagens:**
- ✅ Sem limite de timeout
- ✅ Suporta uploads grandes
- ✅ Mais fácil de configurar
- ✅ Gratuito

Veja `DEPLOY.md` para instruções completas.

