import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ typeSlug: "condominio", path: "/imoveis/condominio" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
