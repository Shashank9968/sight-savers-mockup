(function () {
  "use strict";
  var fig = document.getElementById("mx-diagram");
  if (!fig) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  fig.classList.add("mxd-js");
  function reveal() {
    fig.classList.add("mxd-animate");
  }
  if (!("IntersectionObserver" in window)) {
    reveal();
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal();
          io.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  io.observe(fig);
})();
