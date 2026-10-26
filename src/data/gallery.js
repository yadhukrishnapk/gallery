import { thumbnailFor } from '../lib/thumbnails'

// Your portfolio pieces. Each entry is one card on the Orbit Reel and one detail page.
//
// `src` (and every entry in `images`) can be either:
//   - a file in the /public folder, written from the site root:  '/images/my-photo.jpg'
//     (public/images/my-photo.jpg  ->  '/images/my-photo.jpg')
//   - a full image link:  'https://example.com/photo.jpg'
//
// Card fields:
//   src          – the full photo, shown on the card brought to the front and on the detail page.
//                  The other cards show a small thumbnail of it, made automatically for photos in
//                  /public (`npm run thumbnails`, which also runs before `dev` and `build`).
//   thumb        – your own small version of the photo for the cards (optional; useful for links)
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
    alt: 'Yadhu in a classy moment',
    title: 'Dressed in Silence',
    subtitle: 'Class over noise',
    year: '2026',
    category: 'Portrait',
    description: ['Some moments don\'t need words — just the right frame and a little elegance.'],
  },
  {
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.36 PM (1).jpeg',
    alt: 'Yadhu smiling with gratitude',
    title: 'Enough is Everything',
    subtitle: 'Happy with what I have',
    year: '2026',
    category: 'Candid',
    description: ['Not chasing more. Just grateful for what\'s already here.'],
  },
  {
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.36 PM (2).jpeg',
    alt: 'Yadhu exploring a destination',
    title: 'Off the Clock',
    subtitle: 'Wandering when free',
    year: '2026',
    category: 'Travel',
    description: ['Free time hits different when you let your feet pick the direction.'],
  },
  {
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.37 PM.jpeg',
    alt: 'Yadhu in a spiritual setting',
    title: 'Not Devout, Just Still',
    subtitle: 'A feeling, not a faith',
    year: '2026',
    category: 'Mood',
    description: ['You don\'t have to be religious to feel something sacred in the silence.'],
  },
  {
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.37 PM (1).jpeg',
    alt: 'Yadhu in a relaxed state',
    title: 'Nothing Pending',
    subtitle: 'Just being',
    year: '2026',
    category: 'Lifestyle',
    description: ['No deadlines, no notifications. Just calm and a slow breath.'],
  },
  {
    src: '/images/me/WhatsApp Image 2026-10-25 at 3.12.38 PM.jpeg',
    alt: 'Yadhu happy at work',
    title: 'Built, Not Balanced',
    subtitle: 'The joy of building things',
    year: '2026',
    category: 'Work',
    description: ['Work-life balance is a myth. Work-life happiness — that\'s the real flex.'],
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

// Gallery entries with a guaranteed unique `slug` and a card `thumb`, used by the reel and the detail pages.
export const projects = (() => {
  const seen = new Map()
  return gallery.map((item, index) => {
    const base = item.slug || slugify(item.title || '') || `work-${index + 1}`
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return {
      ...item,
      slug: count ? `${base}-${count + 1}` : base,
      thumb: item.thumb ?? thumbnailFor(item.src),
    }
  })
})()
