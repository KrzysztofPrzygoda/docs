document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".carousel").forEach((carousel) => {
        const track = carousel.querySelector(".carousel__track");
        const slides = Array.from(track.querySelectorAll(".carousel__slide"));
        const previousButton = carousel.querySelector(".carousel__previous");
        const nextButton = carousel.querySelector(".carousel__next");
        const defaultInterval = getInterval(carousel.dataset.autoplayInterval, 5000);
        const centerSlides = carousel.classList.contains("carousel--centered");
        let activeIndex = 0;
        let autoplayTimer;
        let scrollTimer;
        let isProgrammaticScroll = false;
        let isHovered = false;
        let isVisible = false;
        let dots = [];
        const maxVisibleDots = 7;

        if ("IntersectionObserver" in window) {
            const visibilityObserver = new IntersectionObserver((entries) => {
                const [entry] = entries;
                isVisible = entry ? entry.isIntersecting : false;
                if (!isVisible) {
                    window.clearTimeout(autoplayTimer);
                    updateDots(0);
                    return;
                }
                scheduleAutoplay();
            }, {
                threshold: 0.01
            });
            visibilityObserver.observe(carousel);
        }

        if (carousel.classList.contains("carousel--dots")) {
            const dotsContainer = document.createElement("div");
            dotsContainer.className = "carousel__dots";
            dots = slides.map((slide, index) => {
                const dot = document.createElement("button");
                dot.type = "button";
                dot.className = "carousel__dot";
                dot.setAttribute("aria-label", `Slajd ${index + 1}`);
                dot.addEventListener("click", () => goToSlide(index));
                dotsContainer.append(dot);
                return dot;
            });
            track.after(dotsContainer);
        }

        function updateDots(interval) {
            const centerOffset = Math.floor((maxVisibleDots - 1) / 2);
            const firstVisibleIndex = Math.min(
                Math.max(activeIndex - centerOffset, 0),
                Math.max(slides.length - maxVisibleDots, 0)
            );
            const lastVisibleIndex = Math.min(
                firstVisibleIndex + maxVisibleDots - 1,
                slides.length - 1
            );

            dots.forEach((dot, index) => {
                dot.removeAttribute("data-running");
                dot.setAttribute("aria-current", String(index === activeIndex));
                const isVisible = index >= firstVisibleIndex && index <= lastVisibleIndex;
                dot.classList.toggle("is-hidden", !isVisible);

                const hasHiddenLeft = firstVisibleIndex > 0;
                const hasHiddenRight = lastVisibleIndex < slides.length - 1;
                const isLeftSmall = hasHiddenLeft && index === firstVisibleIndex;
                const isLeftMedium = hasHiddenLeft && index === firstVisibleIndex + 1;
                const isRightSmall = hasHiddenRight && index === lastVisibleIndex;
                const isRightMedium = hasHiddenRight && index === lastVisibleIndex - 1;

                dot.toggleAttribute("data-edge-small", isLeftSmall || isRightSmall);
                dot.toggleAttribute("data-edge-medium", isLeftMedium || isRightMedium);
            });
            if (!interval || !dots[activeIndex]) return;

            const activeDot = dots[activeIndex];
            activeDot.style.setProperty("--carousel-progress-duration", `${interval}ms`);
            void activeDot.offsetWidth; // restart animacji
            activeDot.setAttribute("data-running", "");
        }

        function getInterval(value, fallback) {
            if (value === undefined || value.trim() === "") return fallback;
            const seconds = Number(value);
            return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : fallback;
        }

        function isCarouselVisible() {
            if ("IntersectionObserver" in window) {
                return isVisible;
            }

            const rect = carousel.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

            return rect.bottom > 0 && rect.top < viewportHeight &&
                rect.right > 0 && rect.left < viewportWidth;
        }

        function scheduleAutoplay() {
            window.clearTimeout(autoplayTimer);
            const interval = getInterval(
                slides[activeIndex].dataset.autoplayInterval,
                defaultInterval
            );
            const isAutoplaying = isCarouselVisible() && !(document.hidden || isHovered || slides.length < 2 ||
                defaultInterval === 0 || interval === 0);
            updateDots(isAutoplaying ? interval : 0);
            if (!isAutoplaying) return;
            autoplayTimer = window.setTimeout(() => {
                goToSlide((activeIndex + 1) % slides.length);
            }, interval);
        }

        function goToSlide(index) {
            if (!isCarouselVisible()) return;
            const targetSlide = slides[index];
            if (!targetSlide) return;

            activeIndex = index;
            isProgrammaticScroll = true;
            window.clearTimeout(scrollTimer);
            scrollTimer = window.setTimeout(() => {
                isProgrammaticScroll = false;
            }, 120);
            const slideRect = targetSlide.getBoundingClientRect();
            const trackRect = track.getBoundingClientRect();
            track.scrollTo({
                left: centerSlides
                    ? track.scrollLeft + slideRect.left - trackRect.left -
                        (track.clientWidth - slideRect.width) / 2
                    : targetSlide.offsetLeft,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth"
            });
            scheduleAutoplay();
        }

        function goToNextSlide() {
            goToSlide((activeIndex + 1) % slides.length);
        }
        function goToPreviousSlide() {
            goToSlide((activeIndex - 1 + slides.length) % slides.length);
        }

        nextButton.addEventListener("click", goToNextSlide);
        previousButton.addEventListener("click", goToPreviousSlide);

        track.addEventListener("keydown", (event) => {
            if (event.altKey || event.ctrlKey || event.metaKey ||
                event.target.isContentEditable ||
                ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) {
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                goToPreviousSlide();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                goToNextSlide();
            }
        });

        function syncActiveSlide() {
            const trackRect = track.getBoundingClientRect();
            const trackCenter = centerSlides
                ? trackRect.left + track.clientWidth / 2
                : trackRect.left;
            const nearestIndex = slides.reduce((closestIndex, slide, index) => {
                const closestRect = slides[closestIndex].getBoundingClientRect();
                const slideRect = slide.getBoundingClientRect();
                const closestPosition = centerSlides
                    ? closestRect.left + closestRect.width / 2
                    : closestRect.left;
                const slidePosition = centerSlides
                    ? slideRect.left + slideRect.width / 2
                    : slideRect.left;
                const closestDistance = Math.abs(closestPosition - trackCenter);
                const distance = Math.abs(slidePosition - trackCenter);
                return distance < closestDistance ? index : closestIndex;
            }, 0);
            if (nearestIndex === activeIndex) return;
            activeIndex = nearestIndex;
            scheduleAutoplay();
        }

        // Przewijanie użytkownika (wheel/touch) aktualizuje kropki natychmiast;
        // przewijanie programowe jest ignorowane do jego zakończenia.
        track.addEventListener("scroll", () => {
            window.clearTimeout(scrollTimer);
            if (!isProgrammaticScroll) syncActiveSlide();
            scrollTimer = window.setTimeout(() => {
                isProgrammaticScroll = false;
                syncActiveSlide();
            }, 120);
        }, { passive: true });

        ["wheel", "touchstart"].forEach((type) => {
            track.addEventListener(type, () => {
                isProgrammaticScroll = false;
            }, { passive: true });
        });

        // Tylko mysz: dotyk emuluje hover i zatrzymywałby przewijanie na stałe.
        carousel.addEventListener("pointerenter", (event) => {
            if (event.pointerType !== "mouse") return;
            isHovered = true;
            carousel.setAttribute("data-onhover", "true");
            window.clearTimeout(autoplayTimer);
            updateDots(0);
        });

        carousel.addEventListener("pointerleave", () => {
            if (!isHovered) return;
            isHovered = false;
            carousel.removeAttribute("data-onhover");
            scheduleAutoplay();
        });

        document.addEventListener("visibilitychange", scheduleAutoplay);
        scheduleAutoplay();
    });
});