import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap | EnesOzen AffilatePro",
  description: "EnesOzen AffilatePro Giriş Sayfası",
};

export default function SignIn() {
  return <SignInForm />;
}
