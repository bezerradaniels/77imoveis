import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "terreno", negotiation: "romaria", path: "/imoveis/terreno/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
