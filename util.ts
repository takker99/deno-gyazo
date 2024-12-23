/**
 * Timestamp string whose format is `YYYY-MM-DDTHH:mm:ssZ`
 */
export type Timestamp = string;

/** Represents {@linkcode fetch}
 *
 * This type can return `undefined`, which is useful for implementing `fetch` using Cache API.
 */
export type Fetch<R extends Response | undefined> = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<R>;

/** Options common to all Gyazo API */
export interface BaseOptions<R extends Response | undefined> {
  /** データの取得に使う処理
   *
   * @default fetch
   */
  fetch?: Fetch<R>;
}

/** Options for Gyazo API which requires OAuth */
export interface OAuthOptions<R extends Response | undefined>
  extends BaseOptions<R> {
  /** an access token associated with the Gyazo user account */
  accessToken: string;
}

/** Set default values for {@linkcode BaseOptions}
 *
 * @internal
 */
export const setDefaults = <
  // deno-lint-ignore no-explicit-any
  T extends BaseOptions<any> = BaseOptions<Response>,
>(
  options: T,
): Omit<T, "fetch"> & Required<Pick<T, "fetch">> => {
  const { fetch = globalThis.fetch, ...rest } = options;
  return { fetch, ...rest };
};
