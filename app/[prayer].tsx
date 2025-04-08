import { StyleSheet, View } from "react-native";
import React from "react";
import RenderPrayer from "@/components/RenderPrayer";
import { useLocalSearchParams } from "expo-router";

const Prayer = () => {
  const params = useLocalSearchParams();
  // Normalize prayerID: if it's an array, take the first element, otherwise use it directly
  const prayerID = Array.isArray(params.prayerID) ? params.prayerID[0] : params.prayerID;

  return (
    <View style={styles.container}>
      <RenderPrayer prayerID={prayerID} />
    </View>
  );
};

export default Prayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
