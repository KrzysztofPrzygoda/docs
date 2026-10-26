document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".carousel").forEach((carousel) => {
        const track = carousel.querySelector(".carousel__track");
        const slides = Array.from(track.querySelectorAll(".carousel__slide"));
        const previousButton = carousel.querySelector(".carousel__previous");
        const nextButton = carousel.querySelector(".carousel__next");
        const defaultInterval = getInterval(carousel.dataset.autoplayInterval, 5000);
        let activeIndex = 0;
        let autoplayTimer;
        let scrollTimer;
        let isHovered = false;
        let isVisible = false;
        let dots = [];

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
            dots.forEach((dot, index) => {
                dot.removeAttribute("data-running");
                dot.setAttribute("aria-current", String(index === activeIndex));
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
            track.scrollTo({
                left: targetSlide.offsetLeft,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth"
            });
            scheduleAutoplay();
        }

        previousButton.addEventListener("click", () => {
            goToSlide((activeIndex - 1 + slides.length) % slides.length);
        });

        nextButton.addEventListener("click", () => {
            goToSlide((activeIndex + 1) % slides.length);
        });

        track.addEventListener("scroll", () => {
            window.clearTimeout(scrollTimer);
            scrollTimer = window.setTimeout(() => {
                const trackLeft = track.getBoundingClientRect().left;
                const nearestIndex = slides.reduce((closestIndex, slide, index) => {
                    const closestDistance = Math.abs(
                        slides[closestIndex].getBoundingClientRect().left - trackLeft
                    );
                    const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
                    return distance < closestDistance ? index : closestIndex;
                }, 0);
                if (nearestIndex === activeIndex) return;
                activeIndex = nearestIndex;
                scheduleAutoplay();
            }, 120);
        }, { passive: true });

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