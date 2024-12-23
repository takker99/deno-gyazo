import { type OAuthOptions, setDefaults, type Timestamp } from "./util.ts";
import type { GyazoAPIError } from "./error.ts";
import type {
  ClientErrorStatus,
  StatusCode,
  SuccessfulStatus,
} from "@std/http/status";
import type { ResponseOfEndpoint } from "./targeted_response.ts";

/** metadata and access tokens */
export interface UploadInit<R extends Response | undefined>
  extends OAuthOptions<R> {
  /** the image title
   *
   * This is displayed in the "From xxx" field of Gyazo webpages.
   */
  title?: string;

  /** the description of the image
   *
   * This is displayed in the "Description" field of Gyazo webpages.
   */
  description?: string;

  /** Unix time which the image was created at */
  created?: number;

  /** whether to make the metadata of the image public
   *
   * - `true`: public
   * - `false`: private
   *
   * @default {false}
   */
  metadataIsPublic?: boolean;

  /** collection id the image is added to */
  collectionId?: string;

  /** URL related to the image */
  refererURL?: string | URL;

  /** App name which create the image */
  app?: string;
}

/**
 * the result of {@linkcode upload}
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

/** Upload an image to Gyazo
 *
 * @see https://gyazo.com/api/docs/image#upload
 *
 * @param image image data to upload
 * @param init access token and metadata
 */
export const upload = <R extends Response | undefined>(
  image: Blob,
  init: UploadInit<R>,
): Promise<
  | ResponseOfEndpoint<
    & { 200: UploadResult }
    & Record<ClientErrorStatus, GyazoAPIError>
    & Record<Exclude<StatusCode, SuccessfulStatus | ClientErrorStatus>, string>
  >
  | (undefined extends R ? undefined : never)
> => {
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

  return fetch(
    "https://upload.gyazo.com/api/upload",
    {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      body: formData,
    },
  ) as Promise<
    | ResponseOfEndpoint<
      & { 200: UploadResult }
      & Record<ClientErrorStatus, GyazoAPIError>
      & Record<
        Exclude<StatusCode, SuccessfulStatus | ClientErrorStatus>,
        string
      >
    >
    | (undefined extends R ? undefined : never)
  >;
};
