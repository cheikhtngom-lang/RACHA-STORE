"use client";

import { PageHeader } from "@/components/admin/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "@/components/admin/settings/account-settings";
import { ShopSettings } from "@/components/admin/settings/shop-settings";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader title="Paramètres" description="Votre compte, et les informations de la boutique affichées sur le site." />
      <Tabs defaultValue="compte">
        <TabsList>
          <TabsTrigger value="compte">Mon compte</TabsTrigger>
          <TabsTrigger value="boutique">Boutique</TabsTrigger>
        </TabsList>
        <TabsContent value="compte">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="boutique">
          <ShopSettings />
        </TabsContent>
      </Tabs>
    </>
  );
}
