/**
 * Gives the path of a request's `url` without its query string, which can
 * carry a secret, such as the token of an Account deletion link that a
 * browser opens outside the app.
 */
export function getUrlPath(url: string) {
  return url.split("?", 1)[0] ?? url;
}
