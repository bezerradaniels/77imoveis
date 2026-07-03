import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ typeSlug: "lote", path: "/imoveis/lote" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
