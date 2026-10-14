// Images shown on the Orbit Reel cards.
//
// `src` can be either:
//   - a file in the /public folder, written from the site root:  '/images/my-photo.jpg'
//     (public/images/my-photo.jpg  ->  '/images/my-photo.jpg')
//   - a full image link:  'https://example.com/photo.jpg'
//
// Other fields:
//   alt       – description of the image (for screen readers)
//   title     – shown under the card when it is at the top (optional)
//   subtitle  – smaller line under the title (optional)
//   href      – link opened when the top card is clicked (optional)
//
// Cards are portrait (4:5) by default, so portrait images fit best.
// Add, remove or reorder entries freely — the reel repeats them to fill the wheel.

export const gallery = [
  {
    src: '/images/Screenshot from 2026-10-13 10-42-32.png',
    alt: 'Coral disc partly covered by a violet diagonal plane on a purple field',
    title: 'Solar eclipse',
    subtitle: 'A disc slipping behind a plane',
  },
  {
    src: '/images/quiet-balance.svg',
    alt: 'Tilted raspberry slab and tangerine disc on a rose field',
    title: 'Quiet balance',
    subtitle: 'Weight and counterweight',
  },
  {
    src: '/images/ember-fold.svg',
    alt: 'Vermilion and orange folded plane over deep plum',
    title: 'Ember fold',
    subtitle: 'Heat creased into shadow',
  },
  {
    src: '/images/golden-loop.svg',
    alt: 'Tilted amber loop on a raspberry-purple field',
    title: 'Golden loop',
    subtitle: 'A ring that never closes',
  },
  {
    src: '/images/stairwell.svg',
    alt: 'Interlocking violet and pink stepped planes with an amber edge',
    title: 'Stairwell',
    subtitle: 'Three steps toward light',
  },
  {
    src: '/images/crossing-ribbons.svg',
    alt: 'Intersecting pink and plum diagonal ribbons on a coral-magenta field',
    title: 'Crossing ribbons',
    subtitle: 'Two paths, one field',
  },
  {
    src: '/images/orchid-orbit.svg',
    alt: 'Fuchsia ring and peach crescent on an orchid-purple field',
    title: 'Orchid orbit',
    subtitle: 'A moon tracing its path',
  },
  {
    src: '/images/tidal-wave.svg',
    alt: 'Broad fuchsia S-shaped band with a coral gradient across deep plum',
    title: 'Tidal wave',
    subtitle: 'Momentum held in a curve',
  },
  {
    src: '/images/dusk-dunes.svg',
    alt: 'Layered magenta and orange hills under a violet sky',
    title: 'Dusk dunes',
    subtitle: 'Layers settling at nightfall',
  },
  // Example of an image link instead of a public-folder file:
  // {
  //   src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
  //   alt: 'Mountain road at sunset',
  //   title: 'Open road',
  //   subtitle: 'Somewhere west',
  //   href: 'https://example.com/project',
  // },
]
