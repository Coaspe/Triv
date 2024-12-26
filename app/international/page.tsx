import { ModelDetails } from "@/types";
import ModelPage from "../../components/ModelPage";

const internationalModels: ModelDetails[] = [];

export default function InternationalPage() {
  return <ModelPage title="INTERNATIONAL" models={internationalModels} />;
}
