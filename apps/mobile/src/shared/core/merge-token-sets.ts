/** The Contexts of each Modifier, keyed by the Modifier. */
export type ModifierContexts = {
  appearance: "dark" | "darkHighContrast" | "light" | "lightHighContrast";
  boldText: "boldTextOff" | "boldTextOn";
  reduceMotion: "reduceMotionOff" | "reduceMotionOn";
};

/**
 * A Token family's Semantic tokens as the DTCG Resolver Module 2025.10 models
 * them: a base set, and for each Modifier of the family one set per Context
 * that holds only the tokens the Context changes
 * (https://www.designtokens.org/tr/2025.10/resolver/).
 */
export type TokenSets<Tokens> = {
  base: Tokens;
  modifiers: {
    [Modifier in keyof ModifierContexts]?: Record<
      ModifierContexts[Modifier],
      Partial<Tokens>
    >;
  };
};

const RESOLUTION_ORDER = ["appearance", "reduceMotion", "boldText"] as const;

/**
 * Merges a Token family's sets for the Context each input selects: the base
 * set, then each Modifier's Context in the Resolution order, a later set
 * replacing a token that an earlier one holds.
 *
 * It throws when a Modifier of the sets has no input, as the DTCG Resolver
 * Module requires of a Modifier with no default, unlike a Core decision, which
 * returns its Outcome: tokens resolve at module load, so a missing input is a
 * defect in the token files that must stop the app from starting, and no
 * caller could act on an Outcome.
 */
export function mergeTokenSets<Tokens extends object>({
  inputs,
  sets,
}: {
  inputs: Partial<ModifierContexts>;
  sets: TokenSets<Tokens>;
}) {
  return RESOLUTION_ORDER.reduce<Tokens>((tokens, modifier) => {
    const contextSets: Partial<Record<string, Partial<Tokens>>> | undefined =
      sets.modifiers[modifier];
    const context = inputs[modifier];

    if (contextSets === undefined) {
      return tokens;
    }

    if (context === undefined) {
      throw new Error(`The ${modifier} Modifier has no input.`);
    }

    return { ...tokens, ...contextSets[context] };
  }, sets.base);
}
