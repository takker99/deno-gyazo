export type Timestamp = string;

/** networkからdataをとってくる処理
 *
 * interfaceは`fetch()`と同じ
 */
export type Fetch = (
  input: string | Request,
  init?: RequestInit,
) => Promise<Response>;

/** 全てのREST APIに共通するopitons */
export interface BaseOptions {
  /** データの取得に使う処理
   *
   * @default fetch
   */
  fetch?: Fetch;
}

/** OAuth API用options */
export interface OAuthOptions extends BaseOptions {
  /** user accountに紐付いたaccess token */
  accessToken: string;
}

/** BaseOptionsの既定値を埋める */
export const setDefaults = <T extends BaseOptions = BaseOptions>(
  options: T,
): Omit<T, "fetch"> & Required<Pick<BaseOptions, "fetch">> => {
  const { fetch = globalThis.fetch, ...rest } = options;
  return { fetch, ...rest };
};

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
