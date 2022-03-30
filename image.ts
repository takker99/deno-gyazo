import { OAuthOptions, Result, setDefaults, Timestamp } from "./util.ts";
import { checkResponse, GyazoAPIError } from "./error.ts";

/** Image data */
export interface Image {
  /** image id */
  image_id: string;
  /** permalink url */
  permalink_url: string;
  /** image  url */
  url: string;
  /** OCR result */
  ocr: {
    /** language of OCR text*/
    locale: string;
    /** OCR text*/
    description: string;
  } | { locale: null; description: "" };
  /** image metadata */
  metadata: {
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
  type: "jpg";
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
export const getImage = async (
  imageId: string,
  init: OAuthOptions,
): Promise<
  Result<
    Omit<Image, "ocr" | "metadata"> & Partial<Pick<Image, "ocr" | "metadata">>,
    GyazoAPIError
  >
> => {
  const { accessToken, fetch } = setDefaults(init ?? {});

  const path =
    `https://api.gyazo.com/api/images/${imageId}?access_token=${accessToken}`;
  const res = await fetch(path);

  const checked = await checkResponse(res);
  if (!checked.ok) return checked;

  return { ok: true, value: JSON.parse(checked.value) };
};

/** the options for `getImages()` */
export interface GetImagesInit extends OAuthOptions {
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

export interface ImageList {
  /* the total number of images */
  count: number;
  /* current image page */
  page: number;
  /** image count per page */
  per: number;
  /** 詳細不明 */
  userType: string;
  images: Image[];
}

/** get images
 *
 * @param init accessTokeなど
 */
export const getImages = async (
  init: GetImagesInit,
): Promise<Result<ImageList, GyazoAPIError>> => {
  const { accessToken, fetch, page, per } = setDefaults(init ?? {});
  const params = new URLSearchParams();
  params.append("access_token", accessToken);
  if (per !== undefined) {
    params.append("per_page", `${Math.max(1, Math.min(100, Math.round(per)))}`);
  }
  if (page !== undefined) {
    params.append("page", `${page}`);
  }

  const path = `https://api.gyazo.com/api/images?${params.toString()}`;
  const res = await fetch(path);

  const checked = await checkResponse(res);
  if (!checked.ok) return checked;

  const images: Image[] = JSON.parse(checked.value);
  const count = parseInt(res.headers.get("X-Total-Count") ?? "0");
  const currentPage = parseInt(res.headers.get("X-Current-Page") ?? "0");
  const perPage = parseInt(res.headers.get("X-Per-Page") ?? "0");
  const userType = res.headers.get("X-User-Type") ?? "";

  return {
    ok: true,
    value: { images, count, page: currentPage, per: perPage, userType },
  };
};
