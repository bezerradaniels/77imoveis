import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "casa", negotiation: "venda", path: "/imoveis/casa/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
