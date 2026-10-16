import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoCrypto from "expo-crypto";
import { v7 } from "uuid";

const UUID_RANDOM_BYTE_COUNT = 16;

export class Crypto extends Context.Service<Crypto>()(
  "@ankaa/mobile/shared/services/Crypto",
  {
    make: Effect.sync(() => {
      function createIdentifier() {
        return Effect.sync(() =>
          v7({ random: ExpoCrypto.getRandomBytes(UUID_RANDOM_BYTE_COUNT) }),
        );
      }

      function createRandomUuid() {
        return Effect.sync(() => ExpoCrypto.randomUUID());
      }

      function createSha256Digest(text: string) {
        return Effect.promise(() =>
          ExpoCrypto.digestStringAsync(
            ExpoCrypto.CryptoDigestAlgorithm.SHA256,
            text,
          ),
        );
      }

      return { createIdentifier, createRandomUuid, createSha256Digest };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
