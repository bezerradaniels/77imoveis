import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ typeSlug: "casa", path: "/imoveis/casa" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
