/* =============================================================================
   Nama Kafe — interaksi halaman (Vanilla JS, tanpa dependensi)
   -----------------------------------------------------------------------------
   Daftar isi:
     1. Menu mobile   -> buka/tutup panel + fokus, Esc, klik di luar, resize
     2. Header        -> state .is-scrolled saat halaman digeser
     3. Smooth scroll -> geser ke section + dukungan aksesibilitas
     4. Reveal        -> IntersectionObserver + jeda bertahap antar kartu
     5. Nav aktif     -> tandai menu sesuai section yang sedang terlihat
     6. Filter menu   -> sembunyikan/tampilkan kartu sesuai kategori
     7. Kontak        -> tautan WhatsApp, email, Maps, Instagram
     8. Tahun copyright

   Catatan: setiap fungsi punya guard sendiri, jadi halaman tetap aman bila ada
   elemen yang hilang, dan animasi dimatikan bila pengguna memilih
   "prefers-reduced-motion: reduce" di sistemnya.
   ============================================================================= */
(() => {
  "use strict";

  /* Harus sama dengan breakpoint menu di style.css (max-width: 860px). */
  const MOBILE_BREAKPOINT = 860;

  const motionSafe = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const onFrame = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 16));

  document.documentElement.classList.add("js-ready");

  /* ------------------------------------------------------------- 1. MENU MOBILE */
  function initMobileMenu() {
    const toggle = document.querySelector("#menu-toggle");
    const panel = document.querySelector("#mobile-panel");
    if (!toggle || !panel) return;

    let closeTimer = null;

    const openMenu = () => {
      window.clearTimeout(closeTimer);
      panel.inert = false;
      panel.setAttribute("aria-hidden", "false");
      panel.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Tutup menu navigasi");
    };

    const closeMenu = (returnFocus = false) => {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Buka menu navigasi");
      panel.setAttribute("aria-hidden", "true");
      panel.inert = true;
      /* Fokus dikembalikan setelah animasi tutup selesai (280ms di CSS). */
      closeTimer = window.setTimeout(() => {
        if (returnFocus) toggle.focus();
      }, 270);
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu(true);
      }
    });

    document.addEventListener("click", (event) => {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!panel.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });

    /* Kalau layar melebar ke mode desktop, panel ditutup otomatis. */
    window.addEventListener("resize", () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) closeMenu();
    });
  }

  /* ----------------------------------------------------- 2. STATE HEADER GESER
     Header transparan selama berada di atas hero. Setelah halaman digeser ia
     memakai latar kaca (.is-scrolled) supaya navigasi tetap terbaca di atas
     konten apa pun. Scroll di-throttle lewat requestAnimationFrame.            */
  function initHeaderState() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let queued = false;

    const sync = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
      queued = false;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      onFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----------------------------------------------------------- 3. SMOOTH SCROLL */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: motionSafe() ? "auto" : "smooth", block: "start" });
        /* Section tujuan diberi tabindex agar bisa difokus dengan keyboard. */
        if (target.matches("section, main, footer") && !target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
        }
      });
    });
  }

  /* -------------------------------------------------------- 4. REVEAL + STAGGER
     Satu sistem reveal untuk seluruh halaman. Anak list berikut diberi jeda
     bertahap supaya kemunculannya terasa mengalir, bukan serentak.            */
  const STAGGER_CONTAINERS = [".menu-grid", ".experience-list", ".gallery-grid"];
  const STAGGER_STEP = 70;  /* ms antar item */
  const STAGGER_MAX = 280;  /* batas jeda agar tidak terasa lambat */

  function staggerDelayFor(element) {
    for (const selector of STAGGER_CONTAINERS) {
      const container = element.closest(selector);
      if (!container) continue;
      const items = Array.from(container.querySelectorAll(".reveal"));
      const index = items.indexOf(element);
      return index > 0 ? Math.min(index * STAGGER_STEP, STAGGER_MAX) : 0;
    }
    return 0;
  }

  function initScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    /* Tanpa IntersectionObserver atau saat animasi dimatikan, semua tampil. */
    if (!("IntersectionObserver" in window) || motionSafe()) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const delay = staggerDelayFor(element);
        if (delay) {
          element.style.transitionDelay = `${delay}ms`;
          /* Jeda hanya untuk animasi masuk; dihapus setelah selesai supaya
             hover dan interaksi berikutnya tetap responsif. */
          window.setTimeout(() => { element.style.transitionDelay = ""; }, delay + 700);
        }
        element.classList.add("is-visible");
        currentObserver.unobserve(element);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

    items.forEach((item) => observer.observe(item));
  }

  /* -------------------------------------------------------------- 5. NAV AKTIF
     Observer dengan area sempit di tengah viewport menandai menu yang sedang
     aktif, sehingga indikator tidak berkedip saat berpindah section.          */
  function initActiveNav() {
    const links = Array.from(document.querySelectorAll(".desktop-nav .nav-link"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    const sections = links
      .map((link) => {
        const id = link.getAttribute("href") || "";
        return id.startsWith("#") ? document.querySelector(id) : null;
      })
      .filter(Boolean);
    if (!sections.length) return;

    const setActive = (id) => {
      links.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach((section) => observer.observe(section));
  }

  /* ------------------------------------------------------------ 6. FILTER MENU */
  function initMenuFilter() {
    const filterButtons = document.querySelectorAll("[data-filter]");
    const cards = document.querySelectorAll(".menu-card[data-category]");
    if (!filterButtons.length || !cards.length) return;

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        filterButtons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        cards.forEach((card) => {
          const show = filter === "all" || card.dataset.category === filter;
          if (show) {
            card.hidden = false;
            /* Kartu yang muncul kembali dibuat beranimasi ulang lewat .is-visible. */
            card.classList.remove("is-visible");
            onFrame(() => onFrame(() => card.classList.add("is-visible")));
          } else {
            card.hidden = true;
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------------- 7. KONTAK
     KUSTOMISASI KONTAK:
     Ganti nilai contoh di bawah. Gunakan nomor WhatsApp dengan kode negara,
     tanpa tanda +, spasi, atau tanda baca. Contoh format Indonesia: 62812xxxxxxx.
     Biarkan kosong bila datanya belum tersedia; tautan akan tetap menjadi
     placeholder yang aman saat diklik.                                          */
  function initContactLinks() {
    const config = {
      whatsapp: "",
      email: "",
      instagram: "",
      maps: "",
      address: "Tambahkan alamat kafe di sini",
      hours: "Senin–Minggu · 08.00–22.00 (contoh)",
      phone: "Tambahkan nomor WhatsApp",
      whatsappMessage: "Halo, saya ingin bertanya tentang menu dan informasi kafe."
    };

    const whatsappUrl = config.whatsapp ? `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(config.whatsappMessage)}` : "";
    const emailUrl = config.email ? `mailto:${config.email}` : "";
    const mapsUrl = config.maps || "";
    const instagramUrl = config.instagram || "";

    const setLink = (id, url, fallbackHref = "#kontak") => {
      const element = document.getElementById(id);
      if (!element) return;
      element.href = url || fallbackHref;
      if (url && url.startsWith("http")) {
        element.target = "_blank";
        element.rel = "noopener noreferrer";
      }
      if (!url) {
        element.setAttribute("aria-disabled", "true");
        element.addEventListener("click", (event) => {
          event.preventDefault();
          window.alert("Silakan isi konfigurasi tautan kafe di assets/js/main.js terlebih dahulu.");
        });
      }
    };

    setLink("whatsapp-link", whatsappUrl);
    setLink("contact-cta", emailUrl);
    setLink("maps-link", mapsUrl);
    setLink("instagram-link", instagramUrl);

    const address = document.querySelector('[data-config="address"]');
    const hours = document.querySelector('[data-config="hours"]');
    const phone = document.querySelector('[data-config="phone"]');
    if (address) address.textContent = config.address;
    if (hours) hours.textContent = config.hours;
    if (phone) phone.textContent = config.phone;
  }

  /* -------------------------------------------------------- 8. TAHUN COPYRIGHT */
  function initCopyrightYear() {
    const year = document.getElementById("copyright-year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  initMobileMenu();
  initHeaderState();
  initSmoothScroll();
  initScrollReveal();
  initActiveNav();
  initMenuFilter();
  initContactLinks();
  initCopyrightYear();
})();