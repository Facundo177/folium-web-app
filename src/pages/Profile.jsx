import UserProfile from "../components/ProfileComponents/UserProfile";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export const Profile = () => {
  useDocumentMetadata({
    title: "Mi Perfil de Lector",
    description: "Configuración y datos personales de tu cuenta en Folium.",
  });

  return (
    <div className="mt-6">
      <UserProfile />
    </div>
  );
};

export default Profile;
