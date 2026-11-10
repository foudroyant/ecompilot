/* ==========================================================================
   EcomPilot — interactions du tableau de bord
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var ECOM = window.ECOM;
    var Charts = window.ECOMCharts;
    var Icons = window.ECOMIcons;
    var UI = window.ECOMUI;

    var state = { period: '30d', query: '' };

    /* ------------------------------------------------------------------
       Indicateurs
       ------------------------------------------------------------------ */
    function renderKpis() {
      var grid = document.getElementById('kpi-grid');
      if (!grid) return;

      var cards = [
        {
          label: 'Chiffre d’affaires',
          value: ECOM.formatNumber(ECOM.kpis.revenue),
          unit: 'FCFA',
          meta: '<span class="delta delta--up">+' + ECOM.kpis.revenueDelta + ' %</span> vs mois précédent',
          icon: 'banknote',
          tone: ''
        },
        {
          label: 'Commandes reçues',
          value: ECOM.formatNumber(ECOM.kpis.orders),
          unit: '',
          meta: '<span class="delta delta--up">+' + ECOM.kpis.ordersDelta + ' %</span> vs mois précédent',
          icon: 'shopping-bag',
          tone: ''
        },
        {
          label: 'Commandes livrées',
          value: ECOM.formatNumber(ECOM.kpis.delivered),
          unit: '',
          meta: ECOM.kpis.deliveredShare + ' % du total',
          icon: 'check-circle',
          tone: ''
        },
        {
          label: 'Commandes en attente',
          value: ECOM.formatNumber(ECOM.kpis.pending),
          unit: '',
          meta: 'À traiter aujourd’hui',
          icon: 'clock',
          tone: 'clay'
        }
      ];

      grid.innerHTML = cards.map(function (card) {
        return '<article class="kpi">' +
          '<div class="kpi__head">' +
            '<p class="kpi__label">' + card.label + '</p>' +
            '<span class="kpi__icon' + (card.tone ? ' kpi__icon--' + card.tone : '') + '">' +
              '<span data-icon="' + card.icon + '" data-icon-size="20"></span>' +
            '</span>' +
          '</div>' +
          '<p class="kpi__value">' + card.value +
            (card.unit ? '<span class="kpi__unit">' + card.unit + '</span>' : '') +
          '</p>' +
          '<p class="kpi__meta">' + card.meta + '</p>' +
        '</article>';
      }).join('');

      Icons.render(grid);
    }

    /* ------------------------------------------------------------------
       Graphique des ventes
       ------------------------------------------------------------------ */
    var chartHost = document.getElementById('sales-chart');
    var salesSub = document.getElementById('sales-sub');
    var periodButtons = Array.prototype.slice.call(document.querySelectorAll('[data-period]'));

    var periodLabels = {
      '7d': '4 – 10 novembre 2026',
      '30d': '12 octobre – 10 novembre 2026',
      '12m': 'Décembre 2025 – novembre 2026, dernier point : 30 derniers jours'
    };

    function renderChart(period) {
      if (!chartHost) return;
      var series = ECOM.revenueSeries[period] || ECOM.dailySales;
      Charts.line(chartHost, series, {
        height: 320,
        valueFormat: ECOM.formatCFA,
        ariaLabel: period === '12m'
          ? 'Ventes mensuelles de décembre 2025 à novembre 2026. Novembre correspond aux 30 derniers jours.'
          : 'Ventes quotidiennes, total ' + ECOM.formatCFA(ECOM.kpis.revenue)
      });
      if (salesSub) salesSub.textContent = periodLabels[period];
    }

    function selectPeriod(period) {
      state.period = period;
      periodButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-period') === period));
      });
      renderChart(period);
    }

    periodButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectPeriod(button.getAttribute('data-period'));
      });
    });

    /* ------------------------------------------------------------------
       Donut + légende
       ------------------------------------------------------------------ */
    function renderDonut() {
      var host = document.getElementById('status-donut');
      var legend = document.getElementById('status-legend');
      if (!host) return;

      Charts.donut(host, ECOM.statusBreakdown, {
        total: ECOM.kpis.orders,
        caption: 'commandes',
        size: 200,
        stroke: 24,
        ariaLabel: 'Répartition des 520 commandes : 385 livrées, 60 en cours, 75 en attente, 0 annulée.'
      });

      if (legend) {
        legend.innerHTML = ECOM.statusBreakdown.map(function (item) {
          var empty = item.value === 0 ? ' legend__item--empty' : '';
          return '<li class="legend__item' + empty + '">' +
            '<span class="legend__swatch" style="background:' + item.color + '"></span>' +
            '<span class="legend__label">' + item.label + '</span>' +
            '<span class="legend__value">' + item.value + '</span>' +
            '<span class="legend__share">' + item.share + ' %</span>' +
          '</li>';
        }).join('');
      }
    }

    /* ------------------------------------------------------------------
       Tableau des commandes
       ------------------------------------------------------------------ */
    var tbody = document.getElementById('orders-body');
    var countLabel = document.getElementById('orders-count');
    var headCount = document.getElementById('orders-head-count');

    function rowMarkup(order) {
      return '<tr>' +
        '<td data-label="N°" class="cell-id">#' + order.id + '</td>' +
        '<td data-label="Client" class="cell-client">' + order.client + '</td>' +
        '<td data-label="Ville" class="cell-muted">' + order.city + '</td>' +
        '<td data-label="Produit">' + order.product + '</td>' +
        '<td data-label="Montant" class="is-num">' + order.amountLabel + '</td>' +
        '<td data-label="Statut">' + UI.statusBadge(order.status) + '</td>' +
        '<td data-label="Date" class="cell-muted">' + order.dateLabel + '</td>' +
      '</tr>';
    }

    function matches(order) {
      if (!state.query) return true;
      var haystack = [order.id, order.client, order.city, order.product, order.statusLabel]
        .join(' ').toLowerCase();
      return haystack.indexOf(state.query) !== -1;
    }

    function renderOrders() {
      if (!tbody) return;
      var rows = ECOM.orders.filter(matches);

      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">' +
          '<div class="empty-state">' +
            '<strong>Aucune commande ne correspond</strong>' +
            '<span>Essayez un nom, une ville, un produit ou un numéro (#CMD-1048).</span>' +
          '</div>' +
        '</td></tr>';
      } else {
        tbody.innerHTML = rows.map(rowMarkup).join('');
      }

      var total = ECOM.kpis.orders;
      if (countLabel) {
        countLabel.textContent = rows.length === ECOM.orders.length
          ? 'Affichage 1 à ' + ECOM.orders.length + ' sur ' + total
          : rows.length + (rows.length > 1 ? ' résultats' : ' résultat') + ' sur ' + total;
      }
      if (headCount) {
        headCount.textContent = state.query
          ? 'Filtré sur « ' + state.query + ' »'
          : 'Les 8 plus récentes sur ' + total;
      }
    }

    var search = document.getElementById('order-search');
    if (search) {
      search.addEventListener('input', function () {
        state.query = search.value.trim().toLowerCase();
        renderOrders();
      });
    }

    /* ------------------------------------------------------------------
       Notifications
       ------------------------------------------------------------------ */
    var notifToggle = document.getElementById('notif-toggle');
    var notifPopover = document.getElementById('notif-popover');

    function closeNotif() {
      if (!notifToggle || !notifPopover) return;
      notifPopover.hidden = true;
      notifToggle.setAttribute('aria-expanded', 'false');
    }

    if (notifToggle && notifPopover) {
      notifToggle.addEventListener('click', function (event) {
        event.stopPropagation();
        var isOpen = notifToggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
          closeNotif();
        } else {
          notifPopover.hidden = false;
          notifToggle.setAttribute('aria-expanded', 'true');
        }
      });

      document.addEventListener('click', function (event) {
        if (!notifPopover.hidden && !notifPopover.contains(event.target) && event.target !== notifToggle) {
          closeNotif();
        }
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeNotif();
      });
    }

    /* ------------------------------------------------------------------
       Sidebar mobile
       ------------------------------------------------------------------ */
    var sidebar = document.getElementById('sidebar');
    var sidebarToggle = document.getElementById('sidebar-toggle');
    var backdrop = document.getElementById('sidebar-backdrop');

    function setSidebar(open) {
      if (!sidebar || !sidebarToggle || !backdrop) return;
      sidebar.classList.toggle('is-open', open);
      sidebarToggle.setAttribute('aria-expanded', String(open));
      if (open) {
        backdrop.hidden = false;
        requestAnimationFrame(function () { backdrop.classList.add('is-visible'); });
      } else {
        backdrop.classList.remove('is-visible');
        setTimeout(function () {
          if (!sidebar.classList.contains('is-open')) backdrop.hidden = true;
        }, 200);
      }
    }

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function () {
        setSidebar(!sidebar.classList.contains('is-open'));
      });
    }
    if (backdrop) backdrop.addEventListener('click', function () { setSidebar(false); });
    if (sidebar) {
      sidebar.addEventListener('click', function (event) {
        if (event.target.closest('a') && window.innerWidth <= 768) setSidebar(false);
      });
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setSidebar(false);
    });

    /* ------------------------------------------------------------------
       Modale « Nouvelle commande »
       ------------------------------------------------------------------ */
    var dialog = document.getElementById('order-dialog');
    var form = document.getElementById('order-form');

    if (form && dialog) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var data = new FormData(form);
        var client = String(data.get('client') || '').trim();
        dialog.close();
        form.reset();
        UI.toast('Commande pour ' + (client || 'ce client') + ' créée (démonstration). Les données du tableau restent inchangées.');
      });
    }

    /* ------------------------------------------------------------------
       Boutons de démonstration
       ------------------------------------------------------------------ */
    Array.prototype.forEach.call(document.querySelectorAll('[data-demo-toast]'), function (button) {
      button.addEventListener('click', function () {
        UI.toast(button.getAttribute('data-demo-toast'));
      });
    });

    /* ------------------------------------------------------------------
       Démarrage
       ------------------------------------------------------------------ */
    UI.initDialogs();
    renderKpis();
    renderDonut();
    renderOrders();
    renderChart(state.period);
  });
})();
