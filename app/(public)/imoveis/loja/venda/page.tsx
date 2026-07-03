import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "loja", negotiation: "venda", path: "/imoveis/loja/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
