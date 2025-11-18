// app/lib/normalize.js
export const normalizeText = (str) => {
  if (!str) return ''
  return str.trim().toLowerCase()
}

export const normalizeNullable = (str) => {
  if (!str) return null
  const cleaned = str.trim().toLowerCase()
  return cleaned.length ? cleaned : null
}
