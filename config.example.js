/**
 * ⚠️ ARQUIVO DE EXEMPLO - NÃO USAR EM PRODUÇÃO
 * 
 * Este arquivo mostra como configurar o site de forma segura.
 * 
 * SEGURANÇA:
 * - NUNCA coloque chaves de API, senhas ou tokens no código JavaScript do frontend
 * - Todas as credenciais devem estar no backend (variáveis de ambiente)
 * - URLs de backend são públicas, mas não expõem credenciais
 * 
 * Para usar este arquivo:
 * 1. Copie este arquivo para config.js
 * 2. Preencha com suas configurações
 * 3. Adicione config.js ao .gitignore
 * 4. Importe no script.js: import { BACKEND_CONFIG, TINIFY_CONFIG } from './config.js';
 */

// Configuração do Backend
// SEGURANÇA: URLs do backend são públicas, mas não expõem credenciais
// Todas as chaves de API e senhas estão armazenadas no backend
export const BACKEND_CONFIG = {
    url: 'https://seu-backend.vercel.app/api/email/send' // Substitua pela URL do seu backend
};

// Configuração do Tinify
// SEGURANÇA: A API key do Tinify está armazenada no backend, não no frontend
// O frontend apenas envia requisições para o backend que processa a compressão
export const TINIFY_CONFIG = {
    enabled: true,
    // NOTA: apiKey removida por segurança - a chave está no backend
    apiUrl: 'https://api.tinify.com/shrink', // URL da API (não usada diretamente)
    backendUrl: 'https://seu-backend.vercel.app/api/tinify/compress' // Substitua pela URL do seu backend
};

// Configuração de Contato
// SEGURANÇA: Evite expor emails diretamente no código
// Considere usar um formulário de contato ou exibir apenas na página HTML
export const CONTACT_CONFIG = {
    // Email removido por segurança - configure no backend ou exiba apenas na página
    supportEmail: 'suporte@exemplo.com' // Substitua pelo email de suporte (opcional)
};

