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
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const modalClose = document.querySelector('.modal-close');
const cancelBtn = document.getElementById('cancelBtn');
const formMessage = document.getElementById('formMessage');

// Function to open modal
function openModal() {
    if (registerModal) {
        registerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
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
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', (e) => {
        // Check if button is not the submit button inside the form
        if (!button.closest('.register-form')) {
            e.preventDefault();
            openModal();
        }
    });
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

// EmailJS Configuration
// 1. Acesse https://www.emailjs.com/ e crie uma conta (gratuito até 200 emails/mês)
// 2. Configure um serviço de email (Gmail, Outlook, etc.)
// 3. Crie DOIS templates de email:
//    - Template 1: Para a empresa (novasolidum@gmail.com) com variáveis: {{user_name}}, {{user_email}}, {{user_phone}}, {{transaction_objective}}
//    - Template 2: Confirmação para o usuário com variáveis: {{user_name}}
// 4. Copie os Template IDs e cole abaixo
// 5. Copie o Service ID e Public Key e cole abaixo

const EMAILJS_CONFIG = {
    serviceID: 'service_pwkak2r',           // Cole aqui o Service ID
    templateIDCompany: 'template_5pxvv6e',  // Cole aqui o Template ID para a empresa
    templateIDUser: 'template_khtoh8k', // Cole aqui o Template ID para confirmação do usuário
    publicKey: 'Caq5-K4DTuFAhXvkQ'          // Cole aqui a Public Key
};

// Initialize EmailJS when available
function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        try {
            emailjs.init(EMAILJS_CONFIG.publicKey);
        } catch (error) {
            console.error('EmailJS initialization error:', error);
        }
    }
}

// Wait for EmailJS to load
if (typeof emailjs === 'undefined') {
    window.addEventListener('load', initEmailJS);
} else {
    initEmailJS();
}

// Function to show message
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message show ${type}`;
    
    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

// Validação de arquivo para email (máximo 10KB)
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
        console.error('Erro ao buscar CEP:', error);
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
    
    if (selectedType === 'PF') {
        pfForm.style.display = 'block';
        pjForm.style.display = 'none';
        // Remover required dos campos PJ
        pjForm.querySelectorAll('[required]').forEach(field => {
            field.removeAttribute('required');
        });
        // Garantir que campos PF tenham required (se necessário)
        pfForm.querySelectorAll('input[data-pf-required], textarea[data-pf-required], select[data-pf-required]').forEach(field => {
            field.setAttribute('required', 'required');
        });
    } else {
        pfForm.style.display = 'none';
        pjForm.style.display = 'block';
        // Remover required dos campos PF
        pfForm.querySelectorAll('[required]').forEach(field => {
            field.removeAttribute('required');
        });
        // Garantir que campos PJ tenham required (se necessário)
        pjForm.querySelectorAll('input[data-pj-required], textarea[data-pj-required], select[data-pj-required]').forEach(field => {
            field.setAttribute('required', 'required');
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
            pepPositionInput.setAttribute('required', 'required');
        } else {
            pepDetailsGroup.style.display = 'none';
            pepPositionInput.removeAttribute('required');
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
        e.target.value = formatCEP(e.target.value);
        if (e.target.value.replace(/\D/g, '').length === 8) {
            fetchCEP(e.target.value).then(data => {
                if (data) {
                    document.getElementById('street').value = data.logradouro || '';
                    document.getElementById('district').value = data.bairro || '';
                    document.getElementById('city').value = data.localidade || '';
                    document.getElementById('state').value = data.uf || '';
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
        const cpf = e.target.value.replace(/\D/g, '');
        if (cpf.length === 11 && !validateCPF(cpf)) {
            e.target.setCustomValidity('CPF inválido');
            e.target.reportValidity();
        } else {
            e.target.setCustomValidity('');
        }
    });
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

// Validação de arquivos (tamanho máximo 10MB para upload, mas apenas <= 10KB será enviado por email)
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
            
            // Aviso se arquivo > 10KB (não será enviado por email)
            const MAX_EMAIL_SIZE = 10 * 1024; // 10KB
            if (file.size > MAX_EMAIL_SIZE) {
                const sizeKB = (file.size / 1024).toFixed(2);
                const warning = `⚠️ Arquivo grande (${sizeKB} KB). Apenas arquivos até 10 KB serão enviados por email. Este arquivo será registrado mas não enviado.`;
                console.warn(warning);
                // Mostrar aviso visual (opcional)
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
            const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
            if (!validateCPF(cpf)) {
                showMessage('CPF inválido. Por favor, verifique o número.', 'error');
                return;
            }
            
            const birthDate = document.getElementById('birthDate').value;
            if (!validateAge(birthDate)) {
                showMessage('Você deve ter pelo menos 18 anos para se cadastrar.', 'error');
                return;
            }
            
            const pepStatus = document.getElementById('pepStatus').checked;
            if (pepStatus && !document.getElementById('pepPosition').value) {
                showMessage('Por favor, informe o cargo/função se você é PEP.', 'error');
                return;
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
        }
        
        // Validar arquivos
        const fileInputsToValidate = accountType === 'PF' 
            ? ['documentFront', 'documentBack', 'proofOfAddress']
            : ['articlesOfAssociation', 'cnpjCard', 'adminIdFront', 'adminIdBack', 'companyProofOfAddress'];
        
        for (const inputId of fileInputsToValidate) {
            const input = document.getElementById(inputId);
            if (input && input.files.length > 0) {
                const validation = validateFile(input.files[0]);
                if (!validation.valid) {
                    showMessage(`${validation.error} (${inputId})`, 'error');
                    return;
                }
            }
        }
        
        // Show loading message
        showMessage('Enviando formulário...', 'loading');
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        // Check if EmailJS is configured
        if (EMAILJS_CONFIG.serviceID === 'YOUR_SERVICE_ID' || 
            EMAILJS_CONFIG.templateIDCompany === 'YOUR_TEMPLATE_ID' || 
            EMAILJS_CONFIG.templateIDUser === 'template_user_confirm' ||
            EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
            showMessage('EmailJS não configurado. Por favor, configure as credenciais no arquivo script.js ou entre em contato diretamente: novasolidum@gmail.com', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar';
            return;
        }
        
        // Check if EmailJS is available
        if (typeof emailjs === 'undefined') {
            showMessage('Serviço de email não disponível. Por favor, entre em contato diretamente: novasolidum@gmail.com', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar';
            return;
        }
        
        try {
            // Coletar dados do formulário
            let formData = {
                accountType: accountType
            };
            
            if (accountType === 'PF') {
                formData = {
                    ...formData,
                    fullName: document.getElementById('fullName').value,
                    cpf: document.getElementById('cpf').value,
                    rg: document.getElementById('rg').value || '',
                    cnh: document.getElementById('cnh').value || '',
                    birthDate: document.getElementById('birthDate').value,
                    motherName: document.getElementById('motherName').value,
                    email: document.getElementById('userEmail').value,
                    phone: document.getElementById('userPhone').value,
                    pepStatus: document.getElementById('pepStatus').checked,
                    pepPosition: document.getElementById('pepPosition').value || '',
                    address: {
                        cep: document.getElementById('cep').value,
                        street: document.getElementById('street').value,
                        number: document.getElementById('number').value,
                        complement: document.getElementById('complement').value || '',
                        district: document.getElementById('district').value,
                        city: document.getElementById('city').value,
                        state: document.getElementById('state').value
                    }
                };
            } else {
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
            }
            
            // Processar arquivos: enviar como base64 se <= 10KB, caso contrário apenas informações
            const MAX_FILE_SIZE_FOR_EMAIL = 10 * 1024; // 10KB em bytes
            const fileFields = accountType === 'PF'
                ? ['documentFront', 'documentBack', 'selfie', 'proofOfAddress']
                : ['articlesOfAssociation', 'cnpjCard', 'adminIdFront', 'adminIdBack', 'companyProofOfAddress', 'ecnpjCertificate'];
            
            for (const fieldId of fileFields) {
                const input = document.getElementById(fieldId);
                if (input && input.files.length > 0) {
                    const file = input.files[0];
                    formData[fieldId + '_name'] = file.name;
                    formData[fieldId + '_type'] = file.type;
                    formData[fieldId + '_size'] = file.size;
                    formData[fieldId + '_size_kb'] = (file.size / 1024).toFixed(2) + ' KB';
                    
                    // Se arquivo <= 10KB, converter para base64 e enviar
                    if (file.size <= MAX_FILE_SIZE_FOR_EMAIL) {
                        try {
                            formData[fieldId + '_base64'] = await fileToBase64(file);
                            formData[fieldId + '_sent'] = true;
                            formData[fieldId + '_note'] = 'Arquivo enviado como anexo (base64)';
                        } catch (error) {
                            console.error(`Erro ao converter ${fieldId} para base64:`, error);
                            formData[fieldId + '_note'] = 'Erro ao converter arquivo para base64';
                        }
                    } else {
                        formData[fieldId + '_sent'] = false;
                        formData[fieldId + '_note'] = `Arquivo muito grande (${(file.size / 1024).toFixed(2)} KB). Máximo permitido: 10 KB. Será necessário solicitar por outro método.`;
                    }
                }
            }
            
            // Template parameters for EmailJS - Email to Nova Solidum (empresa)
            const fileFieldsForTemplate = accountType === 'PF'
                ? ['documentFront', 'documentBack', 'selfie', 'proofOfAddress']
                : ['articlesOfAssociation', 'cnpjCard', 'adminIdFront', 'adminIdBack', 'companyProofOfAddress'];
            
            // Criar objeto sem base64 para não duplicar dados
            const formDataWithoutBase64 = JSON.parse(JSON.stringify(formData));
            fileFieldsForTemplate.forEach(fieldId => {
                if (formDataWithoutBase64[fieldId + '_base64']) {
                    delete formDataWithoutBase64[fieldId + '_base64'];
                }
            });
            
            const companyTemplateParams = {
                to_email: 'novasolidum@gmail.com',
                subject: `Novo Registro ${accountType} - Nova Solidum Finances`,
                account_type: accountType,
                reply_to: accountType === 'PF' ? formData.email : formData.companyEmail
            };
            
            // Adicionar campos específicos para facilitar leitura no email
            if (accountType === 'PF') {
                companyTemplateParams.user_name = formData.fullName;
                companyTemplateParams.user_email = formData.email;
                companyTemplateParams.user_phone = formData.phone;
                companyTemplateParams.user_cpf = formData.cpf;
            } else {
                companyTemplateParams.company_name = formData.companyName;
                companyTemplateParams.company_email = formData.companyEmail;
                companyTemplateParams.company_phone = formData.companyPhone;
                companyTemplateParams.company_cnpj = formData.cnpj;
            }
            
            // Adicionar arquivos base64 como variáveis separadas (apenas se <= 10KB)
            let totalBase64Size = 0;
            for (const fieldId of fileFieldsForTemplate) {
                if (formData[fieldId + '_base64']) {
                    const base64 = formData[fieldId + '_base64'];
                    // Calcular tamanho aproximado do base64 (string length em bytes)
                    totalBase64Size += base64.length;
                    
                    // Adicionar como variável separada para facilitar uso no template
                    companyTemplateParams[fieldId + '_image'] = base64;
                    companyTemplateParams[fieldId + '_name'] = formData[fieldId + '_name'];
                }
            }
            
            // Calcular tamanho total aproximado
            const otherParamsSize = new Blob([JSON.stringify(companyTemplateParams)]).size;
            const formDataJsonSize = new Blob([JSON.stringify(formDataWithoutBase64, null, 2)]).size;
            const estimatedTotalSize = totalBase64Size + otherParamsSize + formDataJsonSize;
            
            const MAX_SIZE = 45 * 1024; // 45KB para deixar margem de segurança (limite é 50KB)
            
            // Se o tamanho estimado for muito grande, não enviar form_data completo
            if (estimatedTotalSize > MAX_SIZE) {
                // Não enviar form_data completo para economizar espaço
                companyTemplateParams.form_data_note = 'Dados completos muito grandes para envio. Apenas informações principais enviadas.';
                console.warn(`Tamanho estimado (${(estimatedTotalSize / 1024).toFixed(2)} KB) excede limite. Removendo form_data completo.`);
            } else {
                // Tamanho OK, pode enviar form_data (sem base64 para não duplicar)
                companyTemplateParams.form_data = JSON.stringify(formDataWithoutBase64, null, 2);
            }
            
            // Adicionar campos específicos para facilitar leitura no email
            if (accountType === 'PF') {
                companyTemplateParams.user_name = formData.fullName;
                companyTemplateParams.user_email = formData.email;
                companyTemplateParams.user_phone = formData.phone;
                companyTemplateParams.user_cpf = formData.cpf;
            } else {
                companyTemplateParams.company_name = formData.companyName;
                companyTemplateParams.company_email = formData.companyEmail;
                companyTemplateParams.company_phone = formData.companyPhone;
                companyTemplateParams.company_cnpj = formData.cnpj;
            }
            
            // Template parameters for EmailJS - Confirmation email to user
            const userEmail = accountType === 'PF' ? formData.email : formData.companyEmail;
            const userName = accountType === 'PF' ? formData.fullName : formData.companyName;
            
            const userTemplateParams = {
                to_email: userEmail,
                to_name: userName,
                user_name: userName,
                subject: 'Registro Confirmado - Nova Solidum Finances'
            };
            
            // Send email to Nova Solidum (empresa)
            await emailjs.send(
                EMAILJS_CONFIG.serviceID,
                EMAILJS_CONFIG.templateIDCompany,
                companyTemplateParams
            );
            
            // Send confirmation email to user
            await emailjs.send(
                EMAILJS_CONFIG.serviceID,
                EMAILJS_CONFIG.templateIDUser,
                userTemplateParams
            );
            
            // Show success message
            showMessage('Formulário enviado com sucesso! Verifique seu email para confirmação. Entraremos em contato em breve.', 'success');
            
            // Reset form after 3 seconds
            setTimeout(() => {
                registerForm.reset();
                closeModal();
            }, 3000);
            
        } catch (error) {
            console.error('EmailJS Error:', error);
            let errorMessage = 'Erro ao enviar formulário. ';
            
            if (error.text) {
                errorMessage += `Detalhes: ${error.text}. `;
            }
            
            errorMessage += 'Por favor, tente novamente ou entre em contato diretamente pelo email novasolidum@gmail.com';
            showMessage(errorMessage, 'error');
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
        console.error('CoinGecko API error:', error);
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
                console.error(`Error fetching ${mapping.binance}:`, error);
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
        console.error('Binance API error:', error);
        return false;
    }
}

// Main function to fetch crypto prices
async function fetchCryptoPrices() {
    const cryptoItems = document.querySelectorAll('.crypto-item[data-coin-id]');
    
    if (cryptoItems.length === 0) {
        console.warn('No crypto items found');
        return;
    }
    
    // Try CoinGecko first
    let success = await fetchCryptoPricesFromCoinGecko();
    
    // If CoinGecko fails, try Binance
    if (!success) {
        console.log('CoinGecko failed, trying Binance...');
        success = await fetchCryptoPricesFromBinance();
    }
    
    if (!success) {
        console.error('All APIs failed');
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

