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

// Button click handlers
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', (e) => {
        // You can add your logic here for login/register
        console.log('Button clicked:', e.target.textContent);
        // Example: window.location.href = '/login';
    });
});

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

