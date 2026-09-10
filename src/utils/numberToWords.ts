/**
 * Converts a numeric amount to Indian Currency format in words.
 * Example: 48816 -> "Rupees Forty-Eight Thousand Eight Hundred Sixteen Only"
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function convertTwoDigits(num: number): string {
  if (num < 20) {
    return ONES[num];
  }
  const ten = Math.floor(num / 10);
  const one = num % 10;
  return TENS[ten] + (one ? '-' + ONES[one] : '');
}

function convertThreeDigits(num: number): string {
  const hundred = Math.floor(num / 100);
  const rest = num % 100;
  let str = '';
  if (hundred) {
    str += ONES[hundred] + ' Hundred';
    if (rest) str += ' ';
  }
  if (rest) {
    str += convertTwoDigits(rest);
  }
  return str;
}

export function numberToIndianWords(amount: number | string): string {
  if (amount === undefined || amount === null) return 'Rupees Zero Only';

  let num: number;
  if (typeof amount === 'string') {
    // Strip currency symbols, commas, spaces
    const cleanStr = amount.replace(/[^0-9.-]+/g, '');
    num = parseFloat(cleanStr);
  } else {
    num = Number(amount);
  }

  if (isNaN(num) || num === 0) {
    return 'Rupees Zero Only';
  }

  const isNegative = num < 0;
  num = Math.abs(num);

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return 'Rupees Zero Only';
  }

  let words = '';

  const crore = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundredAndRest = remainder;

  if (crore > 0) {
    words += convertTwoDigits(crore) + ' Crore ';
  }

  if (lakh > 0) {
    words += convertTwoDigits(lakh) + ' Lakh ';
  }

  if (thousand > 0) {
    words += convertTwoDigits(thousand) + ' Thousand ';
  }

  if (hundredAndRest > 0) {
    words += convertThreeDigits(hundredAndRest) + ' ';
  }

  words = words.trim();

  let result = (isNegative ? 'Minus ' : '') + 'Rupees ' + words;

  if (decimalPart > 0) {
    result += ' and ' + convertTwoDigits(decimalPart) + ' Paise';
  }

  result += ' Only';

  return result;
}

export default numberToIndianWords;
