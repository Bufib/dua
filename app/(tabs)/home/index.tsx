// import * as React from "react";
// import { StyleSheet } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { ScrollView } from "react-native";
// import QuestionLinks from "@/components/QuestionLinks";
// import { coustomTheme } from "@/utils/coustomTheme";

// export default function index() {
//   const themeStyles = coustomTheme();
//   return (
//     <SafeAreaView
//       edges={["top"]}
//       style={[styles.container, themeStyles.defaultBackgorundColor]}
//     >
//       <ScrollView
//         style={[styles.scrollViewStyles, themeStyles.defaultBackgorundColor]}
//         contentContainerStyle={styles.scrollViewContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <QuestionLinks />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollViewStyles: {
//     flex: 1,
//   },
//   scrollViewContent: {
//     paddingTop: 20,
//     paddingBottom: 10,
//   },
// });

import * as React from "react";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native";
import QuestionLinks from "@/components/QuestionLinks";
import { coustomTheme } from "@/utils/coustomTheme";

export default function index() {
  const themeStyles = coustomTheme();
  return <QuestionLinks />;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
