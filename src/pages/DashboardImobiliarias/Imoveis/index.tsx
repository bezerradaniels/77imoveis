import Seo from "../../../components/common/Seo";
import MyPropertiesList from "../../../features/properties/components/MyPropertiesList";
import { paths } from "../../../routes/paths";

export default function DashboardImoveisImobiliaria() {
  return (
    <>
      <Seo title="77 Imóveis | Imobiliária - Meus imóveis" />
      <MyPropertiesList baseEditPath={paths.dashImobiliariaEdit} newPath={paths.dashImobiliariaNew} />
    </>
  );
}
