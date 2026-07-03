import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "apartamento", negotiation: "romaria", path: "/imoveis/apartamento/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
