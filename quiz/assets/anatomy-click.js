// Clickable eye cross-sections (myopia diagram): each label is a button that shows a short
// plain-English description in the readout under its diagram; a click anywhere on the drawing
// resolves to the nearest labelled part. Progressive enhancement only.
(function () {
  document.querySelectorAll('.mxd-eye').forEach(function (eye) {
    const art = eye.querySelector('.mxd-art');
    const readout = eye.querySelector('.mxd-readout');
    const labels = Array.from(eye.querySelectorAll('.mxd-lbl'));
    if (!art || !readout || !labels.length) return;
    let current = null;
    function select(btn) {
      current = btn;
      labels.forEach(function (l) {
        l.setAttribute('aria-pressed', String(l === btn));
        l.classList.toggle('is-active', l === btn);
      });
      readout.textContent = '';
      if (btn) {
        const b = document.createElement('b');
        b.textContent = btn.getAttribute('data-name');
        readout.append(b, document.createTextNode(' ' + btn.getAttribute('data-desc')));
        readout.classList.add('is-on');
      } else {
        readout.textContent = readout.getAttribute('data-rest');
        readout.classList.remove('is-on');
      }
    }
    labels.forEach(function (l) {
      l.addEventListener('click', function (e) { e.stopPropagation(); select(current === l ? null : l); });
    });
    art.addEventListener('click', function (e) {
      const r = art.getBoundingClientRect();
      if (!r.width) return;
      const x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
      const ar = r.width / r.height;
      let best = null, bd = Infinity;
      labels.forEach(function (l) {
        const p = (l.getAttribute('data-dot') || '').split(',').map(Number);
        const d = Math.hypot(x - p[0], (y - p[1]) / ar);
        if (d < bd) { bd = d; best = l; }
      });
      if (best) select(best);
    });
  });
})();
