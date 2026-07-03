import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "kitnet", negotiation: "temporada", path: "/imoveis/kitnet/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
