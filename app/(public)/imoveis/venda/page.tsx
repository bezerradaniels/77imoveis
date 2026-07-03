import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ negotiation: "venda", path: "/imoveis/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
