import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ typeSlug: "kitnet", path: "/imoveis/kitnet" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
