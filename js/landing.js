/* ==========================================================================
   EcomPilot — interactions de la landing
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var ECOM = window.ECOM;
    var Charts = window.ECOMCharts;
    var UI = window.ECOMUI;

    UI.initStickyHeader();
    UI.initDisclosure('.nav-toggle', '#mobile-nav');

    /* ------------------------------------------------------------------
       Aperçu du tableau de bord dans le hero
       ------------------------------------------------------------------ */
    var kpiHost = document.getElementById('hero-kpis');
    if (kpiHost) {
      var cards = [
        {
          label: 'Chiffre d’affaires',
          value: ECOM.formatNumber(ECOM.kpis.revenue),
          unit: 'FCFA',
          meta: '<span class="delta delta--up">+' + ECOM.kpis.revenueDelta + ' %</span> vs mois précédent'
        },
        {
          label: 'Commandes reçues',
          value: ECOM.formatNumber(ECOM.kpis.orders),
          unit: '',
          meta: '<span class="delta delta--up">+' + ECOM.kpis.ordersDelta + ' %</span> vs mois précédent'
        },
        {
          label: 'Commandes livrées',
          value: ECOM.formatNumber(ECOM.kpis.delivered),
          unit: '',
          meta: ECOM.kpis.deliveredShare + ' % du total'
        },
        {
          label: 'En attente',
          value: ECOM.formatNumber(ECOM.kpis.pending),
          unit: '',
          meta: 'À traiter aujourd’hui'
        }
      ];

      kpiHost.innerHTML = cards.map(function (card) {
        return '<div class="app-preview__kpi">' +
          '<span class="app-preview__kpi-label">' + card.label + '</span>' +
          '<span class="app-preview__kpi-value">' + card.value +
            (card.unit ? '<small>' + card.unit + '</small>' : '') +
          '</span>' +
          '<span class="app-preview__kpi-meta">' + card.meta + '</span>' +
        '</div>';
      }).join('');
    }

    var chartHost = document.getElementById('hero-chart');
    if (chartHost && Charts) {
      Charts.line(chartHost, ECOM.dailySales, {
        height: 184,
        tooltip: false,
        valueFormat: ECOM.formatCFA,
        ariaLabel: 'Ventes quotidiennes du 12 octobre au 10 novembre 2026, total 3 850 000 FCFA.'
      });
    }

    var donutHost = document.getElementById('hero-donut');
    var legendHost = document.getElementById('hero-legend');
    if (donutHost && Charts) {
      Charts.donut(donutHost, ECOM.statusBreakdown, {
        total: ECOM.kpis.orders,
        caption: 'commandes',
        size: 132,
        stroke: 16,
        ariaLabel: 'Répartition des 520 commandes : 385 livrées, 60 en cours, 75 en attente.'
      });
    }
    if (legendHost) {
      legendHost.innerHTML = ECOM.statusBreakdown.slice(0, 3).map(function (item) {
        return '<li>' +
          '<span class="legend-dot" style="background:' + item.color + '"></span>' +
          '<span>' + item.label + '</span>' +
          '<strong>' + item.value + '</strong>' +
        '</li>';
      }).join('');
    }
  });
})();
