import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";


export const useConnectionStatus = () => {
  const [hasInternet, setHasInternet] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const networkState = await NetInfo.fetch();
        const isConnected = Boolean(networkState.isConnected && networkState.isInternetReachable !== false);
        setHasInternet(isConnected);
      } catch (error) {
        console.error("Error checking connection:", error);
        setHasInternet(false);
      }
    };

    checkConnection();
    
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = Boolean(state.isConnected && state.isInternetReachable !== false);
      setHasInternet(isConnected);
    });

    return () => unsubscribe();
  }, []);

  return hasInternet;
};