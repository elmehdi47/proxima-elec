import { z } from "zod";
import { db } from "./db";
import type { Locale } from "./i18n";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface HeroStat {
  value: string;
  label: string;
}

export interface FeatureItem {
  title: string;
  desc: string;
}

export interface CategoryItem {
  id: string;
  label: string;
}

export interface NavLinkItem {
  label: string;
  href: string;
}

/** Home-page section ids understood by the storefront renderer. */
export const SECTION_IDS = ["hero", "marquee", "features", "catalog", "contact"] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface SectionConfig {
  id: SectionId;
  /** false = the section is not rendered at all on the home page. */
  visible: boolean;
}

export interface Wilaya {
  code: string;
  name: string;
  fee: number;
}

/**
 * Optional per-language overlay for the storefront texts.
 * Any field left empty falls back to the base (English) value —
 * the admin only translates what they want.
 */
export interface SettingsTranslations {
  tagline?: string;
  hero?: {
    badge?: string;
    titleLine1?: string;
    titleLine2?: string;
    subtitle?: string;
    primaryCta?: string;
    secondaryCta?: string;
    chipTop?: string;
    chipBottom?: string;
  };
  features?: {
    kicker?: string;
    titleLine1?: string;
    titleLine2?: string;
    subtitle?: string;
    items?: FeatureItem[];
  };
  catalog?: {
    kicker?: string;
    titleLine1?: string;
    titleLine2?: string;
    subtitle?: string;
    searchPlaceholder?: string;
  };
  contact?: {
    kicker?: string;
    titleLine1?: string;
    titleLine2?: string;
    subtitle?: string;
    hoursLine?: string;
    whatsappDesc?: string;
    instagramDesc?: string;
    facebookDesc?: string;
  };
  footer?: {
    about?: string;
    note?: string;
    shopTitle?: string;
    supportTitle?: string;
    allProductsLabel?: string;
    deliveryLabel?: string;
    contactLabel?: string;
    adminLabel?: string;
  };
}

export interface SiteSettings {
  /** Storefront languages: default + optional FR/AR text overlays */
  defaultLocale: Locale;
  translations?: { fr?: SettingsTranslations; ar?: SettingsTranslations };

  /** Brand identity */
  brandName: string;
  shortName: string;
  tagline: string;
  logoUrl: string;

  /** Contact */
  phoneDisplay: string;
  whatsappIntl: string;
  instagram: string;
  instagramHandle: string;
  facebook: string;

  /** Header (top bar) */
  header: {
    /** small line under the brand name */
    subLabel: string;
    /** header WhatsApp button text */
    whatsappLabel: string;
    /** desktop + mobile navigation links */
    navLinks: NavLinkItem[];
  };

  /** Home-page layout: section order + visibility */
  sections: SectionConfig[];

  /** Floating WhatsApp button (bottom-right corner) */
  showWhatsappFab: boolean;

  /** Hero section */
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    image: string;
    imageAlt: string;
    chipTop: string;
    chipBottom: string;
    stats: HeroStat[];
  };

  /** Brand marquee strip */
  brandsMarquee: string[];

  /** Product categories */
  categories: CategoryItem[];

  /** "Why Proxima" section */
  features: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    items: FeatureItem[];
  };

  /** Catalog section heading */
  catalog: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    searchPlaceholder: string;
    /** How many products the home page grid shows (rest live on /products). */
    maxOnHome: number;
  };

  /** Contact section */
  contact: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    hoursLine: string;
    whatsappDesc: string;
    instagramDesc: string;
    facebookDesc: string;
  };

  /** Footer */
  footer: {
    about: string;
    note: string;
    shopTitle: string;
    supportTitle: string;
    allProductsLabel: string;
    deliveryLabel: string;
    contactLabel: string;
    adminLabel: string;
    showAdminLink: boolean;
  };

  /** Delivery */
  freeShippingThreshold: number;
  wilayas: Wilaya[];
}

/* ------------------------------------------------------------------ */
/* Defaults (also used as the fallback everywhere + by the seed)       */
/* ------------------------------------------------------------------ */

export const DEFAULT_WILAYAS: Wilaya[] = [
  { code: "16", name: "Alger", fee: 400 },
  { code: "09", name: "Blida", fee: 450 },
  { code: "35", name: "Boumerdès", fee: 450 },
  { code: "42", name: "Tipaza", fee: 500 },
  { code: "15", name: "Tizi Ouzou", fee: 550 },
  { code: "10", name: "Bouira", fee: 550 },
  { code: "19", name: "Sétif", fee: 600 },
  { code: "06", name: "Béjaïa", fee: 600 },
  { code: "25", name: "Constantine", fee: 600 },
  { code: "26", name: "Médéa", fee: 600 },
  { code: "31", name: "Oran", fee: 600 },
  { code: "34", name: "Bordj Bou Arréridj", fee: 600 },
  { code: "18", name: "Jijel", fee: 650 },
  { code: "21", name: "Skikda", fee: 650 },
  { code: "23", name: "Annaba", fee: 650 },
  { code: "24", name: "Guelma", fee: 650 },
  { code: "36", name: "El Tarf", fee: 750 },
  { code: "43", name: "Mila", fee: 650 },
  { code: "04", name: "Oum El Bouaghi", fee: 700 },
  { code: "05", name: "Batna", fee: 700 },
  { code: "02", name: "Chlef", fee: 700 },
  { code: "14", name: "Tiaret", fee: 700 },
  { code: "17", name: "Djelfa", fee: 750 },
  { code: "20", name: "Saïda", fee: 700 },
  { code: "22", name: "Sidi Bel Abbès", fee: 700 },
  { code: "27", name: "Mostaganem", fee: 700 },
  { code: "28", name: "M'Sila", fee: 700 },
  { code: "29", name: "Mascara", fee: 700 },
  { code: "44", name: "Aïn Defla", fee: 700 },
  { code: "48", name: "Relizane", fee: 700 },
  { code: "12", name: "Tébessa", fee: 750 },
  { code: "13", name: "Tlemcen", fee: 750 },
  { code: "38", name: "Tissemsilt", fee: 750 },
  { code: "40", name: "Khenchela", fee: 750 },
  { code: "41", name: "Souk Ahras", fee: 750 },
  { code: "46", name: "Aïn Témouchent", fee: 750 },
  { code: "07", name: "Biskra", fee: 800 },
  { code: "51", name: "Ouled Djellal", fee: 800 },
  { code: "03", name: "Laghouat", fee: 850 },
  { code: "47", name: "Ghardaïa", fee: 850 },
  { code: "58", name: "El Meniaa", fee: 850 },
  { code: "30", name: "Ouargla", fee: 900 },
  { code: "32", name: "El Bayadh", fee: 900 },
  { code: "39", name: "El Oued", fee: 900 },
  { code: "45", name: "Naâma", fee: 900 },
  { code: "55", name: "Touggourt", fee: 900 },
  { code: "57", name: "El M'Ghair", fee: 900 },
  { code: "01", name: "Adrar", fee: 1000 },
  { code: "08", name: "Béchar", fee: 1000 },
  { code: "49", name: "Timimoun", fee: 1000 },
  { code: "52", name: "Béni Abbès", fee: 1000 },
  { code: "53", name: "In Salah", fee: 1100 },
  { code: "11", name: "Tamanrasset", fee: 1200 },
  { code: "33", name: "Illizi", fee: 1200 },
  { code: "37", name: "Tindouf", fee: 1200 },
  { code: "50", name: "Bordj Badji Mokhtar", fee: 1200 },
  { code: "54", name: "In Guezzam", fee: 1200 },
  { code: "56", name: "Djanet", fee: 1200 },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  defaultLocale: "en",
  translations: {
    fr: {
      tagline: "Produits électroniques & audiovisuels",
      hero: {
        badge: "Boutique audio & électronique d'Algérie",
        titleLine1: "Un son légendaire.",
        titleLine2: "Livré à votre porte.",
        subtitle:
          "Enceintes, casques, écouteurs, téléviseurs et accessoires — 100 % authentiques, des marques que vous aimez. Commandez en ligne, payez à la livraison, partout en Algérie.",
        primaryCta: "Voir le catalogue",
        secondaryCta: "Écrivez-nous",
        chipTop: "Livraison rapide — 24/48 h",
        chipBottom: "Paiement à la livraison",
      },
      features: {
        kicker: "Pourquoi Proxima Elec",
        titleLine1: "Bâti sur la confiance.",
        titleLine2: "Livré avec soin.",
        subtitle:
          "Chaque commande compte pour nous — matériel authentique, prix justes et un support qui répond vraiment.",
        items: [
          {
            title: "100 % Authentique",
            desc: "Produits officiels issus de distributeurs agréés. Aucun clone, aucune contrefaçon — jamais.",
          },
          {
            title: "Livraison nationale",
            desc: "Paiement à la livraison dans les 100 wilayas — expédié sous 24 à 72 heures.",
          },
          {
            title: "Garantie officielle",
            desc: "Chaque produit est couvert par une garantie. En cas de problème, on le résout.",
          },
          {
            title: "Support WhatsApp",
            desc: "De vraies personnes, de vraies réponses. Écrivez-nous quand vous voulez au 0652 29 61 24.",
          },
        ],
      },
      catalog: {
        kicker: "Notre catalogue",
        titleLine1: "Du matériel qui",
        titleLine2: "fait la différence.",
        subtitle:
          "Parcourez notre sélection minutieusement choisie. Chaque article est en stock en Algérie et prêt à être expédié vers votre wilaya.",
        searchPlaceholder: "Rechercher enceinte, JBL, écouteurs...",
      },
      contact: {
        kicker: "Contactez-nous",
        titleLine1: "Nous sommes à un",
        titleLine2: "message.",
        subtitle:
          "Une question sur un produit, votre commande ou la livraison ? Écrivez-nous — nous répondons généralement en quelques minutes.",
        hoursLine: "Disponible tous les jours de 9 h à 21 h — et même plus tard par DM Instagram.",
        whatsappDesc:
          "Le moyen le plus rapide de nous joindre. Commandes, questions, disponibilités — discutez directement avec nous.",
        instagramDesc:
          "Nouveautés, réassorts et promos exclusives — abonnez-vous pour ne rien manquer.",
        facebookDesc:
          "Actualités de la communauté, avis et jeux-concours. Rejoignez notre page.",
      },
      footer: {
        about:
          "Produits électroniques & audiovisuels — enceintes, casques, écouteurs, téléviseurs et accessoires livrés dans les 100 wilayas d'Algérie, avec paiement à la livraison et garantie officielle.",
        note: "Paiement à la livraison · Expédition rapide · 100 wilayas",
        shopTitle: "Boutique",
        supportTitle: "Assistance",
        allProductsLabel: "Tous les produits",
        deliveryLabel: "Livraison & garantie",
        contactLabel: "Contactez-nous",
        adminLabel: "Panel admin",
      },
    },
    ar: {
      tagline: "منتجات إلكترونية وسمعية بصرية",
      hero: {
        badge: "متجر الصوتيات والإلكترونيات في الجزائر",
        titleLine1: "صوت أسطوري.",
        titleLine2: "يُوصل إلى باب منزلك.",
        subtitle:
          "مكبرات صوت، سماعات رأس، سماعات لاسلكية، تلفزيونات وملحقات — أصلية 100% من ماركاتك المفضلة. اطلب عبر الإنترنت، ادفع عند الاستلام، واستلم بسرعة في أي مكان في الجزائر.",
        primaryCta: "تصفح الكتالوج",
        secondaryCta: "راسلنا عبر واتساب",
        chipTop: "توصيل سريع — 24/48 ساعة",
        chipBottom: "الدفع عند الاستلام",
      },
      features: {
        kicker: "لماذا Proxima Elec",
        titleLine1: "نبني على الثقة.",
        titleLine2: "ونوصل بعناية.",
        subtitle:
          "نعامل كل طلب كأنه طلبنا الخاص — منتجات أصلية، أسعار عادلة، ودعم يرد فعلاً.",
        items: [
          {
            title: "أصلي 100%",
            desc: "منتجات رسمية من موزعين معتمدين. لا تقليد ولا مغشور — أبداً.",
          },
          {
            title: "توصيل لكل الولايات",
            desc: "الدفع عند الاستلام عبر 100 ولاية — يُشحن خلال 24–72 ساعة.",
          },
          {
            title: "ضمان رسمي",
            desc: "كل منتج مضمون. إذا حدثت أي مشكلة، نحلها لك.",
          },
          {
            title: "دعم عبر واتساب",
            desc: "أشخاص حقيقيون وردود حقيقية. راسلنا في أي وقت على 0652 29 61 24.",
          },
        ],
      },
      catalog: {
        kicker: "كتالوجنا",
        titleLine1: "منتجات تُحدث",
        titleLine2: "الفرق.",
        subtitle:
          "تصفح تشكيلتنا المنتقاة بعناية. كل صنف متوفر في الجزائر وجاهز للشحن إلى ولايتك.",
        searchPlaceholder: "ابحث عن مكبر صوت، JBL، سماعات...",
      },
      contact: {
        kicker: "تواصل معنا",
        titleLine1: "نحن على بُعد",
        titleLine2: "رسالة واحدة.",
        subtitle:
          "سؤال عن منتج أو طلبك أو التوصيل؟ راسلنا في أي وقت — نرد عادة خلال دقائق.",
        hoursLine: "متوفرون كل يوم من 9:00 إلى 21:00 — وأحياناً أكثر عبر رسائل إنستغرام.",
        whatsappDesc:
          "أسرع طريقة للوصول إلينا. طلبات، أسئلة، توفّر المنتجات — تحدث معنا مباشرة.",
        instagramDesc: "وصلات جديدة، إعادة تخزين وعروض حصرية — تابعنا حتى لا تفوتك أي فرصة.",
        facebookDesc: "أخبار المجتمع، تقييمات وهدايا. انضم إلى صفحتنا وابقَ على اطلاع.",
      },
      footer: {
        about:
          "منتجات إلكترونية وسمعية بصرية — مكبرات صوت وسماعات وسماعات لاسلكية وتلفزيونات وملحقات تُوصل إلى 100 ولاية جزائرية، مع الدفع عند الاستلام والضمان الرسمي.",
        note: "الدفع عند الاستلام · شحن سريع · 100 ولاية",
        shopTitle: "المتجر",
        supportTitle: "الدعم",
        allProductsLabel: "جميع المنتجات",
        deliveryLabel: "التوصيل والضمان",
        contactLabel: "تواصل معنا",
        adminLabel: "لوحة الإدارة",
      },
    },
  },

  brandName: "Proxima Elec",
  shortName: "PROXIMA",
  tagline: "Electronic & Audio Visual Products",
  logoUrl: "/logo.jpg",

  phoneDisplay: "0652 29 61 24",
  whatsappIntl: "213652296124",
  instagram: "https://www.instagram.com/proximaelec_store",
  instagramHandle: "@proximaelec_store",
  facebook: "https://www.facebook.com/share/1L7XcXBQyG/",

  header: {
    subLabel: "Audio & Electronics",
    whatsappLabel: "WhatsApp",
    navLinks: [
      { label: "Products", href: "#catalog" },
      { label: "Why Proxima", href: "#features" },
      { label: "Contact", href: "#contact" },
    ],
  },

  sections: [
    { id: "hero", visible: true },
    { id: "marquee", visible: true },
    { id: "features", visible: true },
    { id: "catalog", visible: true },
    { id: "contact", visible: true },
  ],

  showWhatsappFab: true,

  hero: {
    badge: "Algeria's audio & electronics store",
    titleLine1: "Legendary sound.",
    titleLine2: "Delivered to your door.",
    subtitle:
      "Speakers, headphones, earbuds, TVs and accessories — 100% authentic gear from the brands you love. Order online, pay cash on delivery, and get it fast anywhere in Algeria.",
    primaryCta: "Shop the catalog",
    secondaryCta: "WhatsApp us",
    image: "/hero-main.png",
    imageAlt: "Premium headphones, speaker and earbuds with blue neon lighting",
    chipTop: "Fast delivery — 24/48h",
    chipBottom: "Cash on delivery",
    stats: [
      { value: "1 000+", label: "Happy customers" },
      { value: "100", label: "Wilayas served" },
      { value: "24–48h", label: "Delivery time" },
    ],
  },

  brandsMarquee: [
    "JBL",
    "SONY",
    "MARSHALL",
    "ANKER",
    "APPLE",
    "XIAOMI",
    "BOSE",
    "SAMSUNG",
    "LG",
    "JVC",
  ],

  categories: [
    { id: "speakers", label: "Speakers" },
    { id: "headphones", label: "Headphones" },
    { id: "earbuds", label: "Earbuds" },
    { id: "tv-projectors", label: "TVs & Projectors" },
    { id: "accessories", label: "Accessories" },
  ],

  features: {
    kicker: "Why Proxima Elec",
    titleLine1: "Built on trust.",
    titleLine2: "Delivered with care.",
    subtitle:
      "We treat every order like it's our own — authentic gear, fair prices and support that actually answers.",
    items: [
      {
        title: "100% Authentic",
        desc: "Official products sourced from authorized distributors. No clones, no fakes — ever.",
      },
      {
        title: "Nationwide Delivery",
        desc: "Cash on delivery across 100 wilayas — shipped within 24–72 hours.",
      },
      {
        title: "Official Warranty",
        desc: "Every product is covered by warranty. If something goes wrong, we make it right.",
      },
      {
        title: "WhatsApp Support",
        desc: "Real people, real answers. Reach us anytime on 0652 29 61 24.",
      },
    ],
  },

  catalog: {
    kicker: "Our catalog",
    titleLine1: "Gear that hits",
    titleLine2: "different.",
    subtitle:
      "Browse our hand-picked selection. Every item is in stock in Algeria and ready to ship to your wilaya.",
    searchPlaceholder: "Search speakers, JBL, earbuds...",
    maxOnHome: 3,
  },

  contact: {
    kicker: "Get in touch",
    titleLine1: "We're one message",
    titleLine2: "away.",
    subtitle:
      "Questions about a product, your order or delivery? Reach us anytime — we usually reply within minutes.",
    hoursLine:
      "Available every day from 9:00 to 21:00 — and even later on Instagram DMs.",
    whatsappDesc:
      "Fastest way to reach us. Orders, questions, product availability — chat with us directly.",
    instagramDesc:
      "New arrivals, restocks and exclusive promos — follow us to never miss a drop.",
    facebookDesc:
      "Community updates, reviews and giveaways. Join our page and stay in the loop.",
  },

  footer: {
    about:
      "Electronic & audio-visual products — premium speakers, headphones, earbuds, TVs and accessories delivered across 100 wilayas of Algeria, with cash-on-delivery and official warranty.",
    note: "Cash on delivery · Fast shipping · 100 wilayas",
    shopTitle: "Shop",
    supportTitle: "Support",
    allProductsLabel: "All products",
    deliveryLabel: "Delivery & warranty",
    contactLabel: "Contact us",
    adminLabel: "Admin panel",
    showAdminLink: true,
  },

  freeShippingThreshold: 30_000,
  wilayas: DEFAULT_WILAYAS,
};

/* ------------------------------------------------------------------ */
/* Validation schema (admin PUT — full object)                         */
/* ------------------------------------------------------------------ */

const shortText = (max: number) => z.string().min(1).max(max);

/** http(s) links only (or empty) — blocks javascript:/data: URL injection. */
const socialUrl = z
  .string()
  .max(300)
  .regex(/^$|^https?:\/\/\S+$/i, "Link must be an http(s) URL or empty");

const hrefPattern = /^(#|\/|https?:\/\/)/;

const text = (max: number) => z.string().max(max);

const translationsOverlaySchema = z.object({
  tagline: text(120).optional(),
  hero: z
    .object({
      badge: text(80).optional(),
      titleLine1: text(80).optional(),
      titleLine2: text(80).optional(),
      subtitle: text(500).optional(),
      primaryCta: text(40).optional(),
      secondaryCta: text(40).optional(),
      chipTop: text(60).optional(),
      chipBottom: text(60).optional(),
    })
    .optional(),
  features: z
    .object({
      kicker: text(60).optional(),
      titleLine1: text(80).optional(),
      titleLine2: text(80).optional(),
      subtitle: text(400).optional(),
      items: z
        .array(z.object({ title: text(60), desc: text(300) }))
        .max(6)
        .optional(),
    })
    .optional(),
  catalog: z
    .object({
      kicker: text(60).optional(),
      titleLine1: text(80).optional(),
      titleLine2: text(80).optional(),
      subtitle: text(400).optional(),
      searchPlaceholder: text(80).optional(),
    })
    .optional(),
  contact: z
    .object({
      kicker: text(60).optional(),
      titleLine1: text(80).optional(),
      titleLine2: text(80).optional(),
      subtitle: text(400).optional(),
      hoursLine: text(200).optional(),
      whatsappDesc: text(300).optional(),
      instagramDesc: text(300).optional(),
      facebookDesc: text(300).optional(),
    })
    .optional(),
  footer: z
    .object({
      about: text(600).optional(),
      note: text(200).optional(),
      shopTitle: text(40).optional(),
      supportTitle: text(40).optional(),
      allProductsLabel: text(60).optional(),
      deliveryLabel: text(60).optional(),
      contactLabel: text(60).optional(),
      adminLabel: text(60).optional(),
    })
    .optional(),
});

export const settingsSchema = z.object({
  defaultLocale: z.enum(["en", "fr", "ar"]),
  translations: z
    .object({ fr: translationsOverlaySchema.optional(), ar: translationsOverlaySchema.optional() })
    .optional(),

  brandName: shortText(60),
  shortName: shortText(20),
  tagline: z.string().max(120),
  logoUrl: shortText(300),

  phoneDisplay: z.string().max(30),
  whatsappIntl: z.string().regex(/^\d{6,15}$/, "WhatsApp number must be digits only (international format, e.g. 213652296124)"),
  instagram: socialUrl,
  instagramHandle: z.string().max(60),
  facebook: socialUrl,

  header: z.object({
    subLabel: z.string().max(60),
    whatsappLabel: z.string().max(30),
    navLinks: z
      .array(
        z.object({
          label: shortText(40),
          href: z.string().max(300).regex(hrefPattern, "Link must start with #, / or https://"),
        })
      )
      .max(8),
  }),

  sections: z
    .array(
      z.object({
        id: z.enum(SECTION_IDS),
        visible: z.boolean(),
      })
    )
    .length(SECTION_IDS.length)
    .refine(
      (sections) => {
        const ids = sections.map((s) => s.id);
        return new Set(ids).size === SECTION_IDS.length;
      },
      "Each home-page section must appear exactly once"
    ),

  showWhatsappFab: z.boolean(),

  hero: z.object({
    badge: z.string().max(80),
    titleLine1: shortText(80),
    titleLine2: shortText(80),
    subtitle: z.string().max(500),
    primaryCta: shortText(40),
    secondaryCta: shortText(40),
    image: shortText(300),
    imageAlt: z.string().max(200),
    chipTop: z.string().max(60),
    chipBottom: z.string().max(60),
    stats: z
      .array(
        z.object({
          value: shortText(20),
          label: shortText(40),
        })
      )
      .min(1)
      .max(6),
  }),

  brandsMarquee: z.array(z.string().min(1).max(30)).min(1).max(24),

  categories: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]{2,40}$/, "Category id must be lowercase letters, digits or dashes"),
        label: shortText(40),
      })
    )
    .min(1)
    .max(20),

  features: z.object({
    kicker: z.string().max(60),
    titleLine1: shortText(80),
    titleLine2: shortText(80),
    subtitle: z.string().max(400),
    items: z
      .array(z.object({ title: shortText(60), desc: z.string().max(300) }))
      .min(1)
      .max(6),
  }),

  catalog: z.object({
    kicker: z.string().max(60),
    titleLine1: shortText(80),
    titleLine2: shortText(80),
    subtitle: z.string().max(400),
    searchPlaceholder: z.string().max(80),
    maxOnHome: z.number().int().min(1).max(24),
  }),

  contact: z.object({
    kicker: z.string().max(60),
    titleLine1: shortText(80),
    titleLine2: shortText(80),
    subtitle: z.string().max(400),
    hoursLine: z.string().max(200),
    whatsappDesc: z.string().max(300),
    instagramDesc: z.string().max(300),
    facebookDesc: z.string().max(300),
  }),

  footer: z.object({
    about: z.string().max(600),
    note: z.string().max(200),
    shopTitle: z.string().max(40),
    supportTitle: z.string().max(40),
    allProductsLabel: z.string().max(60),
    deliveryLabel: z.string().max(60),
    contactLabel: z.string().max(60),
    adminLabel: z.string().max(60),
    showAdminLink: z.boolean(),
  }),

  freeShippingThreshold: z.number().int().min(0).max(10_000_000),
  wilayas: z
    .array(
      z.object({
        code: z.string().min(1).max(4),
        name: shortText(60),
        fee: z.number().int().min(0).max(20_000),
      })
    )
    .min(1)
    .max(150),
});

/* ------------------------------------------------------------------ */
/* Server helpers                                                      */
/* ------------------------------------------------------------------ */

const SETTING_KEY = "site";

/** Shallow-deep merge stored settings over the defaults (2 levels). */
function mergeDefaults(base: SiteSettings, stored: Record<string, unknown>): SiteSettings {
  const merged = {
    ...base,
    ...stored,
    header: { ...base.header, ...((stored.header as object) ?? {}) },
    hero: { ...base.hero, ...((stored.hero as object) ?? {}) },
    features: { ...base.features, ...((stored.features as object) ?? {}) },
    catalog: { ...base.catalog, ...((stored.catalog as object) ?? {}) },
    contact: { ...base.contact, ...((stored.contact as object) ?? {}) },
    footer: { ...base.footer, ...((stored.footer as object) ?? {}) },
    translations: stored.translations ?? base.translations,
  } as SiteSettings;

  // Backfill the default translations for languages the stored blob omits
  // (old settings keep working while still offering FR/AR out of the box).
  if (base.translations) {
    merged.translations = {
      fr: base.translations.fr,
      ar: base.translations.ar,
      ...((merged.translations as { fr?: unknown; ar?: unknown }) ?? {}),
    } as SiteSettings["translations"];
  }
  return merged;
}

/** Load the site settings from the DB, falling back to defaults. */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const row = await db.siteSetting.findUnique({ where: { key: SETTING_KEY } });
    if (!row) return DEFAULT_SETTINGS;

    const raw = JSON.parse(row.value) as Record<string, unknown>;
    const merged = mergeDefaults(DEFAULT_SETTINGS, raw);
    const parsed = settingsSchema.safeParse(merged);
    if (!parsed.success) {
      console.warn("[settings] stored blob is invalid — using defaults");
      return DEFAULT_SETTINGS;
    }
    return parsed.data;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Persist the full settings object. */
export async function saveSettings(data: SiteSettings): Promise<void> {
  await db.siteSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(data) },
    create: { key: SETTING_KEY, value: JSON.stringify(data) },
  });
}

/** Look up the delivery fee for a wilaya name from a settings object. */
export function findWilaya(settings: SiteSettings, name: string): Wilaya | undefined {
  return settings.wilayas.find((w) => w.name === name);
}

/* ------------------------------------------------------------------ */
/* Locale overlay resolution                                           */
/* ------------------------------------------------------------------ */

/** True when a string is a usable overlay value. */
const filled = (v: string | undefined | null): v is string =>
  typeof v === "string" && v.trim() !== "";

/**
 * Resolve the settings for a locale: every translated field defined in the
 * FR/AR overlay replaces the base value; anything missing falls back to the
 * base (English) content. English (or a missing overlay) returns the base as-is.
 */
export function resolveSettings(settings: SiteSettings, locale: Locale): SiteSettings {
  if (locale === "en") return settings;
  const tr = settings.translations?.[locale];
  if (!tr) return settings;

  const out: SiteSettings = { ...settings };

  if (filled(tr.tagline)) out.tagline = tr.tagline;

  if (tr.hero) {
    const h = { ...settings.hero };
    if (filled(tr.hero.badge)) h.badge = tr.hero.badge;
    if (filled(tr.hero.titleLine1)) h.titleLine1 = tr.hero.titleLine1;
    if (filled(tr.hero.titleLine2)) h.titleLine2 = tr.hero.titleLine2;
    if (filled(tr.hero.subtitle)) h.subtitle = tr.hero.subtitle;
    if (filled(tr.hero.primaryCta)) h.primaryCta = tr.hero.primaryCta;
    if (filled(tr.hero.secondaryCta)) h.secondaryCta = tr.hero.secondaryCta;
    if (filled(tr.hero.chipTop)) h.chipTop = tr.hero.chipTop;
    if (filled(tr.hero.chipBottom)) h.chipBottom = tr.hero.chipBottom;
    out.hero = h;
  }

  if (tr.features) {
    const f = { ...settings.features };
    if (filled(tr.features.kicker)) f.kicker = tr.features.kicker;
    if (filled(tr.features.titleLine1)) f.titleLine1 = tr.features.titleLine1;
    if (filled(tr.features.titleLine2)) f.titleLine2 = tr.features.titleLine2;
    if (filled(tr.features.subtitle)) f.subtitle = tr.features.subtitle;
    if (tr.features.items?.length) {
      // overlay by position; missing positions fall back to the base item
      f.items = settings.features.items.map((base, i) => {
        const over = tr.features.items?.[i];
        if (!over) return base;
        return {
          title: filled(over.title) ? over.title : base.title,
          desc: filled(over.desc) ? over.desc : base.desc,
        };
      });
    }
    out.features = f;
  }

  if (tr.catalog) {
    const c = { ...settings.catalog };
    if (filled(tr.catalog.kicker)) c.kicker = tr.catalog.kicker;
    if (filled(tr.catalog.titleLine1)) c.titleLine1 = tr.catalog.titleLine1;
    if (filled(tr.catalog.titleLine2)) c.titleLine2 = tr.catalog.titleLine2;
    if (filled(tr.catalog.subtitle)) c.subtitle = tr.catalog.subtitle;
    if (filled(tr.catalog.searchPlaceholder)) c.searchPlaceholder = tr.catalog.searchPlaceholder;
    out.catalog = c;
  }

  if (tr.contact) {
    const ct = { ...settings.contact };
    if (filled(tr.contact.kicker)) ct.kicker = tr.contact.kicker;
    if (filled(tr.contact.titleLine1)) ct.titleLine1 = tr.contact.titleLine1;
    if (filled(tr.contact.titleLine2)) ct.titleLine2 = tr.contact.titleLine2;
    if (filled(tr.contact.subtitle)) ct.subtitle = tr.contact.subtitle;
    if (filled(tr.contact.hoursLine)) ct.hoursLine = tr.contact.hoursLine;
    if (filled(tr.contact.whatsappDesc)) ct.whatsappDesc = tr.contact.whatsappDesc;
    if (filled(tr.contact.instagramDesc)) ct.instagramDesc = tr.contact.instagramDesc;
    if (filled(tr.contact.facebookDesc)) ct.facebookDesc = tr.contact.facebookDesc;
    out.contact = ct;
  }

  if (tr.footer) {
    const ft = { ...settings.footer };
    if (filled(tr.footer.about)) ft.about = tr.footer.about;
    if (filled(tr.footer.note)) ft.note = tr.footer.note;
    if (filled(tr.footer.shopTitle)) ft.shopTitle = tr.footer.shopTitle;
    if (filled(tr.footer.supportTitle)) ft.supportTitle = tr.footer.supportTitle;
    if (filled(tr.footer.allProductsLabel)) ft.allProductsLabel = tr.footer.allProductsLabel;
    if (filled(tr.footer.deliveryLabel)) ft.deliveryLabel = tr.footer.deliveryLabel;
    if (filled(tr.footer.contactLabel)) ft.contactLabel = tr.footer.contactLabel;
    if (filled(tr.footer.adminLabel)) ft.adminLabel = tr.footer.adminLabel;
    out.footer = ft;
  }

  return out;
}
