import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "kitnet", negotiation: "lancamento", path: "/imoveis/kitnet/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
