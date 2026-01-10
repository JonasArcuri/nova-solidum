// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        }
    });
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        // Scrolling down
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        // Scrolling up
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.feature-card, .mvv-card, .audience-card, .ecosystem-card, .differentiator-card, .roadmap-phase').forEach(el => {
    observer.observe(el);
});

// Modal functionality
console.log('🔵 Inicializando variáveis do modal...');
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const modalClose = document.querySelector('.modal-close');
const cancelBtn = document.getElementById('cancelBtn');
const formMessage = document.getElementById('formMessage');

console.log('🔵 Verificação de elementos:');
console.log('  - registerModal:', !!registerModal);
console.log('  - registerForm:', !!registerForm);
console.log('  - modalClose:', !!modalClose);
console.log('  - cancelBtn:', !!cancelBtn);
console.log('  - formMessage:', !!formMessage);

// Function to open modal
function openModal() {
    console.log('🟢 openModal() CHAMADA!');
    console.log('🟢 registerModal existe?', !!registerModal);
    
    if (registerModal) {
        console.log('🟢 Adicionando classe "show" ao modal...');
        registerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal aberto! Classes do modal:', registerModal.className);
    } else {
        console.error('❌ ERRO: registerModal não existe!');
        console.error('❌ Tentando encontrar o modal manualmente...');
        const modal = document.getElementById('registerModal');
        console.error('❌ Modal encontrado manualmente?', !!modal);
    }
}

// Function to close modal
function closeModal() {
    if (registerModal) {
        registerModal.classList.remove('show');
        document.body.style.overflow = '';
        registerForm.reset();
        formMessage.classList.remove('show', 'success', 'error', 'loading');
        formMessage.textContent = '';
    }
}

// Button click handlers - open modal
function initModalButtons() {
    console.log('🔵 Iniciando initModalButtons()...');
    
    // Esperar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        const buttons = document.querySelectorAll('.btn-primary');
        console.log(`🔵 Encontrados ${buttons.length} botões com classe .btn-primary`);
        
        if (buttons.length === 0) {
            console.error('❌ NENHUM BOTÃO ENCONTRADO!');
            return;
        }
        
        buttons.forEach((button, index) => {
            console.log(`🔵 Vinculando botão ${index + 1}:`, button.textContent.trim());
            
            button.addEventListener('click', (e) => {
                console.log(`🟢 Botão ${index + 1} CLICADO!`, button.textContent.trim());
                
                // Check if button is not the submit button inside the form and doesn't have the no-modal class
                if (!button.closest('.register-form') && !button.classList.contains('no-modal')) {
                    console.log('🟢 Abrindo modal...');
                    e.preventDefault();
                    e.stopPropagation();
                    openModal();
                } else {
                    console.log('⚠️ Botão ignorado (está dentro do form ou tem classe no-modal)');
                }
            });
        });
        
        console.log('✅ Todos os botões foram vinculados!');
    }, 100);
}

// Initialize button handlers when DOM is ready
console.log('🔵 Script carregado! Estado do documento:', document.readyState);

if (document.readyState === 'loading') {
    console.log('🔵 DOM ainda carregando, aguardando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔵 DOMContentLoaded disparado!');
        initModalButtons();
    });
} else {
    console.log('🔵 DOM já está pronto, inicializando agora...');
    initModalButtons();
}

// Backup: inicializar novamente após tudo carregar
window.addEventListener('load', () => {
    console.log('🔵 Window load completo, verificando botões novamente...');
    const buttons = document.querySelectorAll('.btn-primary');
    if (buttons.length > 0) {
        console.log(`✅ Confirmado: ${buttons.length} botões encontrados após load completo`);
    }
});

// Close modal events
if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
}

// Close modal when clicking outside
if (registerModal) {
    registerModal.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            closeModal();
        }
    });
}

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && registerModal && registerModal.classList.contains('show')) {
        closeModal();
    }
});

// Configuração segura do backend - URLs construídas dinamicamente para evitar exposição direta
const BACKEND_CONFIG = (() => {
    const _p = ['back-end-nova', 'vercel', 'app'];
    const _e = '/api/email/send';
    const _t = '/api/tinify/compress';
    return {
        get url() { return `https://${_p.join('.')}${_e}`; },
        get tinifyUrl() { return `https://${_p.join('.')}${_t}`; }
    };
})();

// Function to show message
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message show ${type}`;
    
    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Função para enviar formulário para o backend
async function sendFormToBackend(formData, accountType, submitBtn) {
    try {
        console.log('📤 ========== INICIANDO ENVIO DO FORMULÁRIO ==========');
        console.log('📤 Tipo de conta:', accountType);
        console.log('📤 Dados do formulário:', formData);
        
        // Validar integridade dos dados antes de enviar
        if (!formData || typeof formData !== 'object') {
            throw new Error('Dados do formulário inválidos');
        }
        
        // Criar FormData para enviar arquivos
        const formDataToSend = new FormData();
        
        // Adicionar honeypot (campo oculto anti-bot)
        const honeypotField = document.getElementById('honeypot');
        if (honeypotField) {
            formDataToSend.append('honeypot', honeypotField.value || '');
            console.log('📤 Honeypot adicionado (anti-bot)');
        }
        
        // Adicionar dados do formulário como JSON
        const formDataJSON = JSON.stringify(formData);
        console.log('📤 Dados JSON (tamanho):', formDataJSON.length, 'bytes');
        formDataToSend.append('formData', formDataJSON);
        
        // Adicionar arquivos
        const fileFields = accountType === 'PF'
            ? ['documentFront', 'documentBack', 'selfie', 'proofOfAddress']
            : ['articlesOfAssociation', 'cnpjCard', 'adminIdFront', 'adminIdBack', 'companyProofOfAddress', 'ecnpjCertificate'];
        
        console.log('📤 Campos de arquivo esperados:', fileFields);
        
        let filesCount = 0;
        for (const fieldId of fileFields) {
            const input = document.getElementById(fieldId);
            if (input && input.files.length > 0) {
                const file = input.files[0];
                console.log(`📤 Arquivo encontrado - ${fieldId}:`, {
                    nome: file.name,
                    tipo: file.type,
                    tamanho: `${(file.size / 1024).toFixed(2)} KB`
                });
                formDataToSend.append(fieldId, file);
                filesCount++;
            } else {
                console.log(`📤 Campo ${fieldId}: Sem arquivo`);
            }
        }
        
        console.log(`📤 Total de arquivos anexados: ${filesCount}`);
        
        // Validar que pelo menos os documentos obrigatórios foram anexados
        const requiredDocs = accountType === 'PF' 
            ? ['documentFront', 'documentBack'] 
            : ['adminIdFront', 'adminIdBack'];
        
        for (const docField of requiredDocs) {
            const input = document.getElementById(docField);
            if (!input || !input.files || input.files.length === 0) {
                throw new Error(`Documento obrigatório faltando: ${docField}`);
            }
        }
        
        // Enviar para o backend
        console.log('📤 Enviando para:', BACKEND_CONFIG.url);
        console.log('📤 Iniciando requisição HTTP POST...');
        
        const response = await fetch(BACKEND_CONFIG.url, {
            method: 'POST',
            body: formDataToSend
        });
        
        console.log('📥 Resposta recebida! Status:', response.status, response.statusText);
        
        if (!response.ok) {
            console.error('❌ Erro na resposta do servidor:', response.status);
            
            let errorData;
            try {
                errorData = await response.json();
                console.error('❌ Detalhes do erro:', errorData);
            } catch (e) {
                console.error('❌ Não foi possível ler o erro do servidor');
                errorData = { error: 'Erro desconhecido', message: `Status ${response.status}` };
            }
            const errorMessage = errorData.message || errorData.error || `Erro ${response.status}`;
            const errorField = errorData.field || '';
            
            
            let userMessage = errorMessage;
            if (errorField) {
                userMessage = `${errorMessage} (Campo: ${errorField})`;
            }
            
            console.error('❌ Mensagem de erro para o usuário:', userMessage);
            showMessage(userMessage, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar';
            return;
        }
        
        const result = await response.json();
        console.log('✅ Resposta do servidor (sucesso):', result);
        console.log('✅ Anexos enviados:', result.attachmentsCount || filesCount);
        
        // Show success message
        showMessage(`Formulário enviado com sucesso! ${result.attachmentsCount || filesCount} anexo(s) enviado(s). Verifique seu email para confirmação. Entraremos em contato em breve.`, 'success');
        console.log('✅ ========== ENVIO CONCLUÍDO COM SUCESSO ==========');
        
        // Reset form after 3 seconds
        setTimeout(() => {
            registerForm.reset();
            closeModal();
        }, 3000);
        
    } catch (error) {
        console.error('❌ ========== ERRO NO ENVIO DO FORMULÁRIO ==========');
        console.error('❌ Tipo de erro:', error.name);
        console.error('❌ Mensagem:', error.message);
        console.error('❌ Stack:', error.stack);
        
        // Log de erro genérico sem expor detalhes sensíveis
        const errorMessage = error.message || 'Erro desconhecido';
        
        // Detectar erro de CORS
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS') || errorMessage.includes('NetworkError')) {
            console.error('❌ Erro de CORS/Rede detectado');
            showMessage('Erro de conexão. Verifique sua conexão com a internet e tente novamente.', 'error');
        } else {
            console.error('❌ Erro genérico no envio');
            showMessage(`Erro ao enviar formulário: ${errorMessage}. Por favor, tente novamente ou entre em contato através do suporte.`, 'error');
        }
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar';
    }
}


// ========== VALIDAÇÕES E UTILITÁRIOS ==========

// Validação de CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // Sequências repetidas
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Validação de CNPJ
function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false; // Sequências repetidas
    
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;
    
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
}

// Validação de idade (>= 18 anos)
function validateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 18;
}

// Validação de arquivo
function validateFile(file, maxSizeMB = 10, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) {
    if (!file) return { valid: false, error: 'Arquivo não selecionado' };
    
    const maxSize = maxSizeMB * 1024 * 1024; // Converter para bytes
    if (file.size > maxSize) {
        return { valid: false, error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB` };
    }
    
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}` };
    }
    
    return { valid: true };
}

// Validação de arquivo para upload (máximo 10MB)
function validateFileForEmail(file, maxSizeKB = 10, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) {
    if (!file) return { valid: false, error: 'Arquivo não selecionado' };
    
    const maxSize = maxSizeKB * 1024; // Converter para bytes
    if (file.size > maxSize) {
        return { valid: false, error: `Arquivo muito grande para envio por email. Máximo: ${maxSizeKB}KB. Tamanho atual: ${(file.size / 1024).toFixed(2)}KB` };
    }
    
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}` };
    }
    
    return { valid: true };
}

// Converter arquivo para base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Configuração do Tinify (opcional - melhor qualidade)
// Gratuito até 500 compressions/mês
const TINIFY_CONFIG = {
    enabled: true,
    get backendUrl() { return BACKEND_CONFIG.tinifyUrl; }
};

// Comprimir imagem usando Tinify (melhor qualidade)
async function compressImageWithTinify(file, maxSizeKB = 15) {
    if (!TINIFY_CONFIG.enabled) {
        throw new Error('Tinify não habilitado');
    }
    
    // Verificar se backend está configurado
    if (!TINIFY_CONFIG.backendUrl) {
        throw new Error('Backend URL não configurada. Configure TINIFY_CONFIG.backendUrl');
    }
    
    // Se não for imagem, não usar Tinify
    if (!file.type.startsWith('image/')) {
        throw new Error('Tinify só funciona com imagens');
    }
    
    // Verificar tamanho do arquivo (Tinify limita a 5MB)
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande para Tinify (máx. 5MB)');
    }
    
    try {
        // Criar FormData para enviar arquivo
        const formData = new FormData();
        formData.append('image', file);
        
        // Fazer requisição para o backend proxy
        const response = await fetch(TINIFY_CONFIG.backendUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            let errorMessage = `Erro ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                // Se não conseguir ler JSON, usar mensagem padrão
            }
            
            if (response.status === 401) {
                throw new Error('Serviço temporariamente indisponível');
            } else if (response.status === 429) {
                throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
            } else if (response.status === 0 || response.status === 500) {
                throw new Error('Serviço temporariamente indisponível');
            }
            
            throw new Error('Erro ao processar imagem');
        }
        
        const result = await response.json();
        
        if (!result.success || !result.base64) {
            throw new Error('Resposta inválida do backend');
        }
        
        const compressedSize = result.compressedSize / 1024;
        const originalSize = result.originalSize / 1024;
        
        // Se ainda estiver acima do limite, redimensionar
        if (compressedSize > maxSizeKB) {
            // Converter base64 para blob e redimensionar
            const base64Data = result.base64.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: result.mimeType });
            return await resizeAndCompressBlob(blob, maxSizeKB);
        }
        
        // Retornar base64 diretamente
        return result.base64;
        
    } catch (error) {
        // Se for erro de network, verificar se backend está rodando
        if (error.message.includes('Failed to fetch') || error.message.includes('Backend não disponível')) {
            throw new Error('BACKEND_ERROR');
        }
        throw error; // Re-throw para usar fallback
    }
}

// Redimensionar e comprimir blob se ainda estiver grande
async function resizeAndCompressBlob(blob, maxSizeKB) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const maxSizeBytes = maxSizeKB * 1024;
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                
                let width = img.width;
                let height = img.height;
                
                // Redimensionar se necessário
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Tentar diferentes qualidades
                    const tryCompress = (quality) => {
                        const base64 = canvas.toDataURL('image/jpeg', quality);
                        const base64Size = new Blob([base64]).size;
                        
                        if (base64Size <= maxSizeBytes || quality <= 0.15) {
                            resolve(base64);
                        } else {
                            tryCompress(Math.max(0.15, quality - 0.05)); // Redução gradual, mínimo 15%
                        }
                    };
                    
                    tryCompress(0.8); // Qualidade inicial boa
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Converter Blob para base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Comprimir imagem usando Tinify (melhor qualidade)
async function compressImage(file, maxSizeKB = 15) {
    // Tentar Tinify primeiro se estiver habilitado
    if (TINIFY_CONFIG.enabled && TINIFY_CONFIG.backendUrl) {
        try {
            const compressed = await compressImageWithTinify(file, maxSizeKB);
            return compressed;
        } catch (error) {
            // Se for erro de backend, usar método local silenciosamente
            // Continuar com método local
        }
    }
    
    // Método local (fallback ou se Tinify não estiver habilitado)
    return new Promise((resolve, reject) => {
        // Se não for imagem, retornar original
        if (!file.type.startsWith('image/')) {
            fileToBase64(file).then(resolve).catch(reject);
            return;
        }
        
        const maxSizeBytes = maxSizeKB * 1024;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Calcular dimensões máximas (mantendo proporção)
                // Otimizado para permitir múltiplas imagens (15KB permite boa qualidade em tamanho moderado)
                const MAX_WIDTH = 1400;
                const MAX_HEIGHT = 1400;
                
                let width = img.width;
                let height = img.height;
                
                // Redimensionar se necessário
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                
                // Criar canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                // Desenhar imagem redimensionada
                ctx.drawImage(img, 0, 0, width, height);
                
                // Tentar diferentes qualidades até ficar abaixo do limite
                const tryCompress = (quality, attempt = 0) => {
                    // Determinar formato de saída - sempre JPEG para melhor compressão
                    let outputFormat = 'image/jpeg';
                    
                    // Se for PNG, converter para JPEG
                    if (file.type === 'image/png') {
                        outputFormat = 'image/jpeg';
                    }
                    
                    // Converter para base64
                    const base64 = canvas.toDataURL(outputFormat, quality);
                    const base64Size = new Blob([base64]).size; // Tamanho total da string base64
                    
                    if (base64Size <= maxSizeBytes || quality <= 0.15 || attempt >= 25) {
                        // Tamanho OK, qualidade mínima (15% para manter legibilidade), ou muitas tentativas
                        resolve(base64);
                    } else {
                        // Ainda muito grande, reduzir qualidade gradualmente
                        // Reduzir mais rápido se estiver muito acima do limite
                        let qualityStep = 0.05; // Passos menores para melhor controle
                        if (base64Size > maxSizeBytes * 1.5) {
                            qualityStep = 0.1; // Reduzir mais rápido se muito grande
                        }
                        const newQuality = Math.max(0.15, quality - qualityStep); // Mínimo 15% para legibilidade
                        tryCompress(newQuality, attempt + 1);
                    }
                };
                
                // Começar com qualidade 0.8 (80%) - bom equilíbrio entre qualidade e tamanho
                tryCompress(0.8);
            };
            
            img.onerror = () => {
                // Se falhar ao carregar imagem, tentar método original
                fileToBase64(file).then(resolve).catch(reject);
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Buscar CEP via ViaCEP
async function fetchCEP(cep) {
    cep = cep.replace(/[^\d]/g, '');
    if (cep.length !== 8) return null;
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) return null;
        return data;
    } catch (error) {
        // Erro silencioso - não expor detalhes
        return null;
    }
}

// Formatação de CPF
function formatCPF(value) {
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
}

// Formatação de CNPJ
function formatCNPJ(value) {
    value = value.replace(/\D/g, '');
    if (value.length <= 14) {
        value = value.replace(/(\d{2})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1/$2');
        value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    return value;
}

// Formatação de CEP
function formatCEP(value) {
    value = value.replace(/\D/g, '');
    if (value.length <= 8) {
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
}

// Formatação de telefone E.164
function formatPhoneE164(value) {
    value = value.replace(/\D/g, '');
    if (value.startsWith('55')) {
        return '+' + value;
    } else if (value.length === 11 && value.startsWith('0')) {
        return '+55' + value.substring(1);
    } else if (value.length === 10 || value.length === 11) {
        return '+55' + value;
    }
    return value;
}

// ========== HANDLERS DO FORMULÁRIO ==========

// Toggle entre PF e PJ
const accountTypeRadios = document.querySelectorAll('input[name="accountType"]');
const pfForm = document.getElementById('pfForm');
const pjForm = document.getElementById('pjForm');

// Função para atualizar campos required baseado no tipo selecionado
function updateRequiredFields() {
    const selectedType = document.querySelector('input[name="accountType"]:checked')?.value || 'PF';
    
    // Lista de IDs de campos de endereço OPCIONAIS (complemento)
    const optionalAddressFields = [
        'complement', 'foreignComplement', 'foreignDistrict', 'foreignCountry',
        'pjComplement'
    ];
    
    // Lista de IDs de campos de endereço OBRIGATÓRIOS
    const requiredAddressFieldsPF = {
        brazil: ['cep', 'street', 'number', 'district', 'city', 'state'],
        foreign: ['foreignStreet', 'foreignNumber', 'foreignCity', 'foreignState', 'foreignZipCode']
    };
    
    const requiredAddressFieldsPJ = ['pjCep', 'pjStreet', 'pjNumber', 'pjDistrict', 'pjCity', 'pjState'];
    
    if (selectedType === 'PF') {
        pfForm.style.display = 'block';
        pjForm.style.display = 'none';
        // Remover required dos campos PJ (exceto documentos que não devem ser removidos)
        pjForm.querySelectorAll('[required]').forEach(field => {
            // Não remover required de campos de documento se já estiverem marcados como obrigatórios
            if (field.id !== 'adminIdFront' && field.id !== 'adminIdBack') {
                field.removeAttribute('required');
            }
        });
        // Garantir que campos PF tenham required (se necessário)
        pfForm.querySelectorAll('input[data-pf-required], textarea[data-pf-required], select[data-pf-required]').forEach(field => {
            if (!optionalAddressFields.includes(field.id)) {
                field.setAttribute('required', 'required');
            }
        });
        // Garantir que documentos PF tenham required
        const documentFrontPF = document.getElementById('documentFront');
        if (documentFrontPF) {
            documentFrontPF.setAttribute('required', 'required');
        }
        const documentBackPF = document.getElementById('documentBack');
        if (documentBackPF) {
            documentBackPF.setAttribute('required', 'required');
        }
        // Garantir que campos de endereço obrigatórios tenham required
        const isForeigner = document.getElementById('isForeigner')?.checked || false;
        const requiredFields = isForeigner ? requiredAddressFieldsPF.foreign : requiredAddressFieldsPF.brazil;
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.setAttribute('required', 'required');
            }
        });
    } else {
        pfForm.style.display = 'none';
        pjForm.style.display = 'block';
        // Remover required dos campos PF (exceto documentos que não devem ser removidos)
        pfForm.querySelectorAll('[required]').forEach(field => {
            // Não remover required de campos de documento se já estiverem marcados como obrigatórios
            if (field.id !== 'documentFront' && field.id !== 'documentBack') {
                field.removeAttribute('required');
            }
        });
        // Garantir que campos PJ tenham required (se necessário)
        pjForm.querySelectorAll('input[data-pj-required], textarea[data-pj-required], select[data-pj-required]').forEach(field => {
            if (!optionalAddressFields.includes(field.id)) {
                field.setAttribute('required', 'required');
            }
        });
        // Garantir que documentos PJ tenham required
        const adminIdFrontPJ = document.getElementById('adminIdFront');
        if (adminIdFrontPJ) {
            adminIdFrontPJ.setAttribute('required', 'required');
        }
        const adminIdBackPJ = document.getElementById('adminIdBack');
        if (adminIdBackPJ) {
            adminIdBackPJ.setAttribute('required', 'required');
        }
        // Garantir que campos de endereço PJ obrigatórios tenham required
        requiredAddressFieldsPJ.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.setAttribute('required', 'required');
            }
        });
    }
}

if (accountTypeRadios.length > 0) {
    // Função para inicializar quando DOM estiver pronto
    function initFormFields() {
        updateRequiredFields();
    }
    
    // Inicializar campos required na carga da página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormFields);
    } else {
        initFormFields();
    }
    
    // Atualizar quando o tipo mudar
    accountTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateRequiredFields();
        });
    });
}

// PEP Status toggle
const pepStatusCheckbox = document.getElementById('pepStatus');
const pepDetailsGroup = document.getElementById('pepDetailsGroup');
const pepPositionInput = document.getElementById('pepPosition');

if (pepStatusCheckbox) {
    pepStatusCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            pepDetailsGroup.style.display = 'block';
        } else {
            pepDetailsGroup.style.display = 'none';
            pepPositionInput.value = '';
        }
    });
}

// Máscaras de input
const cpfInput = document.getElementById('cpf');
if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
        e.target.value = formatCPF(e.target.value);
    });
}

const cnpjInput = document.getElementById('cnpj');
if (cnpjInput) {
    cnpjInput.addEventListener('input', (e) => {
        e.target.value = formatCNPJ(e.target.value);
    });
}

const cepInput = document.getElementById('cep');
if (cepInput) {
    cepInput.addEventListener('input', (e) => {
        // Só buscar CEP se não for estrangeiro
        const isForeigner = document.getElementById('isForeigner')?.checked || false;
        if (isForeigner) return;
        
        e.target.value = formatCEP(e.target.value);
        if (e.target.value.replace(/\D/g, '').length === 8) {
            fetchCEP(e.target.value).then(data => {
                if (data) {
                    const streetInput = document.getElementById('street');
                    const districtInput = document.getElementById('district');
                    const cityInput = document.getElementById('city');
                    const stateInput = document.getElementById('state');
                    
                    if (streetInput) streetInput.value = data.logradouro || '';
                    if (districtInput) districtInput.value = data.bairro || '';
                    if (cityInput) cityInput.value = data.localidade || '';
                    if (stateInput) stateInput.value = data.uf || '';
                }
            });
        }
    });
}

const pjCepInput = document.getElementById('pjCep');
if (pjCepInput) {
    pjCepInput.addEventListener('input', (e) => {
        e.target.value = formatCEP(e.target.value);
        if (e.target.value.replace(/\D/g, '').length === 8) {
            fetchCEP(e.target.value).then(data => {
                if (data) {
                    document.getElementById('pjStreet').value = data.logradouro || '';
                    document.getElementById('pjDistrict').value = data.bairro || '';
                    document.getElementById('pjCity').value = data.localidade || '';
                    document.getElementById('pjState').value = data.uf || '';
                }
            });
        }
    });
}

const majorityAdminCpfInput = document.getElementById('majorityAdminCpf');
if (majorityAdminCpfInput) {
    majorityAdminCpfInput.addEventListener('input', (e) => {
        e.target.value = formatCPF(e.target.value);
    });
}

// Validação de telefone E.164
const phoneInputs = document.querySelectorAll('input[type="tel"][pattern]');
phoneInputs.forEach(input => {
    input.addEventListener('blur', (e) => {
        const formatted = formatPhoneE164(e.target.value);
        if (formatted.startsWith('+55') && formatted.length >= 13) {
            e.target.value = formatted;
        }
    });
});

// Validação de data de nascimento
const birthDateInput = document.getElementById('birthDate');
if (birthDateInput) {
    birthDateInput.addEventListener('change', (e) => {
        if (!validateAge(e.target.value)) {
            e.target.setCustomValidity('Você deve ter pelo menos 18 anos');
            e.target.reportValidity();
        } else {
            e.target.setCustomValidity('');
        }
    });
}

// Validação de CPF
if (cpfInput) {
    cpfInput.addEventListener('blur', (e) => {
        const isForeigner = document.getElementById('isForeigner')?.checked || false;
        const cpf = e.target.value.replace(/\D/g, '');
        
        // CPF agora é obrigatório para todos
        if (!cpf) {
            e.target.setCustomValidity('CPF é obrigatório');
            e.target.reportValidity();
        } else if (cpf.length === 11 && !validateCPF(cpf)) {
            e.target.setCustomValidity('CPF inválido');
            e.target.reportValidity();
        } else {
            e.target.setCustomValidity('');
        }
    });
}

// Toggle CPF e Endereço baseado em estrangeiro
const isForeignerCheckbox = document.getElementById('isForeigner');
const cpfRequiredLabel = document.getElementById('cpfRequired');
const cpfHint = document.getElementById('cpfHint');
const addressBrazil = document.getElementById('addressBrazil');
const addressForeign = document.getElementById('addressForeign');

// Campos de endereço brasileiro
const brazilAddressFields = {
    cep: { input: document.getElementById('cep'), label: document.getElementById('cepRequired') },
    street: { input: document.getElementById('street'), label: document.getElementById('streetRequired') },
    number: { input: document.getElementById('number'), label: document.getElementById('numberRequired') },
    district: { input: document.getElementById('district'), label: document.getElementById('districtRequired') },
    city: { input: document.getElementById('city'), label: document.getElementById('cityRequired') },
    state: { input: document.getElementById('state'), label: document.getElementById('stateRequired') }
};

// Campos de endereço estrangeiro
const foreignAddressFields = {
    foreignStreet: document.getElementById('foreignStreet'),
    foreignNumber: document.getElementById('foreignNumber'),
    foreignComplement: document.getElementById('foreignComplement'),
    foreignDistrict: document.getElementById('foreignDistrict'),
    foreignCity: document.getElementById('foreignCity'),
    foreignState: document.getElementById('foreignState'),
    foreignZipCode: document.getElementById('foreignZipCode'),
    foreignCountry: document.getElementById('foreignCountry')
};

if (isForeignerCheckbox) {
    function updateForeignerFields() {
        const isForeigner = isForeignerCheckbox.checked;
        
        // Atualizar CPF - Sempre obrigatório agora
        if (cpfInput) {
            cpfInput.setAttribute('required', 'required');
            if (cpfRequiredLabel) cpfRequiredLabel.style.display = 'inline';
            if (cpfHint) cpfHint.textContent = 'Obrigatório';
        }
        
        // Atualizar campos de endereço (CEP e endereço são obrigatórios)
        if (addressBrazil && addressForeign) {
            if (isForeigner) {
                // Mostrar endereço estrangeiro, ocultar brasileiro
                addressBrazil.style.display = 'none';
                addressForeign.style.display = 'block';
                
                // Remover required dos campos brasileiros e limpar valores
                Object.values(brazilAddressFields).forEach(field => {
                    if (field.input) {
                        field.input.removeAttribute('required');
                        field.input.value = ''; // Limpar valores
                    }
                    if (field.label) field.label.style.display = 'none';
                });
                
                // Garantir que campos estrangeiros obrigatórios tenham required
                const requiredForeignFields = ['foreignStreet', 'foreignNumber', 'foreignCity', 'foreignState', 'foreignZipCode'];
                requiredForeignFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.setAttribute('required', 'required');
                    }
                });
            } else {
                // Mostrar endereço brasileiro, ocultar estrangeiro
                addressBrazil.style.display = 'block';
                addressForeign.style.display = 'none';
                
                // Garantir que campos brasileiros obrigatórios tenham required
                const requiredBrazilFields = ['cep', 'street', 'number', 'district', 'city', 'state'];
                requiredBrazilFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.setAttribute('required', 'required');
                    }
                });
                
                // Remover required dos campos estrangeiros e limpar
                Object.values(foreignAddressFields).forEach(field => {
                    if (field) {
                        field.removeAttribute('required');
                        field.value = ''; // Limpar valores
                    }
                });
            }
        }
    }
    
    isForeignerCheckbox.addEventListener('change', updateForeignerFields);
    // Inicializar estado
    updateForeignerFields();
}

// Validação de CNPJ
if (cnpjInput) {
    cnpjInput.addEventListener('blur', (e) => {
        const cnpj = e.target.value.replace(/\D/g, '');
        if (cnpj.length === 14 && !validateCNPJ(cnpj)) {
            e.target.setCustomValidity('CNPJ inválido');
            e.target.reportValidity();
        } else {
            e.target.setCustomValidity('');
        }
    });
}

// Validação de arquivos (tamanho máximo 10MB para upload)
const fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            let allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (input.id === 'ecnpjCertificate') {
                allowedTypes = ['.pfx'];
            }
            
            // Validação de tamanho máximo (10MB para upload)
            const validation = validateFile(file, 10, allowedTypes);
            if (!validation.valid) {
                e.target.setCustomValidity(validation.error);
                e.target.reportValidity();
                e.target.value = '';
                return;
            }
            
            // Aviso se arquivo > 10MB (não será enviado por email)
            const MAX_EMAIL_SIZE = 10 * 1024 * 1024; // 10MB
            if (file.size > MAX_EMAIL_SIZE) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                const warning = `⚠️ Arquivo muito grande (${sizeMB} MB). Máximo permitido: 10 MB.`;
                // Mostrar aviso visual
                const hint = input.parentElement.querySelector('.file-size-warning');
                if (hint) {
                    hint.textContent = warning;
                    hint.style.display = 'block';
                    hint.style.color = '#dc2626';
                }
            } else {
                // Remover aviso se arquivo está dentro do limite
                const hint = input.parentElement.querySelector('.file-size-warning');
                if (hint) {
                    hint.style.display = 'none';
                }
            }
            
            e.target.setCustomValidity('');
        }
    });
});

// Form submission handler
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Garantir que campos ocultos não tenham required antes de validar
        updateRequiredFields();
        
        const accountType = document.querySelector('input[name="accountType"]:checked').value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        
        // Validações específicas
        if (accountType === 'PF') {
            const isForeigner = document.getElementById('isForeigner').checked;
            const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
            
            // CPF é obrigatório apenas para brasileiros
            if (!isForeigner) {
                if (!cpf || cpf.length !== 11) {
                    showMessage('CPF é obrigatório para brasileiros. Por favor, informe o CPF.', 'error');
                    return;
                }
                if (!validateCPF(cpf)) {
                    showMessage('CPF inválido. Por favor, verifique o número.', 'error');
                    return;
                }
            } else if (cpf && cpf.length === 11) {
                // Se estrangeiro preencheu CPF, validar mesmo assim
                if (!validateCPF(cpf)) {
                    showMessage('CPF inválido. Por favor, verifique o número ou deixe em branco se não tiver CPF.', 'error');
                    return;
                }
            }
            
            const birthDate = document.getElementById('birthDate').value;
            if (!validateAge(birthDate)) {
                showMessage('Você deve ter pelo menos 18 anos para se cadastrar.', 'error');
                return;
            }
            
            // Validação de PEP removida - campo opcional
            
            // Validar endereço PF (usar variável isForeigner já declarada acima)
            if (isForeigner) {
                // Validar endereço estrangeiro
                const foreignZipCode = document.getElementById('foreignZipCode')?.value.trim() || '';
                const foreignStreet = document.getElementById('foreignStreet')?.value.trim() || '';
                const foreignNumber = document.getElementById('foreignNumber')?.value.trim() || '';
                const foreignCity = document.getElementById('foreignCity')?.value.trim() || '';
                const foreignState = document.getElementById('foreignState')?.value.trim() || '';
                
                // ⚠️ VALIDAÇÃO OBRIGATÓRIA DE CEP ESTRANGEIRO
                if (!foreignZipCode) {
                    showMessage('CEP/Código Postal é obrigatório. Por favor, preencha o CEP.', 'error');
                    document.getElementById('foreignZipCode')?.focus();
                    return;
                }
                
                if (!foreignStreet || !foreignNumber || !foreignCity || !foreignState) {
                    showMessage('Por favor, preencha todos os campos obrigatórios do endereço (CEP/Código Postal, Logradouro, Número, Cidade e Estado/Província).', 'error');
                    return;
                }
            } else {
                // Validar endereço brasileiro
                const cep = document.getElementById('cep')?.value.trim() || '';
                const street = document.getElementById('street')?.value.trim() || '';
                const number = document.getElementById('number')?.value.trim() || '';
                const district = document.getElementById('district')?.value.trim() || '';
                const city = document.getElementById('city')?.value.trim() || '';
                const state = document.getElementById('state')?.value.trim() || '';
                
                // ⚠️ VALIDAÇÃO OBRIGATÓRIA DE CEP BRASILEIRO
                if (!cep) {
                    showMessage('CEP é obrigatório. Por favor, preencha o CEP.', 'error');
                    document.getElementById('cep')?.focus();
                    return;
                }
                
                if (!street || !number || !district || !city || !state) {
                    showMessage('Por favor, preencha todos os campos obrigatórios do endereço (CEP, Logradouro, Número, Bairro, Cidade e UF).', 'error');
                    return;
                }
            }
        } else {
            const cnpj = document.getElementById('cnpj').value.replace(/\D/g, '');
            if (!validateCNPJ(cnpj)) {
                showMessage('CNPJ inválido. Por favor, verifique o número.', 'error');
                return;
            }
            
            const adminCpf = document.getElementById('majorityAdminCpf').value.replace(/\D/g, '');
            if (!validateCPF(adminCpf)) {
                showMessage('CPF do administrador inválido. Por favor, verifique o número.', 'error');
                return;
            }
            
            // Validar endereço PJ
            const pjCep = document.getElementById('pjCep')?.value.trim() || '';
            const pjStreet = document.getElementById('pjStreet')?.value.trim() || '';
            const pjNumber = document.getElementById('pjNumber')?.value.trim() || '';
            const pjDistrict = document.getElementById('pjDistrict')?.value.trim() || '';
            const pjCity = document.getElementById('pjCity')?.value.trim() || '';
            const pjState = document.getElementById('pjState')?.value.trim() || '';
            
            // ⚠️ VALIDAÇÃO OBRIGATÓRIA DE CEP PJ
            if (!pjCep) {
                showMessage('CEP é obrigatório. Por favor, preencha o CEP da empresa.', 'error');
                document.getElementById('pjCep')?.focus();
                return;
            }
            
            if (!pjStreet || !pjNumber || !pjDistrict || !pjCity || !pjState) {
                showMessage('Por favor, preencha todos os campos obrigatórios do endereço (CEP, Logradouro, Número, Bairro, Cidade e UF).', 'error');
                return;
            }
        }
        
        // Validação de documento obrigatório
        if (accountType === 'PF') {
            const documentFront = document.getElementById('documentFront');
            if (!documentFront || !documentFront.files || documentFront.files.length === 0) {
                showMessage('Por favor, envie a foto do documento (RG/CNH - Frente). Este campo é obrigatório.', 'error');
                documentFront?.focus();
                return;
            }
            
            const documentBack = document.getElementById('documentBack');
            if (!documentBack || !documentBack.files || documentBack.files.length === 0) {
                showMessage('Por favor, envie a foto do documento (RG/CNH - Verso). Este campo é obrigatório.', 'error');
                documentBack?.focus();
                return;
            }
        } else {
            const adminIdFront = document.getElementById('adminIdFront');
            if (!adminIdFront || !adminIdFront.files || adminIdFront.files.length === 0) {
                showMessage('Por favor, envie a foto do documento do administrador (RG/CNH - Frente). Este campo é obrigatório.', 'error');
                adminIdFront?.focus();
                return;
            }
            
            const adminIdBack = document.getElementById('adminIdBack');
            if (!adminIdBack || !adminIdBack.files || adminIdBack.files.length === 0) {
                showMessage('Por favor, envie a foto do documento do administrador (RG/CNH - Verso). Este campo é obrigatório.', 'error');
                adminIdBack?.focus();
                return;
            }
        }
        
        // Show loading message
        showMessage('Enviando formulário...', 'loading');
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        try {
            console.log('📋 ========== COLETANDO DADOS DO FORMULÁRIO ==========');
            
            // Coletar dados do formulário
            let formData = {
                accountType: accountType
            };
            
            if (accountType === 'PF') {
                console.log('📋 Coletando dados de PESSOA FÍSICA...');
                
                const isForeigner = document.getElementById('isForeigner').checked;
                console.log('📋 É estrangeiro?', isForeigner);
                
                // Coletar endereço baseado em estrangeiro ou não
                let address = {};
                if (isForeigner) {
                    // Endereço estrangeiro
                    address = {
                        street: document.getElementById('foreignStreet')?.value || '',
                        number: document.getElementById('foreignNumber')?.value || '',
                        complement: document.getElementById('foreignComplement')?.value || '',
                        district: document.getElementById('foreignDistrict')?.value || '',
                        city: document.getElementById('foreignCity')?.value || '',
                        state: document.getElementById('foreignState')?.value || '',
                        zipCode: document.getElementById('foreignZipCode')?.value || '',
                        country: document.getElementById('foreignCountry')?.value || '',
                        isForeign: true
                    };
                    console.log('📋 Endereço estrangeiro coletado:', address);
                } else {
                    // Endereço brasileiro
                    address = {
                        cep: document.getElementById('cep')?.value || '',
                        street: document.getElementById('street')?.value || '',
                        number: document.getElementById('number')?.value || '',
                        complement: document.getElementById('complement')?.value || '',
                        district: document.getElementById('district')?.value || '',
                        city: document.getElementById('city')?.value || '',
                        state: document.getElementById('state')?.value || '',
                        isForeign: false
                    };
                    console.log('📋 Endereço brasileiro coletado:', address);
                }
                
                formData = {
                    ...formData,
                    fullName: document.getElementById('fullName').value,
                    cpf: document.getElementById('cpf').value,
                    rg: document.getElementById('rg').value || '',
                    cnh: document.getElementById('cnh').value || '',
                    birthDate: document.getElementById('birthDate').value,
                    isForeigner: isForeigner,
                    email: document.getElementById('userEmail').value,
                    phone: document.getElementById('userPhone').value,
                    pepStatus: document.getElementById('pepStatus').checked,
                    pepPosition: document.getElementById('pepPosition').value || '',
                    address: address
                };
                
                console.log('📋 Dados PF coletados:', {
                    fullName: formData.fullName,
                    cpf: formData.cpf ? '***' + formData.cpf.slice(-3) : 'vazio',
                    email: formData.email,
                    phone: formData.phone,
                    birthDate: formData.birthDate,
                    pepStatus: formData.pepStatus,
                    endereco: {
                        cep: isForeigner ? formData.address.zipCode : formData.address.cep,
                        cidade: formData.address.city,
                        estado: formData.address.state
                    }
                });
            } else {
                console.log('📋 Coletando dados de PESSOA JURÍDICA...');
                
                formData = {
                    ...formData,
                    companyName: document.getElementById('companyName').value,
                    tradeName: document.getElementById('tradeName').value,
                    cnpj: document.getElementById('cnpj').value,
                    foundationDate: document.getElementById('foundationDate').value,
                    mainCNAE: document.getElementById('mainCNAE').value,
                    companyEmail: document.getElementById('companyEmail').value,
                    companyPhone: document.getElementById('companyPhone').value,
                    legalNature: document.getElementById('legalNature').value || '',
                    address: {
                        cep: document.getElementById('pjCep').value,
                        street: document.getElementById('pjStreet').value,
                        number: document.getElementById('pjNumber').value,
                        complement: document.getElementById('pjComplement').value || '',
                        district: document.getElementById('pjDistrict').value,
                        city: document.getElementById('pjCity').value,
                        state: document.getElementById('pjState').value
                    },
                    majorityAdmin: {
                        name: document.getElementById('majorityAdminName').value,
                        cpf: document.getElementById('majorityAdminCpf').value,
                        email: document.getElementById('majorityAdminEmail').value,
                        phone: document.getElementById('majorityAdminPhone').value
                    }
                };
                
                console.log('📋 Dados PJ coletados:', {
                    companyName: formData.companyName,
                    tradeName: formData.tradeName,
                    cnpj: formData.cnpj ? '***' + formData.cnpj.slice(-4) : 'vazio',
                    email: formData.companyEmail,
                    phone: formData.companyPhone,
                    adminName: formData.majorityAdmin.name,
                    endereco: {
                        cep: formData.address.cep,
                        cidade: formData.address.city,
                        estado: formData.address.state
                    }
                });
            }
            
            console.log('✅ Coleta de dados completa! Enviando para backend...');
            
            // Enviar formulário para o backend (Tudo em uma etapa)
            await sendFormToBackend(formData, accountType, submitBtn);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar';
        }
    });
}

// Crypto Price API Integration
// Coin mapping for different APIs
const coinMapping = {
    'bitcoin': { coingecko: 'bitcoin', binance: 'BTCUSDT', price: 1.0 },
    'ethereum': { coingecko: 'ethereum', binance: 'ETHUSDT', price: 1.0 },
    'solana': { coingecko: 'solana', binance: 'SOLUSDT', price: 1.0 },
    'binancecoin': { coingecko: 'binancecoin', binance: 'BNBUSDT', price: 1.0 },
    'tether': { coingecko: 'tether', binance: null, price: 1.0 }, // USDT is stablecoin
    'usd-coin': { coingecko: 'usd-coin', binance: 'USDCUSDT', price: 1.0 }
};

// Function to update UI with price data
function updateCryptoItem(item, price, change) {
    const priceElement = item.querySelector('.price-amount');
    const changeElement = item.querySelector('.change-percent');
    
    if (priceElement && price !== null) {
        if (price > 1) {
            priceElement.textContent = `$${price.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}`;
        } else {
            priceElement.textContent = `$${price.toLocaleString('en-US', { 
                minimumFractionDigits: 4, 
                maximumFractionDigits: 6 
            })}`;
        }
    }
    
    if (changeElement && change !== null) {
        const changeValue = parseFloat(change);
        const sign = changeValue >= 0 ? '+' : '';
        changeElement.textContent = `${sign}${changeValue.toFixed(2)}%`;
        
        // Update class based on change
        changeElement.classList.remove('positive', 'negative', 'neutral');
        if (changeValue > 0) {
            changeElement.classList.add('positive');
        } else if (changeValue < 0) {
            changeElement.classList.add('negative');
        } else {
            changeElement.classList.add('neutral');
        }
    }
}

// Fetch prices from CoinGecko API
async function fetchCryptoPricesFromCoinGecko() {
    const cryptoItems = document.querySelectorAll('.crypto-item[data-coin-id]');
    
    if (cryptoItems.length === 0) return false;
    
    const coinIds = Array.from(cryptoItems)
        .map(item => item.getAttribute('data-coin-id'))
        .filter((value, index, self) => self.indexOf(value) === index);
    
    if (coinIds.length === 0) return false;
    
    try {
        const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || Object.keys(data).length === 0) {
            return false;
        }
        
        // Update all crypto items
        cryptoItems.forEach(item => {
            const coinId = item.getAttribute('data-coin-id');
            const coinData = data[coinId];
            
            if (coinData && coinData.usd !== undefined) {
                updateCryptoItem(item, coinData.usd, coinData.usd_24h_change);
            }
        });
        
        return true;
    } catch (error) {
        // Erro silencioso
        return false;
    }
}

// Fetch prices from Binance API (alternative)
async function fetchCryptoPricesFromBinance() {
    const cryptoItems = document.querySelectorAll('.crypto-item[data-coin-id]');
    
    if (cryptoItems.length === 0) return false;
    
    try {
        const promises = Array.from(cryptoItems).map(async (item) => {
            const coinId = item.getAttribute('data-coin-id');
            const mapping = coinMapping[coinId];
            
            if (!mapping) return null;
            
            // Handle stablecoins (USDT)
            if (coinId === 'tether') {
                // USDT is pegged to USD, so price is ~1.00
                return { item, price: 1.00, change: 0.00 };
            }
            
            if (!mapping.binance) return null;
            
            try {
                const symbol = mapping.binance;
                const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
                
                if (!response.ok) return null;
                
                const data = await response.json();
                
                if (data && data.lastPrice) {
                    const price = parseFloat(data.lastPrice);
                    const change = parseFloat(data.priceChangePercent);
                    
                    return { item, price, change };
                }
            } catch (error) {
                // Erro silencioso
            }
            
            return null;
        });
        
        const results = await Promise.all(promises);
        
        let updated = false;
        results.forEach(result => {
            if (result) {
                updateCryptoItem(result.item, result.price, result.change);
                updated = true;
            }
        });
        
        return updated;
    } catch (error) {
        // Erro silencioso
        return false;
    }
}

// Main function to fetch crypto prices
async function fetchCryptoPrices() {
    const cryptoItems = document.querySelectorAll('.crypto-item[data-coin-id]');
    
    if (cryptoItems.length === 0) {
        return;
    }
    
    // Try CoinGecko first
    let success = await fetchCryptoPricesFromCoinGecko();
    
    // If CoinGecko fails, try Binance
    if (!success) {
        success = await fetchCryptoPricesFromBinance();
    }
    
    if (!success) {
        // Show error in UI
        cryptoItems.forEach(item => {
            const priceElement = item.querySelector('.price-amount');
            if (priceElement && priceElement.textContent === '--') {
                priceElement.textContent = 'Erro';
            }
        });
    }
}

// Function to initialize crypto prices
function initCryptoPrices() {
    // Wait a bit to ensure DOM is ready
    setTimeout(() => {
        fetchCryptoPrices();
    }, 500);
}

// Fetch prices on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCryptoPrices);
} else {
    initCryptoPrices();
}

// Update prices every 30 seconds
setInterval(fetchCryptoPrices, 30000);

// Add CSS for fade-in animation
const style = document.createElement('style');
style.textContent = `
    .feature-card,
    .mvv-card,
    .audience-card,
    .ecosystem-card,
    .differentiator-card,
    .roadmap-phase {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .fade-in-visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        gap: 1rem;
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(8px, 8px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -7px);
    }
    
    .header.scroll-down {
        transform: translateY(-100%);
    }
    
    .header.scroll-up {
        transform: translateY(0);
    }
    
    .header {
        transition: transform 0.3s ease-in-out;
    }
`;
document.head.appendChild(style);

