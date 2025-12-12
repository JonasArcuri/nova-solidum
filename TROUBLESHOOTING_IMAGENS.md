# 🔧 Troubleshooting - Imagens não aparecem no Email

## Problema
As imagens comprimidas não estão aparecendo no email enviado pelo EmailJS.

## ✅ Verificações Necessárias

### 1. Verificar se as imagens estão sendo enviadas

Abra o **Console do Navegador** (F12) e envie o formulário. Você deve ver logs como:

```
✅ 4 arquivo(s) adicionado(s) ao email (total base64: 183.27 KB)
📧 Variáveis de imagem que serão enviadas:
   - documentFront_image: 48.46 KB (primeiros 50 caracteres: data:image/jpeg;base64,/9j/4AAQSkZJRg...)
   - documentBack_image: 44.81 KB (primeiros 50 caracteres: data:image/jpeg;base64,/9j/4AAQSkZJRg...)
   ...
📋 Parâmetros finais do EmailJS: {
   totalParams: 15,
   imageParams: ['documentFront_image', 'documentBack_image', ...],
   estimatedSize: "XX.XX KB"
}
```

**Se você NÃO vê esses logs:**
- As imagens não estão sendo comprimidas/enviadas
- Verifique se os arquivos são realmente imagens (JPG, PNG)
- Verifique o console para erros

**Se você VÊ esses logs:**
- As imagens estão sendo enviadas corretamente
- O problema está no template do EmailJS

---

### 2. Verificar o Template do EmailJS

#### A. Verificar se está em modo HTML

1. Acesse o [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Vá em **Email Templates**
3. Selecione o template da empresa
4. **IMPORTANTE:** Verifique se está em **"HTML"** e não **"Plain Text"**
   - Se estiver em Plain Text, mude para HTML

#### B. Verificar se as variáveis estão corretas

O template deve usar as variáveis exatamente assim:

```html
<img src="{{documentFront_image}}" alt="RG/CNH Frente" style="max-width: 500px;">
```

**NÃO use:**
- `{{#if documentFront_image}}` (Handlebars pode não funcionar)
- `{{documentFront}}` (sem o sufixo `_image`)
- Variáveis diferentes

#### C. Template Mínimo para Teste

Use este template simples para testar:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Nova Solicitação KYC</h2>
    
    <p><strong>Tipo:</strong> {{account_type}}</p>
    <p><strong>Nome:</strong> {{user_name}}{{company_name}}</p>
    
    <h3>Documento Frente:</h3>
    <p>Nome: {{documentFront_name}}</p>
    <img src="{{documentFront_image}}" alt="Documento Frente" style="max-width: 500px; border: 1px solid #ccc;">
    
    <h3>Documento Verso:</h3>
    <p>Nome: {{documentBack_name}}</p>
    <img src="{{documentBack_image}}" alt="Documento Verso" style="max-width: 500px; border: 1px solid #ccc;">
    
    <hr>
    <p><small>Se as imagens não aparecerem acima, verifique o console do navegador para logs de debug.</small></p>
</body>
</html>
```

---

### 3. Verificar Limite de Tamanho do EmailJS

O EmailJS tem limite de **50KB total** para todas as variáveis.

**Se você enviar muitas imagens:**
- Apenas as menores serão enviadas
- As maiores serão puladas automaticamente
- Verifique os logs no console para ver quais foram enviadas

**Solução:**
- O sistema já prioriza imagens menores
- Se necessário, envie menos imagens por vez

---

### 4. Verificar se as Variáveis Existem

No template do EmailJS, você pode adicionar um teste:

```html
<p>Teste de variáveis:</p>
<p>documentFront_image existe? {{documentFront_image}}</p>
<p>documentBack_image existe? {{documentBack_image}}</p>
```

**Se aparecer vazio:**
- A variável não está sendo enviada
- Verifique os logs do console

**Se aparecer "data:image/jpeg;base64,...":**
- A variável está sendo enviada
- O problema pode ser o cliente de email bloqueando imagens base64

---

### 5. Problemas Comuns de Clientes de Email

Alguns clientes de email bloqueiam imagens base64:

**Gmail:**
- ✅ Geralmente funciona
- Pode aparecer como anexo se muito grande

**Outlook:**
- ⚠️ Pode bloquear imagens base64
- Tente visualizar em outro cliente

**Outros:**
- Alguns clientes podem não suportar imagens base64 inline

**Solução:**
- Teste em diferentes clientes de email
- Considere usar anexos ao invés de inline (requer backend)

---

### 6. Debug Avançado

Adicione este código temporariamente no template para ver todas as variáveis:

```html
<pre style="background: #f5f5f5; padding: 10px; font-size: 10px; overflow: auto;">
Variáveis recebidas:
account_type: {{account_type}}
user_name: {{user_name}}
documentFront_name: {{documentFront_name}}
documentFront_image (primeiros 100 chars): {{documentFront_image}}
</pre>
```

Isso mostrará exatamente o que está chegando no template.

---

## ✅ Checklist de Verificação

- [ ] Console mostra logs de imagens sendo enviadas
- [ ] Template está em modo **HTML** (não Plain Text)
- [ ] Variáveis usam sufixo `_image` (ex: `{{documentFront_image}}`)
- [ ] Não usa Handlebars `{{#if}}` (pode não funcionar)
- [ ] Tamanho total não excede 50KB
- [ ] Testou em diferentes clientes de email
- [ ] Verificou se as variáveis existem no template

---

## 🆘 Se Nada Funcionar

1. **Verifique os logs do console** - Eles mostram exatamente o que está sendo enviado
2. **Use o template mínimo** acima para testar
3. **Teste com apenas 1 imagem** para isolar o problema
4. **Verifique se o EmailJS está funcionando** - Teste enviando um email simples sem imagens

---

## 📞 Próximos Passos

Se após todas essas verificações as imagens ainda não aparecerem:

1. Compartilhe os logs do console
2. Compartilhe uma captura de tela do template do EmailJS
3. Informe qual cliente de email você está usando (Gmail, Outlook, etc.)

