import type { ChatLocale, SourceLinkDef, SuggestionDef } from "./chatbot-copy"

export interface ParkingCopy {
  /** Full first assistant message (markdown **bold** supported) */
  body: string
  sourcesHeading: string
  /** Shown before the link in separate-message / inline row patterns */
  sourceIntro: string
  officialLinks: SourceLinkDef[]
  /** V4: sentence around the official link (same URL as `officialLinks[0]`). */
  v4: {
    sourcesBeforeLink: string
    sourcesAfterLink: string
  }
  followUp: string
  /** Chips shown after the parking follow-up assistant message has finished */
  followUpSuggestions: SuggestionDef[]
}

const fr: ParkingCopy = {
  body: `Voici l'information sur le stationnement à l'**Hôpital général juif** :

- Moins de 2 h : gratuit
- Entre 2 h et 3 h 59 : 6,75 $
- Entre 4 h et 24 h : 11,25 $
- Visiteurs et usagers : 51,00 $ par semaine ou 102,00 $ par mois
- Patients externes : 25,50 $ par semaine ou 51,00 $ par mois

**À noter** : les véhicules avec pneus à crampons ou à clous ne sont pas permis dans le stationnement souterrain.`,
  sourcesHeading: "Page officielle sur le stationnement du CIUSSS :",
  sourceIntro: "",
  officialLinks: [
    {
      title: "Stationnement – CIUSSS du Centre-Ouest-de-l'Île-de-Montréal",
      url: "https://www.ciussscentreouest.ca/a-propos-du-ciusss/stationnement",
    },
  ],
  v4: {
    sourcesBeforeLink: "Pour plus de détails, consultez la page officielle suivante : ",
    sourcesAfterLink: ".",
  },
  followUp:
    "Souhaitez-vous aussi connaître l'**emplacement du stationnement** ou les **tarifs d'un autre établissement du CIUSSS** ?",
  followUpSuggestions: [
    { id: "parking_emplacement", label: "Emplacement du stationnement" },
    { id: "parking_tarifs_autre", label: "Tarifs d'un autre établissement du CIUSSS" },
  ],
}

const en: ParkingCopy = {
  body: `Here is parking information for the **Jewish General Hospital**:

- Under 2 h: free
- Between 2 h and 3 h 59: $6.75
- Between 4 h and 24 h: $11.25
- Visitors and users: $51.00 per week or $102.00 per month
- Outpatients: $25.50 per week or $51.00 per month

**Note**: vehicles with studded or spiked tires are not allowed in the underground parking lot.`,
  sourcesHeading: "Official CIUSSS parking page:",
  sourceIntro: "",
  officialLinks: [
    {
      title: "Parking – CIUSSS of West-Central Montreal",
      url: "https://www.ciussscentreouest.ca/a-propos-du-ciusss/stationnement",
    },
  ],
  v4: {
    sourcesBeforeLink: "For more details, see the official page: ",
    sourcesAfterLink: ".",
  },
  followUp:
    "Would you also like to know the **parking location** or the **rates at another CIUSSS facility**?",
  followUpSuggestions: [
    { id: "parking_emplacement", label: "Parking location" },
    { id: "parking_tarifs_autre", label: "Rates at another CIUSSS facility" },
  ],
}

export function getParkingCopy(locale: ChatLocale): ParkingCopy {
  return locale === "en" ? en : fr
}
