import { ModelDetails } from "@/types";
import ModelPage from "../../components/ModelPage";

const internationalModels: ModelDetails[] = [
  { id: "Lara", name: "ALEX SMITH", images: ["/images/international/im1.jpg"] },
  { id: "Elke", name: "MARIA GARCIA", images: ["/images/international/im2.jpg"] },
  { id: "Kisa", name: "MARIA GARCIA", images: ["/images/international/im3.jpg"] },
];

export default function InternationalPage() {
  return <ModelPage title="INTERNATIONAL" models={internationalModels} />;
}
