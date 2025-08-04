document.addEventListener('DOMContentLoaded', function() {
    function setupHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        if (!hamburger || !navLinks) return; // Exit if elements are not found

        hamburger.addEventListener('click', () => {
            const isOpened = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpened);
        });

        // Smooth page transition for mobile menu links
        document.querySelectorAll('.nav-link a').forEach(link => {
            link.addEventListener('click', (event) => {
                if (navLinks.classList.contains('active')) {
                    event.preventDefault();
                    const destination = link.href;

                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    
                    setTimeout(() => {
                        window.location.href = destination;
                    }, 300);
                }
            });
        });
    }
    function setupScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        if (revealElements.length === 0) return; 

        const revealObserverOptions = {
            root: null,
            threshold: 0.1,
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); 
                }
            });
        }, revealObserverOptions);

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }
    function setupApplicationModal() {
        const modal = document.getElementById('applicationModal');
        const openBtn = document.getElementById('applyNowBtn');
        const closeBtn = document.querySelector('.modal-close-btn');

        if (!modal || !openBtn || !closeBtn) return; // Exit if elements are not found

        const openModal = (e) => {
            e.preventDefault();
            modal.classList.add('show');
        };

        const closeModal = () => {
            modal.classList.remove('show');
        };
        openBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });
    }
    setupHamburgerMenu();
    setupScrollReveal();
    setupApplicationModal();

});