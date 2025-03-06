const hitungBebanKva = (rTotal, sTotal, tTotal) => {
  return ((rTotal + sTotal + tTotal) * 231).toFixed(2);
};

const hitungPersen = (bebanKva, kva) => {
  return ((bebanKva / kva) * 100).toFixed(2);
};

const hitungUBL = (rTotal, sTotal, tTotal) => {
  const maxArus = Math.max(rTotal, sTotal, tTotal);
  const minArus = Math.min(rTotal, sTotal, tTotal);
  return (((maxArus - minArus) / maxArus) * 100).toFixed(2);
};

export { hitungBebanKva, hitungPersen, hitungUBL };
