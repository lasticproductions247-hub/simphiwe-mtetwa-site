window.tailwind = window.tailwind || {};
var tailwind = window.tailwind;

/* Webinar single-page routing */
(function () {
    function setRouteHash(hash) {
        if (window.location.hash !== hash) {
            history.pushState(null, '', hash);
        }
    }

    function hideSharedHomeSections() {
        const impactSection = document.getElementById('impactSection');
        const newsletterSection = document.querySelectorAll('.newsletter-section');
        const recentNewsSection = document.querySelectorAll('.footer-news-section');

        if (impactSection) impactSection.style.display = 'none';
        newsletterSection.forEach(section => section.style.display = 'none');
        recentNewsSection.forEach(section => section.style.display = 'none');
    }

    function hideRoutedPages() {
        document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(page => {
            page.style.display = 'none';
        });
    }

    window.showWebinarsPage = function () {
        const mainContent = document.querySelector('main');
        const webinarsPage = document.getElementById('page-webinars');
        const footers = document.querySelectorAll('.main-footer');

        setRouteHash('#page-webinars');
        hideRoutedPages();
        if (mainContent) mainContent.style.display = 'none';
        footers.forEach(footer => footer.style.display = 'block');
        hideSharedHomeSections();
        if (webinarsPage) webinarsPage.style.display = 'block';
        window.scrollTo(0, 0);
        document.title = 'CSI Webinars - Simphiwe Mtetwa';
    };

    window.showWebinarDetail = function (detailId) {
        const mainContent = document.querySelector('main');
        const detailPage = document.getElementById(detailId);
        const footers = document.querySelectorAll('.main-footer');

        setRouteHash('#' + detailId);
        hideRoutedPages();
        if (mainContent) mainContent.style.display = 'none';
        footers.forEach(footer => footer.style.display = 'block');
        hideSharedHomeSections();
        if (detailPage) detailPage.style.display = 'block';
        window.scrollTo(0, 0);
        document.title = detailId === 'webinar-01-detail'
            ? 'Webinar 01 - The Invisible Drivers of Inequality | CSI Indaba'
            : 'Webinar 02 - The Inequality Mandate in Focus | CSI Indaba';
    };

    function routeWebinarHash() {
        if (window.location.hash === '#page-webinars') {
            window.showWebinarsPage();
        } else if (window.location.hash === '#webinar-01-detail') {
            window.showWebinarDetail('webinar-01-detail');
        } else if (window.location.hash === '#webinar-02-detail') {
            window.showWebinarDetail('webinar-02-detail');
        }
    }

    window.addEventListener('hashchange', routeWebinarHash);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', routeWebinarHash);
    } else {
        routeWebinarHash();
    }
    setTimeout(routeWebinarHash, 0);
    setTimeout(routeWebinarHash, 500);
    setTimeout(routeWebinarHash, 1500);
    setTimeout(routeWebinarHash, 3000);
    setTimeout(routeWebinarHash, 6000);
    setTimeout(routeWebinarHash, 10000);
    setTimeout(routeWebinarHash, 15000);
})();

/* Auto Insights grids */
(function () {
    'use strict';

    const grids = document.querySelectorAll('[data-insights-endpoint]');

    if (!grids.length) return;

    function addPlaceholder(thumb, title) {
        const placeholder = document.createElement('div');
        placeholder.className = 'insight-card-image-placeholder';
        placeholder.setAttribute('aria-label', `${title} has no image`);

        const mark = document.createElement('span');
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = 'SM';
        placeholder.appendChild(mark);
        thumb.prepend(placeholder);
    }

    function createCard(item) {
        const title = item.title || 'Untitled Insight';
        const card = document.createElement('a');
        card.className = 'podcast-card-v3 insight-card-live';
        card.href = item.url;
        card.setAttribute('aria-label', `${title} — read Insight`);

        const thumb = document.createElement('div');
        thumb.className = 'thumb-wrap';

        if (item.image) {
            const image = document.createElement('img');
            image.src = item.image;
            image.alt = title;
            image.loading = 'lazy';
            image.decoding = 'async';
            image.addEventListener('error', function () {
                image.remove();
                addPlaceholder(thumb, title);
            }, { once: true });
            thumb.appendChild(image);
        } else {
            addPlaceholder(thumb, title);
        }

        const type = document.createElement('div');
        type.className = 'type-tag';
        type.textContent = item.type || 'Insight';
        thumb.appendChild(type);

        const heading = document.createElement('h4');
        heading.textContent = title;

        const excerpt = document.createElement('p');
        excerpt.textContent = item.excerpt || 'Read the latest perspective from Simphiwe Mtetwa.';

        const readLink = document.createElement('div');
        readLink.className = 'animated-line-link insight-card-read-link';
        readLink.append('Read Insight ');

        const arrow = document.createElement('i');
        arrow.className = 'fas fa-arrow-right';
        arrow.setAttribute('aria-hidden', 'true');
        readLink.appendChild(arrow);

        const date = document.createElement('span');
        date.className = 'date-tag';
        date.textContent = item.date || '';

        card.append(thumb, heading, excerpt, readLink, date);
        return card;
    }

    function showLoading(grid) {
        const fragment = document.createDocumentFragment();
        const skeletonCount = Number.parseInt(grid.dataset.insightsSkeletons, 10) || 6;

        for (let index = 0; index < skeletonCount; index += 1) {
            const skeleton = document.createElement('div');
            skeleton.className = 'podcast-card-v3 insight-card-skeleton';
            skeleton.setAttribute('aria-hidden', 'true');
            skeleton.innerHTML = '<div class="thumb-wrap"></div><span></span><span></span><span></span>';
            fragment.appendChild(skeleton);
        }

        grid.replaceChildren(fragment);
        grid.setAttribute('aria-busy', 'true');
    }

    function showMessage(grid, message, canRetry) {
        const status = document.createElement('div');
        status.className = 'insights-grid-status';

        const copy = document.createElement('p');
        copy.textContent = message;
        status.appendChild(copy);

        if (canRetry) {
            const retry = document.createElement('button');
            retry.type = 'button';
            retry.className = 'insights-grid-retry';
            retry.textContent = 'Try again';
            retry.addEventListener('click', function () {
                loadInsights(grid);
            });
            status.appendChild(retry);
        }

        grid.replaceChildren(status);
        grid.setAttribute('aria-busy', 'false');
    }

    function updateArticleCount(grid, count) {
        const countTargetId = grid.dataset.insightsCountTarget;
        const countTarget = countTargetId ? document.getElementById(countTargetId) : null;

        if (!countTarget) return;

        if (typeof count !== 'number') {
            countTarget.textContent = 'Articles unavailable';
            return;
        }

        countTarget.textContent = `${count} ${count === 1 ? 'Article' : 'Articles'}`;
    }

    async function loadInsights(grid) {
        const endpoint = grid.dataset.insightsEndpoint;

        if (!endpoint) {
            showMessage(grid, 'The Insights feed has not been configured.', false);
            updateArticleCount(grid, null);
            return;
        }

        showLoading(grid);

        try {
            const response = await fetch(endpoint, {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' }
            });

            if (!response.ok) throw new Error(`Insights request failed: ${response.status}`);

            const payload = await response.json();
            const items = Array.isArray(payload) ? payload : payload.items;

            if (!Array.isArray(items) || items.length === 0) {
                showMessage(grid, 'No Insights have been published yet.', false);
                updateArticleCount(grid, 0);
                return;
            }

            const fragment = document.createDocumentFragment();
            items.forEach(item => fragment.appendChild(createCard(item)));
            grid.replaceChildren(fragment);
            grid.setAttribute('aria-busy', 'false');
            updateArticleCount(grid, items.length);
        } catch (error) {
            console.error('Unable to load Auto Insights.', error);
            showMessage(grid, 'The latest Insights could not be loaded.', true);
            updateArticleCount(grid, null);
        }
    }

    grids.forEach(loadInsights);
})();

/* Inline script block 1 */
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "tertiary": "#000000",
                "primary-fixed-dim": "#c6c6c6",
                "surface-container-high": "#e8e8e8",
                "on-tertiary-container": "#848484",
                "on-secondary": "#ffffff",
                "surface": "#f9f9f9",
                "secondary-container": "#f5a632",
                "on-primary-container": "#848484",
                "surface-container-highest": "#e2e2e2",
                "inverse-primary": "#c6c6c6",
                "background": "#f9f9f9",
                "on-primary-fixed": "#1b1b1b",
                "inverse-surface": "#303030",
                "surface-variant": "#e2e2e2",
                "on-tertiary-fixed-variant": "#474747",
                "on-primary": "#ffffff",
                "surface-container-lowest": "#ffffff",
                "surface-bright": "#f9f9f9",
                "tertiary-fixed": "#e2e2e2",
                "on-error-container": "#93000a",
                "error": "#ba1a1a",
                "on-secondary-container": "#576c00",
                "tertiary-container": "#1b1b1b",
                "on-secondary-fixed-variant": "#3d4d00",
                "on-secondary-fixed": "#171e00",
                "primary-fixed": "#e2e2e2",
                "on-primary-fixed-variant": "#474747",
                "surface-container": "#eeeeee",
                "outline": "#7e7576",
                "on-error": "#ffffff",
                "secondary-fixed": "#f5a632",
                "primary-container": "#1b1b1b",
                "secondary-fixed-dim": "#add500",
                "surface-tint": "#5e5e5e",
                "on-background": "#1b1b1b",
                "outline-variant": "#cfc4c5",
                "on-surface": "#1b1b1b",
                "tertiary-fixed-dim": "#c6c6c6",
                "surface-dim": "#dadada",
                "secondary": "#f5a632",
                "on-tertiary-fixed": "#1b1b1b",
                "on-tertiary": "#ffffff",
                "inverse-on-surface": "#f1f1f1",
                "on-surface-variant": "#4c4546",
                "surface-container-low": "#f3f3f3",
                "error-container": "#ffdad6",
                "primary": "#000000",
                "navy-custom": "#011c3a",
                "crimson-custom": "#a11b2b"
            },
            "borderRadius": {
                "DEFAULT": "1rem",
                "lg": "2rem",
                "xl": "3rem",
                "full": "9999px"
            },
            "spacing": {
                "unit": "8px",
                "margin-mobile": "20px",
                "gutter": "24px",
                "container-max": "1280px",
                "margin-desktop": "64px"
            },
            "fontFamily": {
                "display-lg": ["Libre Caslon Text"],
                "headline-lg": ["Libre Caslon Text"],
                "headline-md": ["Libre Caslon Text"],
                "body-md": ["Hanken Grotesk"],
                "body-lg": ["Hanken Grotesk"],
                "label-md": ["Hanken Grotesk"],
                "label-lg": ["Hanken Grotesk"]
            }
        }
    }
}

/* Inline script block 2 */
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "tertiary": "#000000",
                "primary-fixed-dim": "#c6c6c6",
                "surface-container-high": "#e8e8e8",
                "on-tertiary-container": "#848484",
                "on-secondary": "#ffffff",
                "surface": "#f9f9f9",
                "secondary-container": "#f5a632",
                "on-primary-container": "#848484",
                "surface-container-highest": "#e2e2e2",
                "inverse-primary": "#c6c6c6",
                "background": "#f9f9f9",
                "on-primary-fixed": "#1b1b1b",
                "inverse-surface": "#303030",
                "surface-variant": "#e2e2e2",
                "on-tertiary-fixed-variant": "#474747",
                "on-primary": "#ffffff",
                "surface-container-lowest": "#ffffff",
                "surface-bright": "#f9f9f9",
                "tertiary-fixed": "#e2e2e2",
                "on-error-container": "#93000a",
                "error": "#ba1a1a",
                "on-secondary-container": "#576c00",
                "tertiary-container": "#1b1b1b",
                "on-secondary-fixed-variant": "#3d4d00",
                "on-secondary-fixed": "#171e00",
                "primary-fixed": "#e2e2e2",
                "on-primary-fixed-variant": "#474747",
                "surface-container": "#eeeeee",
                "outline": "#7e7576",
                "on-error": "#ffffff",
                "secondary-fixed": "#f5a632",
                "primary-container": "#1b1b1b",
                "secondary-fixed-dim": "#add500",
                "surface-tint": "#5e5e5e",
                "on-background": "#1b1b1b",
                "outline-variant": "#cfc4c5",
                "on-surface": "#1b1b1b",
                "tertiary-fixed-dim": "#c6c6c6",
                "surface-dim": "#dadada",
                "secondary": "#f5a632",
                "on-tertiary-fixed": "#1b1b1b",
                "on-tertiary": "#ffffff",
                "inverse-on-surface": "#f1f1f1",
                "on-surface-variant": "#4c4546",
                "surface-container-low": "#f3f3f3",
                "error-container": "#ffdad6",
                "primary": "#000000",
                "navy-custom": "#011c3a",
                "crimson-custom": "#a11b2b"
            },
            "borderRadius": {
                "DEFAULT": "1rem",
                "lg": "2rem",
                "xl": "3rem",
                "full": "9999px"
            },
            "spacing": {
                "unit": "8px",
                "margin-mobile": "20px",
                "gutter": "24px",
                "container-max": "1280px",
                "margin-desktop": "64px"
            },
            "fontFamily": {
                "display-lg": ["Libre Caslon Text"],
                "headline-lg": ["Libre Caslon Text"],
                "headline-md": ["Libre Caslon Text"],
                "body-md": ["Hanken Grotesk"],
                "body-lg": ["Hanken Grotesk"],
                "label-md": ["Hanken Grotesk"],
                "label-lg": ["Hanken Grotesk"]
            }
        }
    }
}

/* Inline script block 3 */
const spot2Slider = document.getElementById('spot2HeroSlider');
const spot2Slides = document.querySelectorAll('.spot2-hero-slide');
const spot2Dots = document.querySelectorAll('.spot2-slider-dot');
const spot2ProgressBar = document.getElementById('spot2ProgressBar');
const spot2CurrentSlideEl = document.getElementById('spot2CurrentSlide');
let spot2CurrentIndex = 0;
const spot2TotalSlides = spot2Slides.length;
const spot2AutoPlayDelay = 6000;
let spot2AutoPlayTimer;
let spot2ProgressTimer;
let spot2Progress = 0;
function spot2UpdateSlider() {
    spot2Slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === spot2CurrentIndex);
    });
    spot2Dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === spot2CurrentIndex);
    });
    spot2CurrentSlideEl.textContent = String(spot2CurrentIndex + 1).padStart(2, '0');
    spot2ResetProgress();
}
function spot2NextSlide() {
    spot2CurrentIndex = (spot2CurrentIndex + 1) % spot2TotalSlides;
    spot2UpdateSlider();
}
function spot2PrevSlide() {
    spot2CurrentIndex = (spot2CurrentIndex - 1 + spot2TotalSlides) % spot2TotalSlides;
    spot2UpdateSlider();
}
function spot2GoToSlide(index) {
    spot2CurrentIndex = index;
    spot2UpdateSlider();
    spot2ResetAutoPlay();
}
function spot2ResetProgress() {
    spot2Progress = 0;
    spot2ProgressBar.style.width = '0%';
    clearInterval(spot2ProgressTimer);
    spot2ProgressTimer = setInterval(() => {
        spot2Progress += 100 / (spot2AutoPlayDelay / 50);
        spot2ProgressBar.style.width = Math.min(spot2Progress, 100) + '%';
    }, 50);
}
function spot2ResetAutoPlay() {
    clearInterval(spot2AutoPlayTimer);
    spot2AutoPlayTimer = setInterval(spot2NextSlide, spot2AutoPlayDelay);
    spot2ResetProgress();
}
let spot2TouchStartX = 0;
let spot2TouchEndX = 0;
spot2Slider.addEventListener('touchstart', e => {
    spot2TouchStartX = e.changedTouches[0].screenX;
}, { passive: true });
spot2Slider.addEventListener('touchend', e => {
    spot2TouchEndX = e.changedTouches[0].screenX;
    const diff = spot2TouchStartX - spot2TouchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) spot2NextSlide();
        else spot2PrevSlide();
        spot2ResetAutoPlay();
    }
}, { passive: true });
document.addEventListener('keydown', function spot2HandleKeydown(e) {
    if (document.getElementById('page-spotlight2').style.display !== 'block') return;
    if (e.key === 'ArrowRight') { spot2NextSlide(); spot2ResetAutoPlay(); }
    if (e.key === 'ArrowLeft') { spot2PrevSlide(); spot2ResetAutoPlay(); }
});
spot2Slider.addEventListener('mouseenter', () => clearInterval(spot2AutoPlayTimer));
spot2Slider.addEventListener('mouseleave', spot2ResetAutoPlay);
spot2ResetAutoPlay();

/* Inline script block 4 */
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "tertiary-fixed": "#e1e3e4",
                "secondary": "#f5a632",
                "inverse-primary": "#c8c6c5",
                "surface-variant": "#e4e2e2",
                "surface-container": "#efeded",
                "on-tertiary": "#ffffff",
                "on-secondary-container": "#576c00",
                "surface": "#fbf9f8",
                "primary-container": "#1c1b1b",
                "on-background": "#1b1c1c",
                "tertiary": "#000000",
                "on-tertiary-container": "#828485",
                "surface-container-highest": "#e4e2e2",
                "on-tertiary-fixed-variant": "#454748",
                "on-primary": "#ffffff",
                "surface-container-low": "#f5f3f3",
                "primary": "#000000",
                "on-error-container": "#93000a",
                "primary-fixed-dim": "#c8c6c5",
                "background": "#fbf9f8",
                "primary-fixed": "#e5e2e1",
                "outline-variant": "#c4c7c7",
                "on-error": "#ffffff",
                "on-primary-fixed-variant": "#474646",
                "on-secondary-fixed-variant": "#3d4d00",
                "inverse-surface": "#303031",
                "surface-container-high": "#e9e8e7",
                "on-primary-container": "#858383",
                "error": "#ba1a1a",
                "on-secondary": "#ffffff",
                "surface-bright": "#fbf9f8",
                "secondary-fixed": "#f5a632",
                "secondary-container": "#f5a632",
                "on-primary-fixed": "#1c1b1b",
                "error-container": "#ffdad6",
                "on-surface": "#1b1c1c",
                "tertiary-fixed-dim": "#c5c7c8",
                "on-surface-variant": "#444748",
                "surface-container-lowest": "#ffffff",
                "on-tertiary-fixed": "#191c1d",
                "outline": "#747878",
                "surface-tint": "#5f5e5e",
                "secondary-fixed-dim": "#f5a632",
                "tertiary-container": "#191c1d",
                "inverse-on-surface": "#f2f0f0",
                "on-secondary-fixed": "#171e00",
                "surface-dim": "#dbdad9"
            },
            "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            "spacing": {
                "stack-sm": "8px",
                "margin-x": "24px",
                "stack-md": "16px",
                "gutter": "32px",
                "stack-lg": "48px",
                "container-max": "1280px",
                "section-padding-y": "120px"
            },
            "fontFamily": {
                "label-caps": ["Hanken Grotesk"],
                "headline-lg": ["Libre Caslon Text"],
                "headline-lg-mobile": ["Libre Caslon Text"],
                "display-lg": ["Libre Caslon Text"],
                "body-md": ["Hanken Grotesk"],
                "body-lg": ["Hanken Grotesk"],
                "headline-md": ["Libre Caslon Text"]
            },
            "fontSize": {
                "label-caps": ["12px", { "lineHeight": "1.0", "letterSpacing": "0.1em", "fontWeight": "700" }],
                "headline-lg": ["48px", { "lineHeight": "1.2", "fontWeight": "600" }],
                "headline-lg-mobile": ["32px", { "lineHeight": "1.2", "fontWeight": "600" }],
                "display-lg": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
                "headline-md": ["32px", { "lineHeight": "1.3", "fontWeight": "600" }]
            }
        },
    },
}

/* Inline script block 5 */
let spotlightCurrentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const indicators = document.querySelectorAll('.slide-indicator');
const totalSlides = slides.length;
let autoPlayInterval;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    indicators.forEach((ind, i) => {
        ind.classList.toggle('active', i === index);
    });
    spotlightCurrentSlide = index;
}

function nextSlide() {
    showSlide((spotlightCurrentSlide + 1) % totalSlides);
}

function prevSlide() {
    showSlide((spotlightCurrentSlide - 1 + totalSlides) % totalSlides);
}

function goToSlide(index) {
    showSlide(index);
    resetAutoPlay();
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(nextSlide, 6000);
}

/* Inline script block 6 */
let matterDflipObserver = null;
let matterDflipFallbackTimer = null;

const MATTER_DFLIP_LOCATION = 'https://simphiwemtetwa.africa/wp-content/plugins/3d-flipbook-dflip-lite/assets/';

function ensureMatterDflipConfiguration(host) {
    if (!host) return null;

    const pluginBook = host.querySelector('._df_book');
    const bookId = host.dataset.bookId || (pluginBook && pluginBook.id.replace(/^df_/, ''));
    const source = host.dataset.pdfSource;
    if (!pluginBook || !bookId || !source) return null;

    if (!window.dFlipLocation) window.dFlipLocation = MATTER_DFLIP_LOCATION;

    if (!window.dFlipWPGlobal) {
        window.dFlipWPGlobal = {
            text: {
                toggleSound: 'Turn on/off Sound',
                toggleThumbnails: 'Toggle Thumbnails',
                toggleOutline: 'Toggle Outline/Bookmark',
                previousPage: 'Previous Page',
                nextPage: 'Next Page',
                toggleFullscreen: 'Toggle Fullscreen',
                zoomIn: 'Zoom In',
                zoomOut: 'Zoom Out',
                toggleHelp: 'Toggle Help',
                singlePageMode: 'Single Page Mode',
                doublePageMode: 'Double Page Mode',
                downloadPDFFile: 'Download PDF File',
                gotoFirstPage: 'Goto First Page',
                gotoLastPage: 'Goto Last Page',
                share: 'Share',
                loading: 'DearFlip: Loading '
            },
            viewerType: 'flipbook',
            moreControls: 'download,pageMode,startPage,endPage,sound',
            hideControls: '',
            scrollWheel: 'false',
            backgroundColor: '#777',
            height: 'auto',
            paddingLeft: '20',
            paddingRight: '20',
            controlsPosition: 'bottom',
            duration: 800,
            soundEnable: 'true',
            enableDownload: 'true',
            showSearchControl: 'false',
            showPrintControl: 'false',
            enableAnnotation: false,
            enableAnalytics: 'false',
            webgl: 'true',
            maxTextureSize: '1600',
            rangeChunkSize: 524288,
            zoomRatio: 1.5,
            stiffness: 3,
            pageMode: '0',
            singlePageMode: '0',
            autoPlay: 'false',
            linkTarget: '2'
        };
    }

    const optionKey = `option_df_${bookId}`;
    if (!window[optionKey]) {
        window[optionKey] = {
            outline: [],
            autoEnableOutline: 'false',
            autoEnableThumbnail: 'false',
            overwritePDFOutline: 'false',
            direction: '1',
            pageSize: '0',
            source,
            wpOptions: 'true'
        };
    }

    return pluginBook;
}

function initializeMatterDflip() {
    const hosts = Array.prototype.slice.call(document.querySelectorAll('.matter-dflip-host'));
    if (!hosts.length) return;

    const fallback = document.getElementById('matterLocalFlipbookFallback');
    let anyBook = null;

    hosts.forEach(function (host) {
        const pluginBook = ensureMatterDflipConfiguration(host);
        if (pluginBook && !anyBook) anyBook = pluginBook;
    });
    if (!anyBook) return;

    function markReady() {
        let allReady = true;
        hosts.forEach(function (host) {
            if (host.dataset.status === 'ready') return;
            const pluginBook = host.querySelector('._df_book');
            const viewer = pluginBook && pluginBook.querySelector('.df-container');
            if (viewer) {
                host.hidden = false;
                host.dataset.status = 'ready';
                if (fallback) fallback.hidden = true;
            } else {
                allReady = false;
            }
        });
        if (allReady) {
            clearTimeout(matterDflipFallbackTimer);
            if (matterDflipObserver) matterDflipObserver.disconnect();
            setTimeout(() => window.dispatchEvent(new Event('resize')), 180);
        }
        return allReady;
    }

    if (markReady()) return;

    hosts.forEach(function (host) {
        host.hidden = false;
        host.dataset.status = 'loading';
    });
    if (fallback) fallback.hidden = true;

    if (window.DFLIP && typeof window.DFLIP.parseBooks === 'function') {
        try {
            window.DFLIP.parseBooks();
        } catch (error) {
            console.warn('Matter Magazine DearFlip initialization failed.', error);
        }
    }

    if (matterDflipObserver) matterDflipObserver.disconnect();
    matterDflipObserver = new MutationObserver(function () {
        const allReady = markReady();
        if (allReady && matterDflipObserver) matterDflipObserver.disconnect();
    });
    hosts.forEach(function (host) { matterDflipObserver.observe(host, { childList: true, subtree: true }); });

    clearTimeout(matterDflipFallbackTimer);
    matterDflipFallbackTimer = setTimeout(function () {
        if (markReady()) return;
        hosts.forEach(function (host) {
            if (host.dataset.status !== 'ready') {
                host.hidden = true;
                host.dataset.status = 'fallback';
            }
        });
    }, 9000);
}

/* Custom arrow controls for the embedded CURRENT ISSUE DearFlip book. */
function getMatterDflipControls() {
    var host = document.getElementById('matterCurrentDflip');
    if (!host) return { prev: null, next: null, container: null };
    var c = host.querySelector('.df-container');
    if (!c) c = host;
    function find(sel) {
        for (var i = 0; i < sel.length; i++) {
            var e = c.querySelector(sel[i]);
            if (e) return e;
        }
        return null;
    }
    return {
        prev: find(['.df-ui-prev', '[title="Previous Page"]', '[title="Previous"]', '[data-prev]']),
        next: find(['.df-ui-next', '[title="Next Page"]', '[title="Next"]', '[data-next]']),
        container: c
    };
}
function updateMatterDflipIndicator() {
    var host = document.getElementById('matterCurrentDflip');
    var ind = document.getElementById('matterCtrlIndicator');
    if (!host || !ind) return;
    var pageEl = host.querySelector('.df-ui-page, .df-page-number, .df-page-indicator, .df-current-page, .df-ui-page .df-ui-total');
    if (pageEl && pageEl.textContent) {
        var t = pageEl.textContent.trim();
        if (t) ind.textContent = t;
    }
}
function matterDflipPrev() {
    var g = getMatterDflipControls();
    if (g.prev) { g.prev.click(); setTimeout(updateMatterDflipIndicator, 60); }
}
function matterDflipNext() {
    var g = getMatterDflipControls();
    if (g.next) { g.next.click(); setTimeout(updateMatterDflipIndicator, 60); }
}
(function initMatterDflipControls() {
    var started = false;
    var poll = setInterval(function () {
        var g = getMatterDflipControls();
        if (!g.prev && !g.next) return;
        if (!started) { started = true; updateMatterDflipIndicator(); }
        if (document.getElementById('matterCtrlPrev')) { clearInterval(poll); }
    }, 250);
    setTimeout(function () { clearInterval(poll); }, 30000);
})();
let currentPage = 0;
const book = document.getElementById('flipBook');
const cover = document.getElementById('bookCover');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const indicator = document.getElementById('pageIndicator');
const bookPages = book ? Array.from(book.querySelectorAll('.page')) : [];
const totalPages = bookPages.length || 4;
const pageLabels = ['Cover', 'Pages 1-2', 'Pages 3-4', 'Pages 5-6', 'Pages 7-8', 'Back Cover'];

function updateControls() {
    if (!book || !cover || !btnPrev || !btnNext || !indicator) return;

    cover.classList.toggle('flipped', currentPage > 0);
    book.classList.toggle('is-open', currentPage > 0);
    book.style.setProperty('--book-progress', currentPage / (totalPages + 1));

    bookPages.forEach((page, index) => {
        page.classList.toggle('flipped', currentPage > index + 1);
    });

    btnPrev.disabled = currentPage === 0;
    btnNext.disabled = currentPage === totalPages + 1;
    indicator.textContent = pageLabels[currentPage] || '';
}

function matterToggleCover() {
    goToBookPage(currentPage === 0 ? 1 : 0);
}

function matterFlipPage(pageNum) {
    const page = book && book.querySelector('#page' + pageNum);
    if (!page) return;
    goToBookPage(currentPage > pageNum ? pageNum : pageNum + 1);
}

function goToBookPage(pageIndex) {
    currentPage = Math.max(0, Math.min(totalPages + 1, pageIndex));
    updateControls();
}

function matterNextPage() {
    goToBookPage(currentPage + 1);
}

function matterPrevPage() {
    goToBookPage(currentPage - 1);
}

updateControls();

(function initMatterBookGestures() {
    if (!book) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    function onPointerStart(event) {
        const point = event.touches ? event.touches[0] : event;
        startX = point.clientX;
        startY = point.clientY;
        startTime = Date.now();
    }

    function onPointerEnd(event) {
        const point = event.changedTouches ? event.changedTouches[0] : event;
        const diffX = point.clientX - startX;
        const diffY = point.clientY - startY;
        const isFastEnough = Date.now() - startTime < 700;

        if (Math.abs(diffX) < 42 || Math.abs(diffX) < Math.abs(diffY) || !isFastEnough) return;
        if (diffX < 0) matterNextPage();
        if (diffX > 0) matterPrevPage();
    }

    if ('PointerEvent' in window) {
        book.addEventListener('pointerdown', onPointerStart);
        book.addEventListener('pointerup', onPointerEnd);
    } else {
        book.addEventListener('touchstart', onPointerStart, { passive: true });
        book.addEventListener('touchend', onPointerEnd, { passive: true });
    }

    [cover, ...bookPages].filter(Boolean).forEach((part, index) => {
        part.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            if (index === 0) matterToggleCover();
            else matterFlipPage(index);
        });
    });

    document.addEventListener('keydown', (event) => {
        const magazinePage = document.getElementById('page-matter-magazine');
        const fallback = document.getElementById('matterLocalFlipbookFallback');
        if (!magazinePage || getComputedStyle(magazinePage).display === 'none' || !fallback || fallback.hidden) return;
        if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
        if (event.key === 'ArrowRight') matterNextPage();
        if (event.key === 'ArrowLeft') matterPrevPage();
    });
})();

(function initMatterHeroSlider() {
    const slides = document.querySelectorAll('.matter-hero-slide');
    const dots = document.querySelectorAll('.matter-hero-dots button');
    if (!slides.length || !dots.length) return;

    let activeSlide = 0;
    let matterHeroTimer = null;

    function showMatterHeroSlide(index) {
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === activeSlide);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === activeSlide);
        });
    }

    function startMatterHeroSlider() {
        clearInterval(matterHeroTimer);
        matterHeroTimer = setInterval(() => {
            showMatterHeroSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showMatterHeroSlide(index);
            startMatterHeroSlider();
        });
    });

        startMatterHeroSlider();
})();

/* Page Flip Book for Previous Issues featured edition */
(function initPageFlipBook() {
    const book = document.getElementById('efBook');
    const indicator = document.getElementById('efIndicator');
    // Buttons live in the sibling .ef-ui, not inside #efBook
    const card = book ? book.closest('.edition-pageflip') : null;
    const btnNext = card ? card.querySelector('.ef-next') : null;
    const btnPrev = card ? card.querySelector('.ef-prev') : null;
    if (!book) return;

    const pages = book.querySelectorAll('.ef-pg');
    const pageLabels = ['Cover', 'Shaping the Future', 'Building a Safe SA', 'Executive Impact'];
    let currentPage = 0;

    function showPage(index) {
        const clamped = Math.max(0, Math.min(index, pages.length - 1));
        pages.forEach((page, i) => {
            page.style.display = i === clamped ? 'block' : 'none';
        });
        currentPage = clamped;
        if (indicator) indicator.textContent = pageLabels[currentPage] || (currentPage + 1);
        if (btnPrev) btnPrev.disabled = currentPage === 0;
        if (btnNext) btnNext.disabled = currentPage === pages.length - 1;
    }

    function nextPage() { showPage(currentPage + 1); }
    function prevPage() { showPage(currentPage - 1); }

    if (btnNext) btnNext.addEventListener('click', nextPage);
    if (btnPrev) btnPrev.addEventListener('click', prevPage);
    showPage(0);
})();

/* Inline script block 7 */
(function () {
    const container = document.querySelector('.article-v7-container');
    if (!container) return;

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* Inline script block 8 */
(function () {
    const container = document.querySelector('.article-v7-container');
    if (!container) return;

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* Inline script block 9 */
(function () {
    const container = document.querySelector('#article-future-2050 .article-v7-container');
    if (!container) return;

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* Inline script block 10 */
(function () {
    const container = document.querySelector('#article-after-school .article-v7-container');
    if (!container) return;

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* Inline script block 11 */
(function () {
    const container = document.querySelector('#article-masters-deal .article-v7-container');
    if (!container) return;

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* Inline script block 12 */
(function () {
    const container = document.querySelector('#article-vision-motion .article-v7-container');
    if (!container) return;

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* Inline script block 13 */
// =============================================
// NAV SCROLL EFFECT
// =============================================
const currentPageKey = { value: 'home' };
const header = document.querySelector('.header');
const navLogo = document.getElementById('navLogo');
const whiteLogo = 'https://csiindaba.africa/wp-content/uploads/2026/07/Simphiwe-8-2.png';
const coloredLogo = 'https://www.image2url.com/r2/default/images/1777649055436-1057d549-9fe6-4e04-b970-568610a4c0a0.png';
let isScrolling = header.classList.contains('scrolled');
let logoChangeTimer;
let currentLogoMode = isScrolling ? 'colored' : 'white';
const shouldForceSolidHeader = () =>
    ['#page-csi-indaba', '#page-csi-legacy-awards'].includes(window.location.hash) ||
    ['page-csi-indaba', 'page-csi-legacy-awards'].includes(currentPageKey.value);

[whiteLogo, coloredLogo].forEach(url => { const img = new Image(); img.src = url; });

const changeLogo = (mode) => {
    if (mode === currentLogoMode) return;
    currentLogoMode = mode;
    const newSrc = mode === 'colored' ? coloredLogo : whiteLogo;

    clearTimeout(logoChangeTimer);
    navLogo.style.opacity = '0';
    logoChangeTimer = setTimeout(() => {
        if (navLogo.src !== newSrc) navLogo.src = newSrc;
        const show = () => { navLogo.style.opacity = '1'; };
        if (navLogo.complete) show();
        else {
            navLogo.onload = show;
            navLogo.onerror = show;
        }
    }, 250);
};

const updateHeaderState = () => {
    const shouldUseSolidHeader = currentPageKey.value !== 'home' || window.scrollY > 50 || shouldForceSolidHeader();

    header.classList.toggle('scrolled', shouldUseSolidHeader);
    changeLogo(shouldUseSolidHeader ? 'colored' : 'white');
};

window.addEventListener('scroll', updateHeaderState, { passive: true });
window.addEventListener('hashchange', updateHeaderState);
window.addEventListener('popstate', updateHeaderState);

// Apply the correct header before the user has to trigger a scroll.
updateHeaderState();

// =============================================
// NEW HERO CAROUSEL
// =============================================
const heroSlides = document.querySelectorAll('.hero__slide');
const navItems = document.querySelectorAll('.hero__nav-item');
let currentSlide = 0;
let slideTimer;
let progressStart = Date.now();
const slideDuration = 6000;
let animationFrame;

const heroGoToSlide = (index) => {
    heroSlides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
    navItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
        const progress = item.querySelector('.nav-progress');
        if (progress) progress.style.width = idx === index ? '0%' : '0%';
    });
    currentSlide = index;
    progressStart = Date.now();

    clearInterval(slideTimer);
    slideTimer = setInterval(() => heroGoToSlide((currentSlide + 1) % heroSlides.length), slideDuration);
};

const updateProgress = () => {
    const elapsed = Date.now() - progressStart;
    const percent = Math.min((elapsed / slideDuration) * 100, 100);
    const activeNav = navItems[currentSlide];
    if (activeNav) {
        const progress = activeNav.querySelector('.nav-progress');
        if (progress) progress.style.width = percent + '%';
    }
    animationFrame = requestAnimationFrame(updateProgress);
};

navItems.forEach((item, idx) => {
    item.addEventListener('click', () => heroGoToSlide(idx));
});

if (heroSlides.length > 0) {
    heroGoToSlide(0);
    updateProgress();
}

// Scroll indicator - auto-scroll to bottom with play/pause
const scrollIndicator = document.getElementById('scrollToNextSection');
let autoScrollActive = false;
let autoScrollPaused = false;
let autoScrollRaf = null;
const SCROLL_SPEED = 0.8;

const scrollControls = document.createElement('div');
scrollControls.id = 'scrollControls';
scrollControls.style.cssText = 'position:fixed;bottom:2rem;right:2rem;z-index:9999;display:none;gap:0.5rem;align-items:center;';
scrollControls.innerHTML = '<button id="autoScrollPauseBtn" style="width:36px;height:36px;border-radius:50%;border:1px solid var(--token-border);background:var(--token-bg);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 12px rgba(0,0,0,0.15);transition:all 0.2s;color:var(--token-text);" title="Pause">⏸</button><button id="autoScrollPlayBtn" style="width:36px;height:36px;border-radius:50%;border:1px solid var(--token-border);background:var(--token-bg);cursor:pointer;display:none;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 12px rgba(0,0,0,0.15);transition:all 0.2s;color:var(--token-text);" title="Play">▶</button>';
document.body.appendChild(scrollControls);

const autoScrollPauseBtn = document.getElementById('autoScrollPauseBtn');
const autoScrollPlayBtn = document.getElementById('autoScrollPlayBtn');

function stopAutoScroll() {
    autoScrollActive = false;
    if (autoScrollRaf) cancelAnimationFrame(autoScrollRaf);
    scrollControls.style.display = 'none';
    if (scrollIndicator) scrollIndicator.style.display = '';
}

function pauseAutoScroll() {
    autoScrollPaused = true;
    autoScrollPauseBtn.style.display = 'none';
    autoScrollPlayBtn.style.display = 'flex';
}

function resumeAutoScroll() {
    autoScrollPaused = false;
    autoScrollPauseBtn.style.display = 'flex';
    autoScrollPlayBtn.style.display = 'none';
}

function startAutoScroll() {
    stopAutoScroll();
    autoScrollActive = true;
    autoScrollPaused = false;
    scrollControls.style.display = 'flex';
    autoScrollPauseBtn.style.display = 'flex';
    autoScrollPlayBtn.style.display = 'none';
    if (scrollIndicator) scrollIndicator.style.display = 'none';
    function scrollStep() {
        if (!autoScrollActive) return;
        if (!autoScrollPaused) {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (window.scrollY < maxScroll - 1) {
                window.scrollBy(0, SCROLL_SPEED);
                autoScrollRaf = requestAnimationFrame(scrollStep);
            } else {
                window.scrollTo(0, maxScroll);
                stopAutoScroll();
            }
        } else {
            autoScrollRaf = requestAnimationFrame(scrollStep);
        }
    }
    autoScrollRaf = requestAnimationFrame(scrollStep);
}

if (scrollIndicator) {
    scrollIndicator.addEventListener('click', startAutoScroll);
}
if (autoScrollPauseBtn) autoScrollPauseBtn.addEventListener('click', pauseAutoScroll);
if (autoScrollPlayBtn) autoScrollPlayBtn.addEventListener('click', resumeAutoScroll);

window.addEventListener('wheel', (e) => { if (autoScrollActive && Math.abs(e.deltaY) > 20) stopAutoScroll(); }, { passive: true });
window.addEventListener('touchstart', () => { if (autoScrollActive) stopAutoScroll(); }, { passive: true });

// =============================================
// SCROLL REVEAL
// =============================================
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

// =============================================
// STAT COUNTER ANIMATION
// =============================================
function animateCounter(el, loop = false) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
    }
    requestAnimationFrame(update);
}

document.querySelectorAll('.stats-section').forEach(section => {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.stat-counter').forEach(animateCounter);
                statsObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    statsObserver.observe(section);
});

// =============================================
// MOBILE MENU (OFFCANVAS)
// =============================================
document.getElementById('mobileMenuButton').addEventListener('click', () => {
    document.getElementById('offcanvasMenu').classList.add('active');
    document.getElementById('offcanvasMenu').setAttribute('aria-hidden', 'false');
});
document.getElementById('closeMenu').addEventListener('click', () => {
    document.getElementById('offcanvasMenu').classList.remove('active');
    document.getElementById('offcanvasMenu').setAttribute('aria-hidden', 'true');
});
document.getElementById('offcanvasMenu').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        e.currentTarget.classList.remove('active');
        e.currentTarget.setAttribute('aria-hidden', 'true');
    }
});
document.querySelectorAll('#offcanvasMenu a').forEach(link => {
    link.addEventListener('click', () => {
        const menu = document.getElementById('offcanvasMenu');
        menu.classList.remove('active');
        menu.setAttribute('aria-hidden', 'true');
    });
});

// =============================================
// UNIFIED 3-PANEL MEGA MENU
// =============================================
const megaMenu = document.getElementById('megaMenu');
const megaTriggers = document.querySelectorAll('.nav-item--mega');
const megaPanels = document.querySelectorAll('.mega-menu__panel-section');
const megaFeatured = document.querySelectorAll('.mega-menu__featured-card');
const megaRailItems = document.querySelectorAll('.mega-menu__rail-item');
let megaCloseTimer = null;

const expertiseFeaturedDefaults = {
    eyebrow: 'PUBLISHING SERVICES',
    text: 'Publishing formats built for leaders who need their work to carry authority.',
    ariaLabel: 'Publishing quick links',
    links: [
        { href: '#page-expertise-publishing', onclick: 'showExpertisePublishingPage();return false;', text: 'Annual Reports' },
        { href: '#page-expertise-publishing', onclick: 'showExpertisePublishingPage();return false;', text: 'Executive Messages' },
        { href: '#page-expertise-publishing', onclick: 'showExpertisePublishingPage();return false;', text: 'Flagship Reports' },
        { href: '#page-expertise-publishing', onclick: 'showExpertisePublishingPage();return false;', text: 'Sector Publications' },
        { href: '#page-expertise-publishing', onclick: 'showExpertisePublishingPage();return false;', text: 'Thought Leadership' }
    ]
};

const executiveCouncilFeatured = {
    eyebrow: 'PR & VISIBILITY',
    text: 'Visibility strategy, public positioning and reputation-building support for social investment leaders.',
    ariaLabel: 'PR & Visibility quick links',
    links: [
        { href: '#page-expertise-events', onclick: 'showExpertiseEventsPage();return false;', text: 'Conference Design' },
        { href: '#page-expertise-events', onclick: 'showExpertiseEventsPage();return false;', text: 'CSI Activations & Handovers' },
        { href: '#page-expertise-events', onclick: 'showExpertiseEventsPage();return false;', text: 'Events Delivery' }
    ]
};

const advisoryFeatured = {
    eyebrow: 'ADVISORY',
    text: 'Strategic advisory support for organisations shaping social investment, programme models and executive decision-making.',
    ariaLabel: 'Advisory quick links',
    links: [
        { href: '#page-expertise-advisory', onclick: 'showExpertiseAdvisoryPage();return false;', text: 'Social Investment Strategy' },
        { href: '#page-expertise-advisory', onclick: 'showExpertiseAdvisoryPage();return false;', text: 'Concept Note & Model Development' },
        { href: '#page-expertise-advisory', onclick: 'showExpertiseAdvisoryPage();return false;', text: 'Executive Counsel' }
    ]
};

const eventsFeatured = {
    eyebrow: 'EVENTS & ACTIVATION',
    text: 'Event strategy and activation design for convenings, handovers and executive moments that need to land with purpose.',
    ariaLabel: 'Events & Activation quick links',
    links: [
        { href: '#page-expertise-events', onclick: 'showExpertiseEventsPage();return false;', text: 'Conference Design' },
        { href: '#page-expertise-events', onclick: 'showExpertiseEventsPage();return false;', text: 'Concept Note & Model Development' },
        { href: '#page-expertise-events', onclick: 'showExpertiseEventsPage();return false;', text: 'Executive Counsel' }
    ]
};

const updateExpertiseFeaturedLinks = (content) => {
    if (!megaMenu) return;
    const card = megaMenu.querySelector('.mega-menu__featured-card[data-featured="expertise"]');
    if (!card) return;
    const eyebrowEl = card.querySelector('.mega-menu__featured-eyebrow');
    const textEl = card.querySelector('.mega-menu__featured-text');
    const linksEl = card.querySelector('.mega-menu__featured-links');
    if (eyebrowEl) eyebrowEl.textContent = content.eyebrow;
    if (textEl) textEl.textContent = content.text;
    if (linksEl) {
        linksEl.setAttribute('aria-label', content.ariaLabel);
        linksEl.innerHTML = content.links.map(link =>
            `<a href="${link.href}" onclick="${link.onclick}">${link.text}</a>`
        ).join('');
    }
};

const positionMegaMenu = () => {
    if (!megaMenu) return;
    const headerEl = document.querySelector('.header');
    if (headerEl) {
        megaMenu.style.top = headerEl.offsetHeight + 'px';
    }
};

const showMegaSection = (section) => {
    if (megaMenu) {
        megaMenu.classList.toggle('mega-menu--feature-only', section === 'case-studies');
    }
    megaPanels.forEach(p => p.style.display = p.dataset.panel === section ? 'block' : 'none');
    megaFeatured.forEach(c => c.style.display = c.dataset.featured === section ? 'flex' : 'none');
    if (section === 'expertise') updateExpertiseFeaturedLinks(expertiseFeaturedDefaults);
    megaRailItems.forEach(r => {
        r.classList.toggle('mega-menu__rail-item--active', r.dataset.section === section);
    });
};

const scheduleMegaClose = () => {
    clearTimeout(megaCloseTimer);
    megaCloseTimer = setTimeout(() => {
        if (megaMenu) megaMenu.classList.remove('mega-open');
    }, 200);
};

const cancelMegaClose = () => clearTimeout(megaCloseTimer);

// Nav trigger hover → open mega menu with that section
megaTriggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => {
        cancelMegaClose();
        positionMegaMenu();
        if (megaMenu) megaMenu.classList.add('mega-open');
        showMegaSection(trigger.dataset.section);
    });
    trigger.addEventListener('mouseleave', scheduleMegaClose);
});

// Mega menu hover → keep open
if (megaMenu) {
    megaMenu.addEventListener('mouseenter', cancelMegaClose);
    megaMenu.addEventListener('mouseleave', scheduleMegaClose);
    megaMenu.addEventListener('click', (e) => {
        if (e.target.closest('a')) megaMenu.classList.remove('mega-open');
    });
}

// Rail item hover → swap panel + featured
megaRailItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        if (item.dataset.section === 'home') return;
        showMegaSection(item.dataset.section);
    });
    item.addEventListener('click', (e) => {
        if (item.dataset.section === 'home') return;
        e.preventDefault();
        const section = item.dataset.section;
        const link = megaMenu.querySelector(`.mega-menu__panel-section[data-panel="${section}"] .mega-menu__link`);
        if (link) link.click();
        megaMenu.classList.remove('mega-open');
    });
});

// =============================================
// MEGA MENU SUB-LINK PREVIEWS (3rd panel sync)
// =============================================
document.querySelectorAll('.mega-menu__link[data-preview-img]').forEach(link => {
    link.addEventListener('mouseenter', () => {
        if (!megaMenu) return;
        if (link.closest('.mega-menu__panel-section[data-panel="expertise"]')) return;
        const allCards = megaMenu.querySelectorAll('.mega-menu__featured-card');
        const activeCard = [...allCards].find(c => c.style.display !== 'none' && c.style.display !== '');
        if (!activeCard) return;

        const img = activeCard.querySelector('img');
        const textEl = activeCard.querySelector('.mega-menu__featured-text');
        const eyebrowEl = activeCard.querySelector('.mega-menu__featured-eyebrow');
        const ctaEl = activeCard.querySelector('.mega-menu__featured-cta');

        // Save originals once
        if (!activeCard.dataset.origSaved) {
            activeCard.dataset.origImg = img ? img.src : '';
            activeCard.dataset.origText = textEl ? textEl.textContent : '';
            activeCard.dataset.origEyebrow = eyebrowEl ? eyebrowEl.textContent : '';
            activeCard.dataset.origCta = ctaEl ? ctaEl.textContent : '';
            activeCard.dataset.origCtaHref = ctaEl ? ctaEl.getAttribute('href') || '' : '';
            activeCard.dataset.origCtaOnclick = ctaEl ? ctaEl.getAttribute('onclick') || '' : '';
            activeCard.dataset.origSaved = '1';
        }

        // Swap content with fade
        if (img && link.dataset.previewImg) {
            img.style.opacity = '0';
            setTimeout(() => { img.src = link.dataset.previewImg; img.style.opacity = '1'; }, 150);
        }
        if (textEl && link.dataset.previewText) textEl.textContent = link.dataset.previewText;
        if (eyebrowEl && link.dataset.previewEyebrow) eyebrowEl.textContent = link.dataset.previewEyebrow;
        if (ctaEl && link.dataset.previewCta) ctaEl.textContent = link.dataset.previewCta;
        if (ctaEl && link.dataset.previewCtaHref) ctaEl.setAttribute('href', link.dataset.previewCtaHref);
        if (ctaEl && link.dataset.previewCtaOnclick) ctaEl.setAttribute('onclick', link.dataset.previewCtaOnclick);
    });

    link.addEventListener('mouseleave', () => {
        if (!megaMenu) return;
        if (link.closest('.mega-menu__panel-section[data-panel="expertise"]')) return;
        const allCards = megaMenu.querySelectorAll('.mega-menu__featured-card');
        const activeCard = [...allCards].find(c => c.style.display !== 'none' && c.style.display !== '');
        if (!activeCard || !activeCard.dataset.origSaved) return;

        const img = activeCard.querySelector('img');
        const textEl = activeCard.querySelector('.mega-menu__featured-text');
        const eyebrowEl = activeCard.querySelector('.mega-menu__featured-eyebrow');
        const ctaEl = activeCard.querySelector('.mega-menu__featured-cta');

        if (img) {
            img.style.opacity = '0';
            setTimeout(() => { img.src = activeCard.dataset.origImg; img.style.opacity = '1'; }, 150);
        }
        if (textEl) textEl.textContent = activeCard.dataset.origText;
        if (eyebrowEl) eyebrowEl.textContent = activeCard.dataset.origEyebrow;
        if (ctaEl) ctaEl.textContent = activeCard.dataset.origCta;
        if (ctaEl) ctaEl.setAttribute('href', activeCard.dataset.origCtaHref);
        if (ctaEl) ctaEl.setAttribute('onclick', activeCard.dataset.origCtaOnclick);

        delete activeCard.dataset.origImg;
        delete activeCard.dataset.origText;
        delete activeCard.dataset.origEyebrow;
        delete activeCard.dataset.origCta;
        delete activeCard.dataset.origCtaHref;
        delete activeCard.dataset.origCtaOnclick;
        delete activeCard.dataset.origSaved;
    });
});

document.querySelectorAll('.mega-menu__panel-section[data-panel="expertise"] .mega-menu__link').forEach(link => {
    link.addEventListener('mouseenter', () => {
        const content = link.dataset.executiveCouncilPanel
            ? executiveCouncilFeatured
            : link.getAttribute('href') === '#page-expertise-events'
                ? eventsFeatured
            : link.getAttribute('href') === '#page-expertise-advisory'
                ? advisoryFeatured
                : expertiseFeaturedDefaults;
        updateExpertiseFeaturedLinks(content);
    });
});

// Close on click outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item--mega') && !e.target.closest('.mega-menu')) {
        if (megaMenu) megaMenu.classList.remove('mega-open');
    }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (megaMenu) megaMenu.classList.remove('mega-open');
        document.querySelectorAll('.offcanvas-group.open').forEach(g => {
            g.classList.remove('open');
            const t = g.querySelector('.offcanvas-group__toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
        });
    }
});

// =============================================
// OFFCANVAS ACCORDION
// =============================================
document.querySelectorAll('.offcanvas-group__toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.closest('.offcanvas-group');
        const open = group.classList.contains('open');
        group.classList.toggle('open', !open);
        btn.setAttribute('aria-expanded', String(!open));
    });
});

// =============================================
// ACTIVE NAV HIGHLIGHT
// =============================================
const setActiveNav = () => {
    const key = currentPageKey.value;
    document.querySelectorAll('#desktopNav > li[data-group], #offcanvasMenu li[data-group]').forEach(li => {
        const group = (li.getAttribute('data-group') || '').split(' ');
        const isActive = key !== 'home' && group.indexOf(key) !== -1;
        li.classList.toggle('active', isActive);
    });
};

const mainEl = document.querySelector('main');
const pageObserver = new MutationObserver((muts) => {
    let changed = false;
    for (const m of muts) {
        if (m.type !== 'attributes') continue;
        const el = m.target;
        const display = el.style ? el.style.display : '';
        if (el === mainEl) {
            if (display === 'block') { currentPageKey.value = 'home'; changed = true; }
        } else if ((el.id || '').indexOf('page-') === 0 && display && display !== 'none') {
            currentPageKey.value = el.id;
            changed = true;
        }
    }
    if (changed) {
        setActiveNav();
        updateHeaderState();
    }
});

if (mainEl) pageObserver.observe(mainEl, { attributes: true, attributeFilter: ['style'] });
document.querySelectorAll('[id^="page-"]').forEach(el => pageObserver.observe(el, { attributes: true, attributeFilter: ['style'] }));

setActiveNav();

// =============================================
// HERO SLIDER (SPOTLIGHT)
// =============================================
const heroSlider = document.getElementById('heroSlider');
if (heroSlider) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const progressBar = document.getElementById('progressBar');
    const currentSlideEl = document.getElementById('currentSlide');

    let currentIndex = 0;
    const totalSlides = slides.length;
    const autoPlayDelay = 6000;
    let autoPlayTimer;
    let progressTimer;
    let progress = 0;

    function updateSlider() {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
        if (currentSlideEl) {
            currentSlideEl.textContent = String(currentIndex + 1).padStart(2, '0');
        }
        resetProgress();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    }

    function goToHeroSlide(index) {
        currentIndex = index;
        updateSlider();
        resetAutoPlay();
    }

    function resetProgress() {
        progress = 0;
        if (progressBar) progressBar.style.width = '0%';
        clearInterval(progressTimer);
        progressTimer = setInterval(() => {
            progress += 100 / (autoPlayDelay / 50);
            if (progressBar) progressBar.style.width = Math.min(progress, 100) + '%';
        }, 50);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(nextSlide, autoPlayDelay);
        resetProgress();
    }

    let touchStartX = 0;
    let touchEndX = 0;

    heroSlider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSlider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
            resetAutoPlay();
        }
    }, { passive: true });

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { nextSlide(); resetAutoPlay(); }
        if (e.key === 'ArrowLeft') { prevSlide(); resetAutoPlay(); }
    });

    heroSlider.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    heroSlider.addEventListener('mouseleave', resetAutoPlay);

    resetAutoPlay();
}

// =============================================
// TESTIMONIAL SLIDER (SPOTLIGHT)
// =============================================
let currentTesti = 0;
const testiTrack = document.getElementById('testiTrack');
const testiCards = document.querySelectorAll('.testimonial-card');

function slideTestimonial(direction) {
    if (!testiTrack || testiCards.length === 0) return;
    currentTesti += direction;
    if (currentTesti < 0) currentTesti = testiCards.length - 1;
    if (currentTesti >= testiCards.length) currentTesti = 0;
    testiCards.forEach((c, i) => {
        if (i === currentTesti) c.classList.add('active');
        else c.classList.remove('active');
    });
    const cardWidth = testiCards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(testiTrack).columnGap || getComputedStyle(testiTrack).gap) || 30;
    testiTrack.style.transform = `translateX(-${currentTesti * (cardWidth + gap)}px)`;
}

// Auto Scroll
let autoSlideInterval = setInterval(() => slideTestimonial(1), 5000);
const spotlightSectionHover = document.querySelector('.spotlight-section');
if (spotlightSectionHover) {
    spotlightSectionHover.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    spotlightSectionHover.addEventListener('mouseleave', () => autoSlideInterval = setInterval(() => slideTestimonial(1), 5000));
}

let isDragging = false;
let dragStartPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;

if (testiTrack) {
    testiTrack.addEventListener('mousedown', touchStart);
    testiTrack.addEventListener('touchstart', touchStart, { passive: true });
    testiTrack.addEventListener('mouseup', touchEnd);
    testiTrack.addEventListener('mouseleave', () => { if (isDragging) touchEnd(); });
    testiTrack.addEventListener('touchend', touchEnd);
    testiTrack.addEventListener('mousemove', touchMove);
    testiTrack.addEventListener('touchmove', touchMove, { passive: true });
}

function touchStart(e) {
    isDragging = true;
    dragStartPos = getPositionX(e);
    animationID = requestAnimationFrame(animation);
    testiTrack.style.transition = 'none';
}
function touchMove(e) {
    if (isDragging) {
        currentTranslate = prevTranslate + getPositionX(e) - dragStartPos;
    }
}
function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    testiTrack.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
    const movedBy = currentTranslate - prevTranslate;
    if (movedBy < -100 && currentTesti < testiCards.length - 1) currentTesti += 1;
    if (movedBy > 100 && currentTesti > 0) currentTesti -= 1;
    slideTestimonial(0);
    const cardWidth = testiCards[0].offsetWidth;
    prevTranslate = -(currentTesti * (cardWidth + 30));
}
function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
}
function animation() {
    testiTrack.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) requestAnimationFrame(animation);
}

// =============================================
// MISSION VIDEO HANDLING
// =============================================
function playSectionVideo() {
    const section = document.getElementById('editorialSection');
    const vid = document.getElementById('sectionBgVideo');
    const thumb = document.getElementById('editorialThumbnail');
    const closeBtn = document.getElementById('closeSectionVideoBtn');
    const heading = document.getElementById('editorialHeading');

    vid.src = 'https://raw.githubusercontent.com/vandermerwejack611-cloud/video-2/main/WhatsApp%20Video%202026-05-07%20at%2010.08.45%20PM%20(1).mp4';
    vid.load();
    vid.muted = false;
    vid.play().catch(e => console.log("Video playback error:", e));
    if (heading) heading.style.transform = 'scale(1.05)';
    section.classList.add('video-active');
    vid.style.opacity = '1';
    thumb.style.opacity = '0';
    thumb.style.pointerEvents = 'none';
    closeBtn.style.display = 'flex';

    const volCtrl = document.getElementById('videoVolumeControl');
    const volRange = document.getElementById('videoVolumeRange');
    if (volCtrl && volRange) {
        volCtrl.style.display = 'flex';
        volRange.oninput = (e) => {
            vid.volume = e.target.value;
            const icon = document.getElementById('volumeIcon');
            if (vid.volume == 0) icon.className = 'fas fa-volume-mute';
            else if (vid.volume < 0.5) icon.className = 'fas fa-volume-down';
            else icon.className = 'fas fa-volume-up';
        };
    }
}

function toggleSectionVideo() {
    const video = document.getElementById('sectionBgVideo');
    const icon = document.getElementById('playPauseIcon');
    if (video.paused) {
        video.play();
        icon.classList.replace('fa-play', 'fa-pause');
    } else {
        video.pause();
        icon.classList.replace('fa-pause', 'fa-play');
    }
}

function stopSectionVideo() {
    const section = document.getElementById('editorialSection');
    const vid = document.getElementById('sectionBgVideo');
    const thumb = document.getElementById('editorialThumbnail');
    const closeBtn = document.getElementById('closeSectionVideoBtn');
    const volCtrl = document.getElementById('videoVolumeControl');
    const heading = document.getElementById('editorialHeading');

    vid.pause();
    vid.muted = true;
    vid.style.opacity = '0';
    section.classList.remove('video-active');
    thumb.style.opacity = '1';
    thumb.style.pointerEvents = 'auto';
    closeBtn.style.display = 'none';
    if (volCtrl) volCtrl.style.display = 'none';
    if (heading) heading.style.transform = 'scale(1)';
    vid.src = '';
}

// =============================================
// CONTACT ROUTING
// =============================================
window.showContactPage = function () {
    const mainContent = document.querySelector('main');
    const contactPage = document.getElementById('page-contact');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (contactPage) contactPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Connect - Simphiwe Mtetwa';
};

window.showHomePage = function () {
    const mainContent = document.querySelector('main');
    const contactPage = document.getElementById('page-contact');
    const aboutPage = document.getElementById('page-about');
    const homePage = document.getElementById('page-home');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'block';
    if (homePage) homePage.style.display = 'block';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    window.scrollTo(0, 0);
    document.title = 'Simphiwe Mtetwa – Shaping Africa\'s Socio-Economic Future';
};

window.goHome = function () {
    window.location.hash = '#home';
    showHomePage();
};

// Handle hash changes
window.showPodcastsPage = function () {
    const mainContent = document.querySelector('main');
    const contactPage = document.getElementById('page-contact');
    const podcastsPage = document.getElementById('page-podcasts');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    if (mainContent) mainContent.style.display = 'none';
    if (contactPage) contactPage.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    document.querySelectorAll('[id^="page-"], [id^="article-"]').forEach(el => el.style.display = 'none');
    if (podcastsPage) podcastsPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Podcasts - Simphiwe Mtetwa';
};

window.showExecutiveArticlesPage = function () {
    const mainContent = document.querySelector('main');
    const contactPage = document.getElementById('page-contact');
    const executiveArticlesPage = document.getElementById('page-executive-articles');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    if (mainContent) mainContent.style.display = 'none';
    if (contactPage) contactPage.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    document.querySelectorAll('[id^="page-"], [id^="article-"]').forEach(el => el.style.display = 'none');
    if (executiveArticlesPage) executiveArticlesPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Executive Insights - Simphiwe Mtetwa';
};

window.showRecentNewsPage = function () {
    const mainContent = document.querySelector('main');
    const contactPage = document.getElementById('page-contact');
    const recentNewsPage = document.getElementById('page-recent-news');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    if (mainContent) mainContent.style.display = 'none';
    if (contactPage) contactPage.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    document.querySelectorAll('[id^="page-"], [id^="article-"]').forEach(el => el.style.display = 'none');
    if (recentNewsPage) recentNewsPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Recent News - Simphiwe Mtetwa';
};

window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash === '#page-podcasts') {
        showPodcastsPage();
    } else if (hash === '#page-executive-articles') {
        showExecutiveArticlesPage();
    } else if (hash === '#page-recent-news') {
        showRecentNewsPage();
    } else if (hash === '#page-contact') {
        showContactPage();
    } else if (hash === '#page-spotlight') {
        showSpotlightPage('page-spotlight');
    } else if (hash === '#page-spotlight2') {
        showSpotlightPage('page-spotlight2');
    } else if (hash === '#page-spotlight3') {
        showSpotlightPage('page-spotlight3');
    } else if (hash === '#page-csi-indaba') {
        showCSIIndabaPage();
    } else if (hash === '#page-csi-awards') {
        showCSIAwardsPage();
    } else if (hash === '#page-csi-legacy-awards') {
        showAwardsPage();
    } else if (hash === '#page-winner-oceana') {
        showAwardsWinnerPage('page-winner-oceana');
    } else if (hash === '#page-winner-primestars') {
        showAwardsWinnerPage('page-winner-primestars');
    } else if (hash === '#page-winner-seriti') {
        showAwardsWinnerPage('page-winner-seriti');
    } else if (hash === '#page-winner-tcb') {
        showAwardsWinnerPage('page-winner-tcb');
    } else if (hash === '#page-winner-pinkdrive') {
        showAwardsWinnerPage('page-winner-pinkdrive');
    } else if (hash === '#page-winner-famsa') {
        showAwardsWinnerPage('page-winner-famsa');
    } else if (hash === '#page-winner-petco') {
        showAwardsWinnerPage('page-winner-petco');
    } else if (hash === '#page-winner-urglobal') {
        showAwardsWinnerPage('page-winner-urglobal');
    } else if (hash === '#page-products-v1') {
        showProductsPage('page-products-v1');
    } else if (hash === '#page-offering-v1') {
        showOfferingPage('page-offering-v1');
    } else if (hash === '#page-communities-v1') {
        showCommunitiesPage('page-communities-v1');
    } else if (hash === '#page-team') {
        showTeamPage();
    } else if (hash === '#page-history') {
        showHistoryPage();
    } else if (hash === '#page-expertise') {
        showExpertisePage();
    } else if (hash === '#page-expertise-publishing') {
        showExpertisePublishingPage();
    } else if (hash === '#page-expertise-content-creation') {
        showExpertiseContentCreationPage();
    } else if (hash === '#page-expertise-events') {
        showExpertiseEventsPage();
    } else if (hash === '#page-expertise-advisory') {
        showExpertiseAdvisoryPage();
    } else if (hash === '#page-expertise-research') {
        showExpertiseResearchPage();
    } else if (hash === '#page-social-responsibility') {
        showSocialResponsibilityPage();
    } else if (hash === '#page-about') {
        showAboutPage();
    } else if (hash === '#podcast-management') {
        showPodcastPage('podcast-management');
    } else if (hash === '#podcast-bilateral') {
        showPodcastPage('podcast-bilateral');
    } else if (hash === '#podcast-strategy') {
        showPodcastPage('podcast-strategy');
    } else if (hash === '#podcast-dual-heritage') {
        showPodcastPage('podcast-dual-heritage');
    } else if (hash === '#podcast-whisper-loud') {
        showPodcastPage('podcast-whisper-loud');
    } else if (hash === '#podcast-tiny-kitchens') {
        showPodcastPage('podcast-tiny-kitchens');
    } else if (hash === '#article-vovo') {
        showArticlePage('article-vovo');
    } else if (hash === '#article-top-1') {
        showArticlePage('article-top-1');
    } else if (hash === '#article-top-2') {
        showArticlePage('article-top-2');
    } else if (hash === '#article-top-3') {
        showArticlePage('article-top-3');
    } else if (hash === '#article-top-4') {
        showArticlePage('article-top-4');
    } else if (hash === '#article-top-5') {
        showArticlePage('article-top-5');
    } else if (hash === '#article-future-2050') {
        showArticlePage('article-future-2050');
    } else if (hash === '#article-after-school') {
        showArticlePage('article-after-school');
    } else if (hash === '#article-masters-deal') {
        showArticlePage('article-masters-deal');
    } else if (hash === '#article-vision-motion') {
        showArticlePage('article-vision-motion');
    } else if (hash === '#article-unemployment') {
        showArticlePage('article-unemployment');
    } else if (hash === '#article-legacy-awards') {
        showArticlePage('article-legacy-awards');
    } else {
        showHomePage();
    }
});

window.showArticlePage = function (pageId) {
    const mainContent = document.querySelector('main');
    const articlePage = document.getElementById(pageId);
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'none';
    newsletterSection.forEach(s => s.style.display = 'none');
    recentNewsSection.forEach(s => s.style.display = 'none');
    if (articlePage) articlePage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Article - Simphiwe Mtetwa';
};

window.showSpotlightPage = function (pageId) {
    const mainContent = document.querySelector('main');
    const spotlightPage = document.getElementById(pageId);
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'none';
    newsletterSection.forEach(s => s.style.display = 'none');
    recentNewsSection.forEach(s => s.style.display = 'none');
    if (spotlightPage) spotlightPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Spotlight - Simphiwe Mtetwa';
};

window.showCSIAwardsPage = function () {
    const mainContent = document.querySelector('main');
    const awardsPage = document.getElementById('page-csi-awards');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    if (window.location.hash !== '#page-csi-awards') {
        history.pushState(null, '', '#page-csi-awards');
    }
    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (awardsPage) awardsPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'CSI Awards - Simphiwe Mtetwa';
};

window.showAwardsPage = function () {
    const mainContent = document.querySelector('main');
    const awardsPage = document.getElementById('page-csi-legacy-awards');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    if (window.location.hash !== '#page-csi-legacy-awards') {
        history.pushState(null, '', '#page-csi-legacy-awards');
    }
    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (awardsPage) awardsPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'CSI Legacy Awards - Simphiwe Mtetwa';
};

window.showAwardsWinnerPage = function (pageId) {
    const mainContent = document.querySelector('main');
    const winnerPage = document.getElementById(pageId);
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    if (window.location.hash !== '#' + pageId) {
        history.pushState(null, '', '#' + pageId);
    }
    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'none';
    newsletterSection.forEach(s => s.style.display = 'none');
    recentNewsSection.forEach(s => s.style.display = 'none');
    if (winnerPage) winnerPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'CSI Legacy Awards Winner - Simphiwe Mtetwa';
};

window.showCSIIndabaPage = function () {
    const mainContent = document.querySelector('main');
    const indabaPage = document.getElementById('page-csi-indaba');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    if (window.location.hash !== '#page-csi-indaba') {
        history.pushState(null, '', '#page-csi-indaba');
    }
    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (indabaPage) indabaPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'CSI Indaba 2026 - Simphiwe Mtetwa';
};

window.showProductsPage = function (pageId) {
    const mainContent = document.querySelector('main');
    const productsPage = document.getElementById(pageId);
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'none';
    newsletterSection.forEach(s => s.style.display = 'none');
    recentNewsSection.forEach(s => s.style.display = 'none');
    if (productsPage) productsPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Products - Simphiwe Mtetwa';
};

window.showOfferingPage = function (pageId) {
    const mainContent = document.querySelector('main');
    const offeringPage = document.getElementById(pageId);
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'none';
    newsletterSection.forEach(s => s.style.display = 'none');
    recentNewsSection.forEach(s => s.style.display = 'none');
    if (offeringPage) offeringPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Our Offering - Simphiwe Mtetwa';

    // Reset to first tab
    showOfferingTab('vision');
};

window.showCommunitiesPage = function (pageId) {
    const mainContent = document.querySelector('main');
    const communitiesPage = document.getElementById(pageId);
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'none';
    newsletterSection.forEach(s => s.style.display = 'none');
    recentNewsSection.forEach(s => s.style.display = 'none');
    if (communitiesPage) communitiesPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Building Better Communities - Simphiwe Mtetwa';
};

window.showTeamPage = function () {
    const mainContent = document.querySelector('main');
    const teamPage = document.getElementById('page-team');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (teamPage) teamPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Our Team - Simphiwe Mtetwa';
};

window.showHistoryPage = function () {
    const mainContent = document.querySelector('main');
    const historyPage = document.getElementById('page-history');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (historyPage) historyPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Our History - Simphiwe Mtetwa';
};

window.showExpertisePage = function () {
    if (window.location.hash !== '#page-expertise') {
        history.pushState(null, '', '#page-expertise');
    }
    const mainContent = document.querySelector('main');
    const expertisePage = document.getElementById('page-expertise');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (expertisePage) expertisePage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Expertise - Simphiwe Mtetwa';
};

window.showAboutSection = function (sectionId) {
    showAboutPage();
    setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
};

window.showExpertisePublishingPage = function () {
    if (window.location.hash !== '#page-expertise-publishing') {
        history.pushState(null, '', '#page-expertise-publishing');
    }
    const mainContent = document.querySelector('main');
    const page = document.getElementById('page-expertise-publishing');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (page) page.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Publishing Expertise - Simphiwe Mtetwa';
};

window.showExpertiseContentCreationPage = function () {
    if (window.location.hash !== '#page-expertise-content-creation') {
        history.pushState(null, '', '#page-expertise-content-creation');
    }
    const mainContent = document.querySelector('main');
    const page = document.getElementById('page-expertise-content-creation');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (page) page.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Content Creation Expertise - Simphiwe Mtetwa';
};

window.showExpertiseEventsPage = function () {
    if (window.location.hash !== '#page-expertise-events') {
        history.pushState(null, '', '#page-expertise-events');
    }
    const mainContent = document.querySelector('main');
    const page = document.getElementById('page-expertise-events');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (page) page.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Convening & Programme Architecture - Simphiwe Mtetwa';
};

window.showExpertiseAdvisoryPage = function () {
    if (window.location.hash !== '#page-expertise-advisory') {
        history.pushState(null, '', '#page-expertise-advisory');
    }
    const mainContent = document.querySelector('main');
    const page = document.getElementById('page-expertise-advisory');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (page) page.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Advisory Expertise - Simphiwe Mtetwa';
};

window.showExpertiseResearchPage = function () {
    if (window.location.hash !== '#page-expertise-research') {
        history.pushState(null, '', '#page-expertise-research');
    }
    const mainContent = document.querySelector('main');
    const page = document.getElementById('page-expertise-research');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (page) page.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Research Expertise - Simphiwe Mtetwa';
};

window.showCaseStudiesPage = function () {
    const mainContent = document.querySelector('main');
    const caseStudiesPage = document.getElementById('page-case-studies');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (caseStudiesPage) caseStudiesPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Case Studies - Simphiwe Mtetwa';
};

window.showSocialResponsibilityPage = function () {
    if (window.location.hash !== '#page-social-responsibility') {
        history.pushState(null, '', '#page-social-responsibility');
    }
    const mainContent = document.querySelector('main');
    const socialPage = document.getElementById('page-social-responsibility');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (socialPage) socialPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Social Responsibility - Simphiwe Mtetwa';
};

window.openSocialResponsibilityPopup = function () {
    const trigger = document.getElementById('popupTrigger');
    const popupOverlay = document.getElementById('popupOverlay');
    const popup = document.getElementById('popup');
    if (trigger) {
        trigger.click();
        if (popupOverlay && popupOverlay.classList.contains('open')) return;
    }
    if (!popupOverlay || !popup) return;
    popupOverlay.classList.add('open');
    popupOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => popup.focus());
};

window.showMatterMagazinePage = function () {
    if (window.location.hash !== '#page-matter-magazine') {
        history.pushState(null, '', '#page-matter-magazine');
    }
    const mainContent = document.querySelector('main');
    const magazinePage = document.getElementById('page-matter-magazine');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'block';
    newsletterSection.forEach(s => s.style.display = 'block');
    recentNewsSection.forEach(s => s.style.display = 'block');
    if (magazinePage) magazinePage.style.display = 'block';
    initializeMatterDflip();
    window.scrollTo(0, 0);
    document.title = 'Matter Magazine - Simphiwe Mtetwa';
};

window.showWebinarsPage = function () {
    if (window.location.hash !== '#page-webinars') {
        history.pushState(null, '', '#page-webinars');
    }
    const mainContent = document.querySelector('main');
    const webinarsPage = document.getElementById('page-webinars');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'none';
    newsletterSection.forEach(s => s.style.display = 'none');
    recentNewsSection.forEach(s => s.style.display = 'none');
    if (webinarsPage) webinarsPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'CSI Webinars - Simphiwe Mtetwa';
};

window.showWebinarDetail = function (detailId) {
    if (window.location.hash !== '#' + detailId) {
        history.pushState(null, '', '#' + detailId);
    }
    const mainContent = document.querySelector('main');
    const detailPage = document.getElementById(detailId);
    const footers = document.querySelectorAll('.main-footer');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (detailPage) detailPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Webinar Details - Simphiwe Mtetwa';
};

window.showWebinarTab = function (tab) {
    document.querySelectorAll('.webinar-tab-panel').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.webinars-tab').forEach(t => t.classList.remove('active'));
    if (tab === 'all') {
        document.getElementById('webinar-tab-all').style.display = 'block';
    } else if (tab === 'upcoming') {
        document.getElementById('webinar-tab-upcoming').style.display = 'block';
    } else if (tab === 'past') {
        document.getElementById('webinar-tab-past').style.display = 'block';
    }
    event.target.classList.add('active');
};

function showCommunitiesSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.communities-article-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.communities-nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId + '-section').classList.add('active');

    // Add active class to clicked tab
    document.getElementById('tab-' + sectionId).classList.add('active');

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showOfferingTab(tabId) {
    // Hide all tab content
    document.querySelectorAll('.offering-tab-content').forEach(section => {
        section.style.display = 'none';
    });
    // Remove active class from all tabs
    document.querySelectorAll('.offering-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    // Show selected tab
    document.getElementById('offering-' + tabId).style.display = 'block';
    // Activate clicked tab
    document.getElementById('offering-tab-' + tabId).classList.add('active');
}

function showSpotlightV4Page() {
    const mainContent = document.querySelector('main');
    const spotlightV4Page = document.getElementById('page-spotlight-v4');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'none';
    newsletterSection.forEach(s => s.style.display = 'none');
    recentNewsSection.forEach(s => s.style.display = 'none');
    if (spotlightV4Page) spotlightV4Page.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Spotlight V4 - Simphiwe Mtetwa';
    setTimeout(initSliderV4, 100);
}

// Spotlight V4 Slider Functions
let currentSlideV4 = 0;
let autoPlayIntervalV4;

function showSlideV4(index) {
    const slides = document.querySelectorAll('#page-spotlight-v4 .hero-slide');
    const indicators = document.querySelectorAll('#page-spotlight-v4 .slide-indicator');
    const totalSlides = slides.length;

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    indicators.forEach((ind, i) => {
        ind.classList.toggle('active', i === index);
    });
    currentSlideV4 = index;
}

function nextSlideV4() {
    const slides = document.querySelectorAll('#page-spotlight-v4 .hero-slide');
    const totalSlides = slides.length;
    showSlideV4((currentSlideV4 + 1) % totalSlides);
}

function prevSlideV4() {
    const slides = document.querySelectorAll('#page-spotlight-v4 .hero-slide');
    const totalSlides = slides.length;
    showSlideV4((currentSlideV4 - 1 + totalSlides) % totalSlides);
}

function goToSlideV4(index) {
    showSlideV4(index);
    resetAutoPlayV4();
}

function resetAutoPlayV4() {
    clearInterval(autoPlayIntervalV4);
    autoPlayIntervalV4 = setInterval(nextSlideV4, 6000);
}

function initSliderV4() {
    resetAutoPlayV4();
    const slider = document.getElementById('hero-slider-v4');
    if (slider) {
        slider.addEventListener('mouseenter', () => clearInterval(autoPlayIntervalV4));
        slider.addEventListener('mouseleave', resetAutoPlayV4);
    }
}

function showAboutPage() {
    const mainContent = document.querySelector('main');
    const aboutPage = document.getElementById('page-about');
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], [id^="webinar-01-detail"], [id^="webinar-02-detail"]').forEach(el => el.style.display = 'none');
    if (mainContent) mainContent.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'none';
    newsletterSection.forEach(s => s.style.display = 'none');
    recentNewsSection.forEach(s => s.style.display = 'none');
    if (aboutPage) aboutPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'About Us - Simphiwe Mtetwa';

    // Trigger stat counters for About page with loop
    const aboutStats = aboutPage.querySelector('.history-stats');
    if (aboutStats) {
        const counters = aboutStats.querySelectorAll('.stat-counter');
        const animateLoop = () => {
            counters.forEach(c => animateCounter(c, true));
        };
        animateLoop();
        setInterval(animateLoop, 4000);
    }
}

function showPodcastPage(pageId) {
    const mainContent = document.querySelector('main');
    const contactPage = document.getElementById('page-contact');
    const podcastPage = document.getElementById(pageId);
    const footers = document.querySelectorAll('.main-footer');
    const impactSection = document.getElementById('impactSection');
    const newsletterSection = document.querySelectorAll('.newsletter-section');
    const recentNewsSection = document.querySelectorAll('.footer-news-section');

    if (mainContent) mainContent.style.display = 'none';
    if (contactPage) contactPage.style.display = 'none';
    footers.forEach(f => f.style.display = 'block');
    if (impactSection) impactSection.style.display = 'none';
    newsletterSection.forEach(s => s.style.display = 'none');
    recentNewsSection.forEach(s => s.style.display = 'none');

    document.querySelectorAll('[id^="podcast-"]').forEach(el => el.style.display = 'none');
    document.querySelectorAll('[id^="page-"], [id^="article-"]').forEach(el => el.style.display = 'none');

    if (podcastPage) podcastPage.style.display = 'block';
    window.scrollTo(0, 0);
    document.title = 'Podcast - Simphiwe Mtetwa';
}

window.navigateToPodcast = function (pageId) {
    window.location.hash = '#' + pageId;
    showPodcastPage(pageId);
};

// Podcast audio player
let podAudio = null;
let podInterval = null;

window.togglePodcastAudio = function () {
    podAudio = document.getElementById('pod-audio');
    if (!podAudio) return;
    const podBtn = document.getElementById('pod-play-btn');
    const podIcon = document.getElementById('pod-play-icon');
    if (!window.podPlaying) {
        podAudio.play();
        window.podPlaying = true;
        if (podBtn) podBtn.classList.add('playing');
        podInterval = setInterval(() => {
            const cur = podAudio.currentTime;
            const dur = podAudio.duration || 1169;
            const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
            const el = document.getElementById('pod-player-time');
            if (el) el.textContent = fmt(cur) + ' / ' + fmt(dur);
            const bar = document.getElementById('pod-progress-bar');
            if (bar) bar.style.width = (cur / dur * 100) + '%';
            if (podAudio.ended) {
                window.podPlaying = false;
                clearInterval(podInterval);
                if (podBtn) podBtn.classList.remove('playing');
            }
        }, 100);
    } else {
        podAudio.pause();
        window.podPlaying = false;
        clearInterval(podInterval);
        if (podBtn) podBtn.classList.remove('playing');
    }
};

window.seekPodcastAudio = function (e) {
    if (!podAudio) podAudio = document.getElementById('pod-audio');
    if (!podAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    podAudio.currentTime = pct * (podAudio.duration || 1169);
};

window.togglePodcastAudio2 = function () {
    const audio = document.getElementById('pod-audio2');
    const btn = document.getElementById('pod-play-btn2');
    const icon = document.getElementById('pod-play-icon2');
    if (!audio) return;
    window._podPlaying2 = !window._podPlaying2;
    if (window._podPlaying2) {
        audio.play();
        if (btn) btn.classList.add('playing');
        window._podInterval2 = setInterval(() => {
            const cur = audio.currentTime, dur = audio.duration || 1679;
            const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
            const el = document.getElementById('pod-player-time2');
            if (el) el.textContent = fmt(cur) + ' / ' + fmt(dur);
            const bar = document.getElementById('pod-progress-bar2');
            if (bar) bar.style.width = (cur / dur * 100) + '%';
            if (audio.ended) {
                window._podPlaying2 = false;
                clearInterval(window._podInterval2);
                if (btn) btn.classList.remove('playing');
            }
        }, 100);
    } else {
        audio.pause();
        clearInterval(window._podInterval2);
        if (btn) btn.classList.remove('playing');
    }
};
window.seekPodcastAudio2 = function (e) {
    const audio = document.getElementById('pod-audio2');
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * (audio.duration || 1679);
};
window.podSwitchTab2 = function (tab) {
    const d = document.getElementById('pod-details2'), t = document.getElementById('pod-transcript2');
    const td = document.getElementById('pod-tab-details2'), tt = document.getElementById('pod-tab-transcript2');
    if (tab === 'details') { if (d) d.style.display = 'block'; if (t) t.style.display = 'none'; if (td) td.classList.add('active'); if (tt) tt.classList.remove('active'); }
    else { if (d) d.style.display = 'none'; if (t) t.style.display = 'block'; if (td) td.classList.remove('active'); if (tt) tt.classList.add('active'); }
};

window.togglePodcastAudio3 = function () {
    const audio = document.getElementById('pod-audio3');
    const btn = document.getElementById('pod-play-btn3');
    if (!audio) return;
    window._podPlaying3 = !window._podPlaying3;
    if (window._podPlaying3) {
        audio.play();
        if (btn) btn.classList.add('playing');
        window._podInterval3 = setInterval(() => {
            const cur = audio.currentTime, dur = audio.duration || 1679;
            const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
            const el = document.getElementById('pod-player-time3');
            if (el) el.textContent = fmt(cur) + ' / ' + fmt(dur);
            const bar = document.getElementById('pod-progress-bar3');
            if (bar) bar.style.width = (cur / dur * 100) + '%';
            if (audio.ended) { window._podPlaying3 = false; clearInterval(window._podInterval3); if (btn) btn.classList.remove('playing'); }
        }, 100);
    } else { audio.pause(); clearInterval(window._podInterval3); if (btn) btn.classList.remove('playing'); }
};
window.seekPodcastAudio3 = function (e) {
    const audio = document.getElementById('pod-audio3');
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * (audio.duration || 1679);
};
window.podSwitchTab3 = function (tab) {
    const d = document.getElementById('pod-details3'), t = document.getElementById('pod-transcript3');
    const td = document.getElementById('pod-tab-details3'), tt = document.getElementById('pod-tab-transcript3');
    if (tab === 'details') { if (d) d.style.display = 'block'; if (t) t.style.display = 'none'; if (td) td.classList.add('active'); if (tt) tt.classList.remove('active'); }
    else { if (d) d.style.display = 'none'; if (t) t.style.display = 'block'; if (td) td.classList.remove('active'); if (tt) tt.classList.add('active'); }
};

window.togglePodcastAudio4 = function () {
    const audio = document.getElementById('pod-audio4');
    const btn = document.getElementById('pod-play-btn4');
    if (!audio) return;
    window._podPlaying4 = !window._podPlaying4;
    if (window._podPlaying4) {
        audio.play();
        if (btn) btn.classList.add('playing');
        window._podInterval4 = setInterval(() => {
            const cur = audio.currentTime, dur = audio.duration || 1710;
            const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
            const el = document.getElementById('pod-player-time4');
            if (el) el.textContent = fmt(cur) + ' / ' + fmt(dur);
            const bar = document.getElementById('pod-progress-bar4');
            if (bar) bar.style.width = (cur / dur * 100) + '%';
            if (audio.ended) { window._podPlaying4 = false; clearInterval(window._podInterval4); if (btn) btn.classList.remove('playing'); }
        }, 100);
    } else { audio.pause(); clearInterval(window._podInterval4); if (btn) btn.classList.remove('playing'); }
};
window.seekPodcastAudio4 = function (e) {
    const audio = document.getElementById('pod-audio4');
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * (audio.duration || 1710);
};
window.podSwitchTab4 = function (tab) {
    const d = document.getElementById('pod-details4'), t = document.getElementById('pod-transcript4');
    const td = document.getElementById('pod-tab-details4'), tt = document.getElementById('pod-tab-transcript4');
    if (tab === 'details') { if (d) d.style.display = 'block'; if (t) t.style.display = 'none'; if (td) td.classList.add('active'); if (tt) tt.classList.remove('active'); }
    else { if (d) d.style.display = 'none'; if (t) t.style.display = 'block'; if (td) td.classList.remove('active'); if (tt) tt.classList.add('active'); }
};

window.togglePodcastAudio5 = function () {
    const audio = document.getElementById('pod-audio5');
    const btn = document.getElementById('pod-play-btn5');
    if (!audio) return;
    window._podPlaying5 = !window._podPlaying5;
    if (window._podPlaying5) {
        audio.play();
        if (btn) btn.classList.add('playing');
        window._podInterval5 = setInterval(() => {
            const cur = audio.currentTime, dur = audio.duration || 2040;
            const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
            const el = document.getElementById('pod-player-time5');
            if (el) el.textContent = fmt(cur) + ' / ' + fmt(dur);
            const bar = document.getElementById('pod-progress-bar5');
            if (bar) bar.style.width = (cur / dur * 100) + '%';
            if (audio.ended) { window._podPlaying5 = false; clearInterval(window._podInterval5); if (btn) btn.classList.remove('playing'); }
        }, 100);
    } else { audio.pause(); clearInterval(window._podInterval5); if (btn) btn.classList.remove('playing'); }
};
window.seekPodcastAudio5 = function (e) {
    const audio = document.getElementById('pod-audio5');
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * (audio.duration || 2040);
};
window.podSwitchTab5 = function (tab) {
    const d = document.getElementById('pod-details5'), t = document.getElementById('pod-transcript5');
    const td = document.getElementById('pod-tab-details5'), tt = document.getElementById('pod-tab-transcript5');
    if (tab === 'details') { if (d) d.style.display = 'block'; if (t) t.style.display = 'none'; if (td) td.classList.add('active'); if (tt) tt.classList.remove('active'); }
    else { if (d) d.style.display = 'none'; if (t) t.style.display = 'block'; if (td) td.classList.remove('active'); if (tt) tt.classList.add('active'); }
};

window.togglePodcastAudio6 = function () {
    const audio = document.getElementById('pod-audio6');
    const btn = document.getElementById('pod-play-btn6');
    if (!audio) return;
    window._podPlaying6 = !window._podPlaying6;
    if (window._podPlaying6) {
        audio.play();
        if (btn) btn.classList.add('playing');
        window._podInterval6 = setInterval(() => {
            const cur = audio.currentTime, dur = audio.duration || 1860;
            const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
            const el = document.getElementById('pod-player-time6');
            if (el) el.textContent = fmt(cur) + ' / ' + fmt(dur);
            const bar = document.getElementById('pod-progress-bar6');
            if (bar) bar.style.width = (cur / dur * 100) + '%';
            if (audio.ended) { window._podPlaying6 = false; clearInterval(window._podInterval6); if (btn) btn.classList.remove('playing'); }
        }, 100);
    } else { audio.pause(); clearInterval(window._podInterval6); if (btn) btn.classList.remove('playing'); }
};
window.seekPodcastAudio6 = function (e) {
    const audio = document.getElementById('pod-audio6');
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * (audio.duration || 1860);
};
window.podSwitchTab6 = function (tab) {
    const d = document.getElementById('pod-details6'), t = document.getElementById('pod-transcript6');
    const td = document.getElementById('pod-tab-details6'), tt = document.getElementById('pod-tab-transcript6');
    if (tab === 'details') { if (d) d.style.display = 'block'; if (t) t.style.display = 'none'; if (td) td.classList.add('active'); if (tt) tt.classList.remove('active'); }
    else { if (d) d.style.display = 'none'; if (t) t.style.display = 'block'; if (td) td.classList.remove('active'); if (tt) tt.classList.add('active'); }
};

// Podcast player for article-vovo
const playBtn = document.getElementById('pod-play-btn');
const playIcon = document.getElementById('pod-play-icon');
const progressBar = document.getElementById('pod-progress-bar');
const progressWrap = document.getElementById('pod-progress-wrap');
const timeDisplay = document.getElementById('pod-player-time');
const audio = document.getElementById('pod-audio');
let podPlaying = false, podProgressInterval = null;

if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (!audio) return;
        if (!podPlaying) {
            audio.play();
            podPlaying = true;
            playBtn.style.background = 'var(--token-primary)';
            playIcon.style.cssText = 'display:inline-block;width:14px;height:16px;background:transparent;position:relative;border:none;margin:0;';
            playIcon.innerHTML = '<span style="position:absolute;left:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span><span style="position:absolute;right:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span>';
            podProgressInterval = setInterval(() => {
                if (!audio) return;
                const cur = audio.currentTime, dur = audio.duration || 1169;
                const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
                timeDisplay.textContent = fmt(cur) + ' / ' + fmt(dur);
                progressBar.style.width = (cur / dur * 100) + '%';
                if (audio.ended) {
                    podPlaying = false;
                    clearInterval(podProgressInterval);
                    playBtn.style.background = 'var(--token-primary)';
                    playIcon.innerHTML = '';
                    playIcon.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
                }
            }, 100);
        } else {
            audio.pause();
            podPlaying = false;
            clearInterval(podProgressInterval);
            playBtn.style.background = 'var(--token-primary)';
            playIcon.innerHTML = '';
            playIcon.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
        }
    });
}

if (progressWrap) {
    progressWrap.addEventListener('click', (e) => {
        if (!audio) return;
        const rect = progressWrap.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (audio.duration) audio.currentTime = pct * audio.duration;
    });
}

window.podSwitchTab = function (tab) {
    const details = document.getElementById('pod-details');
    const transcript = document.getElementById('pod-transcript');
    const tabD = document.getElementById('pod-tab-details');
    const tabT = document.getElementById('pod-tab-transcript');
    if (tab === 'details') {
        if (details) details.style.display = 'block';
        if (transcript) transcript.style.display = 'none';
        if (tabD) {
            tabD.classList.add('active');
            tabD.style.color = '#111111';
            tabD.style.borderBottom = '2px solid var(--token-primary)';
        }
        if (tabT) {
            tabT.classList.remove('active');
            tabT.style.color = 'var(--token-text-muted)';
            tabT.style.borderBottom = 'none';
        }
    } else {
        if (details) details.style.display = 'none';
        if (transcript) transcript.style.display = 'block';
        if (tabD) {
            tabD.classList.remove('active');
            tabD.style.color = 'var(--token-text-muted)';
            tabD.style.borderBottom = 'none';
        }
        if (tabT) {
            tabT.classList.add('active');
            tabT.style.color = '#111111';
            tabT.style.borderBottom = '2px solid var(--token-primary)';
        }
    }
};

// Podcast player for article-future-2050
const playBtn2 = document.getElementById('pod-play-btn2');
const playIcon2 = document.getElementById('pod-play-icon2');
const progressBar2 = document.getElementById('pod-progress-bar2');
const progressWrap2 = document.getElementById('pod-progress-wrap2');
const timeDisplay2 = document.getElementById('pod-player-time2');
const audio2 = document.getElementById('pod-audio2');
let podPlaying2 = false, podProgressInterval2 = null;

if (playBtn2) {
    playBtn2.addEventListener('click', () => {
        if (!audio2) return;
        if (!podPlaying2) {
            audio2.play();
            podPlaying2 = true;
            playBtn2.style.background = 'var(--token-primary)';
            playIcon2.style.cssText = 'display:inline-block;width:14px;height:16px;background:transparent;position:relative;border:none;margin:0;';
            playIcon2.innerHTML = '<span style="position:absolute;left:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span><span style="position:absolute;right:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span>';
            podProgressInterval2 = setInterval(() => {
                if (!audio2) return;
                const cur = audio2.currentTime, dur = audio2.duration || 1680;
                const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
                timeDisplay2.textContent = fmt(cur) + ' / ' + fmt(dur);
                progressBar2.style.width = (cur / dur * 100) + '%';
                if (audio2.ended) {
                    podPlaying2 = false;
                    clearInterval(podProgressInterval2);
                    playBtn2.style.background = 'var(--token-primary)';
                    playIcon2.innerHTML = '';
                    playIcon2.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
                }
            }, 100);
        } else {
            audio2.pause();
            podPlaying2 = false;
            clearInterval(podProgressInterval2);
            playBtn2.style.background = 'var(--token-primary)';
            playIcon2.innerHTML = '';
            playIcon2.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
        }
    });
}

if (progressWrap2) {
    progressWrap2.addEventListener('click', (e) => {
        if (!audio2) return;
        const rect = progressWrap2.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (audio2.duration) audio2.currentTime = pct * audio2.duration;
    });
}

window.podSwitchTab2 = function (tab) {
    const details = document.getElementById('pod-details2');
    const transcript = document.getElementById('pod-transcript2');
    const tabD = document.getElementById('pod-tab-details2');
    const tabT = document.getElementById('pod-tab-transcript2');
    if (tab === 'details') {
        if (details) details.style.display = 'block';
        if (transcript) transcript.style.display = 'none';
        if (tabD) {
            tabD.classList.add('active');
            tabD.style.color = '#111111';
            tabD.style.borderBottom = '2px solid var(--token-primary)';
        }
        if (tabT) {
            tabT.classList.remove('active');
            tabT.style.color = 'var(--token-text-muted)';
            tabT.style.borderBottom = 'none';
        }
    } else {
        if (details) details.style.display = 'none';
        if (transcript) transcript.style.display = 'block';
        if (tabD) {
            tabD.classList.remove('active');
            tabD.style.color = 'var(--token-text-muted)';
            tabD.style.borderBottom = 'none';
        }
        if (tabT) {
            tabT.classList.add('active');
            tabT.style.color = '#111111';
            tabT.style.borderBottom = '2px solid var(--token-primary)';
        }
    }
};

// Podcast player for article-after-school
const playBtn3 = document.getElementById('pod-play-btn3');
const playIcon3 = document.getElementById('pod-play-icon3');
const progressBar3 = document.getElementById('pod-progress-bar3');
const progressWrap3 = document.getElementById('pod-progress-wrap3');
const timeDisplay3 = document.getElementById('pod-player-time3');
const audio3 = document.getElementById('pod-audio3');
let podPlaying3 = false, podProgressInterval3 = null;

if (playBtn3) {
    playBtn3.addEventListener('click', () => {
        if (!audio3) return;
        if (!podPlaying3) {
            audio3.play();
            podPlaying3 = true;
            playBtn3.style.background = 'var(--token-primary)';
            playIcon3.style.cssText = 'display:inline-block;width:14px;height:16px;background:transparent;position:relative;border:none;margin:0;';
            playIcon3.innerHTML = '<span style="position:absolute;left:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span><span style="position:absolute;right:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span>';
            podProgressInterval3 = setInterval(() => {
                if (!audio3) return;
                const cur = audio3.currentTime, dur = audio3.duration || 1680;
                const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
                timeDisplay3.textContent = fmt(cur) + ' / ' + fmt(dur);
                progressBar3.style.width = (cur / dur * 100) + '%';
                if (audio3.ended) {
                    podPlaying3 = false;
                    clearInterval(podProgressInterval3);
                    playBtn3.style.background = 'var(--token-primary)';
                    playIcon3.innerHTML = '';
                    playIcon3.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
                }
            }, 100);
        } else {
            audio3.pause();
            podPlaying3 = false;
            clearInterval(podProgressInterval3);
            playBtn3.style.background = 'var(--token-primary)';
            playIcon3.innerHTML = '';
            playIcon3.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
        }
    });
}

if (progressWrap3) {
    progressWrap3.addEventListener('click', (e) => {
        if (!audio3) return;
        const rect = progressWrap3.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (audio3.duration) audio3.currentTime = pct * audio3.duration;
    });
}

window.podSwitchTab3 = function (tab) {
    const details = document.getElementById('pod-details3');
    const transcript = document.getElementById('pod-transcript3');
    const tabD = document.getElementById('pod-tab-details3');
    const tabT = document.getElementById('pod-tab-transcript3');
    if (tab === 'details') {
        if (details) details.style.display = 'block';
        if (transcript) transcript.style.display = 'none';
        if (tabD) {
            tabD.classList.add('active');
            tabD.style.color = '#111111';
            tabD.style.borderBottom = '2px solid var(--token-primary)';
        }
        if (tabT) {
            tabT.classList.remove('active');
            tabT.style.color = 'var(--token-text-muted)';
            tabT.style.borderBottom = 'none';
        }
    } else {
        if (details) details.style.display = 'none';
        if (transcript) transcript.style.display = 'block';
        if (tabD) {
            tabD.classList.remove('active');
            tabD.style.color = 'var(--token-text-muted)';
            tabD.style.borderBottom = 'none';
        }
        if (tabT) {
            tabT.classList.add('active');
            tabT.style.color = '#111111';
            tabT.style.borderBottom = '2px solid var(--token-primary)';
        }
    }
};

// Podcast player for article-masters-deal
const playBtn4 = document.getElementById('pod-play-btn4');
const playIcon4 = document.getElementById('pod-play-icon4');
const progressBar4 = document.getElementById('pod-progress-bar4');
const progressWrap4 = document.getElementById('pod-progress-wrap4');
const timeDisplay4 = document.getElementById('pod-player-time4');
const audio4 = document.getElementById('pod-audio4');
let podPlaying4 = false, podProgressInterval4 = null;

if (playBtn4) {
    playBtn4.addEventListener('click', () => {
        if (!audio4) return;
        if (!podPlaying4) {
            audio4.play();
            podPlaying4 = true;
            playBtn4.style.background = 'var(--token-primary)';
            playIcon4.style.cssText = 'display:inline-block;width:14px;height:16px;background:transparent;position:relative;border:none;margin:0;';
            playIcon4.innerHTML = '<span style="position:absolute;left:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span><span style="position:absolute;right:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span>';
            podProgressInterval4 = setInterval(() => {
                if (!audio4) return;
                const cur = audio4.currentTime, dur = audio4.duration || 1710;
                const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
                timeDisplay4.textContent = fmt(cur) + ' / ' + fmt(dur);
                progressBar4.style.width = (cur / dur * 100) + '%';
                if (audio4.ended) {
                    podPlaying4 = false;
                    clearInterval(podProgressInterval4);
                    playBtn4.style.background = 'var(--token-primary)';
                    playIcon4.innerHTML = '';
                    playIcon4.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
                }
            }, 100);
        } else {
            audio4.pause();
            podPlaying4 = false;
            clearInterval(podProgressInterval4);
            playBtn4.style.background = 'var(--token-primary)';
            playIcon4.innerHTML = '';
            playIcon4.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
        }
    });
}

if (progressWrap4) {
    progressWrap4.addEventListener('click', (e) => {
        if (!audio4) return;
        const rect = progressWrap4.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (audio4.duration) audio4.currentTime = pct * audio4.duration;
    });
}

window.podSwitchTab4 = function (tab) {
    const details = document.getElementById('pod-details4');
    const transcript = document.getElementById('pod-transcript4');
    const tabD = document.getElementById('pod-tab-details4');
    const tabT = document.getElementById('pod-tab-transcript4');
    if (tab === 'details') {
        if (details) details.style.display = 'block';
        if (transcript) transcript.style.display = 'none';
        if (tabD) {
            tabD.classList.add('active');
            tabD.style.color = '#111111';
            tabD.style.borderBottom = '2px solid var(--token-primary)';
        }
        if (tabT) {
            tabT.classList.remove('active');
            tabT.style.color = 'var(--token-text-muted)';
            tabT.style.borderBottom = 'none';
        }
    } else {
        if (details) details.style.display = 'none';
        if (transcript) transcript.style.display = 'block';
        if (tabD) {
            tabD.classList.remove('active');
            tabD.style.color = 'var(--token-text-muted)';
            tabD.style.borderBottom = 'none';
        }
        if (tabT) {
            tabT.classList.add('active');
            tabT.style.color = '#111111';
            tabT.style.borderBottom = '2px solid var(--token-primary)';
        }
    }
};

// Podcast player for article-vision-motion
const playBtn5 = document.getElementById('pod-play-btn5');
const playIcon5 = document.getElementById('pod-play-icon5');
const progressBar5 = document.getElementById('pod-progress-bar5');
const progressWrap5 = document.getElementById('pod-progress-wrap5');
const timeDisplay5 = document.getElementById('pod-player-time5');
const audio5 = document.getElementById('pod-audio5');
let podPlaying5 = false, podProgressInterval5 = null;

if (playBtn5) {
    playBtn5.addEventListener('click', () => {
        if (!audio5) return;
        if (!podPlaying5) {
            audio5.play();
            podPlaying5 = true;
            playBtn5.style.background = 'var(--token-primary)';
            playIcon5.style.cssText = 'display:inline-block;width:14px;height:16px;background:transparent;position:relative;border:none;margin:0;';
            playIcon5.innerHTML = '<span style="position:absolute;left:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span><span style="position:absolute;right:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span>';
            podProgressInterval5 = setInterval(() => {
                if (!audio5) return;
                const cur = audio5.currentTime, dur = audio5.duration || 2045;
                const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
                timeDisplay5.textContent = fmt(cur) + ' / ' + fmt(dur);
                progressBar5.style.width = (cur / dur * 100) + '%';
                if (audio5.ended) {
                    podPlaying5 = false;
                    clearInterval(podProgressInterval5);
                    playBtn5.style.background = 'var(--token-primary)';
                    playIcon5.innerHTML = '';
                    playIcon5.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
                }
            }, 100);
        } else {
            audio5.pause();
            podPlaying5 = false;
            clearInterval(podProgressInterval5);
            playBtn5.style.background = 'var(--token-primary)';
            playIcon5.innerHTML = '';
            playIcon5.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
        }
    });
}

if (progressWrap5) {
    progressWrap5.addEventListener('click', (e) => {
        if (!audio5) return;
        const rect = progressWrap5.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (audio5.duration) audio5.currentTime = pct * audio5.duration;
    });
}

window.podSwitchTab5 = function (tab) {
    const details = document.getElementById('pod-details5');
    const transcript = document.getElementById('pod-transcript5');
    const tabD = document.getElementById('pod-tab-details5');
    const tabT = document.getElementById('pod-tab-transcript5');
    if (tab === 'details') {
        if (details) details.style.display = 'block';
        if (transcript) transcript.style.display = 'none';
        if (tabD) {
            tabD.classList.add('active');
            tabD.style.color = '#111111';
            tabD.style.borderBottom = '2px solid var(--token-primary)';
        }
        if (tabT) {
            tabT.classList.remove('active');
            tabT.style.color = 'var(--token-text-muted)';
            tabT.style.borderBottom = 'none';
        }
    } else {
        if (details) details.style.display = 'none';
        if (transcript) transcript.style.display = 'block';
        if (tabD) {
            tabD.classList.remove('active');
            tabD.style.color = 'var(--token-text-muted)';
            tabD.style.borderBottom = 'none';
        }
        if (tabT) {
            tabT.classList.add('active');
            tabT.style.color = '#111111';
            tabT.style.borderBottom = '2px solid var(--token-primary)';
        }
    }
};

// Podcast player for article-unemployment
const playBtn6 = document.getElementById('pod-play-btn6');
const playIcon6 = document.getElementById('pod-play-icon6');
const progressBar6 = document.getElementById('pod-progress-bar6');
const progressWrap6 = document.getElementById('pod-progress-wrap6');
const timeDisplay6 = document.getElementById('pod-player-time6');
const audio6 = document.getElementById('pod-audio6');
let podPlaying6 = false, podProgressInterval6 = null;

if (playBtn6) {
    playBtn6.addEventListener('click', () => {
        if (!audio6) return;
        if (!podPlaying6) {
            audio6.play();
            podPlaying6 = true;
            playBtn6.style.background = 'var(--token-primary)';
            playIcon6.style.cssText = 'display:inline-block;width:14px;height:16px;background:transparent;position:relative;border:none;margin:0;';
            playIcon6.innerHTML = '<span style="position:absolute;left:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span><span style="position:absolute;right:0;top:0;width:5px;height:16px;background:#111111;display:block;"></span>';
            podProgressInterval6 = setInterval(() => {
                if (!audio6) return;
                const cur = audio6.currentTime, dur = audio6.duration || 1882;
                const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
                timeDisplay6.textContent = fmt(cur) + ' / ' + fmt(dur);
                progressBar6.style.width = (cur / dur * 100) + '%';
                if (audio6.ended) {
                    podPlaying6 = false;
                    clearInterval(podProgressInterval6);
                    playBtn6.style.background = 'var(--token-primary)';
                    playIcon6.innerHTML = '';
                    playIcon6.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
                }
            }, 100);
        } else {
            audio6.pause();
            podPlaying6 = false;
            clearInterval(podProgressInterval6);
            playBtn6.style.background = 'var(--token-primary)';
            playIcon6.innerHTML = '';
            playIcon6.style.cssText = 'width:0;height:0;border-left:16px solid #111111;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;';
        }
    });
}

if (progressWrap6) {
    progressWrap6.addEventListener('click', (e) => {
        if (!audio6) return;
        const rect = progressWrap6.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (audio6.duration) audio6.currentTime = pct * audio6.duration;
    });
}

window.podSwitchTab6 = function (tab) {
    const details = document.getElementById('pod-details6');
    const transcript = document.getElementById('pod-transcript6');
    const tabD = document.getElementById('pod-tab-details6');
    const tabT = document.getElementById('pod-tab-transcript6');
    if (tab === 'details') {
        if (details) details.style.display = 'block';
        if (transcript) transcript.style.display = 'none';
        if (tabD) {
            tabD.classList.add('active');
            tabD.style.color = '#111111';
            tabD.style.borderBottom = '2px solid var(--token-primary)';
        }
        if (tabT) {
            tabT.classList.remove('active');
            tabT.style.color = 'var(--token-text-muted)';
            tabT.style.borderBottom = 'none';
        }
    } else {
        if (details) details.style.display = 'none';
        if (transcript) transcript.style.display = 'block';
        if (tabD) {
            tabD.classList.remove('active');
            tabD.style.color = 'var(--token-text-muted)';
            tabD.style.borderBottom = 'none';
        }
        if (tabT) {
            tabT.classList.add('active');
            tabT.style.color = '#111111';
            tabT.style.borderBottom = '2px solid var(--token-primary)';
        }
    }
};

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

window.podSwitchTab7 = function (tab) {
    const details = document.getElementById('pod-details7');
    const transcript = document.getElementById('pod-transcript7');
    const tabD = document.getElementById('pod-tab-details7');
    const tabT = document.getElementById('pod-tab-transcript7');
    if (tab === 'details') {
        if (details) details.style.display = 'block';
        if (transcript) transcript.style.display = 'none';
        if (tabD) {
            tabD.classList.add('active');
            tabD.style.color = '#111111';
            tabD.style.borderBottom = '2px solid var(--token-primary)';
        }
        if (tabT) {
            tabT.classList.remove('active');
            tabT.style.color = 'var(--token-text-muted)';
            tabT.style.borderBottom = 'none';
        }
    } else {
        if (details) details.style.display = 'none';
        if (transcript) transcript.style.display = 'block';
        if (tabD) {
            tabD.classList.remove('active');
            tabD.style.color = 'var(--token-text-muted)';
            tabD.style.borderBottom = 'none';
        }
        if (tabT) {
            tabT.classList.add('active');
            tabT.style.color = '#111111';
            tabT.style.borderBottom = '2px solid var(--token-primary)';
        }
    }
};

window.togglePodcastAudio7 = function () {
    const audio = document.getElementById('pod-audio7');
    if (!audio) return;
    const btn = document.getElementById('pod-play-btn7');
    const icon = document.getElementById('pod-play-icon7');
    const progressWrap = document.getElementById('pod-progress-wrap7');
    const progressBar = document.getElementById('pod-progress-bar7');
    const timeDisplay = document.getElementById('pod-player-time7');
    if (!window.podPlaying7) {
        audio.play();
        window.podPlaying7 = true;
        if (btn) btn.classList.add('playing');
        if (icon) {
            icon.style.borderLeft = 'none';
            icon.style.borderRight = '14px solid #111111';
            icon.style.marginLeft = '0';
        }
        window.podInterval7 = setInterval(() => {
            if (audio.duration) {
                const pct = (audio.currentTime / audio.duration) * 100;
                if (progressBar) progressBar.style.width = pct + '%';
                const cur = formatTime(audio.currentTime);
                const dur = formatTime(audio.duration);
                if (timeDisplay) timeDisplay.textContent = cur + ' / ' + dur;
            }
            if (audio.ended) {
                window.podPlaying7 = false;
                clearInterval(window.podInterval7);
                if (btn) btn.classList.remove('playing');
                if (icon) {
                    icon.style.borderLeft = '14px solid #111111';
                    icon.style.borderTop = '9px solid transparent';
                    icon.style.borderBottom = '9px solid transparent';
                    icon.style.marginLeft = '4px';
                    icon.style.borderRight = 'none';
                }
            }
        }, 100);
    } else {
        audio.pause();
        window.podPlaying7 = false;
        clearInterval(window.podInterval7);
        if (btn) btn.classList.remove('playing');
        if (icon) {
            icon.style.borderLeft = '14px solid #111111';
            icon.style.borderTop = '9px solid transparent';
            icon.style.borderBottom = '9px solid transparent';
            icon.style.marginLeft = '4px';
            icon.style.borderRight = 'none';
        }
    }
};

if (document.getElementById('pod-play-btn7')) {
    document.getElementById('pod-play-btn7').addEventListener('click', window.togglePodcastAudio7);
}
if (document.getElementById('pod-progress-wrap7')) {
    document.getElementById('pod-progress-wrap7').addEventListener('click', function (e) {
        const audio = document.getElementById('pod-audio7');
        if (!audio) return;
        const rect = this.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * (audio.duration || 1860);
    });
}

window.seekPodcastAudio7 = function (e) {
    const audio = document.getElementById('pod-audio7');
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * (audio.duration || 1860);
};

window.podSwitchTab8 = function (tab) {
    const details = document.getElementById('pod-details8');
    const transcript = document.getElementById('pod-transcript8');
    const tabD = document.getElementById('pod-tab-details8');
    const tabT = document.getElementById('pod-tab-transcript8');
    if (tab === 'details') {
        if (details) details.style.display = 'block';
        if (transcript) transcript.style.display = 'none';
        if (tabD) {
            tabD.classList.add('active');
            tabD.style.color = '#111111';
            tabD.style.borderBottom = '2px solid var(--token-primary)';
        }
        if (tabT) {
            tabT.classList.remove('active');
            tabT.style.color = 'var(--token-text-muted)';
            tabT.style.borderBottom = 'none';
        }
    } else {
        if (details) details.style.display = 'none';
        if (transcript) transcript.style.display = 'block';
        if (tabD) {
            tabD.classList.remove('active');
            tabD.style.color = 'var(--token-text-muted)';
            tabD.style.borderBottom = 'none';
        }
        if (tabT) {
            tabT.classList.add('active');
            tabT.style.color = '#111111';
            tabT.style.borderBottom = '2px solid var(--token-primary)';
        }
    }
};

window.togglePodcastAudio8 = function () {
    const audio = document.getElementById('pod-audio8');
    if (!audio) return;
    const btn = document.getElementById('pod-play-btn8');
    const icon = document.getElementById('pod-play-icon8');
    const progressWrap = document.getElementById('pod-progress-wrap8');
    const progressBar = document.getElementById('pod-progress-bar8');
    const timeDisplay = document.getElementById('pod-player-time8');
    if (!window.podPlaying8) {
        audio.play();
        window.podPlaying8 = true;
        if (btn) btn.classList.add('playing');
        if (icon) {
            icon.style.borderLeft = 'none';
            icon.style.borderRight = '14px solid #111111';
            icon.style.marginLeft = '0';
        }
        window.podInterval8 = setInterval(() => {
            if (audio.duration) {
                const pct = (audio.currentTime / audio.duration) * 100;
                if (progressBar) progressBar.style.width = pct + '%';
                const cur = formatTime(audio.currentTime);
                const dur = formatTime(audio.duration);
                if (timeDisplay) timeDisplay.textContent = cur + ' / ' + dur;
            }
            if (audio.ended) {
                window.podPlaying8 = false;
                clearInterval(window.podInterval8);
                if (btn) btn.classList.remove('playing');
                if (icon) {
                    icon.style.borderLeft = '14px solid #111111';
                    icon.style.borderTop = '9px solid transparent';
                    icon.style.borderBottom = '9px solid transparent';
                    icon.style.marginLeft = '4px';
                    icon.style.borderRight = 'none';
                }
            }
        }, 100);
    } else {
        audio.pause();
        window.podPlaying8 = false;
        clearInterval(window.podInterval8);
        if (btn) btn.classList.remove('playing');
        if (icon) {
            icon.style.borderLeft = '14px solid #111111';
            icon.style.borderTop = '9px solid transparent';
            icon.style.borderBottom = '9px solid transparent';
            icon.style.marginLeft = '4px';
            icon.style.borderRight = 'none';
        }
    }
};

if (document.getElementById('pod-play-btn8')) {
    document.getElementById('pod-play-btn8').addEventListener('click', window.togglePodcastAudio8);
}
if (document.getElementById('pod-progress-wrap8')) {
    document.getElementById('pod-progress-wrap8').addEventListener('click', function (e) {
        const audio = document.getElementById('pod-audio8');
        if (!audio) return;
        const rect = this.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * (audio.duration || 1860);
    });
}

window.seekPodcastAudio8 = function (e) {
    const audio = document.getElementById('pod-audio8');
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * (audio.duration || 1860);
};

// Handle initial load
const hash = window.location.hash;
if (hash === '#page-contact') {
    showContactPage();
} else if (hash === '#page-webinars') {
    showWebinarsPage();
} else if (hash === '#webinar-01-detail') {
    showWebinarDetail('webinar-01-detail');
} else if (hash === '#webinar-02-detail') {
    showWebinarDetail('webinar-02-detail');
} else if (hash === '#page-spotlight') {
    showSpotlightPage('page-spotlight');
} else if (hash === '#page-spotlight2') {
    showSpotlightPage('page-spotlight2');
} else if (hash === '#page-spotlight3') {
    showSpotlightPage('page-spotlight3');
} else if (hash === '#page-csi-indaba') {
    showCSIIndabaPage();
} else if (hash === '#page-csi-awards') {
    showCSIAwardsPage();
} else if (hash === '#page-csi-legacy-awards') {
    showAwardsPage();
} else if (hash === '#page-winner-oceana') {
    showAwardsWinnerPage('page-winner-oceana');
} else if (hash === '#page-winner-primestars') {
    showAwardsWinnerPage('page-winner-primestars');
} else if (hash === '#page-winner-seriti') {
    showAwardsWinnerPage('page-winner-seriti');
} else if (hash === '#page-winner-tcb') {
    showAwardsWinnerPage('page-winner-tcb');
} else if (hash === '#page-winner-pinkdrive') {
    showAwardsWinnerPage('page-winner-pinkdrive');
} else if (hash === '#page-winner-famsa') {
    showAwardsWinnerPage('page-winner-famsa');
} else if (hash === '#page-winner-petco') {
    showAwardsWinnerPage('page-winner-petco');
} else if (hash === '#page-winner-urglobal') {
    showAwardsWinnerPage('page-winner-urglobal');
} else if (hash === '#page-products-v1') {
    showProductsPage('page-products-v1');
} else if (hash === '#page-offering-v1') {
    showOfferingPage('page-offering-v1');
} else if (hash === '#page-communities-v1') {
    showCommunitiesPage('page-communities-v1');
} else if (hash === '#page-podcasts') {
    showPodcastsPage();
} else if (hash === '#page-team') {
    showTeamPage();
} else if (hash === '#page-history') {
    showHistoryPage();
} else if (hash === '#page-expertise') {
    showExpertisePage();
} else if (hash === '#page-expertise-publishing') {
    showExpertisePublishingPage();
} else if (hash === '#page-expertise-content-creation') {
    showExpertiseContentCreationPage();
} else if (hash === '#page-expertise-events') {
    showExpertiseEventsPage();
} else if (hash === '#page-expertise-advisory') {
    showExpertiseAdvisoryPage();
} else if (hash === '#page-expertise-research') {
    showExpertiseResearchPage();
} else if (hash === '#page-about') {
    showAboutPage();
} else if (hash === '#podcast-management') {
    showPodcastPage('podcast-management');
} else if (hash === '#podcast-bilateral') {
    showPodcastPage('podcast-bilateral');
} else if (hash === '#podcast-strategy') {
    showPodcastPage('podcast-strategy');
} else if (hash === '#podcast-dual-heritage') {
    showPodcastPage('podcast-dual-heritage');
} else if (hash === '#podcast-whisper-loud') {
    showPodcastPage('podcast-whisper-loud');
} else if (hash === '#podcast-tiny-kitchens') {
    showPodcastPage('podcast-tiny-kitchens');
} else if (hash === '#article-vovo') {
    showArticlePage('article-vovo');
} else if (hash === '#article-top-1') {
    showArticlePage('article-top-1');
} else if (hash === '#article-top-2') {
    showArticlePage('article-top-2');
} else if (hash === '#article-top-3') {
    showArticlePage('article-top-3');
} else if (hash === '#article-top-4') {
    showArticlePage('article-top-4');
} else if (hash === '#article-top-5') {
    showArticlePage('article-top-5');
} else if (hash === '#article-future-2050') {
    showArticlePage('article-future-2050');
} else if (hash === '#article-after-school') {
    showArticlePage('article-after-school');
} else if (hash === '#article-masters-deal') {
    showArticlePage('article-masters-deal');
} else if (hash === '#article-vision-motion') {
    showArticlePage('article-vision-motion');
} else if (hash === '#article-unemployment') {
    showArticlePage('article-unemployment');
} else if (hash === '#article-legacy-awards') {
    showArticlePage('article-legacy-awards');
} else {
    showHomePage();
}

/* Inline script block 14 */
let spotlightIdx = 0;
function slideSpotlight(dir) {
    const slides = document.querySelectorAll('#spotlightHero .spotlight-slide');
    const dots = document.querySelectorAll('#spotlightDots .s-dot');
    if (!slides.length) return;
    slides[spotlightIdx].classList.remove('active');
    if (dots.length) dots[spotlightIdx].style.background = 'rgba(255,255,255,0.4)';
    spotlightIdx += dir;
    if (spotlightIdx < 0) spotlightIdx = slides.length - 1;
    if (spotlightIdx >= slides.length) spotlightIdx = 0;
    slides[spotlightIdx].classList.add('active');
    if (dots.length) dots[spotlightIdx].style.background = 'var(--token-primary)';
}
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#spotlightDots .s-dot').forEach(dot => {
        dot.addEventListener('click', function () {
            const slides = document.querySelectorAll('#spotlightHero .spotlight-slide');
            const dots = document.querySelectorAll('#spotlightDots .s-dot');
            if (!slides.length) return;
            slides[spotlightIdx].classList.remove('active');
            if (dots.length) dots[spotlightIdx].style.background = 'rgba(255,255,255,0.4)';
            spotlightIdx = parseInt(this.dataset.idx);
            slides[spotlightIdx].classList.add('active');
            if (dots.length) dots[spotlightIdx].style.background = 'var(--token-primary)';
        });
    });
});

// What We Do Section JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate sections
    document.querySelectorAll('.what-we-do-section .left-section, .what-we-do-section .right-section').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.2}s`;
        observer.observe(el);
    });

    // Mouse particle effect
    let lastParticleTime = 0;
    document.addEventListener('mousemove', (e) => {
        if (!e.target.closest('.what-we-do-section')) return;

        const now = Date.now();
        if (now - lastParticleTime > 50) {
            createParticle(e.clientX, e.clientY);
            lastParticleTime = now;
        }
    });

    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.setAttribute('aria-hidden', 'true');
        particle.style.position = 'fixed';
        particle.style.pointerEvents = 'none';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        // Randomize particle properties
        const size = Math.random() * 6 + 4;
        const colors = ['#f5a632', '#f5a623', '#f5a632', '#ff6b9d'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = color;

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    // Parallax effect on shapes
    document.addEventListener('mousemove', (e) => {
        const shapes = document.querySelectorAll('.what-we-do-section .shape');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 20;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
});

/* Inline script block 15 */
// Spotlight V2 Slider Functions
let currentIndexV2 = 0;
const totalSlidesV2 = 4;
const autoPlayDelayV2 = 6000;
let autoPlayTimerV2;
let progressTimerV2;
let progressV2 = 0;

function updateSliderV2() {
    const slider = document.getElementById('heroSliderV2');
    if (!slider) return;

    const slides = slider.querySelectorAll('.hero-slide');
    const dots = slider.querySelectorAll('.slider-dot');
    const progressBar = document.getElementById('progressBarV2');
    const currentSlideEl = document.getElementById('currentSlideV2');

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndexV2);
    });
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndexV2);
    });
    if (currentSlideEl) {
        currentSlideEl.textContent = String(currentIndexV2 + 1).padStart(2, '0');
    }
    resetProgressV2();
}

function nextSlideV2() {
    currentIndexV2 = (currentIndexV2 + 1) % totalSlidesV2;
    updateSliderV2();
}

function prevSlideV2() {
    currentIndexV2 = (currentIndexV2 - 1 + totalSlidesV2) % totalSlidesV2;
    updateSliderV2();
}

function goToSlideV2(index) {
    currentIndexV2 = index;
    updateSliderV2();
    resetAutoPlayV2();
}

function resetProgressV2() {
    progressV2 = 0;
    const progressBar = document.getElementById('progressBarV2');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    clearInterval(progressTimerV2);
    progressTimerV2 = setInterval(() => {
        progressV2 += 100 / (autoPlayDelayV2 / 50);
        const progressBar = document.getElementById('progressBarV2');
        if (progressBar) {
            progressBar.style.width = Math.min(progressV2, 100) + '%';
        }
    }, 50);
}

function resetAutoPlayV2() {
    clearInterval(autoPlayTimerV2);
    autoPlayTimerV2 = setInterval(nextSlideV2, autoPlayDelayV2);
    resetProgressV2();
}

// Initialize V2 slider when page-spotlight2 is shown
function initSliderV2() {
    const slider = document.getElementById('heroSliderV2');
    if (!slider) return;

    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlideV2();
            else prevSlideV2();
            resetAutoPlayV2();
        }
    }, { passive: true });

    slider.addEventListener('mouseenter', () => clearInterval(autoPlayTimerV2));
    slider.addEventListener('mouseleave', resetAutoPlayV2);

    resetAutoPlayV2();
}

// Spotlight version switching function
function switchSpotlightVersion(version) {
    if (version === 'v1') {
        showSpotlightPage('page-spotlight');
    } else if (version === 'v2') {
        showSpotlightPage('page-spotlight2');
        setTimeout(initSliderV2, 100);
    } else if (version === 'v3') {
        showSpotlightPage('page-spotlight3');
    } else if (version === 'v4') {
        showSpotlightPage('page-spotlight-v4');
    }
}

/* Final webinar hash router.
   This block intentionally sits at the end of the file so older extracted
   inline scripts cannot overwrite the webinar routes after page load. */
(function () {
    const routedIds = ['page-webinars', 'webinar-01-detail', 'webinar-02-detail', 'page-matter-magazine'];

    function setHash(hash) {
        if (window.location.hash !== hash) {
            history.pushState(null, '', hash);
        }
    }

    function setSharedSectionsVisibility(show) {
        const mainContent = document.querySelector('main');
        const impactSection = document.getElementById('impactSection');
        const newsletterSections = document.querySelectorAll('.newsletter-section');
        const recentNewsSections = document.querySelectorAll('.footer-news-section');
        const displayValue = show ? 'block' : 'none';

        if (mainContent) mainContent.style.display = 'none';
        if (impactSection) impactSection.style.display = displayValue;
        newsletterSections.forEach(section => section.style.display = displayValue);
        recentNewsSections.forEach(section => section.style.display = displayValue);
        document.querySelectorAll('.main-footer').forEach(footer => footer.style.display = 'block');
    }

    function hideAllRoutedPages() {
        document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], #webinar-01-detail, #webinar-02-detail').forEach(page => {
            page.style.display = 'none';
        });
    }

    function showRoute(id) {
        const page = document.getElementById(id);
        if (!page) return;

        hideAllRoutedPages();
        setSharedSectionsVisibility(['page-webinars', 'webinar-01-detail', 'webinar-02-detail', 'page-matter-magazine'].includes(id));
        page.style.display = 'block';

        if (id === 'page-webinars') {
            document.title = 'CSI Webinars - Simphiwe Mtetwa';
        } else if (id === 'page-matter-magazine') {
            document.title = 'Matter Magazine - Simphiwe Mtetwa';
            initializeMatterDflip();
        } else if (id === 'webinar-01-detail') {
            document.title = 'Webinar 01 - The Invisible Drivers of Inequality | CSI Indaba';
        } else if (id === 'webinar-02-detail') {
            document.title = 'Webinar 02 - The Inequality Mandate in Focus | CSI Indaba';
        }
    }

    function routeHash() {
        const id = window.location.hash.replace('#', '');
        if (routedIds.includes(id)) {
            showRoute(id);
        }
    }

    window.showWebinarsPage = function () {
        setHash('#page-webinars');
        showRoute('page-webinars');
        window.scrollTo(0, 0);
    };

    window.showWebinarDetail = function (detailId) {
        if (!['webinar-01-detail', 'webinar-02-detail'].includes(detailId)) return;
        setHash('#' + detailId);
        showRoute(detailId);
        window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', routeHash);
    window.addEventListener('load', routeHash);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', routeHash);
    } else {
        routeHash();
    }

    [0, 250, 750, 1500, 3000, 6000, 10000, 15000, 20000].forEach(delay => {
        setTimeout(routeHash, delay);
    });
})();

/* Final route sync for pages that can be overridden by earlier inline fallbacks. */
(function () {
    window.showCSIIndabaPage = function () {
        const mainContent = document.querySelector('main');
        const indabaPage = document.getElementById('page-csi-indaba');
        const footers = document.querySelectorAll('.main-footer');
        const impactSection = document.getElementById('impactSection');
        const newsletterSection = document.querySelectorAll('.newsletter-section');
        const recentNewsSection = document.querySelectorAll('.footer-news-section');

        if (window.location.hash !== '#page-csi-indaba') {
            history.pushState(null, '', '#page-csi-indaba');
        }

        document.querySelectorAll('[id^="page-"], [id^="podcast-"], [id^="article-"], #webinar-01-detail, #webinar-02-detail').forEach(page => {
            page.style.display = 'none';
        });
        if (mainContent) mainContent.style.display = 'none';
        if (indabaPage) indabaPage.style.display = 'block';
        footers.forEach(footer => footer.style.display = 'block');
        if (impactSection) impactSection.style.display = 'block';
        newsletterSection.forEach(section => section.style.display = 'block');
        recentNewsSection.forEach(section => section.style.display = 'block');
        window.scrollTo(0, 0);
        document.title = 'CSI Indaba 2026 - Simphiwe Mtetwa';
    };

    function syncCurrentHashRoute() {
        if (window.location.hash === '#page-contact' && typeof window.showContactPage === 'function') {
            window.showContactPage();
        } else if (window.location.hash === '#page-csi-indaba' && typeof window.showCSIIndabaPage === 'function') {
            window.showCSIIndabaPage();
        } else if (window.location.hash === '#page-matter-magazine' && typeof window.showMatterMagazinePage === 'function') {
            window.showMatterMagazinePage();
        } else if (window.location.hash === '#page-case-studies' && typeof window.showCaseStudiesPage === 'function') {
            window.showCaseStudiesPage();
        }
    }

    window.addEventListener('load', syncCurrentHashRoute);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncCurrentHashRoute);
    } else {
        syncCurrentHashRoute();
    }

    [0, 100, 500, 1200, 2500].forEach(delay => {
        setTimeout(syncCurrentHashRoute, delay);
    });
})();


/* ===== Social Responsibility content JS (merged from social-responsibility-popup.html) ===== */
(function () {
    const root = document.getElementById('sm-osr-root');
    if (!root || root.dataset.initialized === 'true') return;
    root.dataset.initialized = 'true';

    const popupOverlay = root.querySelector('#popupOverlay');
    const popup = root.querySelector('#popup');
    const popupTrigger = root.querySelector('#popupTrigger');
    const popupClose = root.querySelector('#popupClose');
    const sheet = root.querySelector('#sheet');
    const sheetClose = root.querySelector('#sheetClose');
    const tabButtons = root.querySelectorAll('.tab-btn');
    const tabPanels = root.querySelectorAll('.tab-panel');
    const sheetTag = root.querySelector('#sheetTag');
    const sheetTitle = root.querySelector('#sheetTitle');
    const sideHeading = root.querySelector('#sideHeading');
    const sideCopy = root.querySelector('#sideCopy');

    if (!popupOverlay || !popup || !popupTrigger || !popupClose || !sheet || !sheetClose) return;

    let lastFocusedElement = popupTrigger;
    const previousBodyOverflow = document.body.style.overflow;

    function syncBodyScroll() {
        const hasOpenLayer =
            popupOverlay.classList.contains('open') ||
            sheet.classList.contains('open');
        document.body.style.overflow = hasOpenLayer ? 'hidden' : previousBodyOverflow;
    }

    function openPopup() {
        lastFocusedElement = document.activeElement === document.body
            ? popupTrigger
            : document.activeElement;
        popupOverlay.classList.add('open');
        popupOverlay.setAttribute('aria-hidden', 'false');
        syncBodyScroll();
        requestAnimationFrame(() => popup.focus());
    }

    function closePopup() {
        if (sheet.classList.contains('open')) closeSheet();
        popupOverlay.classList.remove('open');
        popupOverlay.setAttribute('aria-hidden', 'true');
        syncBodyScroll();
        (lastFocusedElement || popupTrigger).focus();
    }

    const tabConfig = {
        story: {
            tag: 'SHARE A STORY',
            title: 'Tell us who needs support',
            heading: 'Help us find the people who need care most.',
            copy: 'These fields are focused on collecting thoughtful, location-based nominations so the team can review every story with care.'
        },
        support: {
            tag: 'OFFER SUPPORT',
            title: 'Tell us how you can help',
            heading: 'Open a practical route for direct support.',
            copy: 'This route captures offers of help from individuals, companies, professionals and volunteers so the team can coordinate responsibly.'
        },
        partner: {
            tag: 'PARTNER WITH US',
            title: 'Start a partnership conversation',
            heading: 'Build structured response through collaboration.',
            copy: 'This route is for organisations and institutions that want to partner with the platform in a more formal way.'
        }
    };

    function switchTab(tab) {
        const config = tabConfig[tab];
        if (!config) return;
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });
        tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `panel-${tab}`);
        });
        sheetTag.textContent = config.tag;
        sheetTitle.textContent = config.title;
        sideHeading.textContent = config.heading;
        sideCopy.textContent = config.copy;
    }

    function openSheet(tab = 'story') {
        switchTab(tab);
        sheet.classList.add('open');
        sheet.setAttribute('aria-hidden', 'false');
        syncBodyScroll();
        requestAnimationFrame(() => sheetClose.focus());
    }

    function closeSheet() {
        sheet.classList.remove('open');
        sheet.setAttribute('aria-hidden', 'true');
        syncBodyScroll();
        requestAnimationFrame(() => popup.focus());
    }

    popupTrigger.addEventListener('click', openPopup);
    popupClose.addEventListener('click', closePopup);
    popupOverlay.addEventListener('click', event => {
        if (event.target === popupOverlay) closePopup();
    });
    sheetClose.addEventListener('click', closeSheet);
    sheet.addEventListener('click', event => {
        if (event.target === sheet) closeSheet();
    });

    root.querySelectorAll('[data-open-sheet]').forEach(button => {
        button.addEventListener('click', () => openSheet(button.dataset.openSheet));
    });
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        if (sheet.classList.contains('open')) closeSheet();
        else if (popupOverlay.classList.contains('open')) closePopup();
    });

    [
        ['storyForm', 'need', 'Please select at least one kind of need.', 'storySuccess'],
        ['supportForm', 'support_type', 'Please select at least one type of support.', 'supportSuccess'],
        ['partnerForm', 'partner_type', 'Please select at least one partnership type.', 'partnerSuccess']
    ].forEach(([formId, checkboxName, message, successId]) => {
        const form = root.querySelector(`#${formId}`);
        const success = root.querySelector(`#${successId}`);
        if (!form || !success) return;
        form.addEventListener('submit', event => {
            event.preventDefault();
            if (!form.querySelector(`input[name="${checkboxName}"]:checked`)) {
                window.alert(message);
                return;
            }
            success.classList.add('show');
            success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });

    window.openSocialResponsibilityPopup = openPopup;
    window.closeSocialResponsibilityPopup = closePopup;

    window.addEventListener('hashchange', () => {
        if (window.location.hash !== '#page-social-responsibility') closePopup();
    });
})();

/* ===== Editions Marquee Infinite Loop ===== */
(function initEditionsMarquee() {
    function setup() {
        const track = document.getElementById('editionsMarqueeTrack');
        if (!track) return;

        // Clone all cards and append to make seamless loop
        const originals = Array.from(track.children);
        originals.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();