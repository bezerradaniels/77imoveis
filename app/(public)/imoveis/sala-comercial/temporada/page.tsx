import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "sala-comercial", negotiation: "temporada", path: "/imoveis/sala-comercial/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
