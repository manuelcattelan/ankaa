import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoCrypto from "expo-crypto";
import { v7 } from "uuid";

const TEST_UUID_NODE_LENGTH = 12;

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

  static readonly layerTest = Layer.sync(this, () => {
    let identifierCount = 0;
    let randomUuidCount = 0;

    function createIdentifier() {
      return Effect.sync(() => {
        identifierCount += 1;

        return `00000000-0000-7000-8000-${formatTestUuidNode(identifierCount)}`;
      });
    }

    function createRandomUuid() {
      return Effect.sync(() => {
        randomUuidCount += 1;

        return `00000000-0000-4000-8000-${formatTestUuidNode(randomUuidCount)}`;
      });
    }

    function createSha256Digest(text: string) {
      return Effect.succeed(`sha256:${text}`);
    }

    return this.of({ createIdentifier, createRandomUuid, createSha256Digest });
  });
}

function formatTestUuidNode(uuidCount: number) {
  return uuidCount.toString().padStart(TEST_UUID_NODE_LENGTH, "0");
}
