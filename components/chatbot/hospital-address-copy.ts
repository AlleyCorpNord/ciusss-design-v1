import type { ChatLocale } from "./chatbot-copy"

/** Single assistant message: three paragraphs (blank lines between) with **bold** and one markdown link on the source line. */
const fr = `L'adresse de l'**Hôpital général juif** est :

5800, chemin de la Côte-des-Neiges, Montréal (Québec)

Source : [site de l'Hôpital général juif](https://www.hgj.ca/).`

const en = `The address of the **Jewish General Hospital** is:

5800 Côte-des-Neiges Road, Montréal, Québec

Source: [Jewish General Hospital website](https://www.hgj.ca/).`

export function getHospitalAddressCopy(locale: ChatLocale): string {
  return locale === "en" ? en : fr
}
