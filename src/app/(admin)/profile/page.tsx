import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProfileForm from "@/components/profile/ProfileForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Ayarları | EnesOzen Affilate",
  description: "Profil bilgilerini düzenle",
};

export default async function ProfilePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Profil Ayarları" />
      </div>
      <ProfileForm />
    </div>
  );
}




