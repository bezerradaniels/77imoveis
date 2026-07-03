import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "sala-comercial", negotiation: "venda", path: "/imoveis/sala-comercial/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
