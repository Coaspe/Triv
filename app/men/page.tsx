import { ModelDetails } from "@/types";
import ModelPage from "../../components/ModelPage";

const menModels: ModelDetails[] = [
  { id: "JHN", name: "JOO HA NEUL", images: ["/images/men/mmodel1.jpg"] },
  { id: "KJA", name: "KIM JI AN", images: ["/images/men/mmodel2.jpg"] },
  { id: "KIN", name: "KIM JI AN", images: ["/images/men/mmodel3.jpg"] },
  // ... 더 많은 남성 모델 데이터
];

export default function MenPage() {
  return <ModelPage title="MEN" models={menModels} />;
}
