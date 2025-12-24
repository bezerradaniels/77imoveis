import Seo from "../../../components/common/Seo";
import MyPropertiesList from "../../../features/properties/components/MyPropertiesList";
import { paths } from "../../../routes/paths";

export default function DashboardImoveisCorretor() {
  return (
    <>
      <Seo title="77 Imóveis | Corretor - Meus imóveis" />
      <MyPropertiesList baseEditPath={paths.dashCorretorEdit} newPath={paths.dashCorretorNew} />
    </>
  );
}
