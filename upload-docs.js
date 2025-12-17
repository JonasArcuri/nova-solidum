// Configuração do Backend
const BACKEND_CONFIG = {
    documentsUrl: 'https://back-end-nova.vercel.app/api/register/documents',
    verifyUrl: 'https://back-end-nova.vercel.app/api/register/verify'
};

// Obter token da URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const documentsForm = document.getElementById('documentsForm');
const tokenError = document.getElementById('tokenError');
const formMessage = document.getElementById('formMessage');
const pfForm = document.getElementById('pfForm');
const pjForm = document.getElementById('pjForm');
const accountTypeInput = document.getElementById('accountType');

let accountType = 'PF'; // Default

// Verificar token e carregar informações
async function verifyToken() {
    if (!token) {
        tokenError.style.display = 'block';
        documentsForm.style.display = 'none';
        return false;
    }
    
    try {
        const response = await fetch(`${BACKEND_CONFIG.verifyUrl}/${token}`);
        
        if (!response.ok) {
            throw new Error('Token inválido');
        }
        
        const data = await response.json();
        
        if (!data.valid) {
            throw new Error('Token inválido ou expirado');
        }
        
        // Mostrar formulário correto baseado no tipo de conta
        accountType = data.accountType || 'PF';
        accountTypeInput.value = accountType;
        
        if (accountType === 'PF') {
            pfForm.style.display = 'block';
            pjForm.style.display = 'none';
        } else {
            pfForm.style.display = 'none';
            pjForm.style.display = 'block';
        }
        
        documentsForm.style.display = 'block';
        return true;
        
    } catch (error) {
        tokenError.style.display = 'block';
        documentsForm.style.display = 'none';
        return false;
    }
}

// Verificar token ao carregar a página
verifyToken();

// Function to show message
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message show ${type}`;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Validação de arquivo
function validateFile(file, maxSizeMB = 10, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) {
    if (!file) return { valid: false, error: 'Arquivo não selecionado' };
    
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
        return { valid: false, error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB` };
    }
    
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}` };
    }
    
    return { valid: true };
}

// Validação de arquivos
const fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            let allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (input.id === 'ecnpjCertificate') {
                allowedTypes = ['.pfx'];
            }
            
            const validation = validateFile(file, 10, allowedTypes);
            if (!validation.valid) {
                e.target.setCustomValidity(validation.error);
                e.target.reportValidity();
                e.target.value = '';
                return;
            }
            
            const MAX_EMAIL_SIZE = 10 * 1024 * 1024;
            if (file.size > MAX_EMAIL_SIZE) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                const warning = `⚠️ Arquivo muito grande (${sizeMB} MB). Máximo permitido: 10 MB.`;
                const hint = input.parentElement.querySelector('.file-size-warning');
                if (hint) {
                    hint.textContent = warning;
                    hint.style.display = 'block';
                    hint.style.color = '#dc2626';
                }
            } else {
                const hint = input.parentElement.querySelector('.file-size-warning');
                if (hint) {
                    hint.style.display = 'none';
                }
            }
            
            e.target.setCustomValidity('');
        }
    });
});

// Função para enviar documentos
async function sendDocumentsToBackend(accountType, submitBtn) {
    try {
        // Criar FormData para enviar arquivos
        const formDataToSend = new FormData();
        
        // Adicionar token
        formDataToSend.append('token', token);
        
        // Adicionar arquivos
        const fileFields = accountType === 'PF'
            ? ['documentFront', 'documentBack', 'selfie', 'proofOfAddress']
            : ['articlesOfAssociation', 'cnpjCard', 'adminIdFront', 'adminIdBack', 'companyProofOfAddress', 'ecnpjCertificate'];
        
        let filesCount = 0;
        for (const fieldId of fileFields) {
            const input = document.getElementById(fieldId);
            if (input && input.files.length > 0) {
                const file = input.files[0];
                formDataToSend.append(fieldId, file);
                filesCount++;
            }
        }
        
        if (filesCount === 0) {
            showMessage('Por favor, selecione pelo menos um documento.', 'error');
            return;
        }
        
        // Enviar para o backend com token no header
        const response = await fetch(BACKEND_CONFIG.documentsUrl, {
            method: 'POST',
            headers: {
                'x-auth-token': token
            },
            body: formDataToSend
        });
        
        if (!response.ok) {
            let errorMessage = 'Erro ao enviar documentos';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // Usar mensagem padrão
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        
        // Show success message
        showMessage(`Documentos enviados com sucesso! ${result.attachmentsCount || filesCount} anexo(s) enviado(s). Verifique seu email para confirmação.`, 'success');
        
        // Desabilitar formulário após sucesso
        documentsForm.style.pointerEvents = 'none';
        documentsForm.style.opacity = '0.6';
        
    } catch (error) {
        const errorMessage = error.message || 'Erro desconhecido';
        
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS') || errorMessage.includes('NetworkError')) {
            showMessage('Erro de conexão. Verifique sua conexão com a internet e tente novamente.', 'error');
        } else if (errorMessage.includes('Token inválido') || errorMessage.includes('expirado')) {
            showMessage('Token inválido ou expirado. Por favor, verifique o link recebido por email.', 'error');
            tokenError.style.display = 'block';
        } else {
            showMessage('Erro ao enviar documentos. Por favor, tente novamente ou entre em contato através do suporte.', 'error');
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Documentos';
        }
    }
}

// Form submission handler
if (documentsForm) {
    documentsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = documentsForm.querySelector('button[type="submit"]');
        
        // Usar accountType já determinado pela verificação do token
        accountTypeInput.value = accountType;
        
        // Validar arquivos obrigatórios
        const requiredFields = accountType === 'PF'
            ? ['documentFront', 'documentBack', 'proofOfAddress']
            : ['articlesOfAssociation', 'cnpjCard', 'adminIdFront', 'adminIdBack', 'companyProofOfAddress'];
        
        let hasError = false;
        for (const fieldId of requiredFields) {
            const input = document.getElementById(fieldId);
            if (input && (!input.files || input.files.length === 0)) {
                showMessage(`Por favor, selecione o arquivo: ${input.previousElementSibling.textContent}`, 'error');
                hasError = true;
                break;
            }
        }
        
        if (hasError) {
            return;
        }
        
        // Show loading message
        showMessage('Enviando documentos...', 'loading');
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        // Enviar documentos
        await sendDocumentsToBackend(accountType, submitBtn);
    });
}

// Verificar token e determinar tipo de conta (opcional - pode ser feito no backend)
// Por enquanto, mostrar ambos os formulários e deixar o usuário escolher
// Em produção, o backend pode retornar o tipo de conta baseado no token

