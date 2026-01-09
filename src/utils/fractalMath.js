import { complexAdd, complexMul, complexAbs } from "./complex.js";

export function f(z, c) {
  return complexAdd(complexMul(z, z), c);
}

export function iterations(c, max_iter) {
  let z = complex(0, 0);
  for (let n = 0; n < max_iter; n++) {
    if (complexAbs(z) > 2) return n;
    z = f(z, c);
  }
  return max_iter;
}
