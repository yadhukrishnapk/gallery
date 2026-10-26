// Makes the reel's card thumbnails: a small WebP in public/thumbs for every photo in public/.
// Runs before `npm run dev` and `npm run build`, and only redoes photos that are new or changed.
// It never stops the site from starting: if a thumbnail can't be made, that card uses the full photo.
import { mkdir, readdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { THUMB_DIR, THUMB_SIZE, thumbnailFor } from '../src/lib/thumbnails.js'

const publicDir = path.resolve(import.meta.dirname, '../public')
const thumbDir = path.join(publicDir, THUMB_DIR)

let sharp
try {
  sharp = (await import('sharp')).default
} catch (err) {
  console.warn(`thumbnails: skipped, sharp isn't available (${err.message}). Cards will use the full photos.`)
  process.exit(0)
}

const kept = new Set()
let made = 0
let failed = 0

for (const file of await readdir(publicDir, { recursive: true })) {
  const url = '/' + file.split(path.sep).join('/')
  const thumb = thumbnailFor(url)
  if (!thumb || url.startsWith(`/${THUMB_DIR}/`)) continue

  const source = path.join(publicDir, file)
  const target = path.join(publicDir, thumb)
  kept.add(target)
  if (await isNewer(target, source)) continue

  try {
    await mkdir(path.dirname(target), { recursive: true })
    await sharp(source)
      .rotate() // apply the photo's EXIF orientation, which the thumbnail doesn't keep
      .resize({ ...THUMB_SIZE, fit: 'outside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(target)
    made++
  } catch (err) {
    failed++
    console.warn(`thumbnails: couldn't make one for ${url} (${err.message})`)
  }
}

// Drop thumbnails whose photo has been deleted or renamed.
let removed = 0
for (const file of await readdir(thumbDir, { recursive: true }).catch(() => [])) {
  const thumbPath = path.join(thumbDir, file)
  if (thumbPath.endsWith('.webp') && !kept.has(thumbPath)) {
    await rm(thumbPath)
    removed++
  }
}

const upToDate = kept.size - made - failed
console.log(`thumbnails: ${made} made, ${upToDate} up to date${removed ? `, ${removed} removed` : ''}`)

async function isNewer(target, source) {
  try {
    return (await stat(target)).mtimeMs >= (await stat(source)).mtimeMs
  } catch {
    return false
  }
}
