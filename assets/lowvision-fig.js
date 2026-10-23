// Low-vision central-scotoma figure: one range input (0-100) drives --lvf-amt (0-1) on the card,
// which CSS turns into the scene's scale around the fixed patch centre (see .lvf-scenegroup in
// lowvision-fig.css). Dragging the slider updates --lvf-amt with no transition, so the scene
// tracks the pointer 1:1; the two end buttons jump the slider to 0 or 100 and add a short,
// CSS-driven transition for that jump only (removed again once it finishes), which
// prefers-reduced-motion then strips entirely in the stylesheet. The readout pill's text (read
// from data attributes on the card, so the copy lives in one place) and the slider's own
// aria-valuetext both follow the same three-way state so a screen reader hears words, not a raw
// percentage.
(function () {
  var card = document.querySelector('[data-lvf-card]');
  if (!card) return;
  var slider = card.querySelector('[data-lvf-slider]');
  var readout = card.querySelector('[data-lvf-readout]');
  var jumpBtns = Array.prototype.slice.call(card.querySelectorAll('[data-lvf-jump]'));
  if (!slider || !readout || !jumpBtns.length) return;

  var TEXT = {
    without: card.getAttribute('data-without-readout'),
    mid: card.getAttribute('data-mid-readout'),
    with: card.getAttribute('data-with-readout')
  };

  function stateFor(v) {
    return v <= 10 ? 'without' : v >= 90 ? 'with' : 'mid';
  }

  function apply(v) {
    card.style.setProperty('--lvf-amt', String(v / 100));
    slider.style.setProperty('--lvf-pct', v + '%');
    var state = stateFor(v);
    card.setAttribute('data-lvf-state', state);
    var text = TEXT[state];
    readout.textContent = text;
    slider.setAttribute('aria-valuetext', text);
    jumpBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-lvf-jump')) === v));
    });
  }

  slider.addEventListener('input', function () {
    card.classList.remove('lvf-animate');
    apply(Number(slider.value));
  });

  jumpBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = Number(btn.getAttribute('data-lvf-jump'));
      slider.value = String(target);
      card.classList.add('lvf-animate');
      apply(target);
      window.setTimeout(function () { card.classList.remove('lvf-animate'); }, 300);
    });
  });

  apply(Number(slider.value));
})();
