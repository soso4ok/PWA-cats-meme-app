'use strict';

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

const state = {
    isOnline: navigator.onLine,
    serviceWorkerRegistered: false,
    installPromptEvent: null
};

const elements = {
    memeGrid: document.getElementById('memeGrid'),
    modal: document.getElementById('memeModal'),
    modalImage: document.getElementById('modalImage'),
    modalCaption: document.getElementById('modalCaption'),
    modalClose: document.getElementById('modalClose'),
    offlineNotification: document.getElementById('offlineNotification'),
    installBtn: document.getElementById('installBtn'),
    heroInstallBtn: document.getElementById('heroInstallBtn'),
    pwaStatus: document.getElementById('pwaStatus'),
    navLinks: document.querySelectorAll('.nav-link')
};

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register(CONFIG.serviceWorkerPath);
            state.serviceWorkerRegistered = true;
            updatePWAStatus();

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    }
                });
            });

        } catch (error) {
            state.serviceWorkerRegistered = false;
            updatePWAStatus();
        }
    }
}

function setupInstallPrompt() {
    const showInstallButtons = () => {
        if (elements.installBtn) elements.installBtn.style.display = 'block';
        if (elements.heroInstallBtn) elements.heroInstallBtn.classList.remove('hidden');
    };

    const hideInstallButtons = () => {
        if (elements.installBtn) elements.installBtn.style.display = 'none';
        if (elements.heroInstallBtn) elements.heroInstallBtn.classList.add('hidden');
    };

    const showInstallInstructions = () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSamsung = /SamsungBrowser/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        let message = '';
        if (isIOS) {
            message = 'To install: Tap the Share button (square with arrow) then "Add to Home Screen"';
        } else if (isSamsung || isAndroid) {
            message = 'To install: Open browser menu (⋮) and tap "Add to Home Screen" or "Install app"';
        } else {
            message = 'To install: Click the install icon in your browser address bar or use the browser menu';
        }

        alert(message);
    };

    const handleInstallClick = async () => {
        if (state.installPromptEvent) {
            state.installPromptEvent.prompt();
            const { outcome } = await state.installPromptEvent.userChoice;
            state.installPromptEvent = null;
            if (outcome === 'accepted') {
                hideInstallButtons();
            }
        } else {
            showInstallInstructions();
        }
    };

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        state.installPromptEvent = event;
    });

    showInstallButtons();

    if (elements.installBtn) {
        elements.installBtn.addEventListener('click', handleInstallClick);
    }

    if (elements.heroInstallBtn) {
        elements.heroInstallBtn.addEventListener('click', handleInstallClick);
    }

    window.addEventListener('appinstalled', () => {
        state.installPromptEvent = null;
        hideInstallButtons();
    });

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        hideInstallButtons();
    }
}

function setupNetworkDetection() {
    const updateOnlineStatus = () => {
        state.isOnline = navigator.onLine;

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

function renderMemeGrid() {
    elements.memeGrid.innerHTML = '';

    CONFIG.memes.forEach((meme, index) => {
        const card = document.createElement('div');
        card.className = 'meme-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.dataset.memeId = meme.id;

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

function openMemeModal(meme, gradient) {
    elements.modalImage.style.display = 'none';

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

function setupNavigation() {
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            elements.navLinks.forEach(l => l.classList.remove('active'));
            event.target.classList.add('active');
        });
    });

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

window.addEventListener('load', async () => {
    await registerServiceWorker();

    setupInstallPrompt();
    setupNetworkDetection();
    setupModal();
    setupNavigation();

    renderMemeGrid();
});

window.catMemesPWA = {
    state,
    CONFIG,
    registerServiceWorker
};
