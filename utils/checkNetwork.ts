// Only for other functions
import NetInfo, { NetInfoState, NetInfoSubscription } from "@react-native-community/netinfo";

export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const networkState: NetInfoState = await NetInfo.fetch();
    return !!(networkState.isConnected && networkState.isInternetReachable !== false);
  } catch (error) {
    console.error("Error fetching network state:", error);
    return false;
  }
};

export const setupConnectivityListener = (
  onConnected?: () => void,
  onDisconnected?: () => void
): NetInfoSubscription => {
  return NetInfo.addEventListener((state: NetInfoState) => {
    const hasInternet = state.isConnected && state.isInternetReachable !== false;
    if (hasInternet) {
      console.log("Connected to the internet");
      onConnected?.();
    } else {
      console.log("Lost internet connection");
      onDisconnected?.();
    }
  });
};