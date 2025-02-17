import { StyleSheet, View } from "react-native";
import React from "react";
import { ResetPassword } from "@/components/ResetPassword";
const resetPassword = () => {
  return (
    <View style={styles.container}>
      <ResetPassword />
    </View>
  );
};

export default resetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
