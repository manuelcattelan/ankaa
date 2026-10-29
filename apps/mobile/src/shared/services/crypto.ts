import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoCrypto from "expo-crypto";

export class Crypto extends Context.Service<
  Crypto,
  {
    readonly createRandomUuid: () => Effect.Effect<string>;
    readonly createSha256Digest: (text: string) => Effect.Effect<string>;
  }
>()("@ankaa/mobile/shared/services/Crypto") {
  static readonly layer = Layer.effect(
    Crypto,
    Effect.sync(() => {
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

      return Crypto.of({ createRandomUuid, createSha256Digest });
    }),
  );
}
