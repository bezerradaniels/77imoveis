import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "loja", negotiation: "romaria", path: "/imoveis/loja/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
