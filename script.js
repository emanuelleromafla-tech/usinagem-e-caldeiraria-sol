document.addEventListener('DOMContentLoaded', () => {
    // 1. GERENCIAMENTO DE TEMA (DARK MODE)
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        trackEvent('Engagement', 'Theme_Change', newTheme);
    });

    // 2. HEADER GLASSMORPHISM AO ROLAR
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // 3. MENU MOBILE
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    mobileMenuBtn.addEventListener('click', () => {
        const isActive = mobileNav.classList.toggle('active');
        mobileMenuBtn.textContent = isActive ? '✕' : '☰';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
        });
    });

    // 4. RASTREAMENTO DE UTMs E ATUALIZAÇÃO DE LINKS WHATSAPP
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {
        source: urlParams.get('utm_source') || 'direto',
        medium: urlParams.get('utm_medium') || 'organico',
        campaign: urlParams.get('utm_campaign') || 'sem_campanha'
    };

    if (urlParams.has('utm_source')) {
        localStorage.setItem('utm_data', JSON.stringify(utmData));
    }

    function getUtmData() {
        const stored = localStorage.getItem('utm_data');
        return stored ? JSON.parse(stored) : utmData;
    }

    function updateWhatsAppLinks() {
        const data = getUtmData();
        const baseMessage = `Olá! Vim pelo ${data.source} (Campanha: ${data.campaign}) e gostaria de mais informações sobre os serviços de usinagem/caldeiraria.`;
        const encodedMessage = encodeURIComponent(baseMessage);
        const waUrl = `https://wa.me/5511999978888?text=${encodedMessage}`;
        
        // Atualiza TODOS os links do WhatsApp na página (Hero, Sticky Bar e o NOVO Botão Flutuante)
        document.querySelectorAll('a[href*="wa.me/5511999978888"]').forEach(link => {
            link.href = waUrl;
        });
    }
    updateWhatsAppLinks();

    // 5. SISTEMA DE COOKIES (LGPD) E TRACKING SEGURO
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => cookieBanner.classList.add('show'), 1000);
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        cookieBanner.classList.remove('show');
        trackEvent('Compliance', 'Cookie_Consent', 'Accepted');
    });

    window.trackEvent = function(category, action, label) {
        const hasConsent = localStorage.getItem('cookieConsent') === 'true';
        if (!hasConsent) return; 
        console.log(`[TRACKING] ${category} | ${action} | ${label}`);
        // Descomente as linhas abaixo quando configurar GTM/GA4/Meta
        // if (typeof gtag !== 'undefined') gtag('event', action, { 'event_category': category, 'event_label': label });
        // if (typeof fbq !== 'undefined') fbq('trackCustom', action, { category: category, label: label });
    };

    // 6. FAQ ACCORDION ANIMADO
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            const content = header.nextElementSibling;
            
            document.querySelectorAll('.accordion-header').forEach(h => {
                h.setAttribute('aria-expanded', 'false');
                h.nextElementSibling.style.maxHeight = null;
            });

            if (!isExpanded) {
                header.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // 7. FORMULÁRIO INTELIGENTE (SEM BACKEND)
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalWaLink = document.getElementById('modal-wa-link');
    const modalEmailLink = document.getElementById('modal-email-link');

    // Rascunho automático seguro
    contactForm.querySelectorAll('input, textarea').forEach(input => {
        const savedValue = localStorage.getItem(`form_draft_${input.name}`);
        if (savedValue) input.value = savedValue;
        input.addEventListener('input', () => localStorage.setItem(`form_draft_${input.name}`, input.value));
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        const utm = getUtmData();

        contactForm.querySelectorAll('input, textarea').forEach(input => localStorage.removeItem(`form_draft_${input.name}`));

        const waText = encodeURIComponent(`Olá, meu nome é ${name}. Meu telefone é ${phone}.\n\nDetalhes: ${message}\n\n(Origem: ${utm.source})`);
        const emailSubject = encodeURIComponent(`Orçamento - ${name}`);
        const emailBody = encodeURIComponent(`Nome: ${name}\nTelefone: ${phone}\n\nMensagem:\n${message}\n\nOrigem: ${utm.source}`);

        modalWaLink.href = `https://wa.me/5511999978888?text=${waText}`;
        modalEmailLink.href = `mailto:usicalsol@gmail.com?subject=${emailSubject}&body=${emailBody}`;

        successModal.classList.add('active');
        trackEvent('Conversion', 'Form_Submit', 'Contact_Form');
    });

    closeModalBtn.addEventListener('click', () => successModal.classList.remove('active'));
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.classList.remove('active');
    });
});