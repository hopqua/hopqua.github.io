const GTAG_ID = 'G-BLMNQ4FRDJ';

function runWhenIdle(callback, timeoutMs = 2500) {
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(callback, { timeout: timeoutMs });
        return;
    }
    window.addEventListener('load', () => setTimeout(callback, 800), { once: true });
}

function loadDeferredGtag() {
    runWhenIdle(() => {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GTAG_ID);

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`;
        document.head.appendChild(script);
    }, 3500);
}

function observeWhenNear(element, callback, rootMargin = '300px 0px') {
    if (!element || typeof callback !== 'function') return;

    if (!('IntersectionObserver' in window)) {
        callback();
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                callback();
            });
        },
        { rootMargin }
    );

    observer.observe(element);
}
