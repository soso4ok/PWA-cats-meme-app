/**
 * Main JavaScript for Cat Memes PWA
 * Handles Service Worker registration, UI interactions, and meme loading
 */

'use strict';

// =============================================
// Configuration
// =============================================
const CONFIG = {
    serviceWorkerPath: '/sw.js',
    memes: [
        {
            id: 1,
            title: 'Grumpy Cat',
            caption: 'I had fun once. It was awful.',
            emoji: '😾'
        },
        {
            id: 2,
            title: 'Ceiling Cat',
            caption: 'Ceiling Cat is watching you...',
            emoji: '🙀'
        },
        {
            id: 3,
            title: 'Keyboard Cat',
            caption: 'Play him off, Keyboard Cat!',
            emoji: '🎹'
        },
        {
            id: 4,
            title: 'Nyan Cat',
            caption: 'Nyan nyan nyan nyan~',
            emoji: '🌈'
        },
        {
            id: 5,
            title: 'Business Cat',
            caption: 'We need to talk about your TPS reports...',
            emoji: '💼'
        },
        {
            id: 6,
            title: 'Surprised Cat',
            caption: 'What do you mean there\'s no more tuna?!',
            emoji: '😱'
        },
        {
            id: 7,
            title: 'Sleepy Cat',
            caption: 'Five more minutes... or hours.',
            emoji: '😴'
        },
        {
            id: 8,
            title: 'Detective Cat',
            caption: 'The case of the missing treats.',
            emoji: '🔍'
        }
    ]
};

// =============================================
// App State
// =============================================
const state = {
    isOnline: navigator.onLine,
    serviceWorkerRegistered: false,
    installPromptEvent: null
};

// =============================================
// DOM Elements
// =============================================
const elements = {
    memeGrid: document.getElementById('memeGrid'),
    modal: document.getElementById('memeModal'),
    modalImage: document.getElementById('modalImage'),
    modalCaption: document.getElementById('modalCaption'),
    modalClose: document.getElementById('modalClose'),
    offlineNotification: document.getElementById('offlineNotification'),
    installBtn: document.getElementById('installBtn'),
    pwaStatus: document.getElementById('pwaStatus'),
    navLinks: document.querySelectorAll('.nav-link')
};

// =============================================
// Service Worker Registration
// =============================================
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register(CONFIG.serviceWorkerPath);
            console.log('Service Worker registered successfully:', registration.scope);
            state.serviceWorkerRegistered = true;
            updatePWAStatus();

            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('New Service Worker found, installing...');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('New content available, refresh to update.');
                        // Could show update notification here
                    }
                });
            });

        } catch (error) {
            console.error('Service Worker registration failed:', error);
            state.serviceWorkerRegistered = false;
            updatePWAStatus();
        }
    } else {
        console.warn('Service Workers not supported in this browser');
    }
}

// =============================================
// PWA Install Prompt
// =============================================
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
        console.log('Install prompt available');
        event.preventDefault();
        state.installPromptEvent = event;
        elements.installBtn.style.display = 'block';
    });

    elements.installBtn.addEventListener('click', async () => {
        if (state.installPromptEvent) {
            state.installPromptEvent.prompt();
            const { outcome } = await state.installPromptEvent.userChoice;
            console.log(`Install prompt outcome: ${outcome}`);
            state.installPromptEvent = null;
            elements.installBtn.style.display = 'none';
        }
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        state.installPromptEvent = null;
        elements.installBtn.style.display = 'none';
    });
}

// =============================================
// Online/Offline Detection
// =============================================
function setupNetworkDetection() {
    const updateOnlineStatus = () => {
        state.isOnline = navigator.onLine;
        console.log(`Network status: ${state.isOnline ? 'online' : 'offline'}`);

        if (state.isOnline) {
            elements.offlineNotification.classList.remove('visible');
        } else {
            elements.offlineNotification.classList.add('visible');
        }

        updatePWAStatus();
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
}

// =============================================
// PWA Status Display
// =============================================
function updatePWAStatus() {
    const indicator = elements.pwaStatus.querySelector('.status-indicator');
    const text = elements.pwaStatus.querySelector('.status-text');

    if (state.isOnline) {
        indicator.className = 'status-indicator online';
        text.textContent = state.serviceWorkerRegistered
            ? 'Online - PWA Ready'
            : 'Online - Loading...';
    } else {
        indicator.className = 'status-indicator offline';
        text.textContent = 'Offline - Using cached content';
    }
}

// =============================================
// Meme Gallery
// =============================================
function renderMemeGrid() {
    elements.memeGrid.innerHTML = '';

    CONFIG.memes.forEach((meme, index) => {
        const card = document.createElement('div');
        card.className = 'meme-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.dataset.memeId = meme.id;

        // Create a colorful placeholder with emoji
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        ];

        card.innerHTML = `
            <div class="meme-image-placeholder" style="
                height: 250px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: ${colors[index % colors.length]};
                font-size: 5rem;
            ">
                ${meme.emoji}
            </div>
            <div class="meme-info">
                <h3 class="meme-title">${meme.title}</h3>
                <p class="meme-caption">${meme.caption}</p>
            </div>
        `;

        card.addEventListener('click', () => openMemeModal(meme, colors[index % colors.length]));
        elements.memeGrid.appendChild(card);
    });
}

// =============================================
// Modal Functions
// =============================================
function openMemeModal(meme, gradient) {
    // Create a larger version of the emoji placeholder
    elements.modalImage.style.display = 'none';

    // Create emoji display element if not exists
    let emojiDisplay = elements.modal.querySelector('.modal-emoji');
    if (!emojiDisplay) {
        emojiDisplay = document.createElement('div');
        emojiDisplay.className = 'modal-emoji';
        emojiDisplay.style.cssText = `
            font-size: 10rem;
            padding: 3rem;
            background: ${gradient};
            border-radius: 20px;
            display: inline-block;
        `;
        elements.modalImage.parentNode.insertBefore(emojiDisplay, elements.modalImage);
    }

    emojiDisplay.textContent = meme.emoji;
    emojiDisplay.style.background = gradient;
    emojiDisplay.style.display = 'inline-block';

    elements.modalCaption.textContent = `${meme.title}: "${meme.caption}"`;
    elements.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMemeModal() {
    elements.modal.classList.remove('active');
    document.body.style.overflow = '';
}

function setupModal() {
    elements.modalClose.addEventListener('click', closeMemeModal);
    elements.modal.addEventListener('click', (event) => {
        if (event.target === elements.modal) {
            closeMemeModal();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && elements.modal.classList.contains('active')) {
            closeMemeModal();
        }
    });
}

// =============================================
// Navigation
// =============================================
function setupNavigation() {
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            elements.navLinks.forEach(l => l.classList.remove('active'));
            event.target.classList.add('active');
        });
    });

    // Update active nav on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                elements.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// =============================================
// Initialization
// =============================================
window.addEventListener('load', async () => {
    console.log('Cat Memes PWA initializing...');

    // Register Service Worker
    await registerServiceWorker();

    // Setup features
    setupInstallPrompt();
    setupNetworkDetection();
    setupModal();
    setupNavigation();

    // Render content
    renderMemeGrid();

    console.log('Cat Memes PWA initialized successfully!');
});

// =============================================
// Expose for debugging
// =============================================
window.catMemesPWA = {
    state,
    CONFIG,
    registerServiceWorker
};
