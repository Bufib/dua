import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import addPushMessage from "./addPushMessage";
import addNews from "./addNews";
import { useWindowDimensions } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { coustomTheme } from "@/utils/coustomTheme";
import { Colors } from "@/constants/Colors";

const add = () => {
  const renderScene = SceneMap({
    addNews: addNews,
    addPush: addPushMessage,
  });

  const routes = [
    { key: "addNews", title: "Neue Nachricht" },
    { key: "addPush", title: "Push-Benachrichtigung" },
  ];

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const themeStyles = coustomTheme();
  return (
    <SafeAreaView
      style={[styles.container, themeStyles.defaultBackgorundColor]}
      edges={["top"]}
    >
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={{borderTopRightRadius: 2, borderTopLeftRadius: 2}}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ backgroundColor: Colors.universal.primary }} // Header background color
            indicatorStyle={{ backgroundColor: "red", height: 4 }}
            // Active tab underline color
          />
        )}
      />
    </SafeAreaView>
  );
};

export default add;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
