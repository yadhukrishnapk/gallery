// Rough location from the visitor's internet address, via GeoJS (free, no account). On mobile data it is
// often the network's nearest hub rather than the visitor's own town. The address itself isn't kept.
const GEO_URL = 'https://get.geojs.io/v1/ip/geo.json'
const TIMEOUT_MS = 3000

export async function lookUpPlace() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(GEO_URL, { signal: controller.signal })
    if (!res.ok) return {}
    const geo = await res.json()
    return {
      city: geo.city,
      region: geo.region,
      country: geo.country,
      countryCode: geo.country_code,
      network: geo.organization_name,
      // The middle of the area the address belongs to, not the visitor's own spot.
      latitude: roundedCoordinate(geo.latitude),
      longitude: roundedCoordinate(geo.longitude),
      accuracyKm: Number.isFinite(geo.accuracy) ? geo.accuracy : undefined,
    }
  } catch {
    return {} // blocked, offline or too slow: the visit is recorded without a place
  } finally {
    clearTimeout(timer)
  }
}

function roundedCoordinate(value) {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : undefined
}
