/** Full event site unless `production` in `.env` is exactly "false". */
export function isFullSiteEnabled() {
  return process.env.production !== "false";
}
