import { Sizes } from "./types";
  
  export const returnSize = (width: number, height: number): Sizes => {
    const isLarge = width > 380 && height > 900;
    const isMedium = width < 380 && height > 750;
  
    return {
      elementSize: isLarge ? 120 : isMedium ? 110 : 90,
      fontSize: isLarge ? 13 : isMedium ? 12 : 11,
      iconSize: isLarge ? 65 : isMedium ? 60 : 50,
      imageSize: isLarge ? 300 : isMedium ? 250 : 200,
      gap: isLarge ? 30 : isMedium ? 20 : 15
    };
  };


  // Old sizes
    /*  const elementSize = width > 380 ? 120 : 110; // Size of each small square
  const fontSize = width > 380 ? 13 : 12; // Font of element text
  const iconSize = width > 380 ? 65 : 60; // Icon in element
  const imageSize = width > 380 ? 300 : 250; // Header image
  const gap = width > 380 ? 30 : 20; // Header image gap
  */