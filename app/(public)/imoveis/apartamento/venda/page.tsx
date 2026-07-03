import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "apartamento", negotiation: "venda", path: "/imoveis/apartamento/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
