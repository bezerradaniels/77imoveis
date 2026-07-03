import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "casa", negotiation: "lancamento", path: "/imoveis/casa/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
