"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

    const topBar = $("#top-bar");
    const nav = $("#nav-buttons");
    const burger = $("#burger");
    const heroImg = $("#home-image");
    const progress = $("#scroll-progress");

    /* ---------- Anno nel footer ---------- */
    if ($("#year")) $("#year").textContent = new Date().getFullYear();

    /* ---------- Scorrimento fluido verso le sezioni ---------- */
    const goTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        closeMenu();
    };
    $$("[data-target]").forEach((el) =>
        el.addEventListener("click", () => goTo(el.dataset.target))
    );

    /* ---------- Link verso le altre pagine ---------- */
    $$("[data-href]").forEach((el) =>
        el.addEventListener("click", () => { window.location.href = el.dataset.href; })
    );

    /* ---------- Menu mobile ---------- */
    function closeMenu() {
        if (!nav || !topBar || !burger) return;
        nav.classList.remove("open");
        topBar.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
    }
    if (burger) {
        burger.addEventListener("click", () => {
            const open = nav.classList.toggle("open");
            topBar.classList.toggle("menu-open", open);
            burger.setAttribute("aria-expanded", String(open));
        });
    }

    /* ---------- Scroll: barra, progresso, parallax ---------- */
    let ticking = false;
    function onScroll() {
        const y = window.scrollY;
        if (topBar) topBar.classList.toggle("scrolled", y > 60);

        if (progress) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
        }

        if (heroImg && y < window.innerHeight * 1.2) {
            heroImg.style.transform = `translateY(${y * 0.25}px) scale(1.05)`;
        }
        ticking = false;
    }
    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    /* ---------- Rivelazione degli elementi allo scroll ---------- */
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("visible");
                revealObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    $$(".reveal").forEach((el) => revealObs.observe(el));

    /* ---------- Voce di menu attiva ---------- */
    const navBtns = $$(".button-top-bar[data-target]");
    const sectionObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                navBtns.forEach((b) =>
                    b.classList.toggle("active", b.dataset.target === e.target.id)
                );
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navBtns.forEach((b) => {
        const s = document.getElementById(b.dataset.target);
        if (s) sectionObs.observe(s);
    });

    /* ---------- Contatori animati nella fascia info ---------- */
    const strip = $(".strip");
    if (strip) {
        const counters = $$("strong", strip);
        const animate = (el) => {
            const text = el.textContent;
            const match = text.match(/[\d.,]+/);
            if (!match) return;
            const target = parseFloat(match[0].replace(",", "."));
            const hasComma = match[0].includes(",");
            const duration = 1600;
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                let val = target * eased;
                val = hasComma ? val.toFixed(1).replace(".", ",") : Math.round(val);
                el.textContent = text.replace(match[0], val);
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = text;
            };
            requestAnimationFrame(tick);
        };
        const stripObs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                counters.forEach(animate);
                stripObs.disconnect();
            }
        }, { threshold: 0.5 });
        stripObs.observe(strip);
    }

    /* ---------- Modale di prenotazione ---------- */
    const modal = $("#booking-modal");
    const form = $("#booking-form");
    const msg = $("#form-msg");
    const checkin = $("#checkin");
    const checkout = $("#checkout");

    if (checkin && checkout) {
        const iso = (d) => d.toISOString().split("T")[0];
        const today = new Date();
        checkin.min = iso(today);
        checkout.min = iso(today);

        checkin.addEventListener("change", () => {
            if (checkin.value) {
                const next = new Date(checkin.value);
                next.setDate(next.getDate() + 1);
                checkout.min = iso(next);
                if (checkout.value && checkout.value <= checkin.value) checkout.value = "";
            }
        });
    }

    function openModal() {
        if (!modal) return;
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        closeMenu();
        if (checkin) setTimeout(() => checkin.focus(), 300);
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    if ($("#prenota-top-bar")) $("#prenota-top-bar").addEventListener("click", openModal);
    $$("[data-open-booking]").forEach((b) => b.addEventListener("click", openModal));
    if ($("#modal-close")) $("#modal-close").addEventListener("click", closeModal);
    if (modal) {
        modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    }
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!msg) return;
            msg.className = "form-msg";
            const email = $("#email") ? $("#email").value.trim() : "";

            if (!checkin || !checkout || !checkin.value || !checkout.value) {
                msg.textContent = "Selezionate le date di arrivo e partenza.";
                return;
            }
            if (checkout.value <= checkin.value) {
                msg.textContent = "La partenza deve essere successiva all'arrivo.";
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                msg.textContent = "Inserite un indirizzo email valido.";
                return;
            }

            const roomChoice = $("#room-choice") ? $("#room-choice").value : null;
            const floorChoice = $("#floor-choice") ? $("#floor-choice").value : null;
            const nights = Math.round((new Date(checkout.value) - new Date(checkin.value)) / 86400000);

            let extraInfo = "";
            if (roomChoice) extraInfo = ` per la ${roomChoice}`;
            else if (floorChoice) extraInfo = ` (${floorChoice})`;

            msg.classList.add("ok");
            msg.textContent = `Grazie! Richiesta${extraInfo} per ${nights} ${nights === 1 ? "notte" : "notti"} ricevuta: vi risponderemo presto.`;
            form.reset();
            setTimeout(() => { closeModal(); msg.textContent = ""; }, 3200);
        });
    }
});