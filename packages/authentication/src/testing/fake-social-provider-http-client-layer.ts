import * as Effect from "effect/Effect";
import * as HttpClient from "effect/http/HttpClient";
import * as HttpClientResponse from "effect/http/HttpClientResponse";
import * as Layer from "effect/Layer";

export type FakeSocialProviderResponses = Partial<
  Record<string, () => Response>
>;

export type SocialProviderRequest = {
  body: Record<string, string>;
  url: string;
};

const HTTP_STATUS_NOT_FOUND = 404;

/**
 * Answers the requests that the server sends to Apple and Google from
 * `responses`, keyed by URL, and records each into `receivedRequests`. A URL
 * with no response answers 404.
 */
export function fakeSocialProviderHttpClientLayer({
  receivedRequests = [],
  responses = {},
}: {
  receivedRequests?: SocialProviderRequest[];
  responses?: FakeSocialProviderResponses;
}) {
  return Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request, url) =>
      Effect.sync(() => {
        receivedRequests.push({
          body: Object.fromEntries(
            new URLSearchParams(
              request.body._tag === "Uint8Array"
                ? new TextDecoder().decode(request.body.body)
                : "",
            ),
          ),
          url: url.toString(),
        });

        const fakeSocialProviderResponse = responses[url.toString()];

        return HttpClientResponse.fromWeb(
          request,
          fakeSocialProviderResponse === undefined
            ? new Response(null, { status: HTTP_STATUS_NOT_FOUND })
            : fakeSocialProviderResponse(),
        );
      }),
    ),
  );
}
