import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "lote", negotiation: "venda", path: "/imoveis/lote/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
