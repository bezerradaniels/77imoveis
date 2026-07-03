import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "chacara", negotiation: "lancamento", path: "/imoveis/chacara/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
