import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "kitnet", negotiation: "romaria", path: "/imoveis/kitnet/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
