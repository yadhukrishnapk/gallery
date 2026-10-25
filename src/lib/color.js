// True when a CSS color is light enough to need dark text on top of it. Painting it onto a
// 1px canvas resolves any CSS color syntax; an invalid color keeps the black fill and reads as dark.
export function isLightColor(color) {
  if (!color || color === 'transparent' || typeof document === 'undefined') return false
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  if (a < 30) return false
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}
