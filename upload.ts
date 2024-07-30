import {
  type OAuthOptions,
  type Result,
  setDefaults,
  type Timestamp,
} from "./util.ts";
import { checkResponse, type GyazoAPIError } from "./error.ts";

/** metadata and access tokens */
export interface UploadInit extends OAuthOptions {
  /** the image title
   *
   * Gyazoの"From xxx"欄に表示される
   */
  title?: string;

  /** the description of the image
   *
   * Gyazoのhashtagを書き込む場所に表示される
   */
  description?: string;

  /** Unix time which the image was created at */
  created?: number;

  /** whether to make the metadata of the image public
   *
   * @default false (private)
   */
  metadataIsPublic?: boolean;

  /** collection id the image is added to */
  collectionId?: string;

  /** URL related to the image */
  refererURL?: string | URL;

  /** App name which create the image */
  app?: string;
}

/** the result of `upload()`
 *
 * this includes URLs of the uploaded image
 */
export interface UploadResult {
  /** image id */
  image_id: string;

  /** permalink url */
  permalink_url: string;

  /** image  url */
  url: string;

  /** file extension */
  type: "png" | "jpg";

  /** thumbnail url */
  thumb_url: string;

  /** timestamp which the image is created at */
  created_at: Timestamp;
}

/** Gyazoへ画像をuploadする
 *
 * For more informaion, see https://gyazo.com/api/docs/image#upload
 *
 * @param image uploadする画像データ
 * @param init tokenとmetadata
 */
export const upload = async (
  image: Blob,
  init: UploadInit,
): Promise<Result<UploadResult, GyazoAPIError>> => {
  const {
    title,
    description,
    metadataIsPublic,
    collectionId,
    refererURL,
    accessToken,
    created,
    app,
    fetch,
  } = setDefaults(init);

  const formData = new FormData();
  formData.append("imagedata", image);
  formData.append("access_token", accessToken);
  if (refererURL) formData.append("referer_url", refererURL.toString());
  if (app !== undefined) formData.append("app", app);
  if (title !== undefined) formData.append("title", title);
  if (description != undefined) formData.append("desc", description);
  if (collectionId) formData.append("collection_id", collectionId);
  if (metadataIsPublic) formData.append("metadata_is_public", "true");
  if (created !== undefined) formData.append("created_at", `${created}`);

  const res = await fetch(
    "https://upload.gyazo.com/api/upload",
    {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      body: formData,
    },
  );

  const checked = await checkResponse(res);
  if (!checked.ok) return checked;
  return { ok: true, value: JSON.parse(checked.value) };
};
