// ============================================
// DELIVERY LINK CONFIGURATION
// ============================================
// ⚠️ IMPORTANT: Configure the real link of your product/content below
// The link will be displayed in the success modal after payment is approved
const DELIVERY_CONFIG = {
    // Default link for all plans
    // ⚠️ CHANGE THIS LINK to your real delivery link
    defaultLink: 'https://www.example.com/seu-conteudo',
    
    // Or different links per plan (optional)
    planLinks: {
        'Monthly': 'https://www.example.com/mensal',
        'Quarterly': 'https://www.example.com/trimestral',
        'Annual': 'https://www.example.com/anual'
    },
    
    // Use plan-specific links? (true/false)
    usePlanSpecificLinks: false
};

// Toggle de pacotes de assinatura
document.addEventListener('DOMContentLoaded', function() {
    const packageToggle = document.querySelector('.package-toggle');
    const packagesList = document.querySelector('.packages-list');
    
    if (packageToggle && packagesList) {
        // Inicialmente mostrar os pacotes
        let isOpen = true;
        
        packageToggle.addEventListener('click', function() {
            isOpen = !isOpen;
            
            if (isOpen) {
                packagesList.style.display = 'flex';
                packageToggle.querySelector('i').className = 'fas fa-chevron-up';
            } else {
                packagesList.style.display = 'none';
                packageToggle.querySelector('i').className = 'fas fa-chevron-down';
            }
        });
    }
    
    // Adicionar animação suave ao scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Sistema de Tabs (POSTAGENS / MÍDIA)
    const tabs = document.querySelectorAll('.tab');
    const postsContent = document.getElementById('postsContent');
    const mediaContent = document.getElementById('mediaContent');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            // Remove active de todas as tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Adiciona active na tab clicada
            this.classList.add('active');
            
            // Alterna o conteúdo
            if (index === 0) {
                // Tab POSTAGENS
                postsContent.classList.remove('hidden');
                mediaContent.classList.add('hidden');
            } else {
                // Tab MÍDIA
                postsContent.classList.add('hidden');
                mediaContent.classList.remove('hidden');
            }
        });
    });
    
    // Autoplay de vídeos na grade ao passar o mouse
    const mediaItems = document.querySelectorAll('.media-item');
    mediaItems.forEach(item => {
        const video = item.querySelector('video');
        
        if (video) {
            // Play on hover
            item.addEventListener('mouseenter', () => {
                video.play().catch(err => console.log('Error playing:', err));
            });
            
            // Pause ao tirar o mouse
            item.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0; // Volta ao início
            });
        }
    });
    
    // Animação de entrada para elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Aplicar animação aos cards
    const animatedElements = document.querySelectorAll('.subscription-section, .locked-content, .subscription-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
    
    // Adicionar efeito de ripple nos botões
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Adicionar contador de likes animado
    const likeCount = document.querySelector('.profile-header-stats .stat-item:last-child');
    if (likeCount) {
        let count = 0;
        const target = 193100;
        const duration = 2000;
        const increment = target / (duration / 16);
        
        const updateCount = () => {
            count += increment;
            if (count < target) {
                const formatted = (count / 1000).toFixed(1) + 'K';
                requestAnimationFrame(updateCount);
            } else {
                const formatted = '193.1K';
            }
        };
        
        // Comentado para não sobrescrever o HTML
        // updateCount();
    }
    
    // Adicionar efeito parallax no banner
    const banner = document.querySelector('.profile-banner img');
    if (banner) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            banner.style.transform = `translate3d(0, ${rate}px, 0)`;
        });
    }

    // Lógica para "See more" na descrição do perfil
    const profileDesc = document.getElementById('profileDescription');
    const seeMoreBtn = document.getElementById('seeMoreBtn');

    if (profileDesc && seeMoreBtn) {
        // Função para verificar se há estouro de conteúdo
        const checkOverflow = () => {
            const isOverflowing = profileDesc.scrollHeight > 100;
            if (isOverflowing) {
                seeMoreBtn.style.display = 'block';
            } else {
                seeMoreBtn.style.display = 'none';
            }
        };

        // Verifica inicialmente
        checkOverflow();
        
        // Verifica novamente após o carregamento completo das fontes/imagens
        window.addEventListener('load', checkOverflow);

        seeMoreBtn.addEventListener('click', function() {
            const isExpanded = profileDesc.classList.toggle('expanded');
            seeMoreBtn.textContent = isExpanded ? 'See less' : 'See more';
            
            if (!isExpanded) {
                // Scroll suave para o topo da descrição ao fechar
                const headerOffset = 100;
                const elementPosition = profileDesc.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Notificações toast (exemplo)
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, var(--primary-blue), #0095d4);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
            z-index: 10000;
            animation: slideUp 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Adicionar CSS para ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes slideUp {
            from {
                transform: translate(-50%, 100px);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
        
        @keyframes slideDown {
            from {
                transform: translate(-50%, 0);
                opacity: 1;
            }
            to {
                transform: translate(-50%, 100px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    
    // Sistema de favoritos
    const starBtns = document.querySelectorAll('.icon-btn .fa-star');
    starBtns.forEach(btn => {
        btn.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            if (btn.classList.contains('far')) {
                btn.classList.remove('far');
                btn.classList.add('fas');
                btn.style.color = '#FFD700';
                showToast('Added to favorites! ⭐');
            } else {
                btn.classList.remove('fas');
                btn.classList.add('far');
                btn.style.color = '';
                showToast('Removed from favorites');
            }
        });
    });
    
    // Sistema de desbloqueio de conteúdo
    const unlockBtn = document.getElementById('unlockBtn');
    const lockOverlay = document.getElementById('lockOverlay');
    const previewVideo = document.getElementById('previewVideo');
    
    // Garante que o vídeo carregue e comece a tocar
    const videoElement = document.querySelector('.preview-video video');
    if (videoElement) {
        videoElement.load();
        
        // Tenta dar play automaticamente
        videoElement.play().catch(err => {
            console.log('Autoplay bloqueado, aguardando interação:', err);
        });
        
        // Play ao passar o mouse (hover)
        const lockedContent = document.getElementById('lockedContent');
        if (lockedContent) {
            lockedContent.addEventListener('mouseenter', () => {
                videoElement.play().catch(err => console.log('Erro ao dar play:', err));
            });
        }
        
        // Play ao clicar em qualquer lugar da área
        if (lockedContent) {
            lockedContent.addEventListener('click', () => {
                if (videoElement.paused) {
                    videoElement.play();
                }
            });
        }
        
        // Debug: verifica se o vídeo está carregando
        videoElement.addEventListener('loadeddata', () => {
            console.log('Vídeo carregado com sucesso!');
            // Força o play quando carregar
            videoElement.play().catch(() => {});
        });
        
        videoElement.addEventListener('error', (e) => {
            console.error('Erro ao carregar vídeo:', e);
        });
        
        videoElement.addEventListener('playing', () => {
            console.log('Vídeo está tocando!');
        });
    }
    
    if (unlockBtn && lockOverlay && previewVideo) {
        // Unlocking is handled after successful payment confirmation
        // unlockBtn.addEventListener('click', function() {
        //     ...
        // });
    }
    
    // Also add functionality to subscription buttons
    // Unlocking is handled after successful payment confirmation
    // const subscribeBtns = document.querySelectorAll('.subscribe-btn, .subscribe-btn-small');
    // subscribeBtns.forEach(btn => {
    //     ...
    // });
});

// Função para formatar números
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Atualizar contadores dinamicamente
function updateStats() {
    const stats = {
        photos: 388,
        videos: 67,
        streams: 33,
        likes: 193100
    };
    
    // Aqui você pode adicionar lógica para atualizar dinamicamente
}

// Listener para o botão de voltar
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
    backBtn.addEventListener('click', function() {
        window.history.back();
    });
}

// Help button listener
const helpBtn = document.querySelector('.help-btn');
if (helpBtn) {
    helpBtn.addEventListener('click', function() {
        alert('How can we help you?');
    });
}

// ============================================
// SISTEMA DE PAGAMENTO PAYPAL + BACKEND
// ============================================

// URL do backend API
const API_URL = window.location.origin + '/api';

// Check if user has already paid when loading the page
async function checkPaymentStatus() {
    // Check for saved email
    const savedEmail = localStorage.getItem('user_email');
    
    if (savedEmail) {
        try {
            const response = await fetch(`${API_URL}/subscription-status/${encodeURIComponent(savedEmail)}`);
            if (!response.ok) throw new Error('Failed to fetch status');
            const data = await response.json();
            
            if (data.success && data.hasActiveSubscription) {
                // Subscription confirmed by webhook - unlock everything
                unlockAllContent();
                showPaymentStatus(data.subscription);
                return;
            }
        } catch (error) {
            console.error('Error checking status:', error);
        }
    }
    
    // Fallback: check old localStorage (if webhook hasn't processed yet)
    const hasPaid = localStorage.getItem('subscription_active');
    if (hasPaid === 'true') {
        unlockAllContent();
        showPaymentStatus(null);
        
        // Try checking again after a few seconds (in case webhook is processing)
        const savedEmail = localStorage.getItem('user_email');
        if (savedEmail) {
            setTimeout(async () => {
                await checkPaymentStatus();
            }, 5000);
        }
    }
}

// Unlock all content
function unlockAllContent() {
    // Remove blur from central video
    const previewVideo = document.getElementById('previewVideo');
    if (previewVideo) {
        previewVideo.classList.remove('blurred');
    }
    
    // Hide block overlay
    const lockOverlay = document.getElementById('lockOverlay');
    if (lockOverlay) {
        lockOverlay.style.display = 'none';
    }
    
    // Remove blur from all media grid items
    const mediaItems = document.querySelectorAll('.media-item');
    mediaItems.forEach(item => {
        item.classList.remove('blurred');
        const overlay = item.querySelector('.media-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    });
    
    // Allow video playback
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.controls = true;
    });
}

// Show confirmed payment status
function showPaymentStatus(subscription) {
    const subscriptionSection = document.querySelector('.subscription-section');
    if (subscriptionSection) {
        let expiresInfo = '';
        if (subscription && subscription.expires_at) {
            const expiresDate = new Date(subscription.expires_at);
            expiresInfo = `<p>Expires on: ${expiresDate.toLocaleDateString('en-US')}</p>`;
        }
        
        const statusHTML = `
            <div class="payment-status">
                <h4>✓ Active Subscription</h4>
                <p>You have full access to the content</p>
                ${expiresInfo}
            </div>
        `;
        subscriptionSection.innerHTML = statusHTML;
    }
    
    // Also update sidebar
    const subscriptionCard = document.querySelector('.subscription-card');
    if (subscriptionCard) {
        const statusHTML = `
            <h3>SUBSCRIPTION</h3>
            <div class="payment-status">
                <h4>✓ Active Subscription</h4>
                <p>Full access</p>
            </div>
        `;
        subscriptionCard.innerHTML = statusHTML;
    }
}

// Process approved payment
async function handlePaymentApproved(details, planName, planPrice, email) {
    console.log('Payment approved:', details);
    
    // Save user email
    localStorage.setItem('user_email', email);
    localStorage.setItem('subscription_active', 'true'); // Fallback
    
    // Unlock content immediately (optimistic)
    unlockAllContent();
    
    // Show success message
    showPaymentStatus(null);
    
    // Show success modal with delivery link
    showSuccessModal(planName, planPrice, email);
    
    // Polling to check if webhook processed the payment
    // The webhook may take a few seconds to update the status
    let attempts = 0;
    const maxAttempts = 10; // 10 attempts = ~20 seconds
    
    const checkWebhookStatus = setInterval(async () => {
        attempts++;
        
        try {
            const response = await fetch(`${API_URL}/subscription-status/${encodeURIComponent(email)}`);
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.hasActiveSubscription) {
                    // Webhook processed! Update full status
                    clearInterval(checkWebhookStatus);
                    showPaymentStatus(data.subscription);
                    console.log('✅ Webhook confirmed - Subscription active on backend');
                }
            }
            
            if (attempts >= maxAttempts) {
                // Timeout - stop polling
                clearInterval(checkWebhookStatus);
                console.warn('⚠️ Webhook not confirmed after 20 seconds, but payment was approved');
            }
        } catch (error) {
            console.error('Error checking webhook status:', error);
            if (attempts >= maxAttempts) {
                clearInterval(checkWebhookStatus);
            }
        }
    }, 2000); // Check every 2 seconds
}

// Show success modal after payment
function showSuccessModal(planName, planPrice, email) {
    const modal = document.getElementById('successModal');
    const planDetails = document.getElementById('successPlanDetails');
    const deliveryLink = document.getElementById('deliveryLink');
    
    // Update plan details
    planDetails.textContent = `Plan ${planName} - $${planPrice}`;
    
    // Configure delivery link
    let linkUrl = DELIVERY_CONFIG.defaultLink;
    
    if (DELIVERY_CONFIG.usePlanSpecificLinks && DELIVERY_CONFIG.planLinks[planName]) {
        linkUrl = DELIVERY_CONFIG.planLinks[planName];
    }
    
    // Add email as parameter (optional - useful for tracking)
    const urlWithParams = new URL(linkUrl);
    urlWithParams.searchParams.set('email', email);
    urlWithParams.searchParams.set('plan', planName);
    
    deliveryLink.href = urlWithParams.toString();
    
    // Show modal
    modal.classList.add('active');
    
    // Close modal when clicking the button
    const closeBtn = document.getElementById('closeSuccess');
    closeBtn.onclick = function() {
        modal.classList.remove('active');
    };
    
    // Close when clicking outside
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    };
}

// Global variable to store current plan
let currentPaymentPlan = null;

// Open payment modal
function openPaymentModal(planName, planPrice, planDescription) {
    const modal = document.getElementById('paymentModal');
    const planInfo = document.getElementById('paymentPlanInfo');
    const container = document.getElementById('paypal-button-container');
    const emailInput = document.getElementById('payerEmail');
    
    // Update plan information
    planInfo.textContent = `${planDescription} - $${planPrice}`;
    
    // Pre-fill email if already saved
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
        emailInput.value = savedEmail;
    }
    
    // Show modal FIRST (to avoid popup blocker due to hidden element)
    modal.classList.add('active');
    
    // Clear previous container
    container.innerHTML = '';
    
    // Check if PayPal SDK is loaded
    if (typeof paypal === 'undefined') {
        alert('Error loading PayPal. Please reload the page.');
        return;
    }
    
    // Small delay to ensure the modal is visible and ready
    setTimeout(() => {
        // Render PayPal button
        paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'pay',
                height: 50
            },
            createOrder: function(data, actions) {
                // Validate email
                const email = emailInput.value.trim();
                if (!email || !email.includes('@')) {
                    alert('Please enter a valid email!');
                    return Promise.reject(new Error('Invalid email'));
                }
                
                // Return the fetch promise directly to PayPal
                // This is faster than using async/await and helps avoid the popup blocker
                return fetch(`${API_URL}/create-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        plan: planName,
                        amount: planPrice
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw new Error(err.error || 'Failed to create order'); });
                    }
                    return response.json();
                })
                .then(result => {
                    if (!result.success) {
                        throw new Error(result.error || 'Error creating order');
                    }
                    // Save email temporarily
                    localStorage.setItem('temp_email', email);
                    return result.orderId;
                })
                .catch(error => {
                    console.error('Error creating order:', error);
                    alert(error.message || 'Error creating payment. Please try again.');
                    throw error;
                });
            },
            onApprove: function(data, actions) {
                return fetch(`${API_URL}/capture-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderId: data.orderID
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw new Error(err.error || 'Failed to capture payment'); });
                    }
                    return response.json();
                })
                .then(result => {
                    if (!result.success) {
                        throw new Error(result.error || 'Error capturing payment');
                    }
                    
                    // Retrieve email
                    const email = localStorage.getItem('temp_email') || emailInput.value;
                    localStorage.removeItem('temp_email');
                    
                    // Close modal
                    closePaymentModal();
                    
                    // Process approval
                    return handlePaymentApproved(result.data, planName, planPrice, email);
                })
                .catch(error => {
                    console.error('Error approving payment:', error);
                    alert(error.message || 'Error processing payment. Please contact support.');
                });
            },
            onError: function(err) {
                console.error('Payment error:', err);
                
                // Better error message for the user
                let msg = 'Error processing payment. Please try again.';
                
                if (err.message) {
                    if (err.message.includes('popup_close')) {
                        return; // User just closed the popup, don't show alert
                    }
                    if (err.message.includes('ENETUNREACH')) {
                        msg = 'Server connection error. Please wait a moment and try again.';
                    }
                }
                
                alert(msg);
            },
            onCancel: function(data) {
                console.log('Payment canceled by user');
            }
        }).render('#paypal-button-container');
    }, 100);
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('active');
}

// Event listeners for subscription buttons
function initSubscriptionButtons() {
    // Monthly Button - Main
    const monthlyBtn = document.getElementById('subscribeMonthly');
    if (monthlyBtn) {
        monthlyBtn.addEventListener('click', function() {
            openPaymentModal('Monthly', '12.99', 'Monthly Subscription (31 days)');
        });
    }
    
    // Quarterly Button
    const quarterlyBtn = document.getElementById('subscribeQuarterly');
    if (quarterlyBtn) {
        quarterlyBtn.addEventListener('click', function() {
            openPaymentModal('Quarterly', '34.99', 'Quarterly Subscription (3 months)');
        });
    }
    
    // Yearly Button
    const yearlyBtn = document.getElementById('subscribeYearly');
    if (yearlyBtn) {
        yearlyBtn.addEventListener('click', function() {
            openPaymentModal('Annual', '59.90', 'Annual Subscription (12 months)');
        });
    }
    
    // Sidebar Button
    const sidebarBtn = document.getElementById('subscribeSidebar');
    if (sidebarBtn) {
        sidebarBtn.addEventListener('click', function() {
            openPaymentModal('Monthly', '12.99', 'Monthly Subscription (31 days)');
        });
    }
    
    // "SUBSCRIBE" button from locked area
    const unlockBtn = document.getElementById('unlockBtn');
    if (unlockBtn) {
        unlockBtn.addEventListener('click', function() {
            openPaymentModal('Monthly', '12.99', 'Monthly Subscription (31 days)');
        });
    }
    
    // Close modal button
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePaymentModal);
    }
    
    // Click outside modal to close
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePaymentModal();
            }
        });
    }
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePaymentModal();
        }
    });
}

// Initialize everything when the page loads
window.addEventListener('load', function() {
    checkPaymentStatus();
    initSubscriptionButtons();
});

// Debug helpers
console.log('🔧 Backend API:', API_URL);
console.log('💡 To reset (test): localStorage.clear()');

