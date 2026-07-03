import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ negotiation: "romaria", path: "/imoveis/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
