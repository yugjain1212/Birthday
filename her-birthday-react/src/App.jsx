import { useEffect, useRef, useState } from 'react';
import './App.css';
import Grainient from './Grainient';
import LineByLineType from './LineByLineType';

// Lines for the TextType animation
const TYPE_LINES = [
  'Hey Milii 💖',
  'Happy Birthday 🎂',
  'Tumhe shayad pata bhi nahi hoga —',
  'but you have this really quiet energy',
  'that makes people feel safe around you.',
  'Chhoti si baat bhi, agar tu kare toh,',
  'somehow it stays.',
  'You deserve real happiness —',
  "the kind that doesn't need a reason.",
  'Good people. Peaceful mornings.',
  'And days that just feel right.',
  "And also… you're genuinely prettyy yaarrrrr.",
  'Bas itna hi bolna tha. ❤️',
  'Enjoy your day, Mili ✨'
];

// ── Star background ──────────────────────────────────────────────────────────
function Stars() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    for (let i = 0; i < 100; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() * 1.8 + 0.3;
      s.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${Math.random() * 100}%`,
        `top:${Math.random() * 100}%`,
        `--dur:${2.5 + Math.random() * 5}s`,
        `--delay:${Math.random() * 7}s`,
        `--max-op:${0.1 + Math.random() * 0.4}`,
      ].join(';');
      el.appendChild(s);
    }
  }, []);
  return <div id="stars" ref={ref} />;
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [showText, setShowText] = useState(false);

  /* Load legacy scripts in order, then boot the tree */
  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    const scripts = [
      `${base}jquery.min.js`,
      `${base}jscex.min.js`,
      `${base}jscex-parser.js`,
      `${base}jscex-jit.js`,
      `${base}jscex-builderbase.min.js`,
      `${base}jscex-async.min.js`,
      `${base}jscex-async-powerpack.min.js`,
      `${base}function.js`,
      `${base}love.js`,
    ];

    const loaded = [];
    let chain = Promise.resolve();
    scripts.forEach(src => {
      chain = chain.then(() =>
        new Promise(resolve => {
          const s = document.createElement('script');
          s.src = src;
          s.async = false;
          s.onload = resolve;
          s.onerror = () => { console.warn('Missing:', src); resolve(); };
          document.head.appendChild(s);
          loaded.push(s);
        })
      );
    });

    chain.then(initTree);
    return () => loaded.forEach(s => s.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Called from inside Jscex after all animation phases complete */
  function onAnimationDone() {
    setShowText(true);
  }

  function initTree() {
    const $ = window.$;
    if (!$) return;

    const canvas = $(canvasRef.current);
    if (!canvas[0]?.getContext) {
      document.getElementById('error').style.display = 'block';
      return;
    }

    const width = canvas.width() || 1100;
    const height = canvas.height() || 680;
    canvas.attr('width', width).attr('height', height);

    const opts = {
      seed: { x: width / 2 - 20, color: 'rgb(190, 26, 37)', scale: 2 },
      branch: [[535, 680, 570, 250, 500, 200, 30, 100, [
        [540, 500, 455, 417, 340, 400, 13, 100, [[450, 435, 434, 430, 394, 395, 2, 40]]],
        [550, 445, 600, 356, 680, 345, 12, 100, [[578, 400, 648, 409, 661, 426, 3, 80]]],
        [539, 281, 537, 248, 534, 217, 3, 40],
        [546, 397, 413, 247, 328, 244, 9, 80, [
          [427, 286, 383, 253, 371, 205, 2, 40],
          [498, 345, 435, 315, 395, 330, 4, 60],
        ]],
        [546, 357, 608, 252, 678, 221, 6, 100, [[590, 293, 646, 277, 648, 271, 2, 80]]],
      ]]],
      bloom: { num: 700, width: 1080, height: 650 },
      footer: { width: 1200, height: 5, speed: 14 },
    };

    const Jscex = window.Jscex;
    const tree = new window.Tree(canvas[0], width, height, opts);
    const seed = tree.seed;
    const foot = tree.footer;
    let hold = 1;

    // ── Transform-aware coordinate mapping ──────────────
    // CSS scale() changes visual size but not layout box.
    // getBoundingClientRect() returns the VISUAL rect, so we
    // can map screen coordinates → canvas coordinates correctly.
    function toCanvasCoords(clientX, clientY) {
      const rect = canvas[0].getBoundingClientRect();
      const x = (clientX - rect.left) * (width / rect.width);
      const y = (clientY - rect.top) * (height / rect.height);
      return { x, y };
    }

    function handleInteract(clientX, clientY) {
      const { x, y } = toCanvasCoords(clientX, clientY);
      if (seed.hover(x, y)) {
        hold = 0;
        canvas.off('click touchstart').off('mousemove').removeClass('hand');
        setRevealed(true);
        setShowArrow(true);
        document.body.classList.add('unlocked');
        setTimeout(() => setFadeIn(true), 80);
      }
    }

    // Mouse click (desktop)
    canvas.on('click', function (e) {
      handleInteract(e.clientX, e.clientY);
    });

    // Touch tap (mobile) — fires before click, prevents 300ms delay
    canvas.on('touchstart', function (e) {
      e.preventDefault();
      const t = e.originalEvent.touches[0];
      handleInteract(t.clientX, t.clientY);
    });

    // Hover cursor (desktop only)
    canvas.on('mousemove', function (e) {
      const { x, y } = toCanvasCoords(e.clientX, e.clientY);
      canvas.toggleClass('hand', seed.hover(x, y));
    });

    const seedAnimate = eval(Jscex.compile('async', function () {
      seed.draw();
      while (hold) { $await(Jscex.Async.sleep(16)); }
      while (seed.canScale()) {
        seed.scale(0.92); seed.scale(0.92); seed.scale(0.92);
        $await(Jscex.Async.sleep(16));
      }
      while (seed.canMove()) {
        seed.move(0, 5); foot.draw();
        $await(Jscex.Async.sleep(16));
      }
    }));

    const growAnimate = eval(Jscex.compile('async', function () {
      do {
        tree.grow(); tree.grow(); tree.grow(); tree.grow();
        $await(Jscex.Async.sleep(16));
      } while (tree.canGrow());
    }));

    const flowAnimate = eval(Jscex.compile('async', function () {
      do {
        tree.flower(16);
        $await(Jscex.Async.sleep(16));
      } while (tree.canFlower());
    }));

    // ── Smooth slide using requestAnimationFrame + easing ──
    function smoothSlide() {
      return new Promise(function (resolve) {
        tree.snapshot('p1', 240, 0, 610, 680);
        var rec = tree.record['p1'];
        var startX = rec.point.x;
        var targetX = 500;
        var startTime = null;
        var duration = 900; // ms

        function easeOutCubic(t) {
          return 1 - Math.pow(1 - t, 3);
        }

        function frame(ts) {
          if (!startTime) startTime = ts;
          var elapsed = ts - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var easedProgress = easeOutCubic(progress);
          var currentX = startX + (targetX - startX) * easedProgress;

          var ctx = tree.ctx;
          ctx.save();
          ctx.clearRect(rec.point.x, rec.point.y, rec.width, rec.height);
          ctx.putImageData(rec.image, currentX, rec.point.y);
          ctx.restore();
          rec.point = new window.Point(currentX, rec.point.y);
          foot.draw();

          if (progress < 1) {
            requestAnimationFrame(frame);
          } else {
            tree.snapshot('p2', 500, 0, 610, 680);
            canvas[0].parentNode.style.background = 'url(' + tree.toDataURL('image/png') + ')';
            canvas.css('background', 'transparent');
            resolve();
          }
        }
        requestAnimationFrame(frame);
      });
    }

    var smoothSlideFn = smoothSlide;

    // Capture for eval scope
    const triggerText = onAnimationDone;

    const runAsync = eval(Jscex.compile('async', function () {
      $await(seedAnimate());
      $await(growAnimate());
      $await(flowAnimate());
      // Use smooth rAF slide instead of laggy Jscex move loop
      smoothSlideFn().then(function () { triggerText(); });
    }));

    runAsync().start();
  }

  return (
    <>
      <Stars />

      {/* ── HERO ───────────────────────────────────────── */}
      <section id="hero">

        {/* Layer 0 — Grainient WebGL gradient background */}
        <Grainient
          color1="#000000"
          color2="#7c2d8e"
          color3="#000000"
          timeSpeed={0.35}
          colorBalance={0.12}
          warpStrength={1.6}
          warpFrequency={4.5}
          warpSpeed={0.18}
          warpAmplitude={65}
          blendAngle={55}
          blendSoftness={0.08}
          rotationAmount={280}
          noiseScale={1.2}
          grainAmount={0.06}
          grainScale={2.5}
          grainAnimated={false}
          contrast={1.35}
          gamma={1.5}
          saturation={1.1}
          centerX={0.05}
          centerY={0.05}
          zoom={0.75}
        />

        {/* Layer 1 — dark radial vignette */}
        <div className="hero-vignette" />

        {/* Error fallback */}
        <div id="error">
          Please use{' '}
          <a href="https://www.google.com/chrome/">Chrome</a> or{' '}
          <a href="https://firefox.com">Firefox</a>.
        </div>

        {/* Layer 2 — canvas + text */}
        <div id="wrap">

          {/* Line-by-line typewriter — appears after tree animation */}
          <div id="text">
            {showText && (
              <LineByLineType
                lines={TYPE_LINES}
                typingSpeed={50}
                pauseBetweenLines={500}
                cursorChar="_"
                className="hero-typewriter"
              />
            )}
          </div>

          {/* Clock */}
          <div id="clock-box">
            <span id="clock">— — —</span>
          </div>

          {/* Canvas */}
          <canvas ref={canvasRef} id="canvas" width="1100" height="680" />
        </div>

        {/* Seed click hint */}
        {!revealed && <p className="click-hint">click the seed to begin</p>}

        {/* Scroll cue */}
        <div className={`scroll-arrow${showArrow ? ' show' : ''}`}>
          <span>scroll</span>
          <svg viewBox="0 0 24 24" aria-hidden>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>



      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className={`birthday-footer${revealed ? ' visible' : ''}`}>
        <p>made with 💗 &nbsp;—&nbsp; happy birthday Milii</p>
      </footer>
    </>
  );
}
