import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoCrypto from "expo-crypto";

export class Crypto extends Context.Service<Crypto>()(
  "@ankaa/mobile/shared/services/Crypto",
  {
    make: Effect.sync(() => {
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

      return { createRandomUuid, createSha256Digest };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
