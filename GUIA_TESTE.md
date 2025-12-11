# Guia de Teste - Formulário de Registro KYC

## Como Abrir e Testar

### Método 1: Abrir Diretamente no Navegador
1. Navegue até a pasta do projeto: `C:\Users\JONAS.RR\Desktop\nova-solidum`
2. Clique duas vezes no arquivo `index.html`
3. O arquivo abrirá no seu navegador padrão

### Método 2: Usar Live Server (Recomendado)
Se você tem a extensão Live Server no VS Code:
1. Clique com botão direito no arquivo `index.html`
2. Selecione "Open with Live Server"
3. O site abrirá em `http://localhost:5504` (ou porta configurada)

### Método 3: Servidor Python (Alternativa)
Se você tem Python instalado:
```bash
# No terminal, na pasta do projeto:
python -m http.server 8000
# Depois acesse: http://localhost:8000
```

---

## Checklist de Testes

### 1. Teste Básico - Abertura do Modal
- [ ] Clique no botão "Começar" no header
- [ ] O modal deve abrir com animação
- [ ] Verifique se aparece a seleção PF/PJ
- [ ] Teste fechar o modal (X, ESC, ou clicando fora)

### 2. Teste de Seleção PF/PJ
- [ ] Selecione "Pessoa Física (PF)" - deve mostrar campos PF
- [ ] Selecione "Pessoa Jurídica (PJ)" - deve mostrar campos PJ
- [ ] Verifique se os campos corretos aparecem/desaparecem

### 3. Teste de Validações - Pessoa Física

#### Campos Obrigatórios
- [ ] Tente enviar sem preencher campos - deve mostrar erros
- [ ] Preencha todos os campos obrigatórios

#### Validação de CPF
- [ ] Digite CPF inválido: `111.111.111-11` - deve mostrar erro
- [ ] Digite CPF válido: `123.456.789-09` (ou use gerador online)
- [ ] Verifique se a máscara funciona automaticamente

#### Validação de Data de Nascimento
- [ ] Digite data que dá menos de 18 anos - deve mostrar erro
- [ ] Digite data válida (>= 18 anos)

#### Validação de CEP
- [ ] Digite CEP: `01310-100` (Av. Paulista, SP)
- [ ] Verifique se preenche automaticamente: logradouro, bairro, cidade, UF
- [ ] Teste com CEP inválido

#### Validação de Telefone
- [ ] Digite telefone: `11999999999`
- [ ] Verifique se formata para: `+5511999999999`
- [ ] Teste formato E.164

#### PEP Status
- [ ] Marque "Sou PEP"
- [ ] Verifique se aparece campo de cargo/função
- [ ] Desmarque - campo deve desaparecer

#### Upload de Arquivos
- [ ] Tente enviar arquivo > 10MB - deve mostrar erro
- [ ] Tente enviar tipo inválido (ex: .txt) - deve mostrar erro
- [ ] Envie arquivos válidos (JPG, PNG, PDF < 10MB)

### 4. Teste de Validações - Pessoa Jurídica

#### Validação de CNPJ
- [ ] Digite CNPJ inválido: `00.000.000/0000-00` - deve mostrar erro
- [ ] Digite CNPJ válido (use gerador online)
- [ ] Verifique se a máscara funciona

#### Validação de CPF do Administrador
- [ ] Teste CPF inválido do admin
- [ ] Teste CPF válido

#### CEP PJ
- [ ] Teste preenchimento automático de endereço fiscal

### 5. Teste de Envio (Modo Desenvolvimento)

⚠️ **IMPORTANTE**: Para testar sem enviar email real, você pode:

#### Opção A: Comentar o envio de email
No arquivo `script.js`, comente as linhas de envio:
```javascript
// await emailjs.send(...)
```

#### Opção B: Usar dados de teste do EmailJS
- Configure um template de teste no EmailJS
- Use emails de teste

#### Opção C: Verificar no Console
1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Envie o formulário
4. Verifique se os dados estão sendo coletados corretamente
5. Veja se há erros

### 6. Teste de Responsividade
- [ ] Redimensione a janela do navegador
- [ ] Teste em mobile (F12 > Toggle Device Toolbar)
- [ ] Verifique se o formulário fica legível em telas pequenas
- [ ] Teste scroll no modal em mobile

### 7. Teste de Acessibilidade
- [ ] Navegue usando Tab
- [ ] Verifique se os campos são focáveis
- [ ] Teste com leitor de tela (se disponível)

---

## Dados de Teste Sugeridos

### Para Pessoa Física:
```
Nome: João Silva Santos
CPF: 123.456.789-09 (use gerador online para CPF válido)
RG: 12.345.678-9
Data Nascimento: 01/01/1990
Nome da Mãe: Maria Silva Santos
Email: teste@email.com
Telefone: 11999999999
CEP: 01310-100
```

### Para Pessoa Jurídica:
```
Razão Social: Empresa Teste LTDA
Nome Fantasia: Teste
CNPJ: 12.345.678/0001-90 (use gerador online)
Data Fundação: 01/01/2020
CNAE: 6201-5/00
Email: empresa@email.com
Telefone: 11999999999
```

---

## Verificações no Console do Navegador

1. **Abrir Console**: Pressione `F12` ou `Ctrl+Shift+I`
2. **Verificar Erros**: Procure por mensagens em vermelho
3. **Verificar Dados**: Adicione `console.log` no código para debugar

### Comandos Úteis no Console:
```javascript
// Verificar se EmailJS está carregado
typeof emailjs

// Verificar configuração
EMAILJS_CONFIG

// Testar validação de CPF
validateCPF('12345678909')

// Testar validação de CNPJ
validateCNPJ('12345678000190')
```

---

## Problemas Comuns e Soluções

### Modal não abre
- Verifique se há erros no console (F12)
- Verifique se o JavaScript está carregado
- Teste em outro navegador

### CEP não preenche
- Verifique conexão com internet
- Verifique se a API ViaCEP está acessível
- Veja erros no console

### Validações não funcionam
- Verifique se os campos têm os IDs corretos
- Verifique se o JavaScript está executando
- Veja erros no console

### Email não envia
- Verifique se EmailJS está configurado
- Verifique Service ID, Template ID e Public Key
- Veja erros no console do navegador
- Verifique se os templates no EmailJS estão corretos

---

## Próximos Passos Após Teste

1. ✅ Verificar se todas as validações funcionam
2. ✅ Testar em diferentes navegadores (Chrome, Firefox, Edge)
3. ✅ Testar em dispositivos móveis
4. ✅ Configurar templates no EmailJS
5. ✅ Testar envio real de email
6. ✅ Ajustar estilos se necessário
7. ✅ Otimizar performance se necessário

---

## Dicas de Debug

1. **Use breakpoints**: Adicione `debugger;` no código para pausar execução
2. **Console.log**: Adicione logs para ver valores das variáveis
3. **Network Tab**: Veja requisições de API (ViaCEP, EmailJS)
4. **Elements Tab**: Inspecione HTML e CSS

---

Boa sorte com os testes! 🚀

