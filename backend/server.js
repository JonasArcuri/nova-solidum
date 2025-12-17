const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração CORS - permitir requisições do frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Em produção, especifique a URL do frontend
    credentials: true
}));

app.use(express.json());

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
    }
});

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
            console.error('❌ Erro na configuração do email:', error);
        } else {
            console.log('✅ Servidor de email configurado com sucesso!');
        }
    });
} else {
    console.warn('⚠️  Configuração de email não encontrada. Configure EMAIL_HOST, EMAIL_USER e EMAIL_PASS no .env');
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
app.post('/api/register/initial', async (req, res) => {
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
        
        // Validar dados básicos
        if (accountType === 'PF') {
            if (!formData.fullName || !formData.email || !formData.phone) {
                return res.status(400).json({ error: 'Dados obrigatórios faltando' });
            }
        } else {
            if (!formData.companyName || !formData.companyEmail || !formData.companyPhone) {
                return res.status(400).json({ error: 'Dados obrigatórios faltando' });
            }
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

// Rota para enviar email com anexos (LEGADO - mantida para compatibilidade)
app.post('/api/email/send', uploadMultiple.fields([
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
        const formData = JSON.parse(req.body.formData || '{}');
        const accountType = formData.accountType || 'PF';
        
        // Preparar anexos
        const attachments = [];
        const fileFields = accountType === 'PF'
            ? ['documentFront', 'documentBack', 'selfie', 'proofOfAddress']
            : ['articlesOfAssociation', 'cnpjCard', 'adminIdFront', 'adminIdBack', 'companyProofOfAddress', 'ecnpjCertificate'];
        
        fileFields.forEach(fieldId => {
            const file = req.files && req.files[fieldId] ? req.files[fieldId][0] : null;
            if (file) {
                attachments.push({
                    filename: file.originalname,
                    content: file.buffer,
                    contentType: file.mimetype
                });
                console.log(`📎 Anexo adicionado: ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`);
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
        console.log('✅ Email enviado para empresa:', emailResult.messageId);

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
        console.log('✅ Email de confirmação enviado para usuário:', userEmail);

        res.json({
            success: true,
            message: 'Emails enviados com sucesso!',
            attachmentsCount: attachments.length,
            emailId: emailResult.messageId
        });

    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        res.status(500).json({
            error: 'Erro ao enviar email',
            message: error.message
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

    // Adicionar dados específicos baseado no tipo
    if (accountType === 'PF') {
        if (formData.fullName) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Nome:</span><span style="color: #1a2744; font-size: 14px;">${formData.fullName}</span></td></tr>`;
        if (formData.cpf) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">CPF:</span><span style="color: #1a2744; font-size: 14px;">${formData.cpf}</span></td></tr>`;
        if (formData.email) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Email:</span><span style="color: #1a2744; font-size: 14px;">${formData.email}</span></td></tr>`;
        if (formData.phone) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Telefone:</span><span style="color: #1a2744; font-size: 14px;">${formData.phone}</span></td></tr>`;
    } else {
        if (formData.companyName) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Razão Social:</span><span style="color: #1a2744; font-size: 14px;">${formData.companyName}</span></td></tr>`;
        if (formData.cnpj) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">CNPJ:</span><span style="color: #1a2744; font-size: 14px;">${formData.cnpj}</span></td></tr>`;
        if (formData.companyEmail) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Email:</span><span style="color: #1a2744; font-size: 14px;">${formData.companyEmail}</span></td></tr>`;
        if (formData.companyPhone) html += `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 14px; font-weight: 600; display: inline-block; width: 180px;">Telefone:</span><span style="color: #1a2744; font-size: 14px;">${formData.companyPhone}</span></td></tr>`;
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

        console.log(`📤 Comprimindo imagem: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

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

        console.log(`✅ Compressão concluída: ${(compressedSize / 1024).toFixed(2)} KB`);

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
        console.error('❌ Erro ao comprimir imagem:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            message: error.message 
        });
    }
});

// Exportar app para Vercel (serverless)
module.exports = app;

// Iniciar servidor apenas se não estiver no Vercel
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Backend rodando na porta ${PORT}`);
        console.log(`📡 Health check: http://localhost:${PORT}/health`);
        console.log(`🔧 Tinify: http://localhost:${PORT}/api/tinify/compress`);
        console.log(`📧 Email: http://localhost:${PORT}/api/email/send`);
        
        if (!process.env.TINIFY_API_KEY) {
            console.warn('⚠️  TINIFY_API_KEY não configurada! Configure no arquivo .env');
        }
        
        if (!transporter) {
            console.warn('⚠️  Servidor de email não configurado! Configure EMAIL_HOST, EMAIL_USER e EMAIL_PASS no .env');
        }
    });
}

