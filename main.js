(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('.managed-video')];
  const heroVideo = document.querySelector('.hero-video');
  const dialog = document.querySelector('#world-dialog');
  const dialogVideo = document.querySelector('.dialog-video');
  const watchButton = document.querySelector('#watch-world');
  const closeButton = dialog.querySelector('.dialog-close');
  const visible = new Map();
  let currentVideo = null;
  let heroIndex = 0;
  let manuallyPaused = false;

  function setSource(video) {
    if (video.dataset.loaded) return;
    video.src = video.dataset.src || video.dataset.sources.split(',')[0];
    video.dataset.loaded = 'true';
    video.load();
  }

  function pauseAll() {
    videos.forEach(video => video.pause());
    currentVideo = null;
  }

  function selectVideo() {
    if (reducedMotion.matches || document.hidden || manuallyPaused) { pauseAll(); return; }
    const eligible = videos.filter(video => (visible.get(video) || 0) >= .5 && (!dialog.open || video === dialogVideo) && (dialog.open || video !== dialogVideo));
    eligible.sort((a, b) => (visible.get(b) || 0) - (visible.get(a) || 0));
    const next = eligible[0] || null;
    if (next === currentVideo) return;
    pauseAll();
    if (next) {
      currentVideo = next;
      setSource(next);
      next.play().catch(() => { if (currentVideo === next) currentVideo = null; });
    }
  }

  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => visible.set(entry.target, entry.intersectionRatio));
    selectVideo();
  }, { threshold: [0, .25, .5, .75, 1] });
  videos.forEach(video => videoObserver.observe(video));
  document.addEventListener('visibilitychange', selectVideo);
  reducedMotion.addEventListener('change', selectVideo);
  const mediaToggle = document.querySelector('#media-toggle');
  mediaToggle.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    mediaToggle.setAttribute('aria-pressed', String(manuallyPaused));
    mediaToggle.querySelector('span').textContent = manuallyPaused ? '播放画面' : '暂停画面';
    mediaToggle.querySelector('path').setAttribute('d', manuallyPaused ? 'm8 5 11 7-11 7V5Z' : 'M8 5v14M16 5v14');
    selectVideo();
  });

  // One hero video cycles through the three supplied clips while in view.
  heroVideo.addEventListener('timeupdate', () => {
    if (heroVideo.currentTime < 6 || reducedMotion.matches) return;
    const sources = heroVideo.dataset.sources.split(',');
    heroIndex = (heroIndex + 1) % sources.length;
    heroVideo.src = sources[heroIndex];
    heroVideo.load();
    if (currentVideo === heroVideo) heroVideo.play().catch(() => {});
  });

  function closeDialog() { dialog.close(); }
  watchButton.addEventListener('click', () => {
    pauseAll();
    dialog.showModal();
    document.body.classList.add('dialog-open');
    closeButton.focus();
    // The observer supplies the final visibility check after the dialog opens.
    requestAnimationFrame(selectVideo);
  });
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    dialogVideo.pause();
    visible.set(dialogVideo, 0);
    watchButton.focus();
    selectVideo();
  });

  const strip = document.querySelector('.world-frames');
  const shots = [...strip.querySelectorAll('img')];
  const counter = document.querySelector('.world-count');
  let galleryIndex = 0;
  function goTo(index) {
    galleryIndex = (index + shots.length) % shots.length;
    strip.scrollTo({ left: shots[galleryIndex].offsetLeft - strip.offsetLeft, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    counter.textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(shots.length).padStart(2, '0')}`;
  }
  document.querySelector('#gallery-prev').addEventListener('click', () => goTo(galleryIndex - 1));
  document.querySelector('#gallery-next').addEventListener('click', () => goTo(galleryIndex + 1));
  let scrollTimer;
  strip.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      galleryIndex = Math.round(strip.scrollLeft / strip.clientWidth);
      counter.textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(shots.length).padStart(2, '0')}`;
    }, 90);
  }, { passive: true });

  function initMotion() {
    if (reducedMotion.matches) return;
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal').forEach(element => {
      gsap.from(element, { autoAlpha: 0, y: 36, duration: .85, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
    });
    gsap.to('.hero-video', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 } });
    if (window.matchMedia('(min-width: 901px)').matches) {
      const frames = document.querySelector('.world-frames');
      gsap.to(frames, { scrollLeft: () => frames.scrollWidth - frames.clientWidth, ease: 'none', scrollTrigger: { trigger: '.world-stage', start: 'top 13%', end: () => `+=${Math.round(window.innerHeight * 2.1)}`, pin: true, scrub: .6, invalidateOnRefresh: true } });
    }
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }
  initMotion();
})();
