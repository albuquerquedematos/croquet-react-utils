const defaultOpts = {
  showMethods: false,
  exclude: ['__views'],
}

export default function filterModel(model, options = {}) {
  const { showMethods, exclude } = { ...defaultOpts, ...options }

  function filterObject(obj) {
    let result = {}
    for (const [key, value] of Object.entries(obj)) {
      if (exclude.includes(key)) continue
      if (typeof value === 'function') {
        if (showMethods) result[key] = `<-- Method to publish '${key}' Event`
      } else {
        if (typeof value === 'object') {
          if (value instanceof Set) {
            result[key] = Array.from(value)
          } else {
            result[key] = filterObject(value)
          }
        } else result[key] = value
      }
    }
    return result
  }

  return filterObject(model)
}
