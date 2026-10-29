import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Crypto } from "#/shared/services/crypto.ts";

const FAKE_UUID_NODE_LENGTH = 12;

export const fakeCryptoLayer = Layer.sync(Crypto, () => {
  let randomUuidCount = 0;

  function createRandomUuid() {
    return Effect.sync(() => {
      randomUuidCount += 1;

      return `00000000-0000-4000-8000-${formatFakeUuidNode(randomUuidCount)}`;
    });
  }

  function createSha256Digest(text: string) {
    return Effect.succeed(`sha256:${text}`);
  }

  return Crypto.of({ createRandomUuid, createSha256Digest });
});

function formatFakeUuidNode(uuidCount: number) {
  return uuidCount.toString().padStart(FAKE_UUID_NODE_LENGTH, "0");
}
