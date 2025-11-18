// app/lib/match.js

// decide si un auto matchea con una búsqueda
export const vehicleMatchesSearch = (vehicle, search) => {
  const brandOk =
    !search.brand ||
    !vehicle.brand ||
    vehicle.brand.toLowerCase() === search.brand.toLowerCase()

  const modelOk =
    !search.model ||
    !vehicle.model ||
    vehicle.model.toLowerCase() === search.model.toLowerCase()

  const yearOk =
    (!search.year_min || !vehicle.year || vehicle.year >= search.year_min) &&
    (!search.year_max || !vehicle.year || vehicle.year <= search.year_max)

  const priceOk =
    (!search.price_min || !vehicle.price || vehicle.price >= search.price_min) &&
    (!search.price_max || !vehicle.price || vehicle.price <= search.price_max)

  return brandOk && modelOk && yearOk && priceOk
}
