import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoCrypto from "expo-crypto";
import { v7 } from "uuid";

const UUID_RANDOM_BYTE_COUNT = 16;

export class Crypto extends Context.Service<
  Crypto,
  {
    readonly createId: () => Effect.Effect<string>;
    readonly createRandomUuid: () => Effect.Effect<string>;
    readonly createSha256Digest: (text: string) => Effect.Effect<string>;
  }
>()("@ankaa/mobile/shared/services/Crypto") {
  static readonly layer = Layer.effect(
    Crypto,
    Effect.sync(() => {
      // uuid's own random source needs crypto.getRandomValues, which React
      // Native lacks, so expo-crypto supplies the random bytes
      // (https://github.com/uuidjs/uuid#react-native--expo).
      function createId() {
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

      return Crypto.of({ createId, createRandomUuid, createSha256Digest });
    }),
  );
}
