# 🔒 Guia de Segurança - Nova Solidum

Este documento descreve as práticas de segurança implementadas no projeto.

## ⚠️ Problemas de Segurança Corrigidos

### 1. Chave de API do Tinify Removida do Frontend

**Problema:** A chave de API do Tinify estava exposta no código JavaScript (`script.js`).

**Solução:** 
- A chave foi removida do código frontend
- A chave agora está apenas no backend (variáveis de ambiente)
- O frontend envia requisições para o backend que processa a compressão

**Antes:**
```javascript
const TINIFY_CONFIG = {
    apiKey: 'rG1y8sHgfYxFZfsc3g9prpxFjWS7YHfx', // ❌ EXPOSTO
    backendUrl: 'https://back-end-nova.vercel.app/api/tinify/compress'
};
```

**Depois:**
```javascript
const TINIFY_CONFIG = {
    // apiKey removida - está no backend
    backendUrl: 'https://back-end-nova.vercel.app/api/tinify/compress'
};
```

### 2. Email de Contato Removido do Código

**Problema:** O email `novasolidum@gmail.com` estava hardcoded no código JavaScript.

**Solução:**
- Email removido do código JavaScript
- Mensagens de erro agora não expõem emails
- Email deve ser configurado no backend ou exibido apenas na página HTML

### 3. Arquivo de Configuração de Exemplo Criado

**Solução:**
- Criado `config.example.js` com exemplos de configuração segura
- Documentação sobre boas práticas de segurança
- `.gitignore` atualizado para proteger arquivos sensíveis

## ✅ Boas Práticas Implementadas

### 1. Separação de Credenciais

- **Frontend:** Apenas URLs públicas e configurações não sensíveis
- **Backend:** Todas as chaves de API, senhas e tokens em variáveis de ambiente

### 2. Variáveis de Ambiente

Todas as credenciais sensíveis devem estar em variáveis de ambiente no backend:

```env
# Backend (.env)
TINIFY_API_KEY=sua_chave_aqui
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
COMPANY_EMAIL=novasolidum@gmail.com
```

### 3. Proteção de Arquivos

O arquivo `.gitignore` foi atualizado para proteger:
- `config.js` (se você criar um)
- `.env` e variantes
- Arquivos de log
- Dependências

## 🔐 Checklist de Segurança

Antes de fazer deploy, verifique:

- [ ] Nenhuma chave de API no código JavaScript
- [ ] Nenhuma senha ou token no código
- [ ] Emails não expostos no código JavaScript
- [ ] Variáveis de ambiente configuradas no backend
- [ ] `.gitignore` atualizado
- [ ] URLs do backend são públicas (isso é normal e seguro)

## 📝 Notas Importantes

1. **URLs do Backend são Públicas:** Isso é normal e seguro. As URLs do backend não expõem credenciais, apenas endpoints públicos.

2. **Chaves de API no Backend:** Todas as chaves de API devem estar no backend usando variáveis de ambiente. O frontend nunca deve ter acesso direto a chaves de API.

3. **Emails de Contato:** Se precisar exibir um email de contato, faça isso no HTML da página, não no JavaScript.

4. **CORS:** O backend deve estar configurado para aceitar requisições apenas do seu frontend (configurar `FRONTEND_URL` no backend).

## 🚨 Se Você Encontrou uma Vulnerabilidade

Se você encontrou uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Entre em contato diretamente com a equipe de desenvolvimento
3. Aguarde a correção antes de divulgar

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

