export function complex(re, im) {
  return { re, im };
}

export function cAdd(a, b) {
  return {
    re: a.re + b.re,
    im: a.im + b.im,
  };
}

export function cSub(a, b) {
  return {
    re: a.re - b.re,
    im: a.im - b.im,
  };
}

export function cMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function cDiv(a, b) {
  const denom = b.re ** 2 + b.im ** 2;
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

export function cScalMul(z, x) {
  return {
    re: z.re * x,
    im: z.im * x,
  };
}

export function cScalDiv(z, x) {
  return {
    re: z.re / x,
    im: z.im / x,
  };
}

export function cAbs(z) {
  return Math.sqrt(z.re * z.re + z.im * z.im);
}
