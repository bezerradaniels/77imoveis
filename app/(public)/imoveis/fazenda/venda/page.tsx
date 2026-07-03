import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "fazenda", negotiation: "venda", path: "/imoveis/fazenda/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
