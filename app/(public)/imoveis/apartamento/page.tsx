import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ typeSlug: "apartamento", path: "/imoveis/apartamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
