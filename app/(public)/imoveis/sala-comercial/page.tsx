import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ typeSlug: "sala-comercial", path: "/imoveis/sala-comercial" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
