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

// Form submission handler
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userEmail = document.getElementById('userEmail').value;
        const fullName = document.getElementById('fullName').value;
        const userPhone = document.getElementById('userPhone').value;
        const transactionObjective = document.getElementById('transactionObjective').value;
        
        // Show loading message
        showMessage('Enviando formulário...', 'loading');
        
        // Disable submit button
        const submitBtn = registerForm.querySelector('button[type="submit"]');
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
            // Template parameters for EmailJS - Email to Nova Solidum (empresa)
            const companyTemplateParams = {
                to_email: 'novasolidum@gmail.com',
                from_email: userEmail,
                from_name: fullName,
                user_email: userEmail,
                user_name: fullName,
                user_phone: userPhone,
                transaction_objective: transactionObjective,
                reply_to: userEmail,
                subject: 'Novo Registro - Nova Solidum Finances'
            };
            
            // Template parameters for EmailJS - Confirmation email to user
            const userTemplateParams = {
                to_email: userEmail,
                to_name: fullName,
                user_name: fullName,
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

