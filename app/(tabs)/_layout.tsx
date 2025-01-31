// import { Tabs } from "expo-router";
// import React from "react";
// import { HapticTab } from "@/components/HapticTab";
// import { IconSymbol } from "@/components/ui/IconSymbol";
// import TabBarBackground from "@/components/ui/TabBarBackground";
// import { Colors } from "@/constants/Colors";
// import { useColorScheme } from "@/hooks/useColorScheme";
// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//         tabBarBackground: TabBarBackground,

//       }}
//     >
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="house.fill" color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="news"
//         options={{
//           title: "Neuigkeiten",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="newspaper" color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="search"
//         options={{
//           title: "Suche",
//           headerShown: false,
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="magnifyingglass" color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="favorites"
//         options={{
//           title: "Favoriten",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="star.fill" color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="settings"
//         options={{
//           title: "Einstellungen",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="gear.circle" color={color} />
//           ),
//         }}
//       />
//     </Tabs>

//   );
// }

import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { Pressable, View } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="news"
        options={{
          title: "Neuigkeiten",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="newspaper" color={color} />
          ),
        }}
      />

      {/** This is the middle “Add” button. */}
      <Tabs.Screen
        name="user" // the route for "Add" screen / modal
        options={{
          title: "", // you can hide the title
          tabBarLabel: () => null,
          tabBarIcon: () => null, // we’ll render our own icon
          tabBarButton: (props) => {
            return (
              <Pressable
                {...props}
                onPress={() => {
                  // This is where you open your Add screen/modal, e.g.:
                  // router.push("/some-route");
                  // or
                  // router.push("/modal/add-something");
                }}
                style={styles.floatingButtonContainer}
              >
                {/* Add the icon or the symbol you want here */}
                <View style={styles.floatingButton}>
                  <IconSymbol size={28} name="questionmark" color="white" />
                </View>
              </Pressable>
            );
          },
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoriten",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="star.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Einstellungen",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gear.circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -30 }],
    justifyContent: "center",
    alignItems: "center",
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2ea853", // adjust color as needed
    justifyContent: "center",
    alignItems: "center",
    elevation: 4, // gives a small shadow on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
