import { RegisterView } from "@/components/account/register-view";
import { getPagePhotos } from "@/lib/get-page-photos";

export default async function RegisterPage() {
  const { signup } = await getPagePhotos();
  return <RegisterView photo={signup} />;
}
