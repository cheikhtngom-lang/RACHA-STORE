"use client";

import { PageHeader } from "@/components/admin/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "@/components/admin/settings/account-settings";
import { ShopSettings } from "@/components/admin/settings/shop-settings";
import { HomeSettings } from "@/components/admin/settings/home-settings";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader title="Paramètres" description="Votre compte, les informations de la boutique et le bloc mis en avant sur l'accueil." />
      <Tabs defaultValue="compte">
        <TabsList>
          <TabsTrigger value="compte">Mon compte</TabsTrigger>
          <TabsTrigger value="boutique">Boutique</TabsTrigger>
          <TabsTrigger value="accueil">Page d&apos;accueil</TabsTrigger>
        </TabsList>
        <TabsContent value="compte">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="boutique">
          <ShopSettings />
        </TabsContent>
        <TabsContent value="accueil">
          <HomeSettings />
        </TabsContent>
      </Tabs>
    </>
  );
}
