import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "kitnet", negotiation: "venda", path: "/imoveis/kitnet/venda" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
