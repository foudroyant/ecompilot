/* ==========================================================================
   EcomPilot — utilitaires partagés (statuts, toast, dialogues)
   ========================================================================== */
(function () {
  'use strict';

  var ECOM = window.ECOM;

  function statusBadge(key) {
    var meta = ECOM.statusMeta[key];
    if (!meta) return '';
    return '<span class="status status--' + meta.tone + '">' + meta.label + '</span>';
  }

  function toastHost() {
    var host = document.querySelector('.toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toast-host';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    return host;
  }

  function toast(message, options) {
    options = options || {};
    var host = toastHost();
    var node = document.createElement('div');
    node.className = 'toast';
    node.innerHTML = '<span class="toast__icon" data-icon="check-circle" data-icon-size="20"></span>' +
      '<span class="toast__text">' + message + '</span>';
    host.appendChild(node);
    if (window.ECOMIcons) window.ECOMIcons.render(node);
    requestAnimationFrame(function () { node.classList.add('is-visible'); });

    var timer = setTimeout(remove, options.duration || 5200);
    node.addEventListener('click', function () { clearTimeout(timer); remove(); });

    function remove() {
      node.classList.remove('is-visible');
      setTimeout(function () { node.remove(); }, 220);
    }
  }

  /* Dialogues natifs : [data-dialog-open="#id"] / [data-dialog-close] */
  function initDialogs() {
    document.addEventListener('click', function (event) {
      var opener = event.target.closest('[data-dialog-open]');
      if (opener) {
        var dialog = document.querySelector(opener.getAttribute('data-dialog-open'));
        if (dialog && dialog.showModal) {
          dialog.showModal();
          document.body.classList.add('has-dialog');
        }
        return;
      }
      var closer = event.target.closest('[data-dialog-close]');
      if (closer) {
        var parent = closer.closest('dialog');
        if (parent) parent.close();
        return;
      }
      if (event.target.tagName === 'DIALOG') {
        event.target.close();
      }
    });

    document.addEventListener('close', function (event) {
      if (event.target.tagName === 'DIALOG') document.body.classList.remove('has-dialog');
    }, true);
  }

  /* Bordure de l'en-tête au défilement */
  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* Menu mobile générique */
  function initDisclosure(toggleSelector, panelSelector) {
    var toggle = document.querySelector(toggleSelector);
    var panel = document.querySelector(panelSelector);
    if (!toggle || !panel) return null;

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    }
    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      document.body.classList.add('nav-open');
    }

    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') close(); else open();
    });
    panel.addEventListener('click', function (event) {
      if (event.target.closest('a')) close();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) close();
    });

    return { open: open, close: close };
  }

  function formatCFA(value) { return ECOM.formatCFA(value); }

  window.ECOMUI = {
    statusBadge: statusBadge,
    toast: toast,
    initDialogs: initDialogs,
    initStickyHeader: initStickyHeader,
    initDisclosure: initDisclosure,
    formatCFA: formatCFA
  };
})();
