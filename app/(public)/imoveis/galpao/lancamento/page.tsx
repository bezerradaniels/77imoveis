import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "galpao", negotiation: "lancamento", path: "/imoveis/galpao/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
