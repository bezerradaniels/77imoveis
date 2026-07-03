import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "fazenda", negotiation: "lancamento", path: "/imoveis/fazenda/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
