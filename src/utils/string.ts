

export function camelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

export function wordify(str) {
  // some-word => Some Word
  // someWord => Some Word
  // some_word => Some Word
  // some => Some
  return str.replace(/[-_]/g, ' ').replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
}

export function getNested(obj, paths) {
  return paths.reduce((acc, path) => acc[path], obj)
}
