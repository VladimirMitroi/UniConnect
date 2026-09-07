export function cleanFileName(name) {
  if (!name) return '';
  if (name.length > 37 && name.charAt(36) === '_') {
    return name.substring(37);
  }
  return name;
}
