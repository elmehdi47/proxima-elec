import type { Product } from "./types";

/* ------------------------------------------------------------------ */
/* Locales                                                             */
/* ------------------------------------------------------------------ */

export type Locale = "en" | "fr" | "ar";

export const LOCALE_COOKIE = "px_locale";

export const LOCALES: { id: Locale; native: string; short: string; dir: "ltr" | "rtl" }[] = [
  { id: "en", native: "English", short: "EN", dir: "ltr" },
  { id: "fr", native: "Français", short: "FR", dir: "ltr" },
  { id: "ar", native: "العربية", short: "AR", dir: "rtl" },
];

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "fr" || value === "ar";
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/* ------------------------------------------------------------------ */
/* UI dictionary (storefront chrome — not the CMS-managed content)     */
/* ------------------------------------------------------------------ */

const en = {
  /* language switcher */
  langLabel: "Language",

  /* catalog / products page */
  viewAll: "View all products",
  productsKicker: "Catalog",
  productsTitle: "All products",
  productsSubtitle:
    "Browse the full catalog — use the search and filters to find your next favorite.",
  all: "All",
  allBrands: "All brands",
  brandLabel: "Brand",
  sortBy: "Sort by",
  sortNewest: "Newest first",
  sortPriceAsc: "Price: low to high",
  sortPriceDesc: "Price: high to low",
  sortRating: "Best rated",
  loading: "Loading...",
  productSingular: "product",
  productPlural: "products",
  catalogError: "We couldn't load the catalog. Please try again.",
  retry: "Retry",
  noMatch: "No products match your search.",
  noMatchHint: "Try a different keyword or category.",
  resetFilters: "Reset filters",
  searchAria: "Search products",

  /* product card */
  addToCart: "Add to cart",
  outOfStock: "Out of stock",
  onlyLeft: "Only {n} left",
  inStock: "In stock",
  outOfStockToast: "This product is currently out of stock.",
  addedToast: "Added to cart — {name}",
  viewCart: "View cart",
  viewProduct: "View {name}",

  /* product dialog */
  reviews: "reviews",
  saveLabel: "Save {amount}",
  perkAuthentic: "100% authentic",
  perkDelivery: "Delivery 24–72h",
  perkWarranty: "Official warranty",
  outOfStockContact: "Out of stock — contact us on WhatsApp",
  hurryOnly: "Hurry — only {n} left in stock",
  inStockShip: "In stock, ready to ship",
  subtotal: "Subtotal",
  orderWhatsApp: "Order on WhatsApp",
  qtyDecrease: "Decrease quantity",
  qtyIncrease: "Increase quantity",

  /* cart sheet */
  cartTitle: "Your cart",
  cartReview: "Review your items before checkout.",
  cartEmpty: "Your cart is empty",
  cartEmptyHint: "Add some gear and it will show up here.",
  browseProducts: "Browse products",
  eachSuffix: "each",
  unlockedFree: "You've unlocked FREE delivery",
  addMoreForFree: "Add {amount} more for free delivery",
  deliveryNote: "Delivery fee is calculated at checkout based on your wilaya.",
  proceedCheckout: "Proceed to checkout",
  removeAria: "Remove {name} from cart",

  /* checkout */
  completeOrder: "Complete your order",
  itemSingular: "item",
  itemPlural: "items",
  fillDetails: "fill in your details to confirm.",
  fullName: "Full name",
  namePlaceholder: "Your full name",
  phoneLabel: "Phone number",
  phoneHint: "We'll call this number to confirm your order.",
  wilayaLabel: "Wilaya",
  selectWilaya: "Select your wilaya",
  addressLabel: "Commune / Address",
  addressPlaceholder: "Commune, street, landmark...",
  notesLabel: "Notes",
  optional: "(optional)",
  notesPlaceholder: "Anything we should know? Color preference, delivery time...",
  deliveryLabel: "Delivery",
  selectWilayaHint: "Select your wilaya",
  free: "FREE",
  totalToPay: "Total to pay",
  codNote: "Cash on delivery — pay when you receive your order",
  confirmOrder: "Confirm order — {total}",
  placingOrder: "Placing your order...",
  orderPlaced: "Order placed!",
  yourOrder: "Your order",
  hasBeenReceived: "has been received and is now",
  pendingConfirmation: "pending confirmation",
  customer: "Customer",
  deliverTo: "Deliver to",
  total: "Total",
  confirmWhatsApp: "Confirm on WhatsApp",
  confirmHint: "Recommended — it helps us process your order faster.",
  continueShopping: "Continue shopping",
  errName: "Please enter your full name.",
  errPhone: "Please enter a valid Algerian phone number (e.g. 06 52 29 61 24).",
  errWilaya: "Please select your wilaya.",
  errAddress: "Please enter your commune or address.",
  errEmptyCart: "Your cart is empty.",
  errGeneric: "Something went wrong. Please try again.",
  errNetwork: "Network error. Please check your connection and try again.",
  confirmNote: "By confirming, our team will call you to arrange delivery.",

  /* footer */
  rightsReserved: "All rights reserved.",

  /* contact channel CTAs */
  ctaChat: "Chat on WhatsApp",
  ctaFollow: "Follow us",
  ctaVisit: "Visit page",

  /* WhatsApp message templates */
  waGreeting: "Hello! I have a question.",
  heroWaText: "Hello {name}! I'd like to ask about your products.",
  supportText: "Hello! I need help with an order.",
  inquiryLine1: "Hello! I'm interested in this product:",
  inquiryPrice: "Price:",
  inquiryAvailable: "Is it available?",
};

export type UIKeys = keyof typeof en;

const fr: Record<UIKeys, string> = {
  langLabel: "Langue",

  viewAll: "Voir tous les produits",
  productsKicker: "Catalogue",
  productsTitle: "Tous les produits",
  productsSubtitle:
    "Parcourez tout le catalogue — utilisez la recherche et les filtres pour trouver votre prochain coup de cœur.",
  all: "Tous",
  allBrands: "Toutes les marques",
  brandLabel: "Marque",
  sortBy: "Trier",
  sortNewest: "Nouveautés d'abord",
  sortPriceAsc: "Prix : croissant",
  sortPriceDesc: "Prix : décroissant",
  sortRating: "Mieux notés",
  loading: "Chargement...",
  productSingular: "produit",
  productPlural: "produits",
  catalogError: "Impossible de charger le catalogue. Veuillez réessayer.",
  retry: "Réessayer",
  noMatch: "Aucun produit ne correspond à votre recherche.",
  noMatchHint: "Essayez un autre mot-clé ou une autre catégorie.",
  resetFilters: "Réinitialiser les filtres",
  searchAria: "Rechercher des produits",

  addToCart: "Ajouter au panier",
  outOfStock: "Rupture de stock",
  onlyLeft: "Plus que {n} !",
  inStock: "En stock",
  outOfStockToast: "Ce produit est actuellement en rupture de stock.",
  addedToast: "Ajouté au panier — {name}",
  viewCart: "Voir le panier",
  viewProduct: "Voir {name}",

  reviews: "avis",
  saveLabel: "Économisez {amount}",
  perkAuthentic: "100 % authentique",
  perkDelivery: "Livraison 24–72 h",
  perkWarranty: "Garantie officielle",
  outOfStockContact: "Rupture de stock — contactez-nous sur WhatsApp",
  hurryOnly: "Dépêchez-vous — plus que {n} en stock",
  inStockShip: "En stock, prêt à expédier",
  subtotal: "Sous-total",
  orderWhatsApp: "Commander sur WhatsApp",
  qtyDecrease: "Diminuer la quantité",
  qtyIncrease: "Augmenter la quantité",

  cartTitle: "Votre panier",
  cartReview: "Vérifiez vos articles avant de commander.",
  cartEmpty: "Votre panier est vide",
  cartEmptyHint: "Ajoutez du matériel et il apparaîtra ici.",
  browseProducts: "Parcourir les produits",
  eachSuffix: "l'unité",
  unlockedFree: "Vous avez débloqué la livraison GRATUITE",
  addMoreForFree: "Ajoutez {amount} de plus pour la livraison gratuite",
  deliveryNote: "Les frais de livraison sont calculés au paiement selon votre wilaya.",
  proceedCheckout: "Passer à la commande",
  removeAria: "Retirer {name} du panier",

  completeOrder: "Finalisez votre commande",
  itemSingular: "article",
  itemPlural: "articles",
  fillDetails: "remplissez vos informations pour confirmer.",
  fullName: "Nom complet",
  namePlaceholder: "Votre nom complet",
  phoneLabel: "Numéro de téléphone",
  phoneHint: "Nous appellerons ce numéro pour confirmer votre commande.",
  wilayaLabel: "Wilaya",
  selectWilaya: "Sélectionnez votre wilaya",
  addressLabel: "Commune / Adresse",
  addressPlaceholder: "Commune, rue, repère...",
  notesLabel: "Remarques",
  optional: "(facultatif)",
  notesPlaceholder: "Quelque chose à savoir ? Couleur préférée, horaire de livraison...",
  deliveryLabel: "Livraison",
  selectWilayaHint: "Sélectionnez votre wilaya",
  free: "GRATUITE",
  totalToPay: "Total à payer",
  codNote: "Paiement à la livraison — payez en recevant votre commande",
  confirmOrder: "Confirmer la commande — {total}",
  placingOrder: "Envoi de votre commande...",
  orderPlaced: "Commande passée !",
  yourOrder: "Votre commande",
  hasBeenReceived: "a bien été reçue et est maintenant",
  pendingConfirmation: "en attente de confirmation",
  customer: "Client",
  deliverTo: "Livrer à",
  total: "Total",
  confirmWhatsApp: "Confirmer sur WhatsApp",
  confirmHint: "Recommandé — cela nous aide à traiter votre commande plus vite.",
  continueShopping: "Continuer les achats",
  errName: "Veuillez saisir votre nom complet.",
  errPhone: "Veuillez saisir un numéro algérien valide (ex. 06 52 29 61 24).",
  errWilaya: "Veuillez sélectionner votre wilaya.",
  errAddress: "Veuillez saisir votre commune ou adresse.",
  errEmptyCart: "Votre panier est vide.",
  errGeneric: "Une erreur est survenue. Veuillez réessayer.",
  errNetwork: "Erreur réseau. Vérifiez votre connexion et réessayez.",
  confirmNote: "En confirmant, notre équipe vous appellera pour organiser la livraison.",

  rightsReserved: "Tous droits réservés.",

  ctaChat: "Discuter sur WhatsApp",
  ctaFollow: "Suivez-nous",
  ctaVisit: "Voir la page",

  waGreeting: "Bonjour ! J'ai une question.",
  heroWaText: "Bonjour {name} ! J'aimerais me renseigner sur vos produits.",
  supportText: "Bonjour ! J'ai besoin d'aide concernant une commande.",
  inquiryLine1: "Bonjour ! Ce produit m'intéresse :",
  inquiryPrice: "Prix :",
  inquiryAvailable: "Est-il disponible ?",
};

const ar: Record<UIKeys, string> = {
  langLabel: "اللغة",

  viewAll: "عرض جميع المنتجات",
  productsKicker: "الكتالوج",
  productsTitle: "جميع المنتجات",
  productsSubtitle: "تصفّح الكتالوج كاملاً — استخدم البحث والفلاتر لتجد منتجك المفضل.",
  all: "الكل",
  allBrands: "كل الماركات",
  brandLabel: "الماركة",
  sortBy: "ترتيب",
  sortNewest: "الأحدث أولاً",
  sortPriceAsc: "السعر: من الأقل إلى الأعلى",
  sortPriceDesc: "السعر: من الأعلى إلى الأقل",
  sortRating: "الأعلى تقييماً",
  loading: "جارٍ التحميل...",
  productSingular: "منتج",
  productPlural: "منتجات",
  catalogError: "لم نتمكن من تحميل الكتالوج. حاول مرة أخرى.",
  retry: "إعادة المحاولة",
  noMatch: "لا توجد منتجات مطابقة لبحثك.",
  noMatchHint: "جرّب كلمة مختلفة أو تصنيفاً آخر.",
  resetFilters: "مسح الفلاتر",
  searchAria: "البحث عن منتجات",

  addToCart: "أضف إلى السلة",
  outOfStock: "غير متوفر",
  onlyLeft: "بقي {n} فقط",
  inStock: "متوفر",
  outOfStockToast: "هذا المنتج غير متوفر حالياً.",
  addedToast: "أُضيف إلى السلة — {name}",
  viewCart: "عرض السلة",
  viewProduct: "عرض {name}",

  reviews: "تقييم",
  saveLabel: "وفّر {amount}",
  perkAuthentic: "أصلي 100%",
  perkDelivery: "التوصيل خلال 24–72 ساعة",
  perkWarranty: "ضمان رسمي",
  outOfStockContact: "غير متوفر — تواصل معنا عبر واتساب",
  hurryOnly: "أسرع — بقي {n} فقط في المخزون",
  inStockShip: "متوفر وجاهز للشحن",
  subtotal: "المجموع الفرعي",
  orderWhatsApp: "اطلب عبر واتساب",
  qtyDecrease: "إنقاص الكمية",
  qtyIncrease: "زيادة الكمية",

  cartTitle: "سلة المشتريات",
  cartReview: "راجع مشترياتك قبل إتمام الطلب.",
  cartEmpty: "سلتك فارغة",
  cartEmptyHint: "أضف بعض المنتجات وستظهر هنا.",
  browseProducts: "تصفح المنتجات",
  eachSuffix: "للوحدة",
  unlockedFree: "لقد حصلت على التوصيل مجاناً",
  addMoreForFree: "أضف {amount} أخرى للحصول على توصيل مجاني",
  deliveryNote: "تُحسب رسوم التوصيل عند إتمام الطلب حسب ولايتك.",
  proceedCheckout: "إتمام الطلب",
  removeAria: "إزالة {name} من السلة",

  completeOrder: "أكمل طلبك",
  itemSingular: "عنصر",
  itemPlural: "عناصر",
  fillDetails: "أدخل بياناتك للتأكيد.",
  fullName: "الاسم الكامل",
  namePlaceholder: "اسمك الكامل",
  phoneLabel: "رقم الهاتف",
  phoneHint: "سنتصل بهذا الرقم لتأكيد طلبك.",
  wilayaLabel: "الولاية",
  selectWilaya: "اختر ولايتك",
  addressLabel: "البلدية / العنوان",
  addressPlaceholder: "البلدية، الشارع، علامة مميزة...",
  notesLabel: "ملاحظات",
  optional: "(اختياري)",
  notesPlaceholder: "أي شيء يجب أن نعرفه؟ لون مفضل، وقت التوصيل...",
  deliveryLabel: "التوصيل",
  selectWilayaHint: "اختر ولايتك",
  free: "مجاناً",
  totalToPay: "الإجمالي للدفع",
  codNote: "الدفع عند الاستلام — ادفع عند استلام طلبك",
  confirmOrder: "تأكيد الطلب — {total}",
  placingOrder: "جارٍ إرسال الطلب...",
  orderPlaced: "تم استلام طلبك!",
  yourOrder: "طلبك",
  hasBeenReceived: "تم استلامه وهو الآن",
  pendingConfirmation: "بانتظار التأكيد",
  customer: "العميل",
  deliverTo: "التوصيل إلى",
  total: "الإجمالي",
  confirmWhatsApp: "أكّد عبر واتساب",
  confirmHint: "موصى به — يساعدنا على معالجة طلبك أسرع.",
  continueShopping: "مواصلة التسوق",
  errName: "الرجاء إدخال اسمك الكامل.",
  errPhone: "الرجاء إدخال رقم هاتف جزائري صحيح (مثال: 06 52 29 61 24).",
  errWilaya: "الرجاء اختيار ولايتك.",
  errAddress: "الرجاء إدخال بلديتك أو عنوانك.",
  errEmptyCart: "سلتك فارغة.",
  errGeneric: "حدث خطأ ما. حاول مرة أخرى.",
  errNetwork: "خطأ في الشبكة. تحقق من اتصالك وحاول مجدداً.",
  confirmNote: "بعد التأكيد، سيتصل بك فريقنا لترتيب التوصيل.",

  rightsReserved: "جميع الحقوق محفوظة.",

  ctaChat: "تواصل عبر واتساب",
  ctaFollow: "تابعنا",
  ctaVisit: "زيارة الصفحة",

  waGreeting: "مرحباً! لدي سؤال.",
  heroWaText: "مرحباً {name}! أود الاستفسار عن منتجاتكم.",
  supportText: "مرحباً! أحتاج مساعدة بخصوص طلب.",
  inquiryLine1: "مرحباً! أنا مهتم بهذا المنتج:",
  inquiryPrice: "السعر:",
  inquiryAvailable: "هل هو متوفر؟",
};

export const UI: Record<Locale, Record<UIKeys, string>> = { en, fr, ar };

/** Translate a UI key. Missing keys fall back to English, then to the key. */
export function translate(locale: Locale, key: UIKeys): string {
  return UI[locale]?.[key] ?? UI.en[key] ?? key;
}

/** Replace {placeholders} in a translated template. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in values ? values[name] : match
  );
}

/* ------------------------------------------------------------------ */
/* Product localization (per-product translations with fallback)        */
/* ------------------------------------------------------------------ */

export function productName(p: Pick<Product, "name" | "nameFr" | "nameAr">, locale: Locale): string {
  if (locale === "fr" && p.nameFr) return p.nameFr;
  if (locale === "ar" && p.nameAr) return p.nameAr;
  return p.name;
}

export function productDescription(
  p: Pick<Product, "description" | "descriptionFr" | "descriptionAr">,
  locale: Locale
): string {
  if (locale === "fr" && p.descriptionFr) return p.descriptionFr;
  if (locale === "ar" && p.descriptionAr) return p.descriptionAr;
  return p.description;
}

/** Names snapshot for a cart line — resolves to the right language later. */
export function productNames(
  p: Pick<Product, "name" | "nameFr" | "nameAr">
): { en: string; fr: string; ar: string } {
  return { en: p.name, fr: p.nameFr || p.name, ar: p.nameAr || p.name };
}
