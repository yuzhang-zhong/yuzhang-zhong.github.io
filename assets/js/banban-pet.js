/* Banban's tiny web companion. No dependencies, remote calls, or telemetry. */
(function () {
  "use strict";

  var root = document.getElementById("banban-pet");
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";

  var cat = root.querySelector(".banban-pet__cat");
  var sprite = root.querySelector(".banban-pet__sprite");
  var settings = root.querySelector(".banban-pet__settings");
  var menu = root.querySelector(".banban-pet__options");
  var pauseButton = root.querySelector(".banban-pet__pause");
  var hideButton = root.querySelector(".banban-pet__hide");
  var status = root.querySelector(".banban-pet__status");
  var footer = document.querySelector(".page__footer footer");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var compact = window.matchMedia("(max-width: 600px), (pointer: coarse)");
  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "banban-toggle";
  toggle.setAttribute("aria-controls", "banban-pet");
  toggle.hidden = true;
  if (footer) footer.appendChild(toggle);

  // Sprite cells contain original pixels from the public Banban motion demo.
  var frames = { idle: [0], walk: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], blink: [13, 14, 15, 16, 17, 18] };
  var frameCount = 19;
  var x = 0;
  var y = 0;
  var direction = -1;
  var edge = 18;
  var positionSet = false;
  var atBottom = true;
  var visible = readPreference("visible") !== "false";
  var paused = readPreference("paused") === "true";
  var hovered = false;
  var focused = false;
  var dragging = null;
  var ignoreClick = false;
  var happyUntil = 0;
  var phase = "idle";
  var phaseUntil = 0;
  var lastTime = 0;
  var lastPaint = -1;
  var raf = 0;
  var loaded = false;
  var happyTimer = 0;

  function readPreference(key) {
    try { return window.localStorage.getItem("banban:" + key); }
    catch (error) { return null; }
  }

  function savePreference(key, value) {
    try { window.localStorage.setItem("banban:" + key, String(value)); }
    catch (error) { /* The companion also works when storage is disabled. */ }
  }

  function bounds() {
    var viewport = window.visualViewport;
    return {
      width: viewport ? viewport.width : window.innerWidth,
      height: viewport ? viewport.height : window.innerHeight,
      left: viewport ? viewport.offsetLeft : 0,
      top: viewport ? viewport.offsetTop : 0
    };
  }

  function clampPosition() {
    var box = bounds();
    var maxX = Math.max(box.left + edge, box.left + box.width - 44 - edge);
    var maxY = Math.max(box.top + edge, box.top + box.height - 44 - (compact.matches ? 38 : edge));
    if (!positionSet) {
      x = Math.max(box.left + edge, maxX - 48);
      y = maxY;
      positionSet = true;
    }
    x = Math.min(maxX, Math.max(box.left + edge, x));
    y = atBottom ? maxY : Math.min(maxY, Math.max(box.top + edge, y));
    root.toggleAttribute("data-menu-left", x - box.left < 170);
    root.toggleAttribute("data-menu-below", y - box.top < 150);
    root.style.transform = "translate3d(" + Math.round(x) + "px," + Math.round(y) + "px,0)";
  }

  function paintFrame(name, time) {
    var sequence = frames[name] || frames.idle;
    var index = sequence[Math.floor(time / 100) % sequence.length];
    if (index !== lastPaint) {
      sprite.style.backgroundPosition = (index * 100 / (frameCount - 1)) + "% 0";
      lastPaint = index;
    }
    sprite.style.setProperty("--banban-facing", String(direction));
  }

  function updateControls() {
    toggle.textContent = "Banban: " + (visible ? "on" : "off");
    toggle.setAttribute("aria-label", visible ? "Hide Banban" : "Show Banban");
    toggle.setAttribute("aria-pressed", String(visible));
    pauseButton.textContent = paused ? "Resume walking" : "Pause walking";
    // Reduced motion is always respected, even if the saved setting says "on".
    pauseButton.disabled = reducedMotion.matches;
    if (reducedMotion.matches) pauseButton.textContent = "Reduced motion: resting";
  }

  function canAnimate() {
    return loaded && visible && !document.hidden && !reducedMotion.matches &&
      (!paused || performance.now() < happyUntil);
  }

  function schedule() {
    if (!raf && canAnimate()) raf = window.requestAnimationFrame(tick);
  }

  function tick(time) {
    raf = 0;
    if (!canAnimate()) return;
    var delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    var resting = paused || hovered || focused || dragging || !menu.hidden;
    if (time < happyUntil) {
      paintFrame("blink", time);
    } else if (resting) {
      paintFrame("idle", time);
    } else {
      if (time >= phaseUntil) {
        phase = phase === "walk" ? "idle" : "walk";
        phaseUntil = time + (phase === "walk" ? 5000 + Math.random() * 4000 : 2500 + Math.random() * 2500);
      }
      if (phase === "walk") {
        var box = bounds();
        x += direction * (compact.matches ? 16 : 22) * delta;
        if (x <= box.left + edge) direction = 1;
        if (x >= box.left + box.width - 44 - edge) direction = -1;
        clampPosition();
      }
      paintFrame(phase, time);
    }
    schedule();
  }

  function refreshMotion() {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    lastTime = 0;
    paintFrame("idle", 0);
    updateControls();
    schedule();
  }

  function setMenu(open, moveFocus) {
    menu.hidden = !open;
    settings.setAttribute("aria-expanded", String(open));
    root.toggleAttribute("data-menu-open", open);
    clampPosition();
    if (open && moveFocus) {
      (pauseButton.disabled ? hideButton : pauseButton).focus();
    }
  }

  function setVisible(value) {
    visible = value;
    savePreference("visible", value);
    root.hidden = !value;
    setMenu(false, false);
    if (value) {
      clampPosition();
    } else if (root.contains(document.activeElement) && footer) {
      toggle.focus({ preventScroll: true });
    }
    refreshMotion();
  }

  function pet() {
    if (ignoreClick) { ignoreClick = false; return; }
    // Touch browsers do not all focus buttons automatically. Keep options
    // discoverable after a tap as well as after keyboard activation.
    cat.focus({ preventScroll: true });
    happyUntil = performance.now() + 1200;
    status.textContent = "Banban purrs. ♡";
    root.removeAttribute("data-happy");
    // Restart the short reaction without moving or resizing the page.
    void root.offsetWidth;
    root.setAttribute("data-happy", "");
    paintFrame("blink", 0);
    clearTimeout(happyTimer);
    happyTimer = window.setTimeout(function () {
      root.removeAttribute("data-happy");
      status.textContent = "";
      if (reducedMotion.matches || paused) paintFrame("idle", 0);
    }, 1200);
    schedule();
  }

  cat.addEventListener("click", pet);
  cat.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    setMenu(true, true);
  });
  settings.addEventListener("click", function () { setMenu(menu.hidden, true); });
  pauseButton.addEventListener("click", function () {
    paused = !paused;
    savePreference("paused", paused);
    refreshMotion();
    setMenu(false, false);
    cat.focus({ preventScroll: true });
  });
  hideButton.addEventListener("click", function () { setVisible(false); });
  toggle.addEventListener("click", function () {
    setVisible(!visible);
    if (visible) cat.focus({ preventScroll: true });
  });
  root.addEventListener("pointerenter", function (event) {
    if (event.pointerType !== "touch") hovered = true;
  });
  root.addEventListener("pointerleave", function () { hovered = false; });
  root.addEventListener("focusin", function () { focused = true; });
  root.addEventListener("focusout", function (event) {
    focused = root.contains(event.relatedTarget);
  });
  root.addEventListener("keydown", function (event) {
    if (event.target === cat && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(event.key) !== -1) {
      event.preventDefault();
      atBottom = false;
      if (event.key === "ArrowLeft") { x -= 24; direction = -1; }
      if (event.key === "ArrowRight") { x += 24; direction = 1; }
      if (event.key === "ArrowUp") y -= 24;
      if (event.key === "ArrowDown") y += 24;
      clampPosition();
    }
    if (event.key === "Escape" && !menu.hidden) {
      event.preventDefault();
      setMenu(false, false);
      cat.focus({ preventScroll: true });
    }
  });
  document.addEventListener("pointerdown", function (event) {
    if (!root.contains(event.target)) setMenu(false, false);
  });

  cat.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    dragging = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: x, y: y, moved: false };
    cat.setPointerCapture(event.pointerId);
    setMenu(false, false);
  });
  cat.addEventListener("pointermove", function (event) {
    if (!dragging || event.pointerId !== dragging.id) return;
    var dx = event.clientX - dragging.startX;
    var dy = event.clientY - dragging.startY;
    if (!dragging.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
    dragging.moved = true;
    atBottom = false;
    root.setAttribute("data-dragging", "");
    x = dragging.x + dx;
    y = dragging.y + dy;
    clampPosition();
  });
  function endDrag(event) {
    if (!dragging || event.pointerId !== dragging.id) return;
    ignoreClick = dragging.moved && event.type === "pointerup";
    dragging = null;
    root.removeAttribute("data-dragging");
    if (cat.hasPointerCapture(event.pointerId)) cat.releasePointerCapture(event.pointerId);
  }
  cat.addEventListener("pointerup", endDrag);
  cat.addEventListener("pointercancel", endDrag);
  cat.addEventListener("lostpointercapture", endDrag);
  window.addEventListener("resize", clampPosition);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", clampPosition);
    window.visualViewport.addEventListener("scroll", clampPosition);
  }
  document.addEventListener("visibilitychange", refreshMotion);
  reducedMotion.addEventListener("change", refreshMotion);
  compact.addEventListener("change", clampPosition);

  var image = new Image();
  image.onload = function () {
    loaded = true;
    sprite.style.backgroundImage = 'url("' + image.src + '")';
    sprite.style.backgroundSize = (frameCount * 100) + "% 100%";
    toggle.hidden = false;
    root.hidden = !visible;
    clampPosition();
    phaseUntil = performance.now() + 2200;
    refreshMotion();
  };
  // If the optional art fails, leave the website itself completely unaffected.
  image.src = root.dataset.spriteUrl;
}());
