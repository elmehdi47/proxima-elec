import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS } from "../src/lib/site-settings";

const prisma = new PrismaClient();

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  category: string;
  brand: string;
  image: string;
  stock: number;
  featured: boolean;
  badge: string | null;
  rating: number;
  reviewsCount: number;
}

/** FR / AR translations for the demo products (optional on the storefront). */
const TRANSLATIONS: Record<string, { nameFr: string; descriptionFr: string; nameAr: string; descriptionAr: string }> = {
  "JBL Flip 6 Bluetooth Speaker": {
    nameFr: "Enceinte Bluetooth JBL Flip 6",
    descriptionFr:
      "L'enceinte portable iconique, repensée. 30 W de JBL Pro Sound audacieux, 12 heures d'autonomie, étanche IP67 et un design robuste qui survit à toutes les aventures. La fête vous suit partout.",
    nameAr: "مكبر صوت JBL Flip 6 بلوتوث",
    descriptionAr:
      "مكبر الصوت المحمول الأيقوني بتصميم جديد. صوت JBL Pro قوي بقوة 30 واط، بطارية تدوم 12 ساعة، مقاومة للماء IP67 وتصميم متين يتحمل أي مغامرة. خذ الحفلة معك أينما ذهبت.",
  },
  "JBL Charge 5 Bluetooth Speaker": {
    nameFr: "Enceinte Bluetooth JBL Charge 5",
    descriptionFr:
      "40 W de son enveloppant avec haut-parleur racetrack et double radiateurs passifs. 20 heures d'autonomie, étanche IP67 et batterie intégrée pour recharger votre téléphone.",
    nameAr: "مكبر صوت JBL Charge 5 بلوتوث",
    descriptionAr:
      "صوت غامر بقوة 40 واط مع سائق racetrack ومشعات سلبية مزدوجة. بطارية 20 ساعة، مقاومة للماء IP67، وبطارية مدمجة لشحن هاتفك أثناء التنقل.",
  },
  "Marshall Emberton II Portable Speaker": {
    nameFr: "Enceinte portable Marshall Emberton II",
    descriptionFr:
      "Le look classique Marshall avec un son moderne. L'Emberton II offre un vrai son 360°, plus de 20 heures d'autonomie, une robustesse IP67 et le Bluetooth 5.1 multi-appareils.",
    nameAr: "مكبر صوت Marshall Emberton II محمول",
    descriptionAr:
      "مظهر Marshall الكلاسيكي بصوت عصري. يوفر Emberton II صوتاً حقيقياً بتقنية 360 درجة، أكثر من 20 ساعة تشغيل، متانة IP67 وبلوتوث 5.1 مع إقران متعدد الأجهزة.",
  },
  "JBL PartyBox Encore Party Speaker": {
    nameFr: "Enceinte festive JBL PartyBox Encore",
    descriptionFr:
      "Transformez n'importe quelle pièce en piste de danse. 100 W de JBL Pro Sound, lumières dynamiques synchronisées, entrées micro et guitare, et un design portable pensé pour les foules.",
    nameAr: "مكبر صوت الحفلات JBL PartyBox Encore",
    descriptionAr:
      "حوّل أي غرفة إلى حفلة. 100 واط من صوت JBL Pro، إضاءة ديناميكية متزامنة مع الإيقاع، مداخل مايك وغيتار، وتصميم محمول مصمم للحشود.",
  },
  "JBL Bar 2.1 Deep Bass Soundbar": {
    nameFr: "Barre de son JBL Bar 2.1 Deep Bass",
    descriptionFr:
      "Un son TV qui frappe fort. 300 W de puissance avec caisson sans fil, Dolby Digital, streaming Bluetooth et HDMI ARC pour une installation propre à un seul câble.",
    nameAr: "مكبر صوت تلفزيون JBL Bar 2.1 Deep Bass",
    descriptionAr:
      "صوت تلفزيون عميق. قوة إجمالية 300 واط مع سبيكر فرعي لاسلكي، Dolby Digital، بث بلوتوث وHDMI ARC لإعداد أنظف بكابل واحد.",
  },
  "JBL Tune 770NC Wireless Headphones": {
    nameFr: "Casque sans fil JBL Tune 770NC",
    descriptionFr:
      "Réduction de bruit adaptative, jusqu'à 70 heures d'autonomie, son JBL Pure Bass et design pliable léger. La connexion multipoint garde deux appareils à la fois.",
    nameAr: "سماعة رأس JBL Tune 770NC لاسلكية",
    descriptionAr:
      "إلغاء ضجيج تكيفي، بطارية تصل إلى 70 ساعة، صوت JBL Pure Bass وتصميم خفيف قابل للطي. الاتصال المتعدد يبقيك على جهازين في وقت واحد.",
  },
  "Sony WH-CH720N Wireless Headphones": {
    nameFr: "Casque sans fil Sony WH-CH720N",
    descriptionFr:
      "Le casque ANC léger de Sony, à seulement 192 g. Double capteur de bruit, 35 heures d'autonomie, upscaling DSEE et appels limpides — toute la journée, chaque jour.",
    nameAr: "سماعة رأس Sony WH-CH720N لاسلكية",
    descriptionAr:
      "سماعة ANC الخفيفة من Sony بوزن 192 غراماً فقط. مستشعر مزدوج للضجيج، بطارية 35 ساعة، تحسين صوت DSEE ومكالمات صافية — طوال اليوم، كل يوم.",
  },
  "Anker Soundcore Life Q30 Hybrid ANC": {
    nameFr: "Anker Soundcore Life Q30 ANC hybride",
    descriptionFr:
      "Son certifié Hi-Res avec transducteurs 40 mm, réduction de bruit hybride active et une autonomie de 40 heures. Coussinets à mémoire de forme pour un confort toute la journée.",
    nameAr: "سماعة Anker Soundcore Life Q30 هجينة ANC",
    descriptionAr:
      "صوت معتمد Hi-Res مع مشغلات 40 مم مخصصة، إلغاء ضجيج هجين نشط وبطارية مذهلة تدوم 40 ساعة. وسائد ذاكرة الراحة للاستخدام اليومي الطويل.",
  },
  "Proxima Force Wireless Gaming Headset": {
    nameFr: "Casque gaming sans fil Proxima Force",
    descriptionFr:
      "Audio gaming sans fil à faible latence avec surround virtuel 7.1, micro anti-bruit détachable, accents RGB et plus de 15 heures d'autonomie. PC, PS4/PS5 et Switch.",
    nameAr: "سماعة ألعاب Proxima Force اللاسلكية",
    descriptionAr:
      "صوت ألعاب لاسلكي بزمن استجابة منخفض مع محيط افتراضي 7.1، ميكروفون قابل للفصل مضاد للضجيج، لمسات RGB وأكثر من 15 ساعة بطارية. متوافقة مع PC وPS4/PS5 وSwitch.",
  },
  "Apple AirPods Pro 2 (USB-C)": {
    nameFr: "Apple AirPods Pro 2 (USB-C)",
    descriptionFr:
      "La référence des écouteurs. Réduction de bruit active, Adaptive Transparency, audio spatial personnalisé et jusqu'à 6 heures d'écoute sur une seule charge.",
    nameAr: "Apple AirPods Pro 2 (USB-C)",
    descriptionAr:
      "المعيار الذهبي للسماعات اللاسلكية. إلغاء ضجيج نشط، شفافية تكيفية، صوت مكاني مخصص وما يصل إلى 6 ساعات استماع بشحنة واحدة.",
  },
  "Apple AirPods (3rd Generation)": {
    nameFr: "Apple AirPods (3e génération)",
    descriptionFr:
      "Les AirPods classiques, renaissant. Adaptive EQ adapte la musique à vos oreilles, audio spatial avec suivi de tête, résistance à l'eau et 30 heures totales avec le boîtier.",
    nameAr: "Apple AirPods (الجيل الثالث)",
    descriptionAr:
      "سماعات AirPods الكلاسيكية بولادة جديدة. مُعادل تكيفي يضبط الموسيقى على أذنيك، صوت مكاني مع تتبع الرأس، مقاومة للماء و30 ساعة إجمالية مع العلبة.",
  },
  "JBL Wave Buds 2 True Wireless Earbuds": {
    nameFr: "Écouteurs sans fil JBL Wave Buds 2",
    descriptionFr:
      "Le gros son JBL dans un format minuscule. 32 heures d'autonomie totale, Smart Ambient pour rester attentif, réduction d'écho pour des appels clairs et un boîtier de poche.",
    nameAr: "سماعات JBL Wave Buds 2 اللاسلكية",
    descriptionAr:
      "صوت JBL الكبير بجسم صغير. 32 ساعة إجمالية، وضع Smart Ambient للبقاء متنبهاً، تقليل الصدى لمكالمات واضحة وعلبة شحن جيبية.",
  },
  "Xiaomi Redmi Buds 5": {
    nameFr: "Xiaomi Redmi Buds 5",
    descriptionFr:
      "Des fonctions phares à prix honnête. ANC actif 46 dB, transducteurs titane 12,4 mm, Bluetooth 5.4 multipoint et jusqu'à 40 heures d'écoute.",
    nameAr: "Xiaomi Redmi Buds 5",
    descriptionAr:
      "مواصفات رائدة بسعر صادق. إلغاء ضجيج نشط 46 ديسيبل، مشغلات تيتانيوم 12.4 مم، بلوتوث 5.4 متعدد النقاط وما يصل إلى 40 ساعة استماع.",
  },
  'Proxima Smart LED TV 55" 4K UHD': {
    nameFr: 'TV LED intelligente Proxima 55" 4K UHD',
    descriptionFr:
      "Le cinéma à la maison. Panneau 4K Ultra HD de 55 pouces, HDR10+, applications intégrées (YouTube, Netflix), 3 ports HDMI et un design sans bordure qui s'intègre partout.",
    nameAr: "تلفزيون Proxima ذكي LED مقاس 55 بوصة 4K UHD",
    descriptionAr:
      "سينما المنزل. شاشة 4K Ultra HD مقاس 55 بوصة، HDR10+، تطبيقات ذكية مدمجة (يوتيوب، نتفليكس)، 3 منافذ HDMI وتصميم نحيف بلا إطارات يناسب أي غرفة.",
  },
  "Proxima Mini LED Projector FHD 1080p": {
    nameFr: "Projecteur mini LED Proxima FHD 1080p",
    descriptionFr:
      "Des soirées cinéma, partout. Natif 1080p avec support d'entrée 4K, mise en miroir Wi-Fi intégrée, ports HDMI et USB, et un format compact qui projette jusqu'à 120 pouces.",
    nameAr: "جهاز عرض Proxima Mini LED بدقة FHD 1080p",
    descriptionAr:
      "ليالي أفلام في أي مكان. دقة أصلية 1080p مع دعم إدخال 4K، مشاركة شاشة Wi-Fi مدمجة، منافذ HDMI وUSB، وهيكل مدمج يعرض حتى 120 بوصة.",
  },
  "65W GaN USB-C Fast Charger": {
    nameFr: "Chargeur rapide 65W GaN USB-C",
    descriptionFr:
      "Un seul chargeur pour tout. La technologie GaN 65 W recharge téléphone, tablette et ordinateur à pleine vitesse, avec double port USB-C et prise pliable pour voyager.",
    nameAr: "شاحن سريع 65 واط GaN USB-C",
    descriptionAr:
      "شاحن واحد لكل شيء. تقنية GaN بقوة 65 واط تشحن هاتفك وجهازك اللوحي وحاسوبك بأقصى سرعة، مع منفذي USB-C مزدوجين وقابس قابل للطي للسفر.",
  },
};

const products: SeedProduct[] = [
  {
    name: "JBL Flip 6 Bluetooth Speaker",
    description:
      "The iconic portable speaker, rebuilt. 30W of bold JBL Pro Sound, 12 hours of playtime, IP67 waterproof and a rugged design that survives any adventure. Take the party anywhere.",
    price: 18500,
    oldPrice: 21000,
    category: "speakers",
    brand: "JBL",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0b6c3c93aebc.jpg",
    stock: 24,
    featured: true,
    badge: "-12%",
    rating: 4.8,
    reviewsCount: 46,
  },
  {
    name: "JBL Charge 5 Bluetooth Speaker",
    description:
      "40W of room-filling sound with a racetrack driver and dual passive radiators. 20 hours of playtime, IP67 waterproof, and a built-in powerbank to charge your phone on the go.",
    price: 27500,
    oldPrice: null,
    category: "speakers",
    brand: "JBL",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/48272414d373.png",
    stock: 15,
    featured: false,
    badge: null,
    rating: 4.9,
    reviewsCount: 32,
  },
  {
    name: "Marshall Emberton II Portable Speaker",
    description:
      "The classic Marshall look with modern sound. Emberton II delivers true 360° sound, 20+ hours of playtime, IP67 durability and Bluetooth 5.1 with multi-device pairing.",
    price: 32000,
    oldPrice: 35000,
    category: "speakers",
    brand: "Marshall",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a7293fbed2d9.png",
    stock: 8,
    featured: false,
    badge: "TOP",
    rating: 4.7,
    reviewsCount: 21,
  },
  {
    name: "JBL PartyBox Encore Party Speaker",
    description:
      "Turn any room into a party. 100W of JBL Pro Sound, dynamic light shows that sync to the beat, mic and guitar inputs, and a portable design built for crowds.",
    price: 45000,
    oldPrice: null,
    category: "speakers",
    brand: "JBL",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ec7bc63edb2b.png",
    stock: 6,
    featured: false,
    badge: null,
    rating: 4.6,
    reviewsCount: 14,
  },
  {
    name: "JBL Bar 2.1 Deep Bass Soundbar",
    description:
      "TV sound that hits deep. 300W total output with a wireless subwoofer, Dolby Digital, Bluetooth streaming and HDMI ARC for a clean one-cable setup.",
    price: 59500,
    oldPrice: 65000,
    category: "speakers",
    brand: "JBL",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/731a018a1f5a.jpg",
    stock: 4,
    featured: false,
    badge: "-8%",
    rating: 4.7,
    reviewsCount: 11,
  },
  {
    name: "JBL Tune 770NC Wireless Headphones",
    description:
      "Adaptive noise cancelling, up to 70 hours of battery, JBL Pure Bass Sound and a lightweight foldable design. Multipoint connection keeps you on two devices at once.",
    price: 21500,
    oldPrice: 23500,
    category: "headphones",
    brand: "JBL",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/68de0211b991.png",
    stock: 18,
    featured: true,
    badge: "-9%",
    rating: 4.7,
    reviewsCount: 38,
  },
  {
    name: "Sony WH-CH720N Wireless Headphones",
    description:
      "Sony's lightweight ANC headphones at just 192g. Dual Noise Sensor technology, 35-hour battery, DSEE audio upscaling and crystal-clear voice calls — all day, every day.",
    price: 24000,
    oldPrice: null,
    category: "headphones",
    brand: "Sony",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9f8da79c1574.jpg",
    stock: 12,
    featured: true,
    badge: null,
    rating: 4.8,
    reviewsCount: 27,
  },
  {
    name: "Anker Soundcore Life Q30 Hybrid ANC",
    description:
      "Hi-Res certified sound with custom 40mm drivers, hybrid active noise cancelling and a staggering 40-hour playtime. Memory-foam earcups for all-day comfort.",
    price: 13500,
    oldPrice: 15500,
    category: "headphones",
    brand: "Anker",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c6ffb022524e.jpg",
    stock: 20,
    featured: false,
    badge: "BEST VALUE",
    rating: 4.6,
    reviewsCount: 55,
  },
  {
    name: "Proxima Force Wireless Gaming Headset",
    description:
      "Low-latency wireless gaming audio with virtual 7.1 surround, a detachable noise-cancelling mic, RGB accents and 15+ hours of battery. PC, PS4/PS5 and Switch ready.",
    price: 6500,
    oldPrice: null,
    category: "headphones",
    brand: "Proxima",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fd9a33a16d7d.jpg",
    stock: 16,
    featured: false,
    badge: "NEW",
    rating: 4.3,
    reviewsCount: 15,
  },
  {
    name: "Apple AirPods Pro 2 (USB-C)",
    description:
      "The gold standard of earbuds. Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio and up to 6 hours of listening on a single charge.",
    price: 28500,
    oldPrice: 31000,
    category: "earbuds",
    brand: "Apple",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/832f69b3c488.jpg",
    stock: 14,
    featured: true,
    badge: "-8%",
    rating: 4.9,
    reviewsCount: 61,
  },
  {
    name: "Apple AirPods (3rd Generation)",
    description:
      "The classic AirPods, reborn. Adaptive EQ tunes music to your ears, spatial audio with dynamic head tracking, sweat and water resistance and 30 hours total with the case.",
    price: 22000,
    oldPrice: null,
    category: "earbuds",
    brand: "Apple",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/71d36e297ba3.jpg",
    stock: 10,
    featured: false,
    badge: null,
    rating: 4.7,
    reviewsCount: 33,
  },
  {
    name: "JBL Wave Buds 2 True Wireless Earbuds",
    description:
      "Big JBL sound in a tiny package. 32 hours of total battery, Smart Ambient to stay aware, echo-reduction for clear calls and a pocketable charging case.",
    price: 9500,
    oldPrice: 11000,
    category: "earbuds",
    brand: "JBL",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5df320bda0ad.jpg",
    stock: 22,
    featured: false,
    badge: "-14%",
    rating: 4.5,
    reviewsCount: 29,
  },
  {
    name: "Xiaomi Redmi Buds 5",
    description:
      "Flagship features, honest price. 46dB active noise cancelling, 12.4mm titanium drivers, Bluetooth 5.4 multipoint and up to 40 hours of listening.",
    price: 7500,
    oldPrice: null,
    category: "earbuds",
    brand: "Xiaomi",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7938d5dcd549.jpg",
    stock: 30,
    featured: false,
    badge: "NEW",
    rating: 4.4,
    reviewsCount: 18,
  },
  {
    name: 'Proxima Smart LED TV 55" 4K UHD',
    description:
      'Cinema at home. 55-inch 4K Ultra HD panel, HDR10+, built-in smart apps (YouTube, Netflix), 3 HDMI ports and a slim bezel-less design that fits any living room.',
    price: 78000,
    oldPrice: 85000,
    category: "tv-projectors",
    brand: "Proxima",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9f32111ff7f4.jpg",
    stock: 5,
    featured: false,
    badge: "-8%",
    rating: 4.3,
    reviewsCount: 9,
  },
  {
    name: "Proxima Mini LED Projector FHD 1080p",
    description:
      "Movie nights, anywhere. Native 1080p with 4K input support, built-in Wi-Fi screen mirroring, HDMI and USB ports, and a compact body that projects up to 120 inches.",
    price: 39500,
    oldPrice: null,
    category: "tv-projectors",
    brand: "Proxima",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5d625c37e0a5.jpg",
    stock: 7,
    featured: false,
    badge: "NEW",
    rating: 4.4,
    reviewsCount: 12,
  },
  {
    name: "65W GaN USB-C Fast Charger",
    description:
      "One charger for everything. 65W GaN technology charges your phone, tablet and laptop at full speed, with dual USB-C ports and a foldable plug for travel.",
    price: 4900,
    oldPrice: 5900,
    category: "accessories",
    brand: "EcoFlow",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/63a1c816a895.png",
    stock: 40,
    featured: false,
    badge: "-17%",
    rating: 4.8,
    reviewsCount: 47,
  },
];

async function main() {
  let created = 0;
  let translated = 0;
  for (const p of products) {
    const tr = TRANSLATIONS[p.name];
    const existing = await prisma.product.findUnique({ where: { name: p.name } });
    if (!existing) {
      // create with translations when available
      await prisma.product.create({ data: { ...p, ...tr } });
      created++;
    } else if (tr && existing.nameFr == null) {
      // never overwrite admin edits — only backfill missing translations
      await prisma.product.update({ where: { id: existing.id }, data: tr });
      translated++;
    }
  }
  console.log(`Seeded ${products.length} products (${created} created, ${translated} translations backfilled).`);

  // Site settings (CMS) — only seed defaults when no blob exists yet,
  // so admin edits are never overwritten by a re-seed.
  const existingSettings = await prisma.siteSetting.findUnique({
    where: { key: "site" },
  });
  if (!existingSettings) {
    await prisma.siteSetting.create({
      data: { key: "site", value: JSON.stringify(DEFAULT_SETTINGS) },
    });
    console.log("Seeded default site settings (CMS).");
  } else {
    console.log("Site settings already present — keeping admin edits.");
  }

  // Admin account — bcrypt-hashed password from ADMIN_PASSWORD env (default proxima2025)
  const existingAdmin = await prisma.adminUser.findFirst();
  if (!existingAdmin) {
    const password = process.env.ADMIN_PASSWORD || "proxima2025";
    await prisma.adminUser.create({
      data: {
        username: "admin",
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    console.log(`Seeded admin account (username: admin).`);
  } else {
    console.log("Admin account already present — keeping current password.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
