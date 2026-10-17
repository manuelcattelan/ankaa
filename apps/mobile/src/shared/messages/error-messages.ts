type WholeNumberOutOfRangeOptions = {
  maximum: number;
  minimum: number;
};

export const errorMessages = {
  serverUnreachable:
    "The server can't be reached: check your connection and try again.",
  unknown: "Something went wrong: try again.",
  wholeNumberBelowMinimum: (minimum: number) =>
    `This number isn't valid: enter a whole number of at least ${minimum}.`,
  wholeNumberOutOfRange: ({ maximum, minimum }: WholeNumberOutOfRangeOptions) =>
    `This number isn't valid: enter a whole number from ${minimum} to ${maximum}.`,
};
