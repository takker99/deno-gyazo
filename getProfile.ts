import { type OAuthOptions, setDefaults } from "./util.ts";
import type {
  ClientErrorStatus,
  StatusCode,
  SuccessfulStatus,
} from "@std/http/status";
import type { ResponseOfEndpoint } from "./targeted_response.ts";
import type { GyazoAPIError } from "./error.ts";

/** Gyazo account profile */
export interface Profile {
  /** email */
  email: string;
  /** user name */
  name: string;
  /** user id */
  uid: string;
  /** user profile image */
  profile_image: string;
}

/** get a Gyazo user profile
 *
 * @see https://gyazo.com/api/docs/user#user
 *
 * @param init accessToken etc.
 */
export const getProfile = <R extends Response | undefined = Response>(
  init: OAuthOptions<R>,
): Promise<
  | ResponseOfEndpoint<
    & { 200: Profile }
    & Record<ClientErrorStatus, GyazoAPIError>
    & Record<Exclude<StatusCode, SuccessfulStatus | ClientErrorStatus>, string>
  >
  | (undefined extends R ? undefined : never)
> => {
  const { accessToken, fetch } = setDefaults(init ?? {});

  const path = `https://api.gyazo.com/api/users/me?access_token=${accessToken}`;

  return fetch(path) as Promise<
    | ResponseOfEndpoint<
      & {
        200: Profile;
      }
      & Record<ClientErrorStatus, GyazoAPIError>
      & Record<
        Exclude<StatusCode, SuccessfulStatus | ClientErrorStatus>,
        string
      >
    >
    | (undefined extends R ? undefined : never)
  >;
};
