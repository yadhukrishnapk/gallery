// Your portfolio pieces. Each entry is one card on the Orbit Reel and one detail page.
//
// `src` (and every entry in `images`) can be either:
//   - a file in the /public folder, written from the site root:  '/images/my-photo.jpg'
//     (public/images/my-photo.jpg  ->  '/images/my-photo.jpg')
//   - a full image link:  'https://example.com/photo.jpg'
//
// Card fields:
//   src          – card image (also the big image on the detail page)
//   alt          – description of the image (for screen readers)
//   title        – shown under the card and as the detail page heading
//   subtitle     – smaller line under the title (optional)
//
// Detail page fields (all optional):
//   slug         – the page address: /work/<slug>. Made from the title if left out.
//   year         – e.g. '2026'
//   category     – e.g. 'Branding', 'Photography'
//   description  – list of paragraphs
//   images       – more images shown below the description
//   href         – external project link, shown as a "Visit project" button
//
// Cards are portrait (4:5) by default, so portrait images fit best.
// Add, remove or reorder entries freely — the reel repeats them to fill the wheel.

export const gallery = [
  {
    src: '/images/Screenshot from 2026-10-13 10-42-32.png',
    alt: 'Coral disc partly covered by a violet diagonal plane on a purple field',
    title: 'Solar eclipse',
    subtitle: 'A disc slipping behind a plane',
    year: '2026',
    category: 'Illustration',
    description: [
      'A study in overlap: one bright form slowly disappearing behind a cooler, heavier plane.',
      'Replace this text with the story behind your piece — the brief, the process, and what you learned.',
    ],
  },
  {
    src: '/images/quiet-balance.svg',
    alt: 'Tilted raspberry slab and tangerine disc on a rose field',
    title: 'Quiet balance',
    subtitle: 'Weight and counterweight',
    year: '2026',
    category: 'Illustration',
    description: ['A heavy slab held in check by a small, bright counterweight.'],
  },
  {
    src: '/images/ember-fold.svg',
    alt: 'Vermilion and orange folded plane over deep plum',
    title: 'Ember fold',
    subtitle: 'Heat creased into shadow',
    year: '2025',
    category: 'Poster',
    description: ['Warm planes folding into a dark ground, like the last light on a sheet of metal.'],
  },
  {
    src: '/images/golden-loop.svg',
    alt: 'Tilted amber loop on a raspberry-purple field',
    title: 'Golden loop',
    subtitle: 'A ring that never closes',
    year: '2025',
    category: 'Identity',
    description: ['An exploration for a looping brand mark that reads as both a ring and a path.'],
  },
  {
    src: '/images/stairwell.svg',
    alt: 'Interlocking violet and pink stepped planes with an amber edge',
    title: 'Stairwell',
    subtitle: 'Three steps toward light',
    year: '2025',
    category: 'Illustration',
    description: ['Three steps, one bright edge — a quiet piece about progress.'],
  },
  {
    src: '/images/crossing-ribbons.svg',
    alt: 'Intersecting pink and plum diagonal ribbons on a coral-magenta field',
    title: 'Crossing ribbons',
    subtitle: 'Two paths, one field',
    year: '2024',
    category: 'Pattern',
    description: ['Two diagonals meeting in the middle of a warm field.'],
  },
  {
    src: '/images/orchid-orbit.svg',
    alt: 'Fuchsia ring and peach crescent on an orchid-purple field',
    title: 'Orchid orbit',
    subtitle: 'A moon tracing its path',
    year: '2024',
    category: 'Illustration',
    description: ['A small moon riding the edge of a glowing ring.'],
  },
  {
    src: '/images/tidal-wave.svg',
    alt: 'Broad fuchsia S-shaped band with a coral gradient across deep plum',
    title: 'Tidal wave',
    subtitle: 'Momentum held in a curve',
    year: '2024',
    category: 'Motion',
    description: ['One broad curve carrying all the energy of the frame.'],
  },
  {
    src: '/images/dusk-dunes.svg',
    alt: 'Layered magenta and orange hills under a violet sky',
    title: 'Dusk dunes',
    subtitle: 'Layers settling at nightfall',
    year: '2023',
    category: 'Landscape',
    description: ['Layered hills cooling down as the sun sets behind them.'],
  },
  // Example with an image link, extra images and a project link:
  // {
  //   src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000',
  //   alt: 'Mountain road at sunset',
  //   title: 'Open road',
  //   subtitle: 'Somewhere west',
  //   year: '2026',
  //   category: 'Photography',
  //   description: ['First paragraph.', 'Second paragraph.'],
  //   images: ['/images/road-2.jpg', '/images/road-3.jpg'],
  //   href: 'https://example.com/project',
  // },
]

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-')

// Gallery entries with a guaranteed unique `slug`, used by the reel and the detail pages.
export const projects = (() => {
  const seen = new Map()
  return gallery.map((item, index) => {
    const base = item.slug || slugify(item.title || '') || `work-${index + 1}`
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return { ...item, slug: count ? `${base}-${count + 1}` : base }
  })
})()
