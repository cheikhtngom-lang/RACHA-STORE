import { LoginView } from "@/components/account/login-view";
import { getPagePhotos } from "@/lib/get-page-photos";

export default async function LoginPage() {
  const { login } = await getPagePhotos();
  return <LoginView photo={login} />;
}
