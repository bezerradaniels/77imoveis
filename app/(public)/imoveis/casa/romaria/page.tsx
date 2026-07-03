import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "casa", negotiation: "romaria", path: "/imoveis/casa/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
