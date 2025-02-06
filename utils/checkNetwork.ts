import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";

/**
 * Checks for an active internet connection.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the device is connected and has internet access; otherwise, false.
 */

export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const networkState: NetInfoState = await NetInfo.fetch();
    // Check both connection and reachability. Note: isInternetReachable might be null on some platforms.
    const hasInternet: boolean = !!(
      networkState.isConnected && networkState.isInternetReachable !== false
    );

    if (!hasInternet) {
      Toast.show({
        type: "error",
        text1: "Keine Internetverbindung!",
      });
    }

    return hasInternet;
  } catch (error) {
    console.error("Error fetching network state:", error);
    Toast.show({
      type: "error",
      text1: "Fehler beim Überprüfen der Verbindung!",
    });
    return false;
  }
};

/**
 * Sets up a listener for connectivity changes.
 *
 * @param onConnected - Optional callback fired when the device gains an internet connection.
 * @param onDisconnected - Optional callback fired when the device loses its internet connection.
 * @returns {NetInfoSubscription} The subscription function, which should be called to unsubscribe.
 */
export const setupConnectivityListener = (
  onConnected?: () => void,
  onDisconnected?: () => void
): NetInfoSubscription => {
  const subscription = NetInfo.addEventListener((state: NetInfoState) => {
    // Check if the device has an internet connection.
    const hasInternet =
      state.isConnected && state.isInternetReachable !== false;

    if (hasInternet) {
      console.log("Connected to the internet");
      onConnected?.();
    } else {
      console.log("Lost internet connection");
      Toast.show({
        type: "error",
        text1: "Keine Internetverbindung!",
      });
      onDisconnected?.();
    }
  });

  return subscription;
};
