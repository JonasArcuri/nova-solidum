# 🔧 Configuração do Backend - Frontend

Este guia explica como conectar o frontend ao backend hospedado no Vercel.

## 📋 Pré-requisitos

- Backend já hospedado e funcionando no Vercel em outro repositório
- URL do backend no Vercel (exemplo: `https://seu-backend.vercel.app`)

## ⚙️ Configuração

### 1. Abrir o arquivo `script.js`

Localize as seguintes configurações no início do arquivo:

### 2. Configurar URL do Backend para Envio de Emails

Encontre a seção `BACKEND_CONFIG` (aproximadamente linha 151):

```javascript
const BACKEND_CONFIG = {
    enabled: true, // Mude para false para usar EmailJS
    url: 'https://seu-backend.vercel.app/api/email/send' // URL do backend no Vercel
};
```

**Substitua `https://seu-backend.vercel.app` pela URL real do seu backend no Vercel.**

### 3. Configurar URL do Backend para Compressão de Imagens (Tinify)

Encontre a seção `TINIFY_CONFIG` (aproximadamente linha 384):

```javascript
const TINIFY_CONFIG = {
    enabled: true,
    apiKey: 'rG1y8sHgfYxFZfsc3g9prpxFjWS7YHfx',
    apiUrl: 'https://api.tinify.com/shrink',
    backendUrl: 'https://seu-backend.vercel.app/api/tinify/compress' // URL do backend proxy no Vercel
};
```

**Substitua `https://seu-backend.vercel.app` pela URL real do seu backend no Vercel.**

## ✅ Exemplo de Configuração Completa

Se seu backend está hospedado em `https://nova-solidum-backend.vercel.app`, a configuração ficaria assim:

```javascript
// Configuração do Backend
const BACKEND_CONFIG = {
    enabled: true,
    url: 'https://nova-solidum-backend.vercel.app/api/email/send'
};

// Configuração do Tinify
const TINIFY_CONFIG = {
    enabled: true,
    apiKey: 'rG1y8sHgfYxFZfsc3g9prpxFjWS7YHfx',
    apiUrl: 'https://api.tinify.com/shrink',
    backendUrl: 'https://nova-solidum-backend.vercel.app/api/tinify/compress'
};
```

## 🔄 Alternar entre Backend e EmailJS

Se quiser usar EmailJS ao invés do backend (fallback), altere:

```javascript
const BACKEND_CONFIG = {
    enabled: false, // Mude para false para usar EmailJS
    url: 'https://seu-backend.vercel.app/api/email/send'
};
```

## 🧪 Testando a Conexão

1. Abra o console do navegador (F12)
2. Preencha e envie o formulário
3. Verifique os logs no console:
   - `📤 Enviando formulário para backend: X arquivo(s) anexado(s)`
   - `✅ Email enviado com sucesso!`

## ❌ Troubleshooting

### Erro: "Failed to fetch"
- Verifique se a URL do backend está correta
- Verifique se o backend está online no Vercel
- Verifique se há problemas de CORS (o backend deve permitir requisições do seu domínio)

### Erro: "Backend não disponível"
- Verifique se o backend está rodando no Vercel
- Teste a URL diretamente no navegador: `https://seu-backend.vercel.app/health`
- Deve retornar: `{"status":"ok","service":"Tinify Proxy"}`

### Imagens não comprimindo
- Verifique se `TINIFY_CONFIG.enabled` está como `true`
- Verifique se a URL do Tinify está correta
- Verifique se o backend tem a API key do Tinify configurada

## 📝 Notas Importantes

- O backend deve estar configurado com as variáveis de ambiente corretas
- O backend deve ter CORS configurado para permitir requisições do seu frontend
- O backend deve ter a API key do Tinify configurada no `.env`
- O backend está em um repositório separado e já está hospedado no Vercel
