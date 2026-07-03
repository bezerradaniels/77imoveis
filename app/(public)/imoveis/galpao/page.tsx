import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ typeSlug: "galpao", path: "/imoveis/galpao" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
