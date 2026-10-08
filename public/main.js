(() => {
  // Photo choices and franchise enquiries are served by the local/production Node backend.
  fetch('/api/photos').then(response => response.ok ? response.json() : null).then(photos => {
    if (!photos) return;
    document.querySelectorAll('[data-photo]').forEach(image => {
      const next = photos[image.dataset.photo];
      if (next && next !== image.getAttribute('src')) {
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        image.src = next;
      }
    });
  }).catch(() => {});

  const form = document.querySelector('#franchise-form');
  if (form) form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const status = document.querySelector('#form-status');
    const payload = Object.fromEntries(new FormData(form));
    payload.consent = form.elements.consent.checked;
    button.disabled = true;
    if (status) status.textContent = 'Sending your enquiry…';
    try {
      const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      form.reset();
      if (status) status.textContent = 'Thanks — your enquiry has been recorded. We’ll be in touch soon.';
    } catch (error) {
      if (status) status.textContent = error.message === 'Failed to fetch'
        ? 'Could not reach the website service. Please try again in a moment.'
        : error.message;
    } finally {
      button.disabled = false;
    }
  });

  const hero = document.querySelector('#burger-stage');
  const heroPhoto = document.querySelector('.hero-photo-wrap');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hero && heroPhoto && !reduceMotion) {
  const heroBackdrop = document.querySelector('.hero-backdrop');
  const heroOrbits = [...document.querySelectorAll('.hero-orbit')];
  let pointerX = 0;
  let pointerY = 0;
  let heroFrame = 0;

  const renderParallax = () => {
    heroFrame = 0;
    const rect = hero.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
    const scrollOffset = Math.max(-22, Math.min(22, -centerOffset * .035));
    heroPhoto.style.transform = `rotateY(${pointerX * 10}deg) rotateX(${-pointerY * 8}deg) translate3d(${pointerX * 11}px,${pointerY * 8 + scrollOffset}px,0)`;
    if (heroBackdrop) heroBackdrop.style.transform = `translate(calc(-50% - ${pointerX * 14}px), calc(-50% - ${pointerY * 12 + scrollOffset * .4}px)) rotate(${-10 - pointerX * 4}deg)`;
    if (heroOrbits[0]) heroOrbits[0].style.transform = `translate(calc(-50% + ${pointerX * 9}px), calc(-50% + ${pointerY * 7 - scrollOffset * .25}px)) rotate(${-25 + pointerX * 7}deg) scaleY(.38)`;
    if (heroOrbits[1]) heroOrbits[1].style.transform = `translate(calc(-50% - ${pointerX * 7}px), calc(-50% - ${pointerY * 6 + scrollOffset * .2}px)) rotate(${27 - pointerX * 6}deg) scaleY(.34)`;
  };

  const scheduleParallax = () => {
    if (!heroFrame) heroFrame = requestAnimationFrame(renderParallax);
  };

  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - .5;
    pointerY = (event.clientY - rect.top) / rect.height - .5;
    scheduleParallax();
  });

  hero.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
    scheduleParallax();
  });

  window.addEventListener('scroll', scheduleParallax, { passive: true });
  window.addEventListener('resize', scheduleParallax, { passive: true });
  scheduleParallax();
  }

  const section = document.querySelector('#burger-story');
  const canvas = document.querySelector('#burger-canvas');
  if (!section || !canvas) return;

  const loadBurger = () => {
    const effectsScript = document.createElement('script');
    effectsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    effectsScript.onload = () => initBurger();
    effectsScript.onerror = () => console.error('Could not load Three.js for the burger animation.');
    document.head.appendChild(effectsScript);
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      loadBurger();
    }, { rootMargin: '600px 0px' });
    observer.observe(section);
  } else {
    loadBurger();
  }

  function initBurger() {
  if (!window.THREE) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (error) {
    console.warn('WebGL is unavailable; showing the burger photo fallback.', error);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia('(max-width: 620px)').matches ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
  camera.position.set(0, .08, 8.2);
  scene.add(new THREE.HemisphereLight(0xfff5e8, 0x513126, 2.2));
  const keyLight = new THREE.DirectionalLight(0xfff4e5, 2.4);
  keyLight.position.set(4, 5, 7);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, .75);
  fillLight.position.set(-4, 1, 5);
  scene.add(fillLight);

  const burger = new THREE.Group();
  burger.rotation.set(-.08, -.18, -.025);
  scene.add(burger);
  const ingredientData = [
    { file: 'burger-bun-bottom.png', size: [3.65, 3.65], y: -1.05, exploded: -2.65, x: -.05, z: 0 },
    { file: 'burger-lettuce.png', size: [4.1, 2.3], y: -.79, exploded: -1.58, x: -.02, z: .05 },
    { file: 'burger-tomato-onion.png', size: [3.55, 2.37], y: -.52, exploded: -.42, x: .02, z: .1 },
    { file: 'burger-patty.png', size: [3.75, 2.5], y: -.13, exploded: .76, x: .04, z: .16 },
    { file: 'burger-patty.png', size: [3.7, 2.47], y: .3, exploded: 1.94, x: -.04, z: .22 },
    { file: 'burger-bun-top.png', size: [3.7, 2.47], y: .96, exploded: 3.05, x: .03, z: .28 }
  ];

  let loadedTextures = 0;
  let frame = 0;
  let progress = 0;
  let explosion = 1;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  const stage = canvas.parentElement;
  let compactStage = matchMedia('(max-width: 850px)').matches;
  const loader = new THREE.TextureLoader();
  const textureCache = new Map();
  const uniqueFiles = new Set(ingredientData.map(item => item.file));
  const layers = ingredientData.map((item, index) => {
    let texture = textureCache.get(item.file);
    if (!texture) {
      texture = loader.load(`/${item.file}`, () => {
        loadedTextures += 1;
        if (loadedTextures === uniqueFiles.size && !frame) frame = requestAnimationFrame(render);
      }, undefined, error => console.warn(`Could not load burger layer ${item.file}.`, error));
      textureCache.set(item.file, texture);
    }
    texture.encoding = THREE.sRGBEncoding;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .025, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...item.size), material);
    mesh.position.set(item.x, item.y, item.z);
    mesh.renderOrder = index + 1;
    burger.add(mesh);
    return { mesh, ...item, index };
  });

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    compactStage = matchMedia('(max-width: 850px)').matches;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();

  if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
    canvas.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - .5) * .55;
      targetY = ((event.clientY - rect.top) / rect.height - .5) * .35;
    });
    canvas.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  }

  const chapters = [...section.querySelectorAll('.burger-chapter')];
  const smooth = value => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  const updateScrollProgress = () => {
    const first = chapters[0].getBoundingClientRect().top + window.scrollY;
    const last = chapters[chapters.length - 1].getBoundingClientRect().top + window.scrollY;
    progress = Math.max(0, Math.min(1, (window.scrollY + window.innerHeight * .6 - first) / Math.max(1, last - first + window.innerHeight * .1)));
    const buildPortion = .22;
    explosion = reduceMotion ? 0 : progress < buildPortion
      ? 1 - smooth(progress / buildPortion)
      : smooth((progress - buildPortion) / (1 - buildPortion));

    let activeIndex = 0;
    if (progress >= buildPortion) activeIndex = Math.min(chapters.length - 1, 1 + Math.floor(((progress - buildPortion) / (1 - buildPortion)) * (chapters.length - 1)));
    chapters.forEach((chapter, index) => chapter.classList.toggle('is-active', index === activeIndex));
    if (!frame) frame = requestAnimationFrame(render);
  };

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress, { passive: true });
  const render = () => {
    frame = 0;
    if (loadedTextures !== uniqueFiles.size) return;
    pointerX += (targetX - pointerX) * .055;
    pointerY += (targetY - pointerY) * .055;
    const targetCameraZ = compactStage ? 6.8 + explosion * 4.7 : 8.2 + explosion * 5;
    camera.position.z += (targetCameraZ - camera.position.z) * .08;
    burger.rotation.y = -.18 + pointerX + (reduceMotion ? 0 : .025 * Math.sin(performance.now() * .00045));
    burger.rotation.x = -.08 - pointerY;
    burger.rotation.z = -.025 + pointerX * .08;
    for (const layer of layers) {
      layer.mesh.position.y = layer.y + (layer.exploded - layer.y) * explosion;
      layer.mesh.position.x = layer.x + (layer.index % 2 ? -.12 : .12) * explosion;
      layer.mesh.position.z = layer.z + layer.index * .09 * explosion;
    }
    const visible = section.getBoundingClientRect().bottom > 0 && section.getBoundingClientRect().top < window.innerHeight;
    try {
      renderer.render(scene, camera);
      if (visible) {
        stage.classList.add('three-ready');
        frame = requestAnimationFrame(render);
      } else {
        canvas.dataset.drawn = '1';
      }
    } catch (error) {
      stage.classList.remove('three-ready');
      console.warn('The layered burger could not render; showing the photo fallback.', error);
    }
  };

  updateScrollProgress();
  }
})();
