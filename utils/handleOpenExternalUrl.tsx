import { Linking } from "react-native";
import Toast from "react-native-toast-message";

const handleOpenExternalUrl = async (url: string) => {
  if (!url) return;

  try {
    Toast.show({
      type: "info",
      text1: "Link wird geöffnet",
      position: "bottom",
      visibilityTime: 1000,
    });

    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      Toast.show({
        type: "error",
        text1: "URL wird nicht unterstützt",
        position: "bottom",
      });
    }
  } catch (error) {
    console.error("Fehler beim Öffnen der URL:", error);
    Toast.show({
      type: "error",
      text1: "Fehler beim Öffnen der URL",
      position: "bottom",
      
    });
  }
};

export default handleOpenExternalUrl;