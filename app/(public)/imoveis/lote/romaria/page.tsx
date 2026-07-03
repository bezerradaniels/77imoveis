import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "lote", negotiation: "romaria", path: "/imoveis/lote/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
