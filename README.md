# Nova Solidum Finances - Landing Page

Landing page desenvolvida para Nova Solidum Finances LTDA, com identidade visual baseada na logo corporativa.

## Estrutura do Projeto

```
nova-solidum/
├── index.html          # Estrutura HTML da landing page
├── styles.css          # Estilos CSS com identidade visual Nova Solidum
├── script.js           # JavaScript para interatividade
├── assets/
│   └── logo.svg        # Logo SVG da Nova Solidum
└── README.md           # Este arquivo
```

## Identidade Visual

- **Cores principais:**
  - Azul escuro (Navy): `#1a2744`
  - Vermelho: `#dc2626`
  - Branco: `#ffffff`
  - Cinza: `#6b7280`

- **Tipografia:**
  - Títulos: Playfair Display (serif)
  - Texto: Inter (sans-serif)

## Como Usar

1. Abra o arquivo `index.html` em um navegador web moderno
2. Ou hospede os arquivos em um servidor web

### Testando o Formulário

Para testar o formulário de registro KYC:
1. Clique no botão "Começar" no header
2. Selecione entre Pessoa Física (PF) ou Pessoa Jurídica (PJ)
3. Preencha os campos obrigatórios
4. Teste as validações (CPF, CNPJ, CEP, etc.)
5. Faça upload dos documentos necessários

**📋 Veja o guia completo de testes em:** `GUIA_TESTE.md`

## Funcionalidades

- Design responsivo (mobile, tablet, desktop)
- Menu de navegação fixo
- Scroll suave entre seções
- Animações de entrada para elementos
- Menu mobile com toggle
- **Formulário KYC completo** com validações:
  - Cadastro para Pessoa Física (PF) e Pessoa Jurídica (PJ)
  - Validação de CPF/CNPJ com dígito verificador
  - Integração com ViaCEP para preenchimento automático de endereço
  - Upload de documentos com validação de tipo e tamanho
  - Envio de dados via EmailJS

## Seções da Landing Page

1. **Hero** - Apresentação principal
2. **Negociar** - Informações sobre trading de criptomoedas
3. **Pagar Boletos** - Pagamento de boletos com crypto
4. **Sobre** - Missão, visão, valores, história, roadmap

## Tecnologias Utilizadas

- HTML5
- CSS3 (com variáveis CSS e Grid/Flexbox)
- JavaScript (vanilla)
- EmailJS para envio de formulários
- API ViaCEP para consulta de CEP
- SVG/PNG para logo

## Arquivos Importantes

- `index.html` - Página principal com formulário KYC
- `script.js` - Validações e lógica do formulário
- `styles.css` - Estilos e responsividade
- `GUIA_TESTE.md` - Guia completo de testes
- `INSTRUCOES_EMAILJS.md` - Instruções para configurar EmailJS

---

© 2024 Nova Solidum Finances LTDA

