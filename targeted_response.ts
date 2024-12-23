import type { StatusCode, SuccessfulStatus } from "@std/http/status";
import type { JsonCompatible } from "./json_compatible.ts";

export type { StatusCode, SuccessfulStatus };

/**
 * Maps a record of status codes and response body types to a union of {@linkcode TargetedResponse}.
 *
 * ```
 * import type { AssertTrue, IsExact } from "@std/testing/types";
 *
 * type MappedResponse = MapTargetedResponse<{
 *   200: { success: true },
 *   404: { error: "Not Found" },
 *   500: string,
 * }>;
 * type _ = AssertTrue<IsExact<MappedResponse, TargetedResponse<200, { success: true }> | TargetedResponse<404, { error: "Not Found" }> | TargetedResponse<500, string>>>;
 * ```
 */
export type ResponseOfEndpoint<
  ResponseBodyMap extends Record<number, unknown> = Record<StatusCode, string>,
> = {
  [Status in keyof ResponseBodyMap]: Status extends number
    ? ResponseBodyMap[Status] extends
      | string
      | Exclude<
        JsonCompatible<ResponseBodyMap[Status]>,
        string | number | boolean | null
      >
      | Uint8Array
      | FormData
      | Blob ? TargetedResponse<Status, ResponseBodyMap[Status]>
    : never
    : never;
}[keyof ResponseBodyMap];

/**
 * Type-safe {@linkcode Response} object
 *
 * @typeParam Status Available [HTTP status codes](https://developer.mozilla.org/docs/Web/HTTP/Status)
 * @typeParam Format response format
 * @typeParam Body response body type returned by {@linkcode TargetedResponse.text} or {@linkcode TargetedResponse.json}
 */
export interface TargetedResponse<
  Status extends number,
  Body extends
    | string
    | Exclude<JsonCompatible<Body>, string | number | boolean | null>
    | Uint8Array
    | FormData
    | Blob,
> extends globalThis.Response {
  /**
   * [HTTP status code](https://developer.mozilla.org/docs/Web/HTTP/Status)
   */
  readonly status: Status;

  /**
   * Whether the response is successful or not
   *
   * The same as {@linkcode https://developer.mozilla.org/docs/Web/API/Response/ok | Response.ok}.
   *
   * ```ts
   * import type { Assert } from "@std/testing/types";
   *
   * type _1 = Assert<TargetedResponse<200, string>["ok"], true>;
   * type _2 = Assert<TargetedResponse<201, string>["ok"], true>;
   * type _3 = Assert<TargetedResponse<226, string>["ok"], true>;
   * type _4 = Assert<TargetedResponse<101, string>["ok"], false>;
   * type _5 = Assert<TargetedResponse<301, string>["ok"], false>;
   * type _6 = Assert<TargetedResponse<301, string>["ok"], false>;
   * type _7 = Assert<TargetedResponse<404, string>["ok"], false>;
   * type _8 = Assert<TargetedResponse<1000, string>["ok"], boolean>;
   * ```
   */
  readonly ok: Status extends SuccessfulStatus ? true
    : Status extends Exclude<StatusCode, SuccessfulStatus> ? false
    : boolean;

  /**
   * The same as {@linkcode https://developer.mozilla.org/docs/Web/API/Response/text | Response.text} but with type safety
   *
   * ```ts
   * import type { AssertTrue, IsExact } from "@std/testing/types";
   *
   * type _1 = AssertTrue<IsExact<TargetedResponse<200, string>["text"], () => Promise<string>>>;
   * type _2 = AssertTrue<IsExact<TargetedResponse<200, "result">["text"], () => Promise<"result">>>;
   * type _3 = AssertTrue<IsExact<TargetedResponse<200,"state1" | "state2">["text"], () => Promise<"state1" | "state2">>>;
   * type _4 = AssertTrue<IsExact<TargetedResponse<200, Uint8Array>["text"], () => Promise<never>>>;
   * type _5 = AssertTrue<IsExact<TargetedResponse<200, FormData>["text"], () => Promise<never>>>;
   * type _6 = AssertTrue<IsExact<TargetedResponse<200, Blob>["text"], () => Promise<never>>>;
   * type _7 = AssertTrue<IsExact<TargetedResponse<200, { data: { id: string; name: string; }; }>["text"], () => Promise<string>>>;
   * type _8 = AssertTrue<IsExact<TargetedResponse<200, "message" | Uint8Array>["text"], () => Promise<never>>>;
   * type _9 = AssertTrue<IsExact<TargetedResponse<200, "message" | { data: number }>["text"], () => Promise<string>>>;
   * ```
   */
  text(): [Body] extends [string] ? Promise<Body>
    : [Body] extends [Exclude<JsonCompatible<Body>, number | boolean | null>]
      ? Promise<string>
    : Promise<never>;
  /**
   * The same as {@linkcode https://developer.mozilla.org/docs/Web/API/Response/json | Response.json} but with type safety
   *
   * ```ts
   * import type { AssertTrue, IsExact } from "@std/testing/types";
   *
   * type _1 = AssertTrue<IsExact<TargetedResponse<200, { data: { id: string; name: string; }; }>["json"], () => Promise<{ data: { id: string; name: string; }; }>>>;
   * type _4 = AssertTrue<IsExact<TargetedResponse<200, Uint8Array>["json"], () => Promise<never>>>;
   * type _5 = AssertTrue<IsExact<TargetedResponse<200, FormData>["json"], () => Promise<never>>>;
   * type _6 = AssertTrue<IsExact<TargetedResponse<200, Blob>["json"], () => Promise<never>>>;
   * type _7 = AssertTrue<IsExact<TargetedResponse<200, string>["json"], () => Promise<never>>>;
   * type _3 = AssertTrue<IsExact<TargetedResponse<200,"state1" | "state2">["json"], () => Promise<never>>>;
   * type _8 = AssertTrue<IsExact<TargetedResponse<200, "message" | Uint8Array>["json"], () => Promise<never>>>;
   * type _9 = AssertTrue<IsExact<TargetedResponse<200, "message" | { data: number }>["json"], () => Promise<never>>>;
   * ```
   */
  json(): [Body] extends
    [Exclude<JsonCompatible<Body>, string | number | boolean | null>]
    ? Promise<Body>
    : Promise<never>;

  /**
   * The same as {@linkcode https://developer.mozilla.org/docs/Web/API/Response/formData | Response.formData} but with type safety
   */
  formData(): Body extends FormData ? Promise<FormData> : Promise<never>;
}