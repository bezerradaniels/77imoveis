import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "galpao", negotiation: "venda", path: "/imoveis/galpao/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
