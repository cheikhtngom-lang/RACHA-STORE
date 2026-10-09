"use client";

import { PageHeader } from "@/components/admin/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "@/components/admin/settings/account-settings";
import { ShopSettings } from "@/components/admin/settings/shop-settings";
import { HomeSettings } from "@/components/admin/settings/home-settings";
import { PagePhotosSettings } from "@/components/admin/settings/page-photos-settings";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        title="Paramètres"
        description="Votre compte, les informations de la boutique, le bloc mis en avant sur l'accueil et les photos des pages Connexion et Inscription."
      />
      <Tabs defaultValue="compte">
        {/* Défilement horizontal sur téléphone : les quatre onglets ne tiennent pas sur une ligne. */}
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="compte" className="whitespace-nowrap">Mon compte</TabsTrigger>
          <TabsTrigger value="boutique" className="whitespace-nowrap">Boutique</TabsTrigger>
          <TabsTrigger value="accueil" className="whitespace-nowrap">Page d&apos;accueil</TabsTrigger>
          <TabsTrigger value="connexion" className="whitespace-nowrap">Connexion et inscription</TabsTrigger>
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
        <TabsContent value="connexion">
          <PagePhotosSettings />
        </TabsContent>
      </Tabs>
    </>
  );
}
