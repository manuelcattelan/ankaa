import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Crypto } from "#/shared/services/crypto.ts";

const FAKE_UUID_NODE_LENGTH = 12;

/**
 * Creates ids and random UUIDs that count up from 1, each kind on its own, so
 * a test knows every id that the app creates.
 */
export const fakeCryptoLayer = Layer.sync(Crypto, () => {
  let idCount = 0;
  let randomUuidCount = 0;

  function createId() {
    return Effect.sync(() => {
      idCount += 1;

      return `00000000-0000-7000-8000-${formatFakeUuidNode(idCount)}`;
    });
  }

  function createRandomUuid() {
    return Effect.sync(() => {
      randomUuidCount += 1;

      return `00000000-0000-4000-8000-${formatFakeUuidNode(randomUuidCount)}`;
    });
  }

  function createSha256Digest(text: string) {
    return Effect.succeed(`sha256:${text}`);
  }

  return Crypto.of({ createId, createRandomUuid, createSha256Digest });
});

function formatFakeUuidNode(uuidCount: number) {
  return uuidCount.toString().padStart(FAKE_UUID_NODE_LENGTH, "0");
}
