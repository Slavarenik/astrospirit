/** `tz-lookup` ships plain JS with no bundled/published TS types — this is
 *  the minimal ambient declaration for its one default export. */
declare module "tz-lookup" {
  function tzlookup(lat: number, lon: number): string;
  export default tzlookup;
}
