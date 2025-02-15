// import React, { useEffect, useRef } from "react";
// import {
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Button,
//   useColorScheme,
//   Pressable,
//   Text,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { ThemedView } from "@/components/ThemedView";
// import { ThemedText } from "@/components/ThemedText";
// import { coustomTheme } from "@/utils/coustomTheme";
// import { useFetchNews } from "@/hooks/useFetchNews";
// import { NewsItem } from "@/components/NewsItem";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { useAuthStore } from "@/stores/authStore";
// import { router } from "expo-router";
// import NoInternet from "@/components/NoInternet";
// import { FlashList } from "@shopify/flash-list";
// import { NewsItemType } from "@/hooks/useFetchNews";
// import { useSupabaseRealtime } from "@/components/SupabaseRealtimeProvider";
// import { Colors } from "@/constants/Colors";
// import { Image } from "expo-image";
// export default function NewsFeed() {
//   const {
//     allNews: news,
//     isFetchingNextPage,
//     hasNextPage,
//     fetchNextPage,
//     showUpdateButton,
//     handleRefresh: refetch,
//     isRefetching,
//     isLoading,
//   } = useFetchNews();

//   const themeStyles = coustomTheme();
//   const flatListRef = useRef<FlashList<NewsItemType>>(null);
//   const colorScheme = useColorScheme();

//   const handleRefreshAndScroll = async () => {
//     await refetch(); // Fetch the latest news
//     clearNewNewsFlag(); // Clear the "new data" flag
//     flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); // Scroll to the top
//   };

//   const isAdmin = useAuthStore((state) => state.isAdmin);
//   const { hasNewNewsData, clearNewNewsFlag } = useSupabaseRealtime();
//   const ListFooter = () => {
//     if (!hasNextPage) return null;

//     return (
//       <ThemedView style={styles.loadMoreContainer}>
//         {isFetchingNextPage ? (
//           <ActivityIndicator
//             size="small"
//             color={themeStyles.activityIndicator.color}
//           />
//         ) : (
//           <Pressable onPress={() => fetchNextPage()}>
//             <ThemedText style={styles.loadMoreText}>Mehr laden</ThemedText>
//           </Pressable>
//         )}
//       </ThemedView>
//     );
//   };

//   if (isLoading) {
//     return (
//       <SafeAreaView
//         style={[styles.container, themeStyles.defaultBackgorundColor]}
//         edges={["top"]}
//       >
//         <ActivityIndicator
//           size="large"
//           color={themeStyles.activityIndicator.color}
//           style={styles.loader}
//         />
//       </SafeAreaView>
//     );
//   }

//   if (!news || news.length === 0) {
//     return (
//       <SafeAreaView
//         style={[styles.container, themeStyles.defaultBackgorundColor]}
//         edges={["top"]}
//       >
//         <ThemedView style={styles.headerContainer}>
//           <ThemedText style={styles.headerText} type="title">
//             Neuigkeiten
//           </ThemedText>
//           {isAdmin && (
//             <Ionicons
//               name="add-circle-outline"
//               size={35}
//               color={colorScheme === "dark" ? "#fff" : "#000"}
//               style={styles.addIcon}
//               onPress={() => router.push("/news/addNews")}
//             />
//           )}
//         </ThemedView>
//         <ThemedView
//           style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
//         >
//           <ThemedText>Es gibt derzeit noch keine Neuigkeiten!</ThemedText>
//         </ThemedView>
//       </SafeAreaView>
//     );
//   }
//   return (
//     <SafeAreaView
//       style={[styles.container, themeStyles.defaultBackgorundColor]}
//       edges={["top"]}
//     >
//       <NoInternet />
//       {hasNewNewsData && !isAdmin && (
//         <ThemedView style={styles.updateContainer}>
//           <Pressable
//             onPress={handleRefreshAndScroll}
//             style={{
//               flexDirection: "column",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Image
//               source={require("@/assets/images/refresh.png")}
//               style={{ width: 70, height: 70 }}
//             />
//             <ThemedText
//               style={[
//                 styles.newNews,
//                 { color: colorScheme === "dark" ? "#2ea853" : "#057958" },
//               ]}
//             >
//               Neuer Beitrag verfügbar
//             </ThemedText>
//           </Pressable>
//         </ThemedView>
//       )}

//       <ThemedView style={styles.headerContainer}>
//         <ThemedText style={styles.headerText} type="title">
//           Neuigkeiten
//         </ThemedText>
//         {isAdmin && (
//           <Ionicons
//             name="add-circle-outline"
//             size={35}
//             color={colorScheme === "dark" ? "#fff" : "#000"}
//             style={styles.addIcon}
//             onPress={() => router.push("/news/addNews")}
//           />
//         )}
//       </ThemedView>

//       <FlashList
//         ref={flatListRef}
//         data={news}
//         keyExtractor={(item) => item.id.toString()}
//         estimatedItemSize={104}
//         renderItem={({ item }) => (
//           <NewsItem
//             id={item.id}
//             title={item.title ?? ""}
//             body_text={item.body_text ?? ""}
//             image_url={item.image_url ?? []}
//             external_url={item.external_url ?? []}
//             internal_url={item.internal_url ?? []}
//             is_pinned={item.is_pinned}
//             created_at={item.created_at}
//           />
//         )}
//         contentContainerStyle={styles.newsList}
//         onRefresh={refetch} // Trigger `refetch` when pulling down
//         refreshing={isRefetching} // Show a loader when refreshing
//         nestedScrollEnabled={true}
//         ListFooterComponent={ListFooter}
//         ListFooterComponentStyle={styles.footerComponent}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     gap: 10,
//   },
//   headerContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerText: {
//     marginTop: 15,
//     marginHorizontal: 15,
//   },
//   addIcon: {
//     marginRight: 15,
//   },
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   newsList: {
//     padding: 15,
//   },
//   updateContainer: {
//     padding: 10,
//     alignItems: "center",
//   },
//   newNews: {
//     fontWeight: "600",
//   },
//   loadMoreContainer: {
//     alignItems: "flex-end",
//   },
//   loadMoreText: {
//     fontWeight: "700",
//     color: Colors.universal.primary,
//   },
//   footerComponent: {},
// });

import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Text,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { coustomTheme } from "@/utils/coustomTheme";
import { useFetchNews } from "@/hooks/useFetchNews";
import { NewsItem } from "@/components/NewsItem";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { NoInternet } from "@/components/NoInternet";
import { FlashList } from "@shopify/flash-list";
import { NewsItemType } from "@/hooks/useFetchNews";
import { useSupabaseRealtime } from "@/components/SupabaseRealtimeProvider";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";

export default function NewsFeed() {
  const {
    allNews: news,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleRefresh: refetch,
    isRefetching,
    isLoading,
  } = useFetchNews();

  const themeStyles = coustomTheme();
  const flatListRef = useRef<FlashList<NewsItemType>>(null);
  const colorScheme = useColorScheme();

  const handleRefreshAndScroll = async () => {
    await refetch(); // Fetch the latest news
    clearNewNewsFlag(); // Clear the "new data" flag
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); // Scroll to the top
  };

  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { hasNewNewsData, clearNewNewsFlag } = useSupabaseRealtime();

  const ListFooter = () => {
    if (!hasNextPage) return null;
    return (
      <ThemedView style={styles.loadMoreContainer}>
        {isFetchingNextPage ? (
          <ActivityIndicator
            size="small"
            color={themeStyles.activityIndicator.color}
          />
        ) : (
          <Pressable onPress={() => fetchNextPage()}>
            <ThemedText style={styles.loadMoreText}>Mehr laden</ThemedText>
          </Pressable>
        )}
      </ThemedView>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, themeStyles.defaultBackgorundColor]}
        edges={["top"]}
      >
        <ActivityIndicator
          size="large"
          color={themeStyles.activityIndicator.color}
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, themeStyles.defaultBackgorundColor]}
      edges={["top"]}
    >
      <NoInternet showUI={true} showToast={false}/>
      {hasNewNewsData && !isAdmin && (
        <ThemedView style={styles.updateContainer}>
          <Pressable
            onPress={handleRefreshAndScroll}
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("@/assets/images/refresh.png")}
              style={{ width: 70, height: 70 }}
            />
            <ThemedText
              style={[
                styles.newNews,
                { color: colorScheme === "dark" ? "#2ea853" : "#057958" },
              ]}
            >
              Neuer Beitrag verfügbar
            </ThemedText>
          </Pressable>
        </ThemedView>
      )}

      <ThemedView style={styles.headerContainer}>
        <ThemedText style={styles.headerText} type="title">
          Neuigkeiten
        </ThemedText>
        {isAdmin && (
          <Ionicons
            name="add-circle-outline"
            size={35}
            color={colorScheme === "dark" ? "#fff" : "#000"}
            style={styles.addIcon}
            onPress={() => router.push("/news/add")}
          />
        )}
      </ThemedView>

      <FlashList
        ref={flatListRef}
        data={news}
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={104}
        renderItem={({ item }) => (
          <NewsItem
            id={item.id}
            title={item.title ?? ""}
            body_text={item.body_text ?? ""}
            image_url={item.image_url ?? []}
            external_url={item.external_url ?? []}
            internal_url={item.internal_url ?? []}
            is_pinned={item.is_pinned}
            created_at={item.created_at}
          />
        )}
        contentContainerStyle={styles.newsList}
        onRefresh={refetch} // Pull-to-refresh works even when the list is empty
        refreshing={isRefetching}
        nestedScrollEnabled={true}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>Es gibt derzeit noch keine Neuigkeiten!</ThemedText>
          </ThemedView>
        }
        ListFooterComponent={ListFooter}
        ListFooterComponentStyle={styles.footerComponent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 15
  },
  headerText: {
  },
  addIcon: {
    marginRight: 15,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  newsList: {
    padding: 15,
  },
  updateContainer: {
    padding: 10,
    alignItems: "center",
  },
  newNews: {
    fontWeight: "600",
  },
  loadMoreContainer: {
    alignItems: "flex-end",
  },
  loadMoreText: {
    fontWeight: "700",
    color: Colors.universal.primary,
  },
  footerComponent: {},
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
