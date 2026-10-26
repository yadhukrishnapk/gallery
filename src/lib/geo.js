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
    const { city, region, country, organization_name: network } = await res.json()
    return { city, region, country, network }
  } catch {
    return {} // blocked, offline or too slow: the visit is recorded without a place
  } finally {
    clearTimeout(timer)
  }
}
