export function buildWhatsAppURL(
  orgWhatsappNumber: string,
  animalName: string,
  animalSlug: string,
  orgName: string,
  language: 'en' | 'ne' = 'ne'
): string {
  const messages = {
    ne: `Namaste! म ${animalName} (${orgName}) लाई adopt गर्न चाहन्छु। मैले Milaap मा देखेँ। milaap.dpdns.org/p/${animalSlug}`,
    en: `Namaste! I am interested in adopting ${animalName} from ${orgName}. I found them on Milaap. milaap.dpdns.org/p/${animalSlug}`,
  }
  const text = encodeURIComponent(messages[language])
  return `https://wa.me/977${orgWhatsappNumber}?text=${text}`
}
