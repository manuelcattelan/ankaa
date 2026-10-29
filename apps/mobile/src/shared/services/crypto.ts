import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoCrypto from "expo-crypto";

const TEST_UUID_NODE_LENGTH = 12;

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

  static readonly layerTest = Layer.sync(this, () => {
    let randomUuidCount = 0;

    function createRandomUuid() {
      return Effect.sync(() => {
        randomUuidCount += 1;

        return `00000000-0000-4000-8000-${formatTestUuidNode(randomUuidCount)}`;
      });
    }

    function createSha256Digest(text: string) {
      return Effect.succeed(`sha256:${text}`);
    }

    return this.of({ createRandomUuid, createSha256Digest });
  });
}

function formatTestUuidNode(uuidCount: number) {
  return uuidCount.toString().padStart(TEST_UUID_NODE_LENGTH, "0");
}
