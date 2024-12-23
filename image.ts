import { type OAuthOptions, setDefaults, type Timestamp } from "./util.ts";
import type {
  ResponseOfEndpoint,
  TargetedResponse,
} from "./targeted_response.ts";
import type {
  ClientErrorStatus,
  StatusCode,
  SuccessfulStatus,
} from "@std/http/status";
import type { GyazoAPIError } from "./error.ts";

/** Image data */
export interface Image {
  /** image id */
  image_id: string;
  /** permalink url */
  permalink_url: string;
  /** image  url */
  url: string;
  /** OCR result */
  ocr?: {
    /** language of OCR text*/
    locale: string;
    /** OCR text*/
    description: string;
  } | { locale: null; description: "" };
  /** image metadata */
  metadata?: {
    /** app name which create the image */
    app: string | null;
    /** image title */
    title: string;
    /** url where the image is got */
    url: string | null;
    /** image description */
    desc: string;
    /** image title before editing
     *
     * if never, null is set
     */
    original_title: string | null;
    /** image url before editing
     *
     * if never, null is set
     */
    original_url: string | null;
  };
  /** file extension */
  type: string;
  /** thumbnail url */
  thumb_url: string;
  /** timestamp which the image is created at */
  created_at: Timestamp;
}

/** get an image
 *
 * @param imageId image id
 * @param init accessTokeなど
 */
export const getImage = <R extends Response | undefined>(
  imageId: string,
  init: OAuthOptions<R>,
): Promise<
  | ResponseOfEndpoint<
    & { 200: Image }
    & Record<ClientErrorStatus, GyazoAPIError>
    & Record<Exclude<StatusCode, SuccessfulStatus | ClientErrorStatus>, string>
  >
  | (undefined extends R ? undefined : never)
> => {
  const { accessToken, fetch } = setDefaults(init ?? {});

  const path =
    `https://api.gyazo.com/api/images/${imageId}?access_token=${accessToken}`;

  return fetch(path) as Promise<
    | ResponseOfEndpoint<
      & { 200: Image }
      & Record<ClientErrorStatus, GyazoAPIError>
      & Record<
        Exclude<StatusCode, SuccessfulStatus | ClientErrorStatus>,
        string
      >
    >
    | (undefined extends R ? undefined : never)
  >;
};

/** the options for `getImages()` */
export interface GetImagesInit<R extends Response | undefined>
  extends OAuthOptions<R> {
  /** 画像一覧のページ番号
   *
   * @default 1
   */
  page?: number;
  /** 一度に取得する画像の枚数 1 ~ 100まで
   *
   * @default 20
   */
  per?: number;
}

/** get images
 *
 * @param init accessTokeなど
 */
export const getImages = <R extends Response | undefined>(
  init: GetImagesInit<R>,
): Promise<
  | ResponseOfEndpoint<
    & { 200: Image[] }
    & Record<ClientErrorStatus, GyazoAPIError>
    & Record<Exclude<StatusCode, SuccessfulStatus | ClientErrorStatus>, string>
  >
  | (undefined extends R ? undefined : never)
> => {
  const { accessToken, fetch, page, per } = setDefaults(init ?? {});
  const params = new URLSearchParams({
    "access_token": accessToken,
    ...(per !== undefined
      ? { "per_page": `${Math.max(1, Math.min(100, Math.round(per)))}` }
      : {}),
    ...(page !== undefined ? { "page": `${page}` } : {}),
  });

  const path = `https://api.gyazo.com/api/images?${params}`;
  return fetch(path) as Promise<
    | ResponseOfEndpoint<
      & { 200: Image[] }
      & Record<ClientErrorStatus, GyazoAPIError>
      & Record<
        Exclude<StatusCode, SuccessfulStatus | ClientErrorStatus>,
        string
      >
    >
    | (undefined extends R ? undefined : never)
  >;
};

/** get total count of images */
export const getTotalCount = (
  response: TargetedResponse<200, Image[]>,
): number => parseInt(response.headers.get("X-Total-Count") ?? "0");
/** get total page count */
export const getCurrentPage = (
  response: TargetedResponse<200, Image[]>,
): number => parseInt(response.headers.get("X-Current-Page") ?? "0");
/** get total page count */
export const getPerPage = (
  response: TargetedResponse<200, Image[]>,
): number => parseInt(response.headers.get("X-Per-Page") ?? "0");
/** get total page count */
export const getUserType = (
  response: TargetedResponse<200, Image[]>,
): string => response.headers.get("X-User-Type") ?? "";

/** delete an image
 *
 * @param imageId image id
 * @param init accessTokeなど
 */
export const deleteImage = <R extends Response | undefined>(
  imageId: string,
  init: OAuthOptions<R>,
): Promise<
  | ResponseOfEndpoint<
    & { 200: Pick<Image, "image_id" | "type"> }
    & Record<ClientErrorStatus, GyazoAPIError>
    & Record<Exclude<StatusCode, SuccessfulStatus | ClientErrorStatus>, string>
  >
  | (undefined extends R ? undefined : never)
> => {
  const { accessToken, fetch } = setDefaults(init ?? {});

  const path =
    `https://api.gyazo.com/api/images/${imageId}?access_token=${accessToken}`;

  return fetch(path, { method: "DELETE" }) as Promise<
    | ResponseOfEndpoint<
      & { 200: Pick<Image, "image_id" | "type"> }
      & Record<ClientErrorStatus, GyazoAPIError>
      & Record<
        Exclude<StatusCode, SuccessfulStatus | ClientErrorStatus>,
        string
      >
    >
    | (undefined extends R ? undefined : never)
  >;
};
