export const model_detail_creator = (id: string) => {
  let titleImage = "";
  switch (id) {
    case "JHN":
      titleImage = "/images/men/mmodel1.jpg";
      break;
    case "KJA":
      titleImage = "/images/men/mmodel2.jpg";
      break;
    case "KIN":
      titleImage = "/images/men/mmodel3.jpg";
      break;
    case "BSM":
      titleImage = "/images/women/wmodel1.jpg";
      break;
    case "JHN":
      titleImage = "/images/women/wmodel2.jpg";
      break;
    case "HSJ":
      titleImage = "/images/women/wmodel3.jpg";
      break;
    case "Lara":
      titleImage = "/images/international/im1.jpg";
      break;
    case "Elke":
      titleImage = "/images/international/im2.jpg";
      break;
    case "Kisa":
      titleImage = "/images/international/im3.jpg";
    default:
      titleImage = "/images/yul/mm1.jpeg";
      break;
  }

  const images = [titleImage, "/images/men/mmodel2.jpg", "/images/men/mmodel3.jpg"];

  return {
    id: id,
    name: id,
    height: "180 cm",
    weight: "70 kg",
    size: "280 mm",
    shows: ["2015 서울 패션위크 F/W", "2015 헤라서울패션위크 스테틱패션쇼 F/W", "2014 아시아모델페스타 베트남 하노이시티 F/W"],
    modelingInfo: ["UNIQUE MODEL AGENCY", "RANDA 잡지 화보 촬영 완료", "LOFFICIAL HOMMES 화보 촬영 완료"],
    images,
  };
};
