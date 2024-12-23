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

/** 全てのREST APIに共通するopitons */
export interface BaseOptions<R extends Response | undefined> {
  /** データの取得に使う処理
   *
   * @default fetch
   */
  fetch?: Fetch<R>;
}

/** OAuth API用options */
export interface OAuthOptions<R extends Response | undefined>
  extends BaseOptions<R> {
  /** user accountに紐付いたaccess token */
  accessToken: string;
}

/** BaseOptionsの既定値を埋める
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
