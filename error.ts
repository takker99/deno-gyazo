import { isObject, type Result } from "./util.ts";

export class UnexpectedResponseError extends Error {
  name = "UnexpectedResponseError";
  status: number;
  statusText: string;
  body: string;
  path: URL;

  constructor(
    init: { status: number; statusText: string; body: string; path: URL },
  ) {
    super(
      `${init.status} ${init.statusText} when fetching ${init.path.toString()}`,
    );

    this.status = init.status;
    this.statusText = init.statusText;
    this.body = init.body;
    this.path = init.path;

    // @ts-ignore only available on V8
    if (Error.captureStackTrace) {
      // @ts-ignore only available on V8
      Error.captureStackTrace(this, UnexpectedResponseError);
    }
  }
}

export const isUnexpectedResponseError = (
  e: unknown,
): e is UnexpectedResponseError =>
  (e instanceof Error) && e.name === "UnexpectedResponseError";

/** 400のときのerror object */
export interface BadRequestError {
  name: "BadRequestError";
  message: string;
}
/** 401のときのerror object */
export interface UnauthorizedError {
  name: "UnauthorizedError";
  message: string;
}
/** 403のときのerror object */
export interface NotPrivilegeError {
  name: "NotPrivilegeError";
  message: string;
}
/** 404のときのerror object */
export interface NotFoundError {
  name: "NotFoundError";
  message: string;
}
/** 422のときのerror object */
export interface InvalidParameterError {
  name: "InvalidParameterError";
  message: string;
}
/** 429のときのerror object */
export interface RateLimitError {
  name: "RateLimitError";
  message: string;
}
export type GyazoAPIError =
  | BadRequestError
  | UnauthorizedError
  | NotPrivilegeError
  | NotFoundError
  | InvalidParameterError
  | RateLimitError;

/** responseが正常かどうかを確かめる
 *
 * @param response 確かめたいResponse
 * @return 変換できたらそのobjectを返す
 * @throws {UnexpectedResponseError}
 */
export const checkResponse = async (
  response: Response,
): Promise<
  Result<
    string,
    GyazoAPIError
  >
> => {
  const text = await response.text();
  if (response.ok) return { ok: true, value: text };

  if (response.status === 400) {
    return {
      ok: false,
      value: { name: "BadRequestError", message: text },
    };
  }

  try {
    const json: unknown = JSON.parse(text);
    if (!isObject(json) || typeof json.message !== "string") {
      throw new UnexpectedResponseError({
        status: response.status,
        statusText: response.statusText,
        body: text,
        path: new URL(response.url),
      });
    }

    switch (response.status) {
      case 401:
        return {
          ok: false,
          value: { name: "UnauthorizedError", message: json.message },
        };
      case 403:
        return {
          ok: false,
          value: { name: "NotPrivilegeError", message: json.message },
        };
      case 404:
        return {
          ok: false,
          value: { name: "NotFoundError", message: json.message },
        };
      case 422:
        return {
          ok: false,
          value: { name: "InvalidParameterError", message: json.message },
        };
      case 429:
        return {
          ok: false,
          value: { name: "RateLimitError", message: json.message },
        };
      default:
        throw new UnexpectedResponseError({
          status: response.status,
          statusText: response.statusText,
          body: text,
          path: new URL(response.url),
        });
    }
  } catch (e2: unknown) {
    if (e2 instanceof SyntaxError) {
      throw new UnexpectedResponseError({
        status: response.status,
        statusText: response.statusText,
        body: text,
        path: new URL(response.url),
      });
    }
    // JSONのparse error以外はそのまま投げる
    throw e2;
  }
};
