import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "galpao", negotiation: "romaria", path: "/imoveis/galpao/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
