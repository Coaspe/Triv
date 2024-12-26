import { ModelDetails } from "@/types";
import ModelPage from "../../components/ModelPage";
import { JINI, HYUN, USEONG, SIWOONG, VIN } from "@/constants";

const menModels: ModelDetails[] = [JINI, HYUN, USEONG, SIWOONG, VIN];

export default function MenPage() {
  return <ModelPage title="MEN" models={menModels} />;
}
