import { type OAuthOptions, type Result, setDefaults } from "./util.ts";
import { checkResponse, type GyazoAPIError } from "./error.ts";

/** Gyazo account profile */
export interface Profile {
  /* email*/
  email: string;
  /* user name */
  name: string;
  /* user id */
  uid: string;
  /* user profile image */
  profile_image: string;
}

/** get user profile
 *
 * @param init accessTokeなど
 */
export const getProfile = async (
  init: OAuthOptions,
): Promise<Result<Profile, GyazoAPIError>> => {
  const { accessToken, fetch } = setDefaults(init ?? {});

  const path = `https://api.gyazo.com/api/users/me?access_token=${accessToken}`;
  const res = await fetch(path);

  const checked = await checkResponse(res);
  if (!checked.ok) return checked;
  return { ok: true, value: JSON.parse(checked.value) as Profile };
};
