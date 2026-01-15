const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Função para sanitizar logs e remover dados sensíveis
function safeLogger(level, message, error = null) {
    if (process.env.NODE_ENV === 'production') {
        // Em produção, apenas logar mensagens genéricas
        const safeMessage = message || 'Erro interno do servidor';
        if (level === 'error') {
            console.error(`[${new Date().toISOString()}] ${safeMessage}`);
            if (error) {
                // Logar apenas status code e tipo de erro, nunca o conteúdo
                console.error(`[${new Date().toISOString()}] Status: ${error.status || 'N/A'}, Type: ${error.name || 'Error'}`);
            }
        } else if (level === 'warn') {
            console.warn(`[${new Date().toISOString()}] ${safeMessage}`);
        } else {
            console.log(`[${new Date().toISOString()}] ${safeMessage}`);
        }
    } else {
        // Em desenvolvimento, logar detalhes completos
        if (level === 'error') {
            console.error(message, error);
        } else if (level === 'warn') {
            console.warn(message);
        } else {
            console.log(message);
        }
    }
}

// Configuração CORS - Allowlist ESTRITA por segurança (NUNCA usar *)
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(o => o && o !== '*')
    : ['https://www.novasolidumfinance.com.br', 'https://novasolidumfinance.com.br'];

// Validar que não há wildcard na configuração
if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.length === 0) {
    safeLogger('error', 'CORS: Configuração insegura detectada. Wildcard (*) não é permitido.');
    process.exit(1);
}

// Middleware CORS customizado com allowlist ESTRITA
app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Verificar se origin está na allowlist - NUNCA permitir wildcard
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    // Se origin não está na lista, NÃO definir Access-Control-Allow-Origin (bloqueia a requisição)

    // Headers permitidos - mínimo necessário
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight por 24h

    // Responder a preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Middleware de Security Headers - Proteção robusta contra ataques comuns
app.use((req, res, next) => {
    // Headers de segurança essenciais
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY'); // Previne clickjacking
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');

    // Content-Security-Policy para o backend (APIs)
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");

    // Prevenir cache de dados sensíveis
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // HSTS apenas em produção (HTTPS)
    if (process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting - 5 requisições por minuto por IP
const emailRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // 5 requisições por IP
    message: 'Muitas requisições. Por favor, tente novamente em alguns instantes.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Funções de validação
function validateCPF(cpf) {
    if (!cpf) return false;
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // Todos os dígitos iguais

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

function validateCNPJ(cnpj) {
    if (!cnpj) return false;
    cnpj = cnpj.replace(/[^\d]/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false; // Todos os dígitos iguais

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
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

function validateEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    // Validar domínio básico
    const domain = email.split('@')[1];
    if (!domain || domain.length < 4) return false;
    if (!domain.includes('.')) return false;

    return true;
}

function validatePhone(phone) {
    if (!phone) return false;
    const phoneRegex = /^[\d\s\(\)\-\+]+$/;
    if (!phoneRegex.test(phone)) return false;

    // Remover caracteres não numéricos
    const digits = phone.replace(/\D/g, '');
    // Telefone brasileiro: 
    // - Com código do país (+55): 12 ou 13 dígitos (55 + DDD + número)
    // - Sem código do país: 10 ou 11 dígitos (DDD + número)
    // Aceitar de 10 a 13 dígitos para cobrir ambos os casos
    return digits.length >= 10 && digits.length <= 13;
}

// Função para sanitizar HTML e prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '/': '&#x2F;'
    };
    return String(text).replace(/[&<>"'/]/g, m => map[m]);
}

// Função para validar tamanho de string
function validateStringLength(str, maxLength, fieldName) {
    if (!str) return { valid: true };
    if (typeof str !== 'string') {
        return { valid: false, error: `${fieldName} deve ser texto` };
    }
    if (str.length > maxLength) {
        return { valid: false, error: `${fieldName} muito longo (máx: ${maxLength} caracteres)` };
    }
    return { valid: true };
}

// Função para validar e sanitizar dados do formulário
function validateAndSanitizeFormData(formData, accountType) {
    const errors = [];

    if (accountType === 'PF') {
        // Validar campos obrigatórios (verificar se existem e não são strings vazias)
        if (!formData.fullName || formData.fullName.trim() === '' ||
            !formData.email || formData.email.trim() === '' ||
            !formData.phone || formData.phone.trim() === '') {
            return { valid: false, errors: ['Campos obrigatórios faltando'] };
        }

        // Validar tamanhos
        const nameCheck = validateStringLength(formData.fullName, 200, 'Nome');
        if (!nameCheck.valid) errors.push(nameCheck.error);

        // Validar email
        if (!validateEmail(formData.email)) {
            errors.push('Email inválido');
        }

        // Validar telefone
        if (!validatePhone(formData.phone)) {
            errors.push('Telefone inválido');
        }

        // Validar CPF se fornecido
        if (formData.cpf) {
            const cpfClean = formData.cpf.replace(/\D/g, '');
            if (cpfClean.length > 0 && !validateCPF(cpfClean)) {
                errors.push('CPF inválido');
            }
        }

        // Validar endereço PF
        const address = formData.address || {};
        const isForeigner = formData.isForeigner === true || formData.isForeigner === 'true' || address.isForeign === true;

        if (isForeigner) {
            // Validar endereço estrangeiro
            const foreignZipCode = formData.foreignZipCode || address.zipCode || '';
            const foreignStreet = formData.foreignStreet || address.street || '';
            const foreignNumber = formData.foreignNumber || address.number || '';
            const foreignCity = formData.foreignCity || address.city || '';
            const foreignState = formData.foreignState || address.state || '';

            if (!foreignZipCode || foreignZipCode.trim() === '' ||
                !foreignStreet || foreignStreet.trim() === '' ||
                !foreignNumber || foreignNumber.trim() === '' ||
                !foreignCity || foreignCity.trim() === '' ||
                !foreignState || foreignState.trim() === '') {
                errors.push('Por favor, preencha todos os campos obrigatórios do endereço (CEP/Código Postal, Logradouro, Número, Cidade e Estado/Província)');
            }
        } else {
            // Validar endereço brasileiro
            const cep = formData.cep || address.cep || '';
            const street = formData.street || address.street || '';
            const number = formData.number || address.number || '';
            const district = formData.district || address.district || '';
            const city = formData.city || address.city || '';
            const state = formData.state || address.state || '';

            if (!cep || cep.trim() === '' ||
                !street || street.trim() === '' ||
                !number || number.trim() === '' ||
                !district || district.trim() === '' ||
                !city || city.trim() === '' ||
                !state || state.trim() === '') {
                errors.push('Por favor, preencha todos os campos obrigatórios do endereço (CEP, Logradouro, Número, Bairro, Cidade e UF)');
            }
        }

        // Sanitizar strings
        formData.fullName = escapeHtml(formData.fullName);
        formData.email = escapeHtml(formData.email);
        if (formData.rg) formData.rg = escapeHtml(formData.rg);
        if (formData.cnh) formData.cnh = escapeHtml(formData.cnh);

    } else if (accountType === 'PJ') {
        // Validar campos obrigatórios (verificar se existem e não são strings vazias)
        if (!formData.companyName || formData.companyName.trim() === '' ||
            !formData.companyEmail || formData.companyEmail.trim() === '' ||
            !formData.companyPhone || formData.companyPhone.trim() === '' ||
            !formData.cnpj || formData.cnpj.trim() === '') {
            return { valid: false, errors: ['Campos obrigatórios faltando'] };
        }

        // Validar tamanhos
        const companyNameCheck = validateStringLength(formData.companyName, 200, 'Razão Social');
        if (!companyNameCheck.valid) errors.push(companyNameCheck.error);

        // Validar email
        if (!validateEmail(formData.companyEmail)) {
            errors.push('Email da empresa inválido');
        }

        // Validar telefone
        if (!validatePhone(formData.companyPhone)) {
            errors.push('Telefone da empresa inválido');
        }

        // Validar CNPJ
        const cnpjClean = formData.cnpj.replace(/\D/g, '');
        if (!validateCNPJ(cnpjClean)) {
            errors.push('CNPJ inválido');
        }

        // Validar CPF do administrador
        if (formData.majorityAdmin && formData.majorityAdmin.cpf) {
            const adminCpfClean = formData.majorityAdmin.cpf.replace(/\D/g, '');
            if (!validateCPF(adminCpfClean)) {
                errors.push('CPF do administrador inválido');
            }
        }

        // Validar endereço PJ
        const address = formData.address || {};
        const pjCep = formData.pjCep || address.cep || '';
        const pjStreet = formData.pjStreet || address.street || '';
        const pjNumber = formData.pjNumber || address.number || '';
        const pjDistrict = formData.pjDistrict || address.district || '';
        const pjCity = formData.pjCity || address.city || '';
        const pjState = formData.pjState || address.state || '';

        if (!pjCep || pjCep.trim() === '' ||
            !pjStreet || pjStreet.trim() === '' ||
            !pjNumber || pjNumber.trim() === '' ||
            !pjDistrict || pjDistrict.trim() === '' ||
            !pjCity || pjCity.trim() === '' ||
            !pjState || pjState.trim() === '') {
            errors.push('Por favor, preencha todos os campos obrigatórios do endereço (CEP, Logradouro, Número, Bairro, Cidade e UF)');
        }

        // Sanitizar strings
        formData.companyName = escapeHtml(formData.companyName);
        formData.companyEmail = escapeHtml(formData.companyEmail);
        if (formData.tradeName) formData.tradeName = escapeHtml(formData.tradeName);
        if (formData.majorityAdmin) {
            if (formData.majorityAdmin.name) {
                formData.majorityAdmin.name = escapeHtml(formData.majorityAdmin.name);
            }
            if (formData.majorityAdmin.email) {
                formData.majorityAdmin.email = escapeHtml(formData.majorityAdmin.email);
            }
        }
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return { valid: true, sanitizedData: formData };
}

// Armazenamento temporário de tokens (em produção, use Redis ou banco de dados)
const registrationTokens = new Map();

// Middleware para verificar token de autenticação
function verifyToken(req, res, next) {
    const token = req.headers['x-auth-token'] || req.body.token || req.query.token;

    if (!token) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    if (!registrationTokens.has(token)) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    const tokenData = registrationTokens.get(token);

    // Verificar se token expirou (24 horas)
    if (Date.now() > tokenData.expiresAt) {
        registrationTokens.delete(token);
        return res.status(401).json({ error: 'Token expirado' });
    }

    req.tokenData = tokenData;
    next();
}

// Configurar multer para upload de arquivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB máximo
    }
});

// Configurar múltiplos uploads para formulário de registro
const uploadMultiple = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por arquivo
        fieldSize: 50 * 1024 * 1024 // 50MB total
    },
    fileFilter: (req, file, cb) => {
        // Validar tipos de arquivo permitidos
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/pdf'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}. Permitidos: JPG, PNG, PDF`));
        }
    }
});

// Função para validar magic bytes (assinatura de arquivo)
function validateFileMagicBytes(buffer, mimetype) {
    if (!buffer || buffer.length < 4) return false;

    const magicNumbers = {
        'image/jpeg': [[0xFF, 0xD8, 0xFF]],
        'image/jpg': [[0xFF, 0xD8, 0xFF]],
        'image/png': [[0x89, 0x50, 0x4E, 0x47]],
        'application/pdf': [[0x25, 0x50, 0x44, 0x46]]
    };

    const signatures = magicNumbers[mimetype];
    if (!signatures) return false;

    return signatures.some(sig => {
        for (let i = 0; i < sig.length; i++) {
            if (buffer[i] !== sig[i]) return false;
        }
        return true;
    });
}

// Configurar Nodemailer para envio de emails
let transporter = null;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para outras portas
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Verificar conexão
    transporter.verify((error, success) => {
        if (error) {
            safeLogger('error', 'Erro na configuração do email', error);
        } else {
            safeLogger('log', 'Servidor de email configurado com sucesso!');
        }
    });
} else {
    safeLogger('warn', 'Configuração de email não encontrada. Configure EMAIL_HOST, EMAIL_USER e EMAIL_PASS no .env');
}

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Tinify Proxy' });
});

// Rota GET para testar se o servidor está funcionando
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Tinify Proxy Backend',
        message: 'Servidor está rodando!',
        endpoints: {
            health: '/health',
            compress: 'POST /api/tinify/compress'
        }
    });
});

// Rota GET para o endpoint de compressão (apenas informativa)
app.get('/api/tinify/compress', (req, res) => {
    res.status(405).json({
        error: 'Method Not Allowed',
        message: 'Este endpoint aceita apenas requisições POST',
        usage: 'Use POST /api/tinify/compress com FormData contendo o campo "image"'
    });
});

// Rota para cadastro inicial (ETAPA 1) - sem documentos
app.post('/api/register/initial', emailRateLimiter, async (req, res) => {
    try {
        // Verificar se email está configurado
        if (!transporter) {
            return res.status(500).json({
                error: 'Servidor de email não configurado',
                message: 'Configure EMAIL_HOST, EMAIL_USER e EMAIL_PASS no arquivo .env'
            });
        }

        const formData = req.body;
        const accountType = formData.accountType || 'PF';

        // Validar e sanitizar dados
        const validation = validateAndSanitizeFormData(formData, accountType);
        if (!validation.valid) {
            safeLogger('warn', 'Validação falhou no registro inicial', { errors: validation.errors });
            return res.status(400).json({
                error: 'Dados inválidos',
                message: validation.errors.join(', ')
            });
        }

        // Gerar token único
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas

        // Armazenar token com dados (sem criptografia por enquanto - pode adicionar depois)
        registrationTokens.set(token, {
            formData,
            accountType,
            expiresAt,
            createdAt: Date.now()
        });

        // Preparar dados para email
        const userEmail = accountType === 'PF' ? formData.email : formData.companyEmail;
        const userName = accountType === 'PF' ? formData.fullName : formData.companyName;
        const frontendUrl = process.env.FRONTEND_URL || 'https://www.novasolidumfinance.com.br';
        const documentUploadUrl = `${frontendUrl}/upload-docs.html?token=${token}`;

        // Enviar email de confirmação com link para envio de documentos
        const userConfirmationHtml = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a2744;">Cadastro Confirmado - Nova Solidum Finances</h2>
                    <p>Olá ${userName},</p>
                    <p>Seu cadastro foi recebido com sucesso!</p>
                    <p>Para completar seu registro, por favor, envie os documentos necessários através do link abaixo:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${documentUploadUrl}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Enviar Documentos</a>
                    </div>
                    <p style="color: #666; font-size: 12px;">Este link expira em 24 horas.</p>
                    <p>Atenciosamente,<br><strong>Equipe Nova Solidum Finances</strong></p>
                </div>
            </body>
            </html>
        `;

        const userMailOptions = {
            from: `"Nova Solidum Finances" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Cadastro Confirmado - Envie seus Documentos',
            html: userConfirmationHtml
        };

        await transporter.sendMail(userMailOptions);

        // Enviar notificação para empresa
        const companyEmail = process.env.COMPANY_EMAIL || 'novasolidum@gmail.com';
        const companyNotificationHtml = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a2744;">Novo Cadastro Recebido - Nova Solidum Finances</h2>
                    <p>Um novo cadastro foi realizado:</p>
                    <p><strong>Tipo:</strong> ${accountType}</p>
                    <p><strong>Nome/Empresa:</strong> ${userName}</p>
                    <p><strong>Email:</strong> ${userEmail}</p>
                    <p>O usuário receberá um email com link para envio de documentos.</p>
                </div>
            </body>
            </html>
        `;

        const companyMailOptions = {
            from: `"Nova Solidum Formulário" <${process.env.EMAIL_USER}>`,
            to: companyEmail,
            replyTo: userEmail,
            subject: `Novo Cadastro ${accountType} - Nova Solidum Finances`,
            html: companyNotificationHtml
        };

        await transporter.sendMail(companyMailOptions);

        res.json({
            success: true,
            message: 'Cadastro realizado com sucesso! Verifique seu email para enviar os documentos.',
            token: token
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erro ao processar cadastro',
            message: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.'
        });
    }
});

// Rota para verificar token e obter informações do cadastro
app.get('/api/register/verify/:token', (req, res) => {
    try {
        const token = req.params.token;

        if (!token || !registrationTokens.has(token)) {
            return res.status(401).json({
                error: 'Token inválido',
                valid: false
            });
        }

        const tokenData = registrationTokens.get(token);

        // Verificar se token expirou
        if (Date.now() > tokenData.expiresAt) {
            registrationTokens.delete(token);
            return res.status(401).json({
                error: 'Token expirado',
                valid: false
            });
        }

        // Retornar apenas informações não sensíveis
        res.json({
            valid: true,
            accountType: tokenData.accountType,
            expiresAt: tokenData.expiresAt
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erro ao verificar token',
            valid: false
        });
    }
});

// Rota para envio de documentos (ETAPA 2) - requer token
app.post('/api/register/documents', verifyToken, uploadMultiple.fields([
    { name: 'documentFront', maxCount: 1 },
    { name: 'documentBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'articlesOfAssociation', maxCount: 1 },
    { name: 'cnpjCard', maxCount: 1 },
    { name: 'adminIdFront', maxCount: 1 },
    { name: 'adminIdBack', maxCount: 1 },
    { name: 'companyProofOfAddress', maxCount: 1 },
    { name: 'ecnpjCertificate', maxCount: 1 }
]), async (req, res) => {
    try {
        // Verificar se email está configurado
        if (!transporter) {
            return res.status(500).json({
                error: 'Servidor de email não configurado',
                message: 'Configure EMAIL_HOST, EMAIL_USER e EMAIL_PASS no arquivo .env'
            });
        }

        // Obter dados do cadastro do token
        const tokenData = req.tokenData;
        const formData = tokenData.formData;
        const accountType = tokenData.accountType;

        // Preparar anexos
        const attachments = [];
        const fileFields = accountType === 'PF'
            ? ['documentFront', 'documentBack', 'selfie', 'proofOfAddress']
            : ['articlesOfAssociation', 'cnpjCard', 'adminIdFront', 'adminIdBack', 'companyProofOfAddress', 'ecnpjCertificate'];

        fileFields.forEach(fieldId => {
            const file = req.files && req.files[fieldId] ? req.files[fieldId][0] : null;
            if (file) {
                // Validar magic bytes do arquivo para segurança extra
                if (!validateFileMagicBytes(file.buffer, file.mimetype)) {
                    safeLogger('warn', 'Arquivo com magic bytes inválido rejeitado', {
                        fieldId,
                        mimetype: file.mimetype,
                        size: file.size
                    });
                    // Não adiciona arquivo suspeito
                    return;
                }

                attachments.push({
                    filename: file.originalname,
                    content: file.buffer,
                    contentType: file.mimetype
                });
            }
        });

        // Preparar dados do email para a empresa
        const companyEmail = process.env.COMPANY_EMAIL || 'novasolidum@gmail.com';
        const userEmail = accountType === 'PF' ? formData.email : formData.companyEmail;
        const userName = accountType === 'PF' ? formData.fullName : formData.companyName;

        // Construir corpo do email em HTML
        let emailHtml = buildEmailHTML(formData, accountType, attachments.length);

        // Enviar email para a empresa
        const mailOptions = {
            from: `"Nova Solidum Formulário" <${process.env.EMAIL_USER}>`,
            to: companyEmail,
            replyTo: userEmail,
            subject: `Documentos Recebidos - Registro ${accountType} - Nova Solidum Finances`,
            html: emailHtml,
            attachments: attachments
        };

        const emailResult = await transporter.sendMail(mailOptions);

        // Enviar email de confirmação para o usuário
        const userConfirmationHtml = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a2744;">Documentos Recebidos - Nova Solidum Finances</h2>
                    <p>Olá ${userName},</p>
                    <p>Recebemos seus documentos com sucesso! Nossa equipe entrará em contato em breve para finalizar seu cadastro.</p>
                    <p>Atenciosamente,<br><strong>Equipe Nova Solidum Finances</strong></p>
                </div>
            </body>
            </html>
        `;

        const userMailOptions = {
            from: `"Nova Solidum Finances" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Documentos Recebidos - Nova Solidum Finances',
            html: userConfirmationHtml
        };

        await transporter.sendMail(userMailOptions);

        res.json({
            success: true,
            message: 'Documentos enviados com sucesso! Verifique seu email para confirmação.',
            attachmentsCount: attachments.length
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erro ao enviar documentos',
            message: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.'
        });
    }
});

// Rota para enviar email com anexos
app.post('/api/email/send', emailRateLimiter, uploadMultiple.fields([
    { name: 'documentFront', maxCount: 1 },
    { name: 'documentBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'articlesOfAssociation', maxCount: 1 },
    { name: 'cnpjCard', maxCount: 1 },
    { name: 'adminIdFront', maxCount: 1 },
    { name: 'adminIdBack', maxCount: 1 },
    { name: 'companyProofOfAddress', maxCount: 1 },
    { name: 'ecnpjCertificate', maxCount: 1 }
]), async (req, res) => {
    try {
        // Verificar se email está configurado
        if (!transporter) {
            return res.status(500).json({
                error: 'Servidor de email não configurado',
                message: 'Configure EMAIL_HOST, EMAIL_USER e EMAIL_PASS no arquivo .env'
            });
        }

        // Extrair dados do formulário
        let formData;
        try {
            formData = JSON.parse(req.body.formData || '{}');
        } catch (error) {
            safeLogger('error', 'Erro ao parsear formData', error);
            return res.status(400).json({
                error: 'Dados inválidos',
                message: 'Formato de dados incorreto'
            });
        }

        const accountType = formData.accountType || 'PF';

        // 🔍 DEBUG: Log detalhado dos dados recebidos para verificar CEP
        safeLogger('log', '📋 Dados do formulário recebidos:', {
            accountType: formData.accountType,
            hasAddress: !!formData.address,
            address: formData.address,
            directCep: formData.cep,
            directPjCep: formData.pjCep,
            isForeigner: formData.isForeigner
        });

        // Verificar honeypot (anti-bot)
        if (req.body.honeypot && req.body.honeypot.length > 0) {
            safeLogger('warn', 'Honeypot detectado - possível bot');
            return res.status(400).json({
                error: 'Requisição inválida',
                message: 'Por favor, tente novamente'
            });
        }

        // Validar e sanitizar dados
        const validation = validateAndSanitizeFormData(formData, accountType);
        if (!validation.valid) {
            safeLogger('warn', 'Validação falhou', { errors: validation.errors });
            return res.status(400).json({
                error: 'Dados inválidos',
                message: validation.errors.join(', ')
            });
        }

        // Usar dados sanitizados
        formData = validation.sanitizedData;

        // Preparar anexos
        const attachments = [];
        const fileFields = accountType === 'PF'
            ? ['documentFront', 'documentBack', 'selfie', 'proofOfAddress']
            : ['articlesOfAssociation', 'cnpjCard', 'adminIdFront', 'adminIdBack', 'companyProofOfAddress', 'ecnpjCertificate'];

        fileFields.forEach(fieldId => {
            const file = req.files && req.files[fieldId] ? req.files[fieldId][0] : null;
            if (file) {
                // Validar magic bytes do arquivo para segurança extra
                if (!validateFileMagicBytes(file.buffer, file.mimetype)) {
                    safeLogger('warn', 'Arquivo com magic bytes inválido rejeitado', {
                        fieldId,
                        mimetype: file.mimetype,
                        size: file.size
                    });
                    // Não adiciona arquivo suspeito
                    return;
                }

                attachments.push({
                    filename: file.originalname,
                    content: file.buffer,
                    contentType: file.mimetype
                });
            }
        });

        // Preparar dados do email para a empresa
        const companyEmail = process.env.COMPANY_EMAIL || 'novasolidum@gmail.com';
        const userEmail = accountType === 'PF' ? formData.email : formData.companyEmail;
        const userName = accountType === 'PF' ? formData.fullName : formData.companyName;

        // Construir corpo do email em HTML
        let emailHtml = buildEmailHTML(formData, accountType, attachments.length);

        // Enviar email para a empresa
        const mailOptions = {
            from: `"Nova Solidum Formulário" <${process.env.EMAIL_USER}>`,
            to: companyEmail,
            replyTo: userEmail,
            subject: `Novo Registro ${accountType} - Nova Solidum Finances`,
            html: emailHtml,
            attachments: attachments
        };

        const emailResult = await transporter.sendMail(mailOptions);

        // Enviar email de confirmação para o usuário
        const userConfirmationHtml = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a2744;">Registro Confirmado - Nova Solidum Finances</h2>
                    <p>Olá ${userName},</p>
                    <p>Recebemos seu registro com sucesso! Nossa equipe entrará em contato em breve.</p>
                    <p>Atenciosamente,<br><strong>Equipe Nova Solidum Finances</strong></p>
                </div>
            </body>
            </html>
        `;

        const userMailOptions = {
            from: `"Nova Solidum Finances" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Registro Confirmado - Nova Solidum Finances',
            html: userConfirmationHtml
        };

        await transporter.sendMail(userMailOptions);

        // Log de sucesso com contexto
        safeLogger('log', 'Email enviado com sucesso', {
            accountType,
            email: userEmail,
            attachments: attachments.length,
            messageId: emailResult.messageId
        });

        res.json({
            success: true,
            message: 'Emails enviados com sucesso!',
            attachmentsCount: attachments.length,
            emailId: emailResult.messageId
        });

    } catch (error) {
        // Log estruturado com contexto
        safeLogger('error', 'Erro ao enviar email', {
            accountType,
            error: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });

        // Resposta genérica para não expor detalhes internos
        res.status(500).json({
            error: 'Erro ao enviar email',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.'
        });
    }
});

// Função para construir HTML do email
function buildEmailHTML(formData, accountType, attachmentsCount) {
    let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px;">
                            <tr>
                                <td style="background: linear-gradient(135deg, #1a2744 0%, #0f1721 100%); padding: 30px 40px; border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; text-align: center;">Nova Solidum Finances</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px;">
                                    <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">Olá,</p>
                                    <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">Nova solicitação de registro KYC recebida:</p>
                                    
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #f9fafb; border-left: 4px solid #dc2626; border-radius: 4px;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Tipo de Cadastro</p>
                                                <p style="margin: 0; color: #1a2744; font-size: 20px; font-weight: 700;">${accountType}</p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <h2 style="margin: 40px 0 20px 0; color: #1a2744; font-size: 18px; font-weight: 600; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Dados Principais</h2>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
    `;

    // Adicionar dados específicos baseado no tipo (com sanitização)
    if (accountType === 'PF') {
        if (formData.fullName) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Nome:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.fullName)}</span></td></tr>`;
        if (formData.cpf) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">CPF:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.cpf)}</span></td></tr>`;
        if (formData.birthDate) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Data de Nasc.:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.birthDate)}</span></td></tr>`;
        if (formData.email) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Email:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.email)}</span></td></tr>`;
        if (formData.phone) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Telefone:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.phone)}</span></td></tr>`;
        if (formData.pepStatus) {
            html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">PEP:</span><span style="color: #dc2626; font-size: 14px; font-weight: bold;">SIM</span></td></tr>`;
            if (formData.pepPosition) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Cargo PEP:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.pepPosition)}</span></td></tr>`;
        }
    } else {
        if (formData.companyName) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Razão Social:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.companyName)}</span></td></tr>`;
        if (formData.cnpj) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">CNPJ:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.cnpj)}</span></td></tr>`;
        if (formData.foundationDate) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Data Fundação:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.foundationDate)}</span></td></tr>`;
        if (formData.companyEmail) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Email:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.companyEmail)}</span></td></tr>`;
        if (formData.companyPhone) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Telefone:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(formData.companyPhone)}</span></td></tr>`;
    }

    html += `
                                    </table>
                                    
                                    <h2 style="margin: 40px 0 20px 0; color: #1a2744; font-size: 18px; font-weight: 600; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Endereço</h2>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
    `;

    // Adicionar endereço baseado no tipo
    // Suportar tanto campos diretos quanto dentro do objeto 'address'
    const address = formData.address || {};

    if (accountType === 'PF') {
        // Verificar se é estrangeiro ou brasileiro
        const isForeigner = formData.isForeigner === true || formData.isForeigner === 'true' || address.isForeign === true;

        if (isForeigner) {
            // Endereço para estrangeiros (campos diretos ou dentro de address)
            const street = formData.foreignStreet || address.street || '';
            const number = formData.foreignNumber || address.number || '';
            const complement = formData.foreignComplement || address.complement || '';
            const district = formData.foreignDistrict || address.district || '';
            const city = formData.foreignCity || address.city || '';
            const state = formData.foreignState || address.state || '';
            const zipCode = formData.foreignZipCode || address.zipCode || '';
            const country = formData.foreignCountry || address.country || '';

            if (street) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Logradouro:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(street)}</span></td></tr>`;
            if (number) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Número:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(number)}</span></td></tr>`;
            if (complement) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Complemento:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(complement)}</span></td></tr>`;
            if (district) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Bairro/Distrito:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(district)}</span></td></tr>`;
            if (city) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Cidade:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(city)}</span></td></tr>`;
            if (state) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Estado/Província:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(state)}</span></td></tr>`;
            html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">CEP/Código Postal:</span><span style="color: #1a2744; font-size: 14px;">${zipCode ? escapeHtml(zipCode) : '<span style="color: #dc2626;">⚠️ Não informado</span>'}</span></td></tr>`;
            if (country) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">País:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(country)}</span></td></tr>`;
        } else {
            // Endereço para brasileiros (campos diretos ou dentro de address)
            const cep = formData.cep || address.cep || '';
            const street = formData.street || address.street || '';
            const number = formData.number || address.number || '';
            const complement = formData.complement || address.complement || '';
            const district = formData.district || address.district || '';
            const city = formData.city || address.city || '';
            const state = formData.state || address.state || '';

            // 🔍 DEBUG: Log para verificar extração do CEP
            console.log('📋 DEBUG buildEmailHTML - Endereço PF brasileiro:', {
                'formData.cep': formData.cep,
                'address.cep': address.cep,
                'cepFinal': cep,
                'addressObjeto': JSON.stringify(address)
            });

            html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">CEP:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(cep || 'Não informado')}</span></td></tr>`;
            if (street) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Logradouro:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(street)}</span></td></tr>`;
            if (number) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Número:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(number)}</span></td></tr>`;
            if (complement) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Complemento:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(complement)}</span></td></tr>`;
            if (district) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Bairro:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(district)}</span></td></tr>`;
            if (city) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Cidade:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(city)}</span></td></tr>`;
            if (state) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">UF:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(state)}</span></td></tr>`;
        }
    } else {
        // Endereço para PJ (campos diretos ou dentro de address)
        const cep = formData.pjCep || address.cep || '';
        const street = formData.pjStreet || address.street || '';
        const number = formData.pjNumber || address.number || '';
        const complement = formData.pjComplement || address.complement || '';
        const district = formData.pjDistrict || address.district || '';
        const city = formData.pjCity || address.city || '';
        const state = formData.pjState || address.state || '';

        html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">CEP:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(cep || 'Não informado')}</span></td></tr>`;
        if (street) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Logradouro:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(street)}</span></td></tr>`;
        if (number) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Número:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(number)}</span></td></tr>`;
        if (complement) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Complemento:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(complement)}</span></td></tr>`;
        if (district) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Bairro:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(district)}</span></td></tr>`;
        if (city) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Cidade:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(city)}</span></td></tr>`;
        if (state) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">UF:</span><span style="color: #1a2744; font-size: 14px;">${escapeHtml(state)}</span></td></tr>`;
    }

    html += `
                                    </table>
                                    
                                    <h2 style="margin: 40px 0 20px 0; color: #1a2744; font-size: 18px; font-weight: 600; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Documentos Enviados como Anexos</h2>
                                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 13px;">Total de anexos: <strong>${attachmentsCount}</strong> arquivo(s)</p>
                                    <p style="margin: 0 0 20px 0; color: #dc2626; font-size: 12px; font-style: italic;">✅ Os arquivos estão anexados ao email e podem ser baixados diretamente.</p>
                                    
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
                                        <tr>
                                            <td>
                                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                                    <strong>Responder para:</strong> <a href="mailto:${accountType === 'PF' ? formData.email : formData.companyEmail}" style="color: #dc2626; text-decoration: none;">${accountType === 'PF' ? formData.email : formData.companyEmail}</a>
                                                </p>
                                                <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
                                                    Atenciosamente,<br>
                                                    <strong style="color: #1a2744;">Equipe Nova Solidum Finances</strong>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #1a2744; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                                    <p style="margin: 0; color: #ffffff; font-size: 12px; opacity: 0.8;">
                                        © 2025 Nova Solidum Finances LTDA. Todos os direitos reservados.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    return html;
}

// Rota para comprimir imagem usando Tinify
app.post('/api/tinify/compress', upload.single('image'), async (req, res) => {
    try {
        // Verificar se arquivo foi enviado
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada' });
        }

        // Verificar se API key está configurada
        const tinifyKey = process.env.TINIFY_API_KEY;
        if (!tinifyKey) {
            return res.status(500).json({ error: 'TINIFY_API_KEY não configurada' });
        }

        // Verificar tipo de arquivo
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'Arquivo deve ser uma imagem' });
        }

        // Verificar tamanho (Tinify limita a 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'Arquivo muito grande (máx. 5MB)' });
        }

        // Fazer requisição para Tinify
        const tinifyResponse = await fetch('https://api.tinify.com/shrink', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`api:${tinifyKey}`).toString('base64')}`,
                'Content-Type': req.file.mimetype
            },
            body: req.file.buffer
        });

        // Verificar resposta do Tinify
        if (!tinifyResponse.ok) {
            let errorMessage = `Erro ${tinifyResponse.status}`;
            try {
                const errorData = await tinifyResponse.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = tinifyResponse.statusText;
            }

            // Erros específicos
            if (tinifyResponse.status === 401) {
                return res.status(401).json({ error: 'API key inválida ou expirada' });
            } else if (tinifyResponse.status === 429) {
                return res.status(429).json({ error: 'Limite de 500 compressions/mês excedido' });
            }

            return res.status(tinifyResponse.status).json({ error: errorMessage });
        }

        const tinifyResult = await tinifyResponse.json();

        if (!tinifyResult.output || !tinifyResult.output.url) {
            return res.status(500).json({ error: 'Resposta inválida do Tinify' });
        }

        // Baixar imagem comprimida
        const compressedResponse = await fetch(tinifyResult.output.url);
        if (!compressedResponse.ok) {
            return res.status(500).json({ error: 'Erro ao baixar imagem comprimida' });
        }

        const compressedArrayBuffer = await compressedResponse.arrayBuffer();
        const compressedBuffer = Buffer.from(compressedArrayBuffer);
        const compressedSize = compressedBuffer.length;

        // Converter para base64
        const base64 = compressedBuffer.toString('base64');
        const mimeType = compressedResponse.headers.get('content-type') || req.file.mimetype;
        const base64DataUrl = `data:${mimeType};base64,${base64}`;

        // Retornar resultado
        res.json({
            success: true,
            originalSize: req.file.size,
            compressedSize: compressedSize,
            base64: base64DataUrl,
            mimeType: mimeType
        });

    } catch (error) {
        safeLogger('error', 'Erro ao comprimir imagem', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Ocorreu um erro ao processar a imagem. Tente novamente mais tarde.'
        });
    }
});

// Exportar app para Vercel (serverless)
module.exports = app;

// Iniciar servidor apenas se não estiver no Vercel
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
    app.listen(PORT, () => {
        safeLogger('log', `Servidor Backend rodando na porta ${PORT}`);
        safeLogger('log', `Health check: http://localhost:${PORT}/health`);
        safeLogger('log', `Tinify: http://localhost:${PORT}/api/tinify/compress`);
        safeLogger('log', `Email: http://localhost:${PORT}/api/email/send`);

        if (!process.env.TINIFY_API_KEY) {
            safeLogger('warn', 'TINIFY_API_KEY não configurada! Configure no arquivo .env');
        }

        if (!transporter) {
            safeLogger('warn', 'Servidor de email não configurado! Configure EMAIL_HOST, EMAIL_USER e EMAIL_PASS no .env');
        }
    });
}

