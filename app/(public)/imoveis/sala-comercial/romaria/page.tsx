import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "sala-comercial", negotiation: "romaria", path: "/imoveis/sala-comercial/romaria" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
