export const floatToPreciseInt = (
  input: number | string,
  precision: number
): number => {
  const factor = Number(`1${'0'.repeat(precision)}`);

  if (typeof input == 'string') {
    input = Number.parseFloat(input);
  }

  if (Number.isInteger(input)) {
    return input;
  }

  return Number(Number(input * factor).toFixed());
};

export const preciseIntToFloat = (input: number, precision: number): number => {
  if (Number.isInteger(input)) {
    const factor = Number(`1${'0'.repeat(precision)}`);
    return Number(input) / factor;
  } else {
    return Number(input.toFixed(precision));
  }
};
