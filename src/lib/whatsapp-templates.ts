/**
 * Static, multi-language WhatsApp share templates (zero AI cost).
 *
 * The luxury message is hardcoded per language so a share link is generated
 * instantly offline — no Gemini call, no 503s, no latency. If a requested
 * language is not in the list we gracefully fall back to English.
 */

export type WhatsAppTemplateLang = "en" | "ar" | "fr" | "de" | "it" | "es" | "zh";

export interface WhatsAppTemplateParams {
  clientName: string;
  tourTitle: string;
  startDate: string;
  endDate: string;
  totalTravelers: number | string;
  currency: string;
  price: string | number;
  itineraryLink: string;
  companyPhone: string;
  companyWebsite: string;
}

const TEMPLATES: Record<WhatsAppTemplateLang, (p: WhatsAppTemplateParams) => string> = {
  en: (p) =>
    `✨ *${p.tourTitle}* ✨\n\n` +
    `Dear ${p.clientName},\n\n` +
    `Your bespoke Egyptian journey is ready. Every detail has been curated for an unforgettable, luxury experience.\n\n` +
    `📅 *Travel Dates:* ${p.startDate} → ${p.endDate}\n` +
    `👥 *Travelers:* ${p.totalTravelers}\n` +
    `💰 *Price:* ${p.currency} ${p.price}\n\n` +
    `🔗 *View Your Itinerary:* ${p.itineraryLink}\n\n` +
    `👉 *Reply CONFIRM to secure your dates.*\n\n` +
    `Our concierge team is at your service at any time:\n` +
    `📞 ${p.companyPhone}\n` +
    `🌐 ${p.companyWebsite}\n\n` +
    `With warm regards,\n*Kemerya Tours* — Discover Egypt with Excellence`,

  ar: (p) =>
    `✨ *${p.tourTitle}* ✨\n\n` +
    `عزيزي ${p.clientName}،\n\n` +
    `رحلتك المصرية الفاخرة أصبحت جاهزة. كل تفصيلة صُممت بعناية لتجربة استثنائية لا تُنسى.\n\n` +
    `📅 *تواريخ الرحلة:* ${p.startDate} → ${p.endDate}\n` +
    `👥 *عدد المسافرين:* ${p.totalTravelers}\n` +
    `💰 *السعر:* ${p.currency} ${p.price}\n\n` +
    `🔗 *شاهد خط سير رحلتك:* ${p.itineraryLink}\n\n` +
    `👉 *رد بكلمة CONFIRM لتأكيد حجز مواعيدك.*\n\n` +
    `فريق الخدمة الشخصية لدينا في خدمتك في أي وقت:\n` +
    `📞 ${p.companyPhone}\n` +
    `🌐 ${p.companyWebsite}\n\n` +
    `مع خالص التقدير،\n*كيميريا تورز* — اكتشف مصر بتميّز`,

  fr: (p) =>
    `✨ *${p.tourTitle}* ✨\n\n` +
    `Cher ${p.clientName},\n\n` +
    `Votre Voyage Égyptien Sur Mesure Vous Attend. Chaque détail a été orchestré pour une expérience d'exception.\n\n` +
    `📅 *Dates du voyage :* ${p.startDate} → ${p.endDate}\n` +
    `👥 *Voyageurs :* ${p.totalTravelers}\n` +
    `💰 *Tarif :* ${p.currency} ${p.price}\n\n` +
    `🔗 *Consultez votre itinéraire :* ${p.itineraryLink}\n\n` +
    `👉 *Répondez CONFIRM pour réserver vos dates.*\n\n` +
    `Notre équipe concierge reste à votre entière disposition :\n` +
    `📞 ${p.companyPhone}\n` +
    `🌐 ${p.companyWebsite}\n\n` +
    `Bien cordialement,\n*Kemerya Tours* — Discover Egypt with Excellence`,

  de: (p) =>
    `✨ *${p.tourTitle}* ✨\n\n` +
    `Sehr geehrte/r ${p.clientName},\n\n` +
    `Ihre maßgeschneiderte Ägypten-Reise ist bereit. Jedes Detail wurde für ein unvergessliches Luxuserlebnis kuratiert.\n\n` +
    `📅 *Reisedaten:* ${p.startDate} → ${p.endDate}\n` +
    `👥 *Reisende:* ${p.totalTravelers}\n` +
    `💰 *Preis:* ${p.currency} ${p.price}\n\n` +
    `🔗 *Ihr Reiseverlauf:* ${p.itineraryLink}\n\n` +
    `👉 *Antworten Sie mit CONFIRM, um Ihre Termine zu sichern.*\n\n` +
    `Unser Concierge-Team ist jederzeit für Sie da:\n` +
    `📞 ${p.companyPhone}\n` +
    `🌐 ${p.companyWebsite}\n\n` +
    `Mit herzlichen Grüßen,\n*Kemerya Tours* — Discover Egypt with Excellence`,

  it: (p) =>
    `✨ *${p.tourTitle}* ✨\n\n` +
    `Caro/a ${p.clientName},\n\n` +
    `Il Tuo Viaggio Egiziano Su Misura Ti Aspetta. Ogni dettaglio è stato curato per un'esperienza di lusso indimenticabile.\n\n` +
    `📅 *Date del viaggio:* ${p.startDate} → ${p.endDate}\n` +
    `👥 *Viaggiatori:* ${p.totalTravelers}\n` +
    `💰 *Prezzo:* ${p.currency} ${p.price}\n\n` +
    `🔗 *Il tuo itinerario:* ${p.itineraryLink}\n\n` +
    `👉 *Rispondi CONFERMA per bloccare le tue date.*\n\n` +
    `Il nostro team di concierge è a tua completa disposizione:\n` +
    `📞 ${p.companyPhone}\n` +
    `🌐 ${p.companyWebsite}\n\n` +
    `Cordiali saluti,\n*Kemerya Tours* — Discover Egypt with Excellence`,

  es: (p) =>
    `✨ *${p.tourTitle}* ✨\n\n` +
    `Estimado/a ${p.clientName},\n\n` +
    `Su Viaje Egipcio a Medida Le Espera. Cada detalle ha sido cuidadosamente diseñado para una experiencia de lujo inolvidable.\n\n` +
    `📅 *Fechas del viaje:* ${p.startDate} → ${p.endDate}\n` +
    `👥 *Viajeros:* ${p.totalTravelers}\n` +
    `💰 *Precio:* ${p.currency} ${p.price}\n\n` +
    `🔗 *Consulte su itinerario:* ${p.itineraryLink}\n\n` +
    `👉 *Responda CONFIRMAR para asegurar sus fechas.*\n\n` +
    `Nuestro equipo de conserjería está a su entera disposición:\n` +
    `📞 ${p.companyPhone}\n` +
    `🌐 ${p.companyWebsite}\n\n` +
    `Atentamente,\n*Kemerya Tours* — Discover Egypt with Excellence`,

  zh: (p) =>
    `✨ *${p.tourTitle}* ✨\n\n` +
    `尊敬的 ${p.clientName}：\n\n` +
    `您的埃及尊享定制之旅已经准备就绪。每一个细节都经过精心安排，为您呈现难忘的奢华体验。\n\n` +
    `📅 *旅行日期：* ${p.startDate} → ${p.endDate}\n` +
    `👥 *旅行人数：* ${p.totalTravelers}\n` +
    `💰 *价格：* ${p.currency} ${p.price}\n\n` +
    `🔗 *查看您的行程：* ${p.itineraryLink}\n\n` +
    `👉 *回复 CONFIRM 以确认并锁定您的日期。*\n\n` +
    `我们的专属礼宾团队随时为您服务：\n` +
    `📞 ${p.companyPhone}\n` +
    `🌐 ${p.companyWebsite}\n\n` +
    `谨致问候，\n*Kemerya Tours* — Discover Egypt with Excellence`,
};

/**
 * Build the luxury WhatsApp share message for the given language.
 * Falls back to English for any unsupported language code.
 */
export function getWhatsAppMessage(lang: string, params: WhatsAppTemplateParams): string {
  const key = (Object.keys(TEMPLATES) as WhatsAppTemplateLang[]).includes(lang as WhatsAppTemplateLang)
    ? (lang as WhatsAppTemplateLang)
    : "en";
  return TEMPLATES[key](params);
}

/** Build a ready-to-open wa.me URL (with or without a recipient phone). */
export function buildWhatsAppUrl(message: string, phone?: string): string {
  const digits = (phone || "").replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  return digits.length >= 10 ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}