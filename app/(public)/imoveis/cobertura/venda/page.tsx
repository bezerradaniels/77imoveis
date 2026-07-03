import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "cobertura", negotiation: "venda", path: "/imoveis/cobertura/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
