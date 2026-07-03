import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ typeSlug: "cobertura", path: "/imoveis/cobertura" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
