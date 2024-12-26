import { ModelDetails } from "@/types";
import ModelPage from "../../components/ModelPage";
import { ROBURY, YURI, DOYURI, CREAM, EUNHWA } from "@/constants";

const womenModels: ModelDetails[] = [YURI, ROBURY, DOYURI, CREAM, EUNHWA];

export default function WomenPage() {
  return <ModelPage title="WOMEN" models={womenModels} />;
}
