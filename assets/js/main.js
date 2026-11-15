/**
 * DRM Mármores e Granitos - Salvador/BA
 * Motor de Interatividade, Simulador de Orçamento e Status de Funcionamento
 */

document.addEventListener('DOMContentLoaded', () => {
  initBusinessHours();
  initSimulator();
  initStoneCatalogFilter();
  initLightbox();
  initMobileMenu();
  initSmoothScroll();
});

/* ==========================================================================
   1. HORÁRIO DE FUNCIONAMENTO DINÂMICO (SALVADOR - BA)
   Segunda a Sexta: 08:00 às 17:00 | Sábado: 08:00 às 12:00 | Domingo: Fechado
   ========================================================================== */
function initBusinessHours() {
  const statusBadges = document.querySelectorAll('.business-status-badge');
  const statusTexts = document.querySelectorAll('.business-status-text');
  const statusDetails = document.querySelectorAll('.business-status-detail');

  function updateStatus() {
    const now = new Date();
    // Salvador é UTC-3 (Horário de Brasília)
    const day = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentMinutes = hour * 60 + minute;

    let isOpen = false;
    let statusMsg = '';
    let nextMsg = '';

    if (day >= 1 && day <= 5) {
      // Segunda a Sexta: 08:00 (480 min) às 17:00 (1020 min)
      if (currentMinutes >= 480 && currentMinutes < 1020) {
        isOpen = true;
        statusMsg = 'Aberto Agora';
        nextMsg = 'Fecha hoje às 17:00';
      } else if (currentMinutes < 480) {
        isOpen = false;
        statusMsg = 'Fechado no Momento';
        nextMsg = 'Abre hoje às 08:00';
      } else {
        isOpen = false;
        statusMsg = 'Fechado no Momento';
        if (day === 5) {
          nextMsg = 'Abre amanhã (Sáb) às 08:00';
        } else {
          nextMsg = 'Abre amanhã às 08:00';
        }
      }
    } else if (day === 6) {
      // Sábado: 08:00 (480 min) às 12:00 (720 min)
      if (currentMinutes >= 480 && currentMinutes < 720) {
        isOpen = true;
        statusMsg = 'Aberto Agora';
        nextMsg = 'Fecha hoje às 12:00';
      } else if (currentMinutes < 480) {
        isOpen = false;
        statusMsg = 'Fechado no Momento';
        nextMsg = 'Abre hoje às 08:00';
      } else {
        isOpen = false;
        statusMsg = 'Fechado no Momento';
        nextMsg = 'Abre segunda às 08:00';
      }
    } else {
      // Domingo: Fechado
      isOpen = false;
      statusMsg = 'Fechado aos Domingos';
      nextMsg = 'Abre segunda às 08:00';
    }

    statusBadges.forEach(badge => {
      badge.innerHTML = isOpen 
        ? `<span class="relative flex h-3 w-3">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
           </span>`
        : `<span class="relative flex h-3 w-3">
             <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
           </span>`;
    });

    statusTexts.forEach(el => {
      el.textContent = statusMsg;
      if (isOpen) {
        el.className = 'font-semibold text-emerald-400';
      } else {
        el.className = 'font-semibold text-amber-400';
      }
    });

    statusDetails.forEach(el => {
      el.textContent = nextMsg;
    });
  }

  updateStatus();
  setInterval(updateStatus, 60000); // Atualiza a cada minuto
}

/* ==========================================================================
   2. SIMULADOR INTELIGENTE DE PRÉ-ORÇAMENTO
   Compila as escolhas do usuário em uma mensagem estruturada e envia para o WhatsApp
   ========================================================================== */
function initSimulator() {
  const form = document.getElementById('quoteSimulatorForm');
  if (!form) return;

  const previewBox = document.getElementById('whatsappPreviewText');
  const btnSubmit = document.getElementById('btnSubmitSimulator');

  // Atualiza pré-visualização ao vivo
  function updatePreview() {
    const environment = form.querySelector('input[name="sim-environment"]:checked')?.value || 'Ainda não selecionado';
    const item = form.querySelector('input[name="sim-item"]:checked')?.value || 'Ainda não selecionado';
    const material = form.querySelector('input[name="sim-material"]:checked')?.value || 'A definir';
    const measures = form.querySelector('#simMeasures')?.value.trim() || 'A combinar / Preciso de medição no local';
    const clientName = form.querySelector('#simName')?.value.trim() || '[Seu Nome]';
    const neighborhood = form.querySelector('#simNeighborhood')?.value.trim() || '[Seu Bairro / Salvador]';

    const text = `🏛️ *PRÉ-ORÇAMENTO - DRM MÁRMORES*\n` +
      `--------------------------------\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `📍 *Localidade:* ${neighborhood}, Salvador - BA\n\n` +
      `🏡 *Ambiente:* ${environment}\n` +
      `📐 *Item Desejado:* ${item}\n` +
      `💎 *Superfície/Pedra:* ${material}\n` +
      `📏 *Medidas/Detalhes:* ${measures}\n` +
      `--------------------------------\n` +
      `Olá! Montei este pré-orçamento pelo site da DRM Mármores e gostaria de saber os valores aproximados e disponibilidade para medição.`;

    if (previewBox) {
      previewBox.innerText = text;
    }

    return text;
  }

  // Eventos de escuta para atualizar prévia
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('change', updatePreview);
    input.addEventListener('keyup', updatePreview);
  });

  // Disparo do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const clientName = form.querySelector('#simName')?.value.trim();
    const neighborhood = form.querySelector('#simNeighborhood')?.value.trim();

    if (!clientName) {
      alert('Por favor, informe seu nome para personalizarmos seu atendimento.');
      form.querySelector('#simName')?.focus();
      return;
    }

    const compiledMessage = updatePreview();
    const encodedMessage = encodeURIComponent(compiledMessage);
    const whatsappUrl = `https://wa.me/5571986162119?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  });

  // Inicializa preview
  updatePreview();
}

/* ==========================================================================
   3. FILTRAGEM DO MOSTRUÁRIO DE PEDRAS
   ========================================================================== */
function initStoneCatalogFilter() {
  const filterButtons = document.querySelectorAll('.stone-filter-btn');
  const stoneCards = document.querySelectorAll('.stone-item-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Estilos dos botões
      filterButtons.forEach(b => {
        b.classList.remove('active', 'bg-emerald-700', 'text-white', 'border-emerald-500');
        b.classList.add('bg-stone-900/80', 'text-stone-300', 'border-stone-800');
      });

      btn.classList.add('active', 'bg-emerald-700', 'text-white', 'border-emerald-500');
      btn.classList.remove('bg-stone-900/80', 'text-stone-300', 'border-stone-800');

      const filterCategory = btn.getAttribute('data-filter');

      stoneCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterCategory === 'all' || cardCategory === filterCategory) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

// Atalho rápido: clicar em "Pedir cotação desta pedra"
window.requestStoneQuote = function(stoneName) {
  const message = `Olá DRM Mármores! Encontrei a pedra *${stoneName}* no catálogo do site de vocês e gostaria de um orçamento para o meu projeto em Salvador.`;
  const url = `https://wa.me/5571986162119?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

/* ==========================================================================
   4. LIGHTBOX MODAL DA GALERIA DE PROJETOS REAIS
   ========================================================================== */
let galleryItems = [];
let currentGalleryIndex = 0;

function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (!modal) return;

  const modalImg = document.getElementById('lightboxImg');
  const modalTitle = document.getElementById('lightboxTitle');
  const modalDesc = document.getElementById('lightboxDesc');
  const modalWhatsAppBtn = document.getElementById('lightboxWhatsAppBtn');
  const btnClose = document.getElementById('lightboxClose');
  const btnPrev = document.getElementById('lightboxPrev');
  const btnNext = document.getElementById('lightboxNext');

  // Coleta dados dos itens da galeria
  const projectCards = document.querySelectorAll('.gallery-project-card');
  galleryItems = Array.from(projectCards).map((card, index) => {
    return {
      index,
      img: card.getAttribute('data-img'),
      title: card.getAttribute('data-title'),
      desc: card.getAttribute('data-desc'),
      tag: card.getAttribute('data-tag')
    };
  });

  // Abrir Lightbox
  projectCards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  function openLightbox(index) {
    currentGalleryIndex = index;
    const item = galleryItems[index];
    if (!item) return;

    modalImg.src = item.img;
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.desc;
    
    // Atualiza botão de contato para este projeto específico
    const msg = `Olá! Vi o projeto *${item.title}* (${item.desc}) na galeria do site da DRM Mármores e gostaria de solicitar um orçamento similar para minha casa em Salvador.`;
    modalWhatsAppBtn.href = `https://wa.me/5571986162119?text=${encodeURIComponent(msg)}`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
    openLightbox(currentGalleryIndex);
  }

  function showPrev() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentGalleryIndex);
  }

  btnClose?.addEventListener('click', closeLightbox);
  btnNext?.addEventListener('click', showNext);
  btnPrev?.addEventListener('click', showPrev);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-backdrop')) {
      closeLightbox();
    }
  });

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

/* ==========================================================================
   5. MENU MOBILE RESPONSIVO
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenuDrawer');
  const closeBtn = document.getElementById('mobileMenuClose');
  const menuLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !mobileMenu) return;

  function toggleMenu(show) {
    if (show) {
      mobileMenu.classList.remove('hidden');
      setTimeout(() => {
        mobileMenu.classList.remove('opacity-0', 'translate-x-full');
      }, 20);
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => {
        mobileMenu.classList.add('hidden');
      }, 300);
      document.body.style.overflow = '';
    }
  }

  toggleBtn.addEventListener('click', () => toggleMenu(true));
  closeBtn?.addEventListener('click', () => toggleMenu(false));

  menuLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}

/* ==========================================================================
   6. ROLAGEM SUAVE E BOTÃO COPIAR CONTATO
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Utilitário para copiar dados de contato
window.copyToClipboard = function(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} copiado com sucesso!`);
  }).catch(() => {
    prompt('Copie o contato abaixo:', text);
  });
};

function showToast(message) {
  let toast = document.getElementById('drmToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'drmToast';
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900 border border-emerald-500 text-stone-100 px-6 py-3 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-3 text-sm font-medium';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> ${message}`;
  toast.style.opacity = '1';
  toast.style.transform = 'translate(-50%, 0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 20px)';
  }, 3200);
}
