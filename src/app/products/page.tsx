import { getInitialLocale } from "@/lib/server-locale";
import { SiteSettingsProvider } from "@/components/store/settings-provider";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { WhatsappFab } from "@/components/store/whatsapp-fab";
import { CartSheet } from "@/components/store/cart-sheet";
import { CheckoutDialog } from "@/components/store/checkout-dialog";
import { ProductDialog } from "@/components/store/product-dialog";
import { ProductsBrowser } from "@/components/store/products-browser";

type PageProps = {
  searchParams?: Promise<{ cat?: string }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const [initialLocale, params] = await Promise.all([getInitialLocale(), searchParams ?? {}]);

  return (
    <SiteSettingsProvider initialLocale={initialLocale}>
      <SiteHeader />

      <main className="flex-1">
        <ProductsBrowser initialCategory={params.cat} />
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
