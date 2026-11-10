/* ==========================================================================
   EcomPilot — graphiques SVG sans dépendance
   - lineChart(container, series, options)
   - donutChart(container, segments, options)
   ========================================================================== */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var NBSP = '\u00A0';

  function el(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  function round(n) {
    return Math.round(n * 100) / 100;
  }

  function compact(value) {
    if (window.ECOM && window.ECOM.formatCompact) return window.ECOM.formatCompact(value);
    return String(value);
  }

  /* Échelle « ronde » : 0 / 50 k / 100 k… ou 0 / 1 M / 2 M… */
  function niceScale(max, count) {
    var steps = count || 4;
    if (!isFinite(max) || max <= 0) return { top: 1, ticks: [0, 1] };
    var raw = max / steps;
    var magnitude = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var normal = raw / magnitude;
    var multiplier = normal <= 1 ? 1 : normal <= 2 ? 2 : normal <= 2.5 ? 2.5 : normal <= 5 ? 5 : 10;
    var step = multiplier * magnitude;
    var top = Math.ceil(max / step) * step;
    var ticks = [];
    for (var value = 0; value <= top + step / 2; value += step) {
      ticks.push(Math.round(value));
    }
    return { step: step, top: top, ticks: ticks };
  }

  /* Courbe lissée (spline cardinale) */
  function smoothPath(points) {
    if (!points.length) return '';
    if (points.length === 1) return 'M' + round(points[0].x) + ' ' + round(points[0].y);
    var d = 'M' + round(points[0].x) + ' ' + round(points[0].y);
    var tension = 0.16;
    for (var i = 0; i < points.length - 1; i += 1) {
      var p0 = points[i - 1] || points[i];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) * tension;
      var c1y = p1.y + (p2.y - p0.y) * tension;
      var c2x = p2.x - (p3.x - p1.x) * tension;
      var c2y = p2.y - (p3.y - p1.y) * tension;
      d += ' C' + round(c1x) + ' ' + round(c1y) + ' ' + round(c2x) + ' ' + round(c2y) +
        ' ' + round(p2.x) + ' ' + round(p2.y);
    }
    return d;
  }

  function ensureSvgRoot(container) {
    container.classList.add('chart');
    container.innerHTML = '';
    return container;
  }

  /* ------------------------------------------------------------------ */
  /* Courbe + aire                                                      */
  /* ------------------------------------------------------------------ */
  function lineChart(container, series, options) {
    if (!container || !series || !series.length) return null;
    options = options || {};

    var height = options.height || 320;
    var showAxes = options.axes !== false;
    var canHover = options.tooltip !== false;
    var color = options.color || '#1F5C4A';
    var fillColor = options.fill || '#7BC4A4';
    var formatValue = options.valueFormat || function (value) { return compact(value) + NBSP + 'FCFA'; };
    var uid = 'chart-grad-' + Math.random().toString(36).slice(2, 8);
    var activeIndex = -1;
    var raf = null;

    var data = series.map(function (item) {
      return {
        label: item.label,
        shortLabel: item.shortLabel || item.label,
        value: item.value,
        current: !!item.current
      };
    });

    container.style.height = height + 'px';

    function draw() {
      var width = Math.max(Math.round(container.clientWidth), 220);
      var pad = showAxes
        ? { top: 14, right: 10, bottom: 30, left: 54 }
        : { top: 10, right: 8, bottom: 10, left: 8 };
      var plotW = Math.max(width - pad.left - pad.right, 20);
      var plotH = Math.max(height - pad.top - pad.bottom, 20);
      var maxValue = Math.max.apply(null, data.map(function (d) { return d.value; }));
      var scale = niceScale(maxValue, 4);

      function xAt(index) {
        return pad.left + (data.length === 1 ? plotW / 2 : (plotW * index) / (data.length - 1));
      }
      function yAt(value) {
        return pad.top + plotH - (value / scale.top) * plotH;
      }

      ensureSvgRoot(container);
      container.setAttribute('role', 'group');
      container.setAttribute('aria-label', options.ariaLabel || 'Graphique des ventes');

      var svg = el('svg', {
        viewBox: '0 0 ' + width + ' ' + height,
        width: width,
        height: height,
        class: 'chart__svg',
        role: 'img',
        'aria-label': options.ariaLabel ||
          ('Ventes du ' + data[0].label + ' au ' + data[data.length - 1].label +
            ', de ' + compact(Math.min.apply(null, data.map(function (d) { return d.value; }))) +
            ' à ' + compact(maxValue) + ' FCFA.')
      });

      var defs = el('defs');
      var gradient = el('linearGradient', { id: uid, x1: '0', y1: '0', x2: '0', y2: '1' });
      gradient.appendChild(el('stop', { offset: '0', 'stop-color': fillColor, 'stop-opacity': '0.5' }));
      gradient.appendChild(el('stop', { offset: '0.65', 'stop-color': fillColor, 'stop-opacity': '0.16' }));
      gradient.appendChild(el('stop', { offset: '1', 'stop-color': fillColor, 'stop-opacity': '0' }));
      defs.appendChild(gradient);
      svg.appendChild(defs);

      /* grille + axe Y */
      scale.ticks.forEach(function (tick) {
        var y = round(yAt(tick));
        svg.appendChild(el('line', {
          x1: pad.left, x2: pad.left + plotW, y1: y, y2: y,
          stroke: '#E7E0D3',
          'stroke-width': 1,
          'stroke-dasharray': tick === 0 ? 'none' : '3 6'
        }));
        if (showAxes) {
          var label = el('text', {
            x: pad.left - 12, y: y + 4,
            'text-anchor': 'end',
            class: 'chart__axis'
          });
          label.textContent = compact(tick);
          svg.appendChild(label);
        }
      });

      /* axe X */
      if (showAxes) {
        var maxLabels = width < 420 ? 4 : 6;
        var stride = Math.max(1, Math.ceil(data.length / maxLabels));
        var indices = [];
        for (var i = 0; i < data.length; i += stride) indices.push(i);
        if (indices[indices.length - 1] !== data.length - 1) {
          if (data.length - 1 - indices[indices.length - 1] < stride * 0.6) indices.pop();
          indices.push(data.length - 1);
        }
        indices.forEach(function (index) {
          var text = el('text', {
            x: round(xAt(index)),
            y: height - 8,
            'text-anchor': index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle',
            class: 'chart__axis'
          });
          text.textContent = data[index].shortLabel;
          svg.appendChild(text);
        });
      }

      /* aire + courbe */
      var points = data.map(function (d, index) {
        return { x: xAt(index), y: yAt(d.value) };
      });
      var lineD = smoothPath(points);
      var areaD = lineD +
        ' L' + round(points[points.length - 1].x) + ' ' + round(pad.top + plotH) +
        ' L' + round(points[0].x) + ' ' + round(pad.top + plotH) + ' Z';

      svg.appendChild(el('path', { d: areaD, fill: 'url(#' + uid + ')', stroke: 'none' }));
      svg.appendChild(el('path', {
        d: lineD,
        fill: 'none',
        stroke: color,
        'stroke-width': 2.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }));

      /* point « mois en cours » (vue 12 mois) */
      if (data[data.length - 1].current) {
        var last = points[points.length - 1];
        svg.appendChild(el('circle', {
          cx: round(last.x), cy: round(last.y), r: 4.5,
          fill: '#FBF8F3', stroke: color, 'stroke-width': 2.5
        }));
      }

      /* curseur + infobulle */
      var guide = el('line', {
        x1: 0, x2: 0, y1: pad.top, y2: pad.top + plotH,
        stroke: color, 'stroke-opacity': '0.25', 'stroke-width': 1,
        'stroke-dasharray': '3 4', opacity: 0
      });
      var marker = el('circle', {
        r: 5.5, fill: '#FFFFFF', stroke: color, 'stroke-width': 2.5, opacity: 0
      });
      svg.appendChild(guide);
      svg.appendChild(marker);

      var tip = null;
      var announce = null;

      if (canHover) {
        tip = document.createElement('div');
        tip.className = 'chart__tip';
        tip.setAttribute('aria-hidden', 'true');

        announce = document.createElement('p');
        announce.className = 'u-sr-only';
        announce.setAttribute('aria-live', 'polite');

        svg.setAttribute('tabindex', '0');
      }

      function showAt(index, shouldAnnounce) {
        var point = data[index];
        if (!point) return;
        var px = xAt(index);
        var py = yAt(point.value);
        guide.setAttribute('x1', round(px));
        guide.setAttribute('x2', round(px));
        guide.setAttribute('opacity', '1');
        marker.setAttribute('cx', round(px));
        marker.setAttribute('cy', round(py));
        marker.setAttribute('opacity', '1');

        if (tip) {
          tip.innerHTML = '<span class="chart__tip-label">' + point.label + '</span>' +
            '<span class="chart__tip-value">' + formatValue(point.value) + '</span>';
          var left = Math.min(Math.max(px, 78), width - 78);
          tip.style.left = left + 'px';
          tip.style.top = Math.max(py - 12, 46) + 'px';
          tip.classList.add('is-visible');
        }
        if (shouldAnnounce && announce) {
          announce.textContent = point.label + ' : ' + formatValue(point.value);
        }
        activeIndex = index;
      }

      function hideTip() {
        guide.setAttribute('opacity', '0');
        marker.setAttribute('opacity', '0');
        if (tip) tip.classList.remove('is-visible');
        activeIndex = -1;
      }

      if (canHover) {
        var overlay = el('rect', {
          x: pad.left, y: pad.top, width: plotW, height: plotH,
          fill: 'transparent', class: 'chart__overlay'
        });
        overlay.addEventListener('pointermove', function (event) {
          var box = overlay.getBoundingClientRect();
          if (!box.width) return;
          var ratio = (event.clientX - box.left) / box.width;
          var index = Math.round(ratio * (data.length - 1));
          index = Math.max(0, Math.min(data.length - 1, index));
          showAt(index, false);
        });
        overlay.addEventListener('pointerleave', hideTip);
        svg.appendChild(overlay);

        svg.addEventListener('keydown', function (event) {
          var key = event.key;
          if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Home' && key !== 'End' && key !== 'Escape') return;
          event.preventDefault();
          if (key === 'Escape') { hideTip(); return; }
          if (key === 'Home') { showAt(0, true); return; }
          if (key === 'End') { showAt(data.length - 1, true); return; }
          var next = activeIndex < 0 ? data.length - 1 : activeIndex;
          next += key === 'ArrowRight' ? 1 : -1;
          next = Math.max(0, Math.min(data.length - 1, next));
          showAt(next, true);
        });
        svg.addEventListener('blur', hideTip);

        container.appendChild(tip);
        container.appendChild(announce);
      }

      container.appendChild(svg);
    }

    function schedule() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    }

    draw();

    if (window.ResizeObserver) {
      if (container.__ecoRO) container.__ecoRO.disconnect();
      container.__ecoRO = new ResizeObserver(schedule);
      container.__ecoRO.observe(container);
    }

    return { redraw: draw };
  }

  /* ------------------------------------------------------------------ */
  /* Anneau (donut)                                                     */
  /* ------------------------------------------------------------------ */
  function donutChart(container, segments, options) {
    if (!container || !segments || !segments.length) return null;
    options = options || {};
    var size = options.size || 220;
    var stroke = options.stroke || 26;
    var radius = size / 2 - stroke / 2 - 10;
    var center = size / 2;
    var circumference = 2 * Math.PI * radius;
    var total = segments.reduce(function (sum, segment) { return sum + segment.value; }, 0);
    var visible = segments.filter(function (segment) { return segment.value > 0; });
    var gap = options.gap === undefined ? 3 : options.gap;

    container.classList.add('chart', 'chart--donut');
    container.innerHTML = '';

    var svg = el('svg', {
      viewBox: '0 0 ' + size + ' ' + size,
      width: size,
      height: size,
      class: 'chart__svg',
      role: 'img',
      'aria-label': options.ariaLabel ||
        ('Répartition des commandes : ' + segments.map(function (s) {
          return s.value + ' ' + s.label.toLowerCase();
        }).join(', ') + '.')
    });

    svg.appendChild(el('circle', {
      cx: center, cy: center, r: radius,
      fill: 'none', stroke: '#F1EBDF', 'stroke-width': stroke
    }));

    var offset = 0;
    visible.forEach(function (segment) {
      var length = (segment.value / total) * circumference;
      var dash = Math.max(length - gap, 0.5);
      var ring = el('circle', {
        cx: center, cy: center, r: radius,
        fill: 'none',
        stroke: segment.color,
        'stroke-width': stroke,
        'stroke-dasharray': round(dash) + ' ' + round(circumference - dash),
        'stroke-dashoffset': round(-offset),
        transform: 'rotate(-90 ' + center + ' ' + center + ')'
      });
      var title = el('title');
      title.textContent = segment.label + ' : ' + segment.value;
      ring.appendChild(title);
      svg.appendChild(ring);
      offset += length;
    });

    var value = el('text', {
      x: center, y: center - 2,
      'text-anchor': 'middle',
      class: 'chart__donut-value'
    });
    value.textContent = options.total !== undefined ? options.total : total;
    svg.appendChild(value);

    if (options.caption) {
      var caption = el('text', {
        x: center, y: center + 22,
        'text-anchor': 'middle',
        class: 'chart__donut-caption'
      });
      caption.textContent = options.caption;
      svg.appendChild(caption);
    }

    container.appendChild(svg);
    return { svg: svg };
  }

  window.ECOMCharts = {
    line: lineChart,
    donut: donutChart,
    scale: niceScale
  };
})();
