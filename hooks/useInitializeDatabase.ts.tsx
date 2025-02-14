// // // import { useEffect, useState } from "react";
// // // import { initializeDatabase } from "@/utils/initializeDatabase";

// // // export function useInitializeDatabase() {
// // //   const [initialized, setInitialized] = useState(false);

// // //   useEffect(() => {
// // //     const initialize = async () => {
// // //       try {
// // //         await initializeDatabase();
// // //         console.log("Database initialized successfully.");
// // //         // Mark initialization as complete
// // //         setInitialized(true);
// // //       } catch (error) {
// // //         console.error("Error initializing database:", error);
// // //         setInitialized(false);
// // //       }
// // //     };

// // //     initialize();
// // //   }, []);

// // //   return initialized;
// // // }

// // import { useEffect, useState } from "react";
// // import { AppState } from "react-native";
// // import { initializeDatabase } from "@/utils/initializeDatabase";
// // import NetInfo from "@react-native-community/netinfo";

// // export function useInitializeDatabase() {
// //   const [initialized, setInitialized] = useState(false);

// //   useEffect(() => {
// //     const initialize = async () => {
// //       try {
// //         await initializeDatabase();
// //         console.log("Database initialized successfully.");
// //         setInitialized(true);
// //       } catch (error) {
// //         console.error("Error initializing database:", error);
// //         setInitialized(false);
// //       }
// //     };

// //     // Initial load
// //     initialize();

// //     // Subscribe to AppState changes for re-fetching on resume
// //     const subscription = AppState.addEventListener("change", async (nextAppState) => {
// //       const state = await NetInfo.fetch();
// //       if (nextAppState === "active" && state.isConnected) {
// //         console.log("App resumed. Reinitializing database...");
// //         initialize();
// //       } else if (nextAppState === 'background' || nextAppState === 'inactive') {
// //         console.log("background")
// //       }

// //     });

// //     return () => subscription.remove();
// //   }, []);

// //   return initialized;
// // }

// import { useEffect, useState } from "react";
// import { AppState } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { initializeDatabase } from "@/utils/initializeDatabase";
// import NetInfo from "@react-native-community/netinfo";

// const REFETCH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

// export function useInitializeDatabase() {
//   const [initialized, setInitialized] = useState(false);

//   useEffect(() => {
//     const initialize = async () => {
//       try {
//         await initializeDatabase();
//         console.log("Database initialized successfully.");
//         // Update timestamp after successful initialization
//         await AsyncStorage.setItem("lastFetchTime", Date.now().toString());
//         setInitialized(true);
//       } catch (error) {
//         console.error("Error initializing database:", error);
//         setInitialized(false);
//       }
//     };

//     // Set initial timestamp on mount
//     AsyncStorage.setItem("lastFetchTime", Date.now().toString());

//     // Initial load
//     initialize();

//     // Subscribe to AppState changes for re-fetching on resume
//     const subscription = AppState.addEventListener(
//       "change",
//       async (nextAppState) => {
//         const state = await NetInfo.fetch();

//         if (nextAppState === "active" && state.isConnected) {
//           // Check time elapsed since last fetch
//           const lastFetchTime = await AsyncStorage.getItem("lastFetchTime");
//           const timeSinceLastFetch =
//             Date.now() - parseInt(lastFetchTime || "0");

//           if (timeSinceLastFetch > REFETCH_THRESHOLD) {
//             console.log(
//               "App resumed and threshold exceeded. Reinitializing database..."
//             );
//             initialize();
//           } else {
//             console.log(
//               "App resumed but within threshold. Skipping reinitialization."
//             );
//           }
//         } else if (
//           nextAppState === "background" ||
//           nextAppState === "inactive"
//         ) {
//           console.log("App going to background, updating timestamp");
//           await AsyncStorage.setItem("lastFetchTime", Date.now().toString());
//         }
//       }
//     );
//   }, []);

//   return initialized;
// }

import { useState, useEffect } from "react";
import { initializeDatabase } from "@/utils/initializeDatabase";

export function useInitializeDatabase() {
  const [initialized, setInitialized] = useState(false);
  
  const initialize = async () => {
    try {
      await initializeDatabase();
      console.log("Database initialized successfully.");
      setInitialized(true);
    } catch (error) {
      console.error("Error initializing database:", error);
      setInitialized(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return initialized;
}