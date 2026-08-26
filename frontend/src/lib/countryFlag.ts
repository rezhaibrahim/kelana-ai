const COUNTRY_TO_ISO: Record<string, string> = {
  indonesia: "ID",
  japan: "JP",
  "south korea": "KR",
  korea: "KR",
  thailand: "TH",
  vietnam: "VN",
  singapore: "SG",
  malaysia: "MY",
  philippines: "PH",
  cambodia: "KH",
  laos: "LA",
  china: "CN",
  india: "IN",
  "united states": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  france: "FR",
  germany: "DE",
  italy: "IT",
  spain: "ES",
  portugal: "PT",
  netherlands: "NL",
  switzerland: "CH",
  austria: "AT",
  greece: "GR",
  turkey: "TR",
  egypt: "EG",
  morocco: "MA",
  "south africa": "ZA",
  australia: "AU",
  "new zealand": "NZ",
  canada: "CA",
  mexico: "MX",
  brazil: "BR",
  argentina: "AR",
  peru: "PE",
  chile: "CL",
  "united arab emirates": "AE",
  uae: "AE",
  qatar: "QA",
  maldives: "MV",
  "sri lanka": "LK",
  nepal: "NP",
};

function isoToFlagEmoji(iso: string): string {
  return iso
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export function getCountryFlag(country: string): string | null {
  const iso = COUNTRY_TO_ISO[country.trim().toLowerCase()];
  return iso ? isoToFlagEmoji(iso) : null;
}
