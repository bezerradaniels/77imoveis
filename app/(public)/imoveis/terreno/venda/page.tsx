import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "terreno", negotiation: "venda", path: "/imoveis/terreno/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
