import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "chacara", negotiation: "romaria", path: "/imoveis/chacara/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
