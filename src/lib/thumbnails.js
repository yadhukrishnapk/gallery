// Small copies of the gallery photos for the reel's cards, which are only a few dozen pixels across
// while the ring spins. `npm run thumbnails` makes them (it also runs before `dev` and `build`) and
// keeps them in public/thumbs, which mirrors the folders under public/.

// Thumbnails cover this box (the card shape) without cropping. That keeps every card sharp except the
// one brought to the front, which switches to the full photo.
export const THUMB_SIZE = { width: 480, height: 600 }
export const THUMB_DIR = 'thumbs'

const PHOTO = /\.(jpe?g|png|webp|avif)$/i

// Thumbnail address for a photo in public/: '/images/me/a.jpeg' → '/thumbs/images/me/a.jpeg.webp'.
// Links to other sites and vector images (.svg) get none and are shown as they are.
export function thumbnailFor(src) {
  const local = typeof src === 'string' && src.startsWith('/') && !src.startsWith('//')
  return local && PHOTO.test(src) ? `/${THUMB_DIR}${src}.webp` : null
}
