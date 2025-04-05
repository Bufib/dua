import i18n from "./i18n";
import { CategoryItem } from "./types";

// Prayer categories using translations
export const categories: CategoryItem[] = [
  {
    id: 0,
    title: i18n.t("dua"),
    image: require("@/assets/images/dua.png"),
    value: "Dua",
  },
  {
    id: 1,
    title: i18n.t("salat"),
    image: require("@/assets/images/salat.png"),
    value: "Salat",
  },
  {
    id: 2,
    title: i18n.t("ziyarat"),
    image: require("@/assets/images/ziyarat.png"),
    value: "Ziyarat",
  },

  {
    id: 3,
    title: i18n.t("munajat"),
    image: require("@/assets/images/munajat.png"),
    value: "Munajat",
  },
  {
    id: 4,
    title: i18n.t("special"),
    image: require("@/assets/images/special.png"),
    value: "Special",
  },
  {
    id: 5,
    title: i18n.t("tasbih"),
    image: require("@/assets/images/tasbih.png"),
    value: "Tasbih",
  },
  {
    id: 6,
    title: i18n.t("names"),
    image: require("@/assets/images/names.png"),
    value: "Names",
  },
];
