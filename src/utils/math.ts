export function round(number, decimalPlacesToKeep) {
  return Math.round(number * Math.pow(10, decimalPlacesToKeep)) / Math.pow(10, decimalPlacesToKeep)
}