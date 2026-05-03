/* ============================================================
   TILE DATA + RENDERER
   Status: 'live' | 'beta' | 'date' | 'soon' | 'plus'
   For 'date' status, add `dateText: 'OCT 26'`
   ============================================================ */
const STAR_MISSIONS = [
  { slug: 'UpSkill',       name: 'UpSkill USA',          sub: 'AI workforce training',     img: 'tiles/upskill.jpg',       status: 'live' },
  { slug: 'Hello',         name: 'Hello USA',            sub: 'New-American onboarding',   img: 'tiles/hello.jpg',         status: 'soon' },
  { slug: 'Rescue',        name: 'Rescue Connect',       sub: 'Disaster relief network',   img: 'tiles/rescue.jpg',        status: 'soon' },
  { slug: 'Reef',          name: 'Reef Reimagined',      sub: 'Marine citizen science',    img: 'tiles/reef.jpg',          status: 'live' },
  { slug: 'LifeForce',     name: 'LifeForce One',        sub: 'Health · LiV IT!',          img: 'tiles/lifeforce.jpg',     status: 'soon' },
  { slug: 'Rocketship',    name: 'Rocketship for the Mind', sub: 'STEM education',         img: 'tiles/rocketship.jpg',    status: 'soon' },
  { slug: 'CARE',          name: 'CARE',                 sub: 'Disability support app',    img: 'tiles/care.jpg',          status: 'soon' },
  { slug: 'notebooklm',    name: 'NoteBookLM',           sub: 'Learn · Adapt · Innovate',  img: 'tiles/notebooklm.jpg',    status: 'live' },
  { slug: 'Imagine',       name: 'Imagine Nation',       sub: 'Civic imagination',         img: 'tiles/imaginenation.jpg', status: 'soon' },
];

const ARTS_MEDIA = [
  { slug: 'Photo',         name: 'Photography',          sub: 'A life in pictures',        img: 'tiles/photo.jpg',         status: 'live' },
  { slug: 'Music',         name: 'Original Human Music', sub: 'Albums · Dangerous Man at 65', img: 'tiles/music.jpg',     status: 'live' },
  { slug: 'Grok',          name: 'GROK Trilogy',         sub: 'Political thriller series', img: 'tiles/grok.jpg',          status: 'live' },
  { slug: 'Summer',        name: 'Year Without Summer',  sub: 'Musical · Immersive',       img: 'tiles/summer.jpg',        status: 'soon' },
  { slug: 'Abracadabra',   name: 'Abracadabra Brigade',  sub: 'I Create As I Speak',       img: 'tiles/abracadabra.jpg',   status: 'soon' },
  { slug: 'Imaginebook',   name: 'Imagine — A Book',     sub: 'Children\u2019s storybook', img: 'tiles/imaginebook.jpg',   status: 'soon' },
  { slug: 'Circus',        name: 'CircusUSA',            sub: 'The Greatest Show on Earth', img: 'tiles/circus.jpg',       status: 'soon' },
  { slug: 'Screenworks',   name: 'Screenworks',          sub: 'Film, TV · visual essays',   img: 'tiles/screenworks.jpg',   status: 'soon' },
  { slug: '_plus',         name: 'Coming Soon',          sub: 'A new project in motion',   img: null,                      status: 'plus' },
];

function bannerHTML(item) {
  switch (item.status) {
    case 'live': return `<div class="tile-banner live"><span>LIVE</span><span class="pill">●</span></div>`;
    case 'beta': return `<div class="tile-banner beta"><span>BETA TEST</span><span class="pill">TESTING</span></div>`;
    case 'date': return `<div class="tile-banner date"><span>LAUNCH</span><span class="pill">${item.dateText || 'TBA'}</span></div>`;
    case 'soon': return `<div class="tile-banner soon"><span>COMING SOON</span><span class="pill">2026</span></div>`;
    case 'plus': return `<div class="tile-banner soon"><span>COMING SOON</span><span class="pill">+</span></div>`;
    default:     return '';
  }
}

function tileHTML(item) {
  if (item.status === 'plus') {
    return `
      <a class="tile tile-plus" href="#contact" aria-label="Coming soon — pitch a new project">
        ${bannerHTML(item)}
        <div class="plus-glyph" aria-hidden="true">+</div>
        <div class="tile-foot">
          <p class="tile-name">${item.name}</p>
          <p class="tile-sub">${item.sub}</p>
        </div>
      </a>`;
  }
  return `
    <a class="tile" href="/${item.slug}/" aria-label="${item.name}">
      ${bannerHTML(item)}
      <img class="tile-img" src="${item.img}" alt="${item.name}" loading="lazy" />
      <div class="tile-foot">
        <p class="tile-name">${item.name}</p>
        <p class="tile-sub">${item.sub}</p>
      </div>
    </a>`;
}

/* iPhone-style rounded-corner icon: square art + title underneath
   Used by the home page (.icon-grid). Sub-pages still use tileHTML. */
function iconTileHTML(item) {
  if (item.status === 'plus') {
    return `
      <a class="icon-tile icon-plus" href="#contact" aria-label="Coming soon — pitch a new project">
        <div class="icon-art icon-art-plus" aria-hidden="true"><span class="plus-glyph-sm">+</span></div>
        <p class="icon-title">${item.name}</p>
        <p class="icon-sub">${item.sub}</p>
      </a>`;
  }
  const statusPill =
    item.status === 'live' ? `<span class="icon-pill live">LIVE</span>` :
    item.status === 'beta' ? `<span class="icon-pill">BETA</span>` :
    item.status === 'date' ? `<span class="icon-pill">${item.dateText || 'TBA'}</span>` :
    `<span class="icon-pill">SOON</span>`;
  return `
    <a class="icon-tile" href="/${item.slug}/" aria-label="${item.name}">
      <div class="icon-art">
        <img src="${item.img}" alt="${item.name}" loading="lazy" />
        ${statusPill}
      </div>
      <p class="icon-title">${item.name}</p>
      <p class="icon-sub">${item.sub}</p>
    </a>`;
}

function renderGrid(elId, items) {
  const el = document.getElementById(elId);
  if (!el) return;
  const useIcon = el.classList.contains('icon-grid');
  const fn = useIcon ? iconTileHTML : tileHTML;
  el.innerHTML = items.map(fn).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderGrid('star-grid', STAR_MISSIONS);
  renderGrid('arts-grid', ARTS_MEDIA);
});
