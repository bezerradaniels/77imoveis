import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ typeSlug: "loja", path: "/imoveis/loja" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
