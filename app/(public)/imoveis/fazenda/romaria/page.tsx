import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "fazenda", negotiation: "romaria", path: "/imoveis/fazenda/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
