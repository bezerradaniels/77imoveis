import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "condominio", negotiation: "venda", path: "/imoveis/condominio/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
