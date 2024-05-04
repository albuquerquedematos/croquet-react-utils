export function rgba(color: string, alpha: number) {
  const rgbRaw = getRGB(color)
  const rgb = rgbRaw.replace(/[^\d,]/g, '').split(',')
  return `rgba(${rgb}, ${alpha})`
}

export function getRGB(color: string) {
  const temp = document.body.appendChild(document.createElement('f'))
  temp.style.color = color
  const rgb = window.getComputedStyle(temp).color
  document.body.removeChild(temp)
  return rgb
}