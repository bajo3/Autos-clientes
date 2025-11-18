// app/constants/status.js

export const SEARCH_STATUS_LABELS = {
  activa: 'Activa',
  contactado: 'Contactado',
  cerrada: 'Cerrada',
  descartada: 'Descartada',
}

export const VEHICLE_STATUS_LABELS = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  vendido: 'Vendido',
  baja: 'Baja',
}

export const getSearchStatusLabel = (statusRaw) => {
  const status = statusRaw || 'activa'
  return SEARCH_STATUS_LABELS[status] || status
}

export const getVehicleStatusLabel = (statusRaw) => {
  const status = statusRaw || 'disponible'
  return VEHICLE_STATUS_LABELS[status] || status
}
