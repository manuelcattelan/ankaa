import * as ExpoCrypto from "expo-crypto";
import { v7 } from "uuid";

const UUID_RANDOM_BYTE_COUNT = 16;

export function createIdentifier() {
  return v7({ random: ExpoCrypto.getRandomBytes(UUID_RANDOM_BYTE_COUNT) });
}
