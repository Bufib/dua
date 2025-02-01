import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { Pressable, View } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        headerTintColor: colorScheme === "dark" ? "#d0d0c0" : "#000",
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
        name="user"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => {
            return (
              <Pressable
                {...props}
                onPress={() => {
                  if (isLoggedIn) {
                    router.push("/(askQuestion)");
                  } else {
                    router.push("/(auth)/login");
                  }
                }}
                style={styles.floatingButtonContainer}
              >
                {/* Add the icon or the symbol you want here */}
                <View style={styles.floatingButton}>
                  <MaterialCommunityIcons
                    name="account-question-outline"
                    size={26}
                    color="#fff"
                    style={{ marginLeft: 5 }} // Align in middle
                  />
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
    bottom: 15,
    left: "50%",
    // This shifts the element 30 pixels to the left. Since we set `left: "50%"`,
    // the element's left edge is positioned in the middle of the screen, not its center.
    // Translating by -30px (half of 60px width) ensures the element's center
    // lines up exactly with the screen's center.

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
    borderWidth: 1,
    borderColor: "#057958",
  },
});
