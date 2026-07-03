import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "chacara", negotiation: "venda", path: "/imoveis/chacara/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
