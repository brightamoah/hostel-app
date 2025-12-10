/**
 * Deeply compares two values for equality.
 *
 * Handles primitives, arrays, objects, RegExp, and skips React's `_owner` to avoid circular refs.
 *
 * @example
 * isDeepEqual({a: 1}, {a: 1}) // true
 * isDeepEqual([1, 2], [1, 2]) // true
 * isDeepEqual({a: 1}, {a: 2}) // false
 */
export function isDeepEqual(x: any, y: any): boolean {
  if (typeof x !== typeof y) return false;
  if (Object.is(x, y)) return true;

  if (typeof x === "object") {
    if (x === null) return y === null;
    if (y === null) return x === null;

    if (x.constructor !== y.constructor) return false;

    if (Array.isArray(x)) {
      if (x.length !== y.length) return false;
      for (let i = 0; i < x.length; ++i) {
        if (!isDeepEqual(x[i], y[i])) return false;
      }
      return true;
    }

    if (x.constructor === RegExp) return x.source === y.source && x.flags === y.flags;
    if (x.valueOf !== Object.prototype.valueOf) return x.valueOf() === y.valueOf();
    if (x.toString !== Object.prototype.toString) return x.toString() === y.toString();

    const keys = Object.keys(x);
    if (keys.length !== Object.keys(y).length) return false;

    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(y, key)) return false;
    }

    for (const key of keys) {
      // React-specific: avoid traversing React elements' _owner.
      //  _owner contains circular references
      // and is not needed when comparing the actual elements (and not their owners)
      if (key === "_owner" && x.$$typeof) continue;

      if (!isDeepEqual(x[key], y[key])) return false;
    }

    return true;
  }

  return false;
}
