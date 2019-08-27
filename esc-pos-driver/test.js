let threshold = 127;
let luminance = (1 * 0.3 + 1 * 0.59 + 1 * 0.11) | 0;

let a = Number(luminance < threshold);

console.log(threshold);
console.log(luminance);
console.log(a);