import { DOYURI, ROBURY, YURI, CREAM, EUNHWA, YUNE, JINI, HYUN, USEONG, SIWOONG, VIN, JAEWOOK } from "./constants";

export const model_detail_creator = (id: string) => {
  switch (id) {
    case "YURI":
      return YURI;
    case "ROBURY":
      return ROBURY;
    case "DOYURI":
      return DOYURI;
    case "CREAM":
      return CREAM;
    case "YUNE":
      return YUNE;
    case "EUNHWA":
      return EUNHWA;
    case "JINI":
      return JINI;
    case "HYUN":
      return HYUN;
    case "USEONG":
      return USEONG;
    case "SIWOONG":
      return SIWOONG;
    case "190BIN":
      return VIN;
    case "JAEWOOK":
      return JAEWOOK;
    default:
      return YURI;
  }
};
