"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. CAROSELLO RECENSIONI IN EVIDENZA ---
    const slides = document.querySelectorAll(".rec-slide");
    const dotsContainer = document.getElementById("rec-dots");
    const prevBtn = document.getElementById("rec-prev");
    const nextBtn = document.getElementById("rec-next");
    let currentSlide = 0;

    if (slides.length > 0 && dotsContainer) {
        dotsContainer.innerHTML = "";
        slides.forEach((_, idx) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "rec-dot" + (idx === 0 ? " on" : "");
            dot.setAttribute("aria-label", `Vai alla recensione ${idx + 1}`);
            dot.addEventListener("click", () => goToSlide(idx));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll(".rec-dot");

        function goToSlide(index) {
            slides[currentSlide].classList.remove("active");
            dots[currentSlide].classList.remove("on");
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add("active");
            dots[currentSlide].classList.add("on");
        }

        if (prevBtn) prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
        if (nextBtn) nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));

        setInterval(() => goToSlide(currentSlide + 1), 6000);
    }

    // --- 2. DATABASE RECENSIONI INIZIALI ---
    const defaultReviews = [
        {
            id: 1,
            name: "Giulia",
            city: "Milano",
            room: "Suite dei Poeti (Cam. 101)",
            period: "2026-04",
            rating: 5,
            title: "Un romanzo dell'Ottocento",
            message: "Sembra di entrare in un romanzo dell'Ottocento. Colazione indimenticabile, accoglienza calorosa e una suite che profuma di storia.",
            date: "2026-04-15"
        },
        {
            id: 2,
            name: "Thomas",
            city: "Monaco di Baviera",
            room: "Suite Limonaia (Cam. 202)",
            period: "2026-05",
            rating: 5,
            title: "Il giardino al tramonto",
            message: "Il giardino al tramonto vale da solo il viaggio. Torneremo in primavera, magari proprio nella Limonaia.",
            date: "2026-05-10"
        },
        {
            id: 3,
            name: "Élodie",
            city: "Lione",
            room: "Stanza del Conte (Cam. 102)",
            period: "2026-03",
            rating: 5,
            title: "Sogno ad occhi aperti",
            message: "Ogni dettaglio è curato con amore. Il letto a baldacchino è un sogno ad occhi aperti e la colazione in veranda è un rito.",
            date: "2026-03-20"
        },
        {
            id: 4,
            name: "Marco",
            city: "Roma",
            room: "Mansarda Gelso (Cam. 201)",
            period: "2026-06",
            rating: 5,
            title: "Tranquillità assoluta",
            message: "La mansarda offre una vista splendida e un silenzio rigenerante. I proprietari sono gentilissimi e premurosi.",
            date: "2026-06-02"
        },
        {
            id: 5,
            name: "Sarah",
            city: "Londra",
            room: "Suite dei Poeti (Cam. 101)",
            period: "2026-05",
            rating: 4,
            title: "Meravigliosa dimora storica",
            message: "Un posto incantevole fuori dal tempo. Atmosfera autentica e curata nei minimi dettagli. Consigliatissimo!",
            date: "2026-05-28"
        }
    ];

    // Caricamento sicuro da localStorage con controllo di integrità
    let storedReviews = null;
    try {
        storedReviews = JSON.parse(localStorage.getItem("villa_antica_reviews"));
    } catch (e) {
        storedReviews = null;
    }

    let reviews = (Array.isArray(storedReviews) && storedReviews.length > 0) ? storedReviews : defaultReviews;

    // --- 3. SISTEMA INTERATTIVO STELLE ---
    const starButtons = document.querySelectorAll(".rec-star");
    let selectedRating = 0;

    starButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            selectedRating = parseInt(btn.dataset.value, 10);
            updateStarsDisplay(selectedRating);
        });

        btn.addEventListener("mouseenter", () => {
            updateStarsDisplay(parseInt(btn.dataset.value, 10));
        });
    });

    const starsContainer = document.getElementById("rec-stars-input");
    if (starsContainer) {
        starsContainer.addEventListener("mouseleave", () => {
            updateStarsDisplay(selectedRating);
        });
    }

    function updateStarsDisplay(rating) {
        starButtons.forEach((btn, idx) => {
            const val = idx + 1;
            if (val <= rating) {
                btn.classList.add("is-on");
                btn.setAttribute("aria-checked", "true");
            } else {
                btn.classList.remove("is-on");
                btn.setAttribute("aria-checked", "false");
            }
        });
    }

    // Contatore caratteri textarea
    const textarea = document.getElementById("rec-text");
    const countDisplay = document.getElementById("rec-text-count");
    if (textarea && countDisplay) {
        textarea.addEventListener("input", () => {
            const len = textarea.value.length;
            countDisplay.textContent = `${len} / 500 caratteri`;
        });
    }

    // --- 4. RENDERIZZAZIONE LISTA E STATISTICHE ---
    const grid = document.getElementById("rec-grid");
    const totalEl = document.getElementById("rec-total");
    const avgEl = document.getElementById("rec-average");
    const countEl = document.getElementById("rec-count");
    const emptyEl = document.getElementById("rec-empty");
    const breakdownEl = document.getElementById("rec-breakdown");

    let currentFilterStars = 0;
    let currentSort = "recent";

    function renderReviews() {
        if (!grid) return;

        let filtered = reviews.filter(r => {
            if (currentFilterStars === 0) return true;
            return (r.rating || 5) === currentFilterStars;
        });

        filtered.sort((a, b) => {
            if (currentSort === "recent") {
                return new Date(b.date || 0) - new Date(a.date || 0);
            } else if (currentSort === "high") {
                return (b.rating || 5) - (a.rating || 5);
            } else if (currentSort === "low") {
                return (a.rating || 5) - (b.rating || 5);
            }
            return 0;
        });

        grid.innerHTML = "";

        if (filtered.length === 0) {
            if (emptyEl) emptyEl.hidden = false;
        } else {
            if (emptyEl) emptyEl.hidden = true;
            filtered.forEach(rev => {
                const card = document.createElement("article");
                card.className = "rec-card";
                if (rev.isNew) card.classList.add("is-new");

                const rVal = rev.rating || 5;
                const initials = rev.name ? rev.name.charAt(0).toUpperCase() : "O";
                const starsStr = "★".repeat(rVal) + "☆".repeat(5 - rVal);

                card.innerHTML = `
                    <div class="rec-card-head">
                        <div class="rec-avatar">${initials}</div>
                        <div class="rec-who">
                            <strong>${escapeHtml(rev.name || "Ospite")}</strong>
                            <span>${escapeHtml(rev.city || "Ospite")} · ${escapeHtml(rev.room || "")}</span>
                        </div>
                        <div class="rec-stars" aria-label="${rVal} stelle su 5">${starsStr}</div>
                    </div>
                    <h3>${escapeHtml(rev.title || "")}</h3>
                    <p>"${escapeHtml(rev.message || "")}"</p>
                    <div class="rec-card-foot">
                        <span class="rec-badge">${escapeHtml((rev.room || "").split(" (")[0])}</span>
                        <span>${formatDate(rev.date)}</span>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        updateSummary();
    }

    function updateSummary() {
        const total = reviews.length;
        if (totalEl) totalEl.textContent = total;
        if (countEl) countEl.textContent = `${total} ${total === 1 ? "recensione" : "recensioni"}`;

        const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
        const avg = total > 0 ? (sum / total).toFixed(1).replace(".", ",") : "5,0";
        if (avgEl) avgEl.textContent = avg;

        if (breakdownEl) {
            breakdownEl.innerHTML = "";
            for (let stars = 5; stars >= 1; stars--) {
                const count = reviews.filter(r => (r.rating || 5) === stars).length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const row = document.createElement("div");
                row.className = "rec-bar-row";
                row.innerHTML = `
                    <span>${stars} ★</span>
                    <div class="rec-bar"><span style="width: ${pct}%"></span></div>
                    <span>${count}</span>
                `;
                breakdownEl.appendChild(row);
            }
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function formatDate(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
    }

    // Filtri e ordinamento
    const filterBtns = document.querySelectorAll(".rec-filter");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.setAttribute("aria-pressed", "false"));
            btn.setAttribute("aria-pressed", "true");
            currentFilterStars = parseInt(btn.dataset.stars, 10);
            renderReviews();
        });
    });

    const sortSelect = document.getElementById("rec-sort");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            renderReviews();
        });
    }

    // --- 5. GESTIONE INVIO MODULO ---
    const form = document.getElementById("review-form");
    const formMsg = document.getElementById("rec-form-msg");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (formMsg) {
                formMsg.textContent = "";
                formMsg.className = "rec-form-msg";
            }

            const name = document.getElementById("rec-name").value.trim();
            const city = document.getElementById("rec-city").value.trim();
            const room = document.getElementById("rec-room").value;
            const period = document.getElementById("rec-period").value;
            const title = document.getElementById("rec-title").value.trim();
            const message = document.getElementById("rec-text").value.trim();
            const privacy = document.getElementById("rec-privacy").checked;
            const hp = document.getElementById("rec-hp").value;

            if (hp) return; // Controllo antispam

            if (!name || !room || !period || selectedRating === 0 || !title || !message || !privacy) {
                if (formMsg) {
                    formMsg.textContent = "Compila tutti i campi obbligatori e seleziona il voto in stelle.";
                }
                return;
            }

            const newRev = {
                id: Date.now(),
                name,
                city,
                room,
                period,
                rating: selectedRating,
                title,
                message,
                date: new Date().toISOString().split("T")[0],
                isNew: true
            };

            reviews.unshift(newRev);
            localStorage.setItem("villa_antica_reviews", JSON.stringify(reviews));

            renderReviews();

            if (formMsg) {
                formMsg.classList.add("ok");
                formMsg.textContent = "Grazie! La tua recensione è stata pubblicata con successo.";
            }

            form.reset();
            selectedRating = 0;
            updateStarsDisplay(0);
            if (countDisplay) countDisplay.textContent = "0 / 500 caratteri";

            setTimeout(() => {
                if (formMsg) formMsg.textContent = "";
            }, 4000);
        });
    }

    renderReviews();
});