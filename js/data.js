/* ==========================================================================
   EcomPilot — données fictives (source unique de vérité)
   Toutes les vues (cartes KPI, graphique, donut, tableau, hero) lisent ici.
   Aucune valeur n'est dupliquée en HTML.
   ========================================================================== */
(function () {
  'use strict';

  var NBSP = '\u00A0';
  var numberFR = new Intl.NumberFormat('fr-FR');

  function formatNumber(value) {
    return numberFR.format(value).replace(/[\u202F\u00A0\s]/g, NBSP);
  }

  function formatCFA(value) {
    return formatNumber(value) + NBSP + 'FCFA';
  }

  /* Axe Y abrégé : 0, 50 k, 100 k, 3,85 M … */
  function formatCompact(value) {
    if (value === 0) return '0';
    if (value >= 1000000) {
      var millions = value / 1000000;
      var text = millions.toFixed(millions < 10 ? 2 : 1).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
      return text + NBSP + 'M';
    }
    return formatNumber(Math.round(value / 1000)) + NBSP + 'k';
  }

  var MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  function shortDate(iso) {
    var parts = iso.split('-');
    return Number(parts[2]) + NBSP + MONTHS[Number(parts[1]) - 1];
  }

  function slashDate(iso) {
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1];
  }

  /* ------------------------------------------------------------------ */
  /* Ventes quotidiennes : 12 oct. → 10 nov. 2026 (30 jours)            */
  /* Somme contrôlée = 3 850 000 FCFA, valeurs multiples de 5 000.      */
  /* ------------------------------------------------------------------ */
  var rawDaily = [
    100000, 105000, 110000, 115000, 110000, 130000, 125000,
    110000, 115000, 120000, 125000, 120000, 140000, 130000,
    115000, 120000, 125000, 130000, 145000, 170000, 155000,
    120000, 125000, 130000, 130000, 135000, 160000, 145000,
    140000, 150000
  ];

  var dayLabels = [
    '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16',
    '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21',
    '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26',
    '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31',
    '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05',
    '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10'
  ];

  var dailySales = rawDaily.map(function (value, index) {
    var iso = dayLabels[index];
    return {
      date: iso,
      label: shortDate(iso),
      shortLabel: slashDate(iso),
      value: value
    };
  });

  /* ------------------------------------------------------------------ */
  /* Vue 12 mois : déc. 2025 → nov. 2026                                */
  /* Le dernier point correspond aux 30 derniers jours (mois en cours). */
  /* ------------------------------------------------------------------ */
  var monthlySales = [
    { label: 'déc. 2025', shortLabel: 'déc. 25', value: 2600000 },
    { label: 'janv. 2026', shortLabel: 'janv. 26', value: 2700000 },
    { label: 'févr. 2026', shortLabel: 'févr. 26', value: 2750000 },
    { label: 'mars 2026', shortLabel: 'mars 26', value: 2850000 },
    { label: 'avr. 2026', shortLabel: 'avr. 26', value: 2900000 },
    { label: 'mai 2026', shortLabel: 'mai 26', value: 2950000 },
    { label: 'juin 2026', shortLabel: 'juin 26', value: 3050000 },
    { label: 'juil. 2026', shortLabel: 'juil. 26', value: 3150000 },
    { label: 'août 2026', shortLabel: 'août 26', value: 3250000 },
    { label: 'sept. 2026', shortLabel: 'sept. 26', value: 3350000 },
    { label: 'oct. 2026', shortLabel: 'oct. 26', value: 3440000 },
    { label: 'nov. 2026', shortLabel: 'nov. 26', value: 3850000, current: true }
  ];

  /* ------------------------------------------------------------------ */
  /* Indicateurs — calculés, jamais saisis deux fois                    */
  /* ------------------------------------------------------------------ */
  var revenue = dailySales.reduce(function (sum, day) { return sum + day.value; }, 0);

  var kpis = {
    revenue: revenue,
    orders: 520,
    delivered: 385,
    pending: 75,
    shipping: 60,
    deliveredShare: 74,       /* 385 / 520 = 74,04 % */
    revenueDelta: 12,         /* 3 850 000 vs 3 440 000 = +11,9 % */
    ordersDelta: 8,           /* 520 vs 482 = +7,9 % */
    previousRevenue: 3440000,
    previousOrders: 482
  };

  var statusMeta = {
    delivered: { key: 'delivered', label: 'Livrée', tone: 'delivered' },
    shipping: { key: 'shipping', label: 'En cours', tone: 'shipping' },
    pending: { key: 'pending', label: 'En attente', tone: 'pending' },
    cancelled: { key: 'cancelled', label: 'Annulée', tone: 'cancelled' }
  };

  var orders = [
    { id: 'CMD-1048', client: 'Marie Okoko', city: 'Brazzaville', product: 'Tissu wax (6 yards)', amount: 25000, status: 'delivered', date: '2026-11-10' },
    { id: 'CMD-1047', client: 'Jean-Claude Mouanga', city: 'Pointe-Noire', product: 'Panier tressé', amount: 15000, status: 'shipping', date: '2026-11-10' },
    { id: 'CMD-1046', client: 'Christelle Ndinga', city: 'Ouesso', product: 'Huile de palme artisanale', amount: 12500, status: 'pending', date: '2026-11-09' },
    { id: 'CMD-1045', client: 'Serge Makosso', city: 'Dolisie', product: 'Épices (mélange)', amount: 6500, status: 'delivered', date: '2026-11-09' },
    { id: 'CMD-1044', client: 'Aline Poaty', city: 'Brazzaville', product: 'Tissu wax (3 yards)', amount: 12000, status: 'shipping', date: '2026-11-08' },
    { id: 'CMD-1043', client: 'Rodrigue Okemba', city: 'Pointe-Noire', product: 'Café torréfié (1 kg)', amount: 9000, status: 'delivered', date: '2026-11-08' },
    { id: 'CMD-1042', client: 'Léa Mabiala', city: 'Nkayi', product: 'Savon noir artisanal', amount: 4500, status: 'pending', date: '2026-11-07' },
    { id: 'CMD-1041', client: 'Prince Nkodia', city: 'Owando', product: 'Totebag en raphia', amount: 7500, status: 'delivered', date: '2026-11-07' }
  ].map(function (order) {
    return Object.assign({}, order, {
      dateLabel: slashDate(order.date),
      amountLabel: formatCFA(order.amount),
      statusLabel: statusMeta[order.status].label,
      tone: statusMeta[order.status].tone
    });
  });

  var statusBreakdown = [
    { key: 'delivered', label: 'Livrées', value: 385, color: '#2E8B57', tone: 'delivered' },
    { key: 'shipping', label: 'En cours', value: 60, color: '#7BC4A4', tone: 'shipping' },
    { key: 'pending', label: 'En attente', value: 75, color: '#D9703F', tone: 'pending' },
    { key: 'cancelled', label: 'Annulée', value: 0, color: '#A8A59B', tone: 'cancelled' }
  ].map(function (item) {
    return Object.assign({}, item, {
      share: Math.round((item.value / kpis.orders) * 100)
    });
  });

  var testimonials = [
    {
      quote: 'Avant, je tenais mes commandes dans un cahier. Aujourd’hui je vois en un coup d’œil ce qui est parti et ce qui attend.',
      name: 'Grâce Loubaki',
      role: 'Gérante, boutique de textiles',
      city: 'Brazzaville',
      initials: 'GL',
      tone: 'mint'
    },
    {
      quote: 'Le suivi des livraisons a divisé par deux nos appels clients. Mon équipe sait où est chaque colis.',
      name: 'Aurélien Massamba',
      role: 'Fondateur, épicerie en ligne',
      city: 'Pointe-Noire',
      initials: 'AM',
      tone: 'clay'
    },
    {
      quote: 'Les statistiques sont lisibles sans être comptable. Je sais quels produits tournent et quand réapprovisionner.',
      name: 'Nadège Mbemba',
      role: 'Responsable, atelier d’artisanat',
      city: 'Dolisie',
      initials: 'NM',
      tone: 'forest'
    }
  ];

  var metrics = [
    { value: '1 200+', label: 'commandes traitées' },
    { value: '85 %', label: 'de livraisons à l’heure' },
    { value: '3', label: 'villes couvertes' },
    { value: '4 h', label: 'gagnées par semaine' }
  ];

  var features = [
    { icon: 'shopping-bag', title: 'Commandes', text: 'Suivez chaque commande, de la réception à la facture.' },
    { icon: 'truck', title: 'Livraisons', text: 'Organisez les tournées et suivez les colis en temps réel.' },
    { icon: 'package', title: 'Produits', text: 'Gérez catalogue, stocks et prix sans tableur.' },
    { icon: 'chart-line', title: 'Statistiques', text: 'Mesurez le chiffre d’affaires et les tendances.' }
  ];

  var period = {
    start: dailySales[0].date,
    end: dailySales[dailySales.length - 1].date,
    label: '30 derniers jours',
    horizon: 'Mardi 10 novembre 2026'
  };

  var ECOM = {
    period: period,
    kpis: kpis,
    dailySales: dailySales,
    monthlySales: monthlySales,
    orders: orders,
    statusMeta: statusMeta,
    statusBreakdown: statusBreakdown,
    testimonials: testimonials,
    metrics: metrics,
    features: features,
    revenueSeries: { '7d': dailySales.slice(-7), '30d': dailySales, '12m': monthlySales },
    formatNumber: formatNumber,
    formatCFA: formatCFA,
    formatCompact: formatCompact,
    formatDate: shortDate,
    fmt: { number: formatNumber, cfa: formatCFA, compact: formatCompact }
  };

  /* ------------------------------------------------------------------ */
  /* Contrôles de cohérence (console)                                   */
  /* ------------------------------------------------------------------ */
  ECOM.check = function () {
    var dailyTotal = dailySales.reduce(function (sum, day) { return sum + day.value; }, 0);
    var statusTotal = kpis.delivered + kpis.shipping + kpis.pending;
    var results = {
      'somme des 30 jours = CA': dailyTotal === kpis.revenue,
      'livrées + en cours + en attente = reçues': statusTotal === kpis.orders,
      'livrées / reçues = 74 %': Math.round((kpis.delivered / kpis.orders) * 100) === kpis.deliveredShare,
      'parts du donut = 100 %': statusBreakdown.reduce(function (s, i) { return s + i.share; }, 0) === 100,
      '12 mois : dernier point = 30 jours': monthlySales[monthlySales.length - 1].value === revenue,
      'variation CA = +12 %': Math.round(((kpis.revenue - kpis.previousRevenue) / kpis.previousRevenue) * 100) === kpis.revenueDelta,
      'variation commandes = +8 %': Math.round(((kpis.orders - kpis.previousOrders) / kpis.previousOrders) * 100) === kpis.ordersDelta,
      'valeurs multiples de 5 000': dailySales.every(function (d) { return d.value % 5000 === 0; })
    };
    Object.keys(results).forEach(function (label) {
      if (!results[label]) console.error('[EcomPilot] Incohérence : ' + label);
    });
    return results;
  };

  window.ECOM = ECOM;

  if (document.documentElement.dataset.env !== 'prod') {
    ECOM.check();
  }
})();
