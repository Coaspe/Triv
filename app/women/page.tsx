import ModelPage from "../../components/ModelPage";

const womenModels = [
  { id: "LYR", name: "LEE YU RI", images: ["/images/yul/mm1.jpeg"] },
  { id: "JHN", name: "KIM JI AN", images: ["/images/women/wmodel2.jpg"] },
  { id: "HSJ", name: "HHH SSS JJJ", images: ["/images/women/wmodel3.jpg"] },
  // ... 더 많은 여성 모델 데이터
];

export default function WomenPage() {
  return <ModelPage title="WOMEN" models={womenModels} />;
}
