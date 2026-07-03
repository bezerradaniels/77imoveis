import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "terreno", negotiation: "lancamento", path: "/imoveis/terreno/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
