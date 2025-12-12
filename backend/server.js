const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração CORS - permitir requisições do frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Em produção, especifique a URL do frontend
    credentials: true
}));

app.use(express.json());

// Configurar multer para upload de arquivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB máximo
    }
});

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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Tinify Proxy rodando na porta ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Endpoint: http://localhost:${PORT}/api/tinify/compress`);
    
    if (!process.env.TINIFY_API_KEY) {
        console.warn('⚠️  TINIFY_API_KEY não configurada! Configure no arquivo .env');
    }
});

