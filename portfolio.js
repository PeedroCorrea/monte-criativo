// Three seamless horizontal rows: right, left, right. Native page scroll stays intact.
export function setupContactGallery(section, { diagonal = false, source = section, shuffle = false } = {}) {
  const wall = section.querySelector('.portfolio-wall');
  const originals = [...source.querySelectorAll('.portfolio-source > li')];
  // Shuffle once, before distributing the rows, so each loop stays seamless.
  if (shuffle) {
    for (let index = originals.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [originals[index], originals[other]] = [originals[other], originals[index]];
    }
  }
  const rows = [];
  let active = false;
  let resizeFrame = 0;

  function makeGroup(artworks, repeats = 1) {
    const group = document.createElement('ul');
    group.className = 'portfolio-group';
    for (let repeat = 0; repeat < repeats; repeat++) {
      artworks.forEach(original => {
        const copy = original.cloneNode(true);
        const img = copy.querySelector('img');
        img.alt = '';
        img.loading = 'eager';
        group.append(copy);
      });
    }
    return group;
  }

  const trackCount = diagonal ? 5 : 3;
  for (let rowIndex = 0; rowIndex < trackCount; rowIndex++) {
    const viewport = document.createElement('div');
    viewport.className = diagonal ? 'portfolio-column' : 'portfolio-row';
    const track = document.createElement('div');
    track.className = 'portfolio-track';
    track.dataset.direction = diagonal ? (rowIndex % 2 ? 'down' : 'up') : (rowIndex === 1 ? 'left' : 'right');
    const artworks = originals.filter((_, index) => index % trackCount === rowIndex);
    const group = makeGroup(artworks);
    track.append(group, group.cloneNode(true));
    viewport.append(track);
    wall.append(viewport);
    rows.push({ track, artworks, repeats: 1, speed: (diagonal ? [48, 52, 45, 50, 47] : [42, 38, 42])[rowIndex], phase: [.16, .43, .72, .3, .59][rowIndex] });
  }

  function fitTracks() {
    resizeFrame = 0;
    const viewportSize = diagonal ? wall.clientHeight : wall.clientWidth;
    if (!viewportSize) return;
    rows.forEach(row => {
      const group = row.track.firstElementChild;
      const unitSize = (diagonal ? group.offsetHeight : group.offsetWidth) / group.children.length;
      if (!unitSize) return;
      // Measure before the diagonal transform; cover the viewport with a full repeat.
      const repeats = Math.max(1, Math.ceil((viewportSize + unitSize) / (row.artworks.length * unitSize)));
      if (repeats !== row.repeats) {
        const replacement = makeGroup(row.artworks, repeats);
        row.track.replaceChildren(replacement, replacement.cloneNode(true));
        row.repeats = repeats;
      }
      const duration = row.artworks.length * repeats * unitSize / row.speed;
      row.track.style.setProperty('--gallery-duration', `${duration.toFixed(3)}s`);
      row.track.style.setProperty('--gallery-delay', `${(-duration * row.phase).toFixed(3)}s`);
    });
  }
  function requestFit() {
    if (!resizeFrame) resizeFrame = requestAnimationFrame(fitTracks);
  }

  section.classList.add('gallery-ready');
  if ('ResizeObserver' in window) new ResizeObserver(requestFit).observe(wall);
  else window.addEventListener('resize', requestFit, { passive: true });
  requestFit();

  function sync() {
    section.classList.toggle('gallery-running', active && !document.hidden);
  }
  document.addEventListener('visibilitychange', sync);
  return {
    setActive(value) {
      if (active === value) return;
      active = value;
      sync();
    },
  };
}
