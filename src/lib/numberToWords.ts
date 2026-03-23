const unidades = [
  "", "um", "dois", "três", "quatro", "cinco",
  "seis", "sete", "oito", "nove", "dez",
  "onze", "doze", "treze", "quatorze", "quinze",
  "dezesseis", "dezessete", "dezoito", "dezenove",
];

const dezenas = [
  "", "", "vinte", "trinta", "quarenta", "cinquenta",
  "sessenta", "setenta", "oitenta", "noventa",
];

const centenas = [
  "", "cem", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];

function centToWords(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";

  const c = Math.floor(n / 100);
  const resto = n % 100;

  const partes: string[] = [];

  if (c > 0) {
    partes.push(c === 1 && resto > 0 ? "cento" : centenas[c]);
  }

  if (resto > 0) {
    if (resto < 20) {
      partes.push(unidades[resto]);
    } else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      if (u > 0) {
        partes.push(`${dezenas[d]} e ${unidades[u]}`);
      } else {
        partes.push(dezenas[d]);
      }
    }
  }

  return partes.join(" e ");
}

function intToWords(n: number): string {
  if (n === 0) return "zero";

  const bilhoes = Math.floor(n / 1_000_000_000);
  const milhoes = Math.floor((n % 1_000_000_000) / 1_000_000);
  const milhares = Math.floor((n % 1_000_000) / 1_000);
  const resto = n % 1_000;

  const partes: string[] = [];

  if (bilhoes > 0) {
    const s = centToWords(bilhoes);
    partes.push(`${s} ${bilhoes === 1 ? "bilhão" : "bilhões"}`);
  }
  if (milhoes > 0) {
    const s = centToWords(milhoes);
    partes.push(`${s} ${milhoes === 1 ? "milhão" : "milhões"}`);
  }
  if (milhares > 0) {
    const s = centToWords(milhares);
    partes.push(`${s} mil`);
  }
  if (resto > 0) {
    partes.push(centToWords(resto));
  }

  return partes.join(" e ");
}

export function numberToWords(value: number): string {
  if (value < 0) return `menos ${numberToWords(-value)}`;

  const reais = Math.floor(value);
  const centavosRaw = Math.round((value - reais) * 100);

  const partes: string[] = [];

  if (reais > 0) {
    const reaisWords = intToWords(reais);
    partes.push(`${reaisWords} ${reais === 1 ? "real" : "reais"}`);
  }

  if (centavosRaw > 0) {
    const centavosWords = intToWords(centavosRaw);
    partes.push(`${centavosWords} ${centavosRaw === 1 ? "centavo" : "centavos"}`);
  }

  if (partes.length === 0) return "zero reais";

  return partes.join(" e ");
}
