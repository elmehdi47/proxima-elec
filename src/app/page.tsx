import { getInitialLocale } from "@/lib/server-locale";
import { SiteSettingsProvider } from "@/components/store/settings-provider";
import { SiteHeader } from "@/components/store/site-header";
import { HomeSections } from "@/components/store/home-sections";
import { SiteFooter } from "@/components/store/site-footer";
import { WhatsappFab } from "@/components/store/whatsapp-fab";
import { CartSheet } from "@/components/store/cart-sheet";
import { CheckoutDialog } from "@/components/store/checkout-dialog";
import { ProductDialog } from "@/components/store/product-dialog";

export default async function Home() {
  const initialLocale = await getInitialLocale();

  return (
    <SiteSettingsProvider initialLocale={initialLocale}>
      <SiteHeader />

      {/* Sections render in the admin-configured order + visibility */}
      <main className="flex-1">
        <HomeSections />
      </main>

      <SiteFooter />

      {/* Overlays */}
      <CartSheet />
      <CheckoutDialog />
      <ProductDialog />
      <WhatsappFab />
    </SiteSettingsProvider>
  );
}
