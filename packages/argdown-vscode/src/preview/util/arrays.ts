export function equals<T>(
  one: ReadonlyArray<T>,
  other: ReadonlyArray<T>,
  itemEquals: (a: T, b: T) => boolean = (a, b) => a === b
): boolean {
  if (one.length !== other.length) {
    return false;
  }

  for (let i = 0, len = one.length; i < len; i++) {
    if (!itemEquals(one[i], other[i])) {
      return false;
    }
  }

  return true;
}
