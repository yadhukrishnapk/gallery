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
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.36 PM.jpeg',
    alt: 'Personal photo 1',
    title: 'Moment One',
    subtitle: 'A glimpse into my world',
    year: '2026',
    category: 'Photography',
    description: ['A personal capture that tells a story.'],
  },
  {
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.36 PM (1).jpeg',
    alt: 'Personal photo 2',
    title: 'Moment Two',
    subtitle: 'Through my lens',
    year: '2026',
    category: 'Photography',
    description: ['Another perspective, another memory.'],
  },
  {
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.36 PM (2).jpeg',
    alt: 'Personal photo 3',
    title: 'Moment Three',
    subtitle: 'Frozen in time',
    year: '2026',
    category: 'Photography',
    description: ['A frame that captures the essence of the moment.'],
  },
  {
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.37 PM.jpeg',
    alt: 'Personal photo 4',
    title: 'Moment Four',
    subtitle: 'Life in focus',
    year: '2026',
    category: 'Photography',
    description: ['Every photo has a story worth telling.'],
  },
  {
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.37 PM (1).jpeg',
    alt: 'Personal photo 5',
    title: 'Moment Five',
    subtitle: 'Beyond the frame',
    year: '2026',
    category: 'Photography',
    description: ['What lies beyond the edge of the frame.'],
  },
  {
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.38 PM.jpeg',
    alt: 'Personal photo 6',
    title: 'Moment Six',
    subtitle: 'A quiet reflection',
    year: '2026',
    category: 'Photography',
    description: ['A still moment, captured forever.'],
  },
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
