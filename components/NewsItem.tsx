import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  Pressable,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { coustomTheme } from "@/utils/coustomTheme";
import { NewsItemType } from "@/hooks/useFetchNews";
import { Colors } from "@/constants/Colors";
import { formatDate } from "../utils/formatDate";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import RenderLinkNewsItem from "@/components/RenderLinkNewsItem";
import { useAuthStore } from "../stores/authStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import NewsMenu from "./NewsMenu";
import { Image } from "expo-image";

const screenWidth = Dimensions.get("window").width;
const imageHeight = screenWidth * 1.2;

export const NewsItem = ({
  id,
  title,
  body_text,
  created_at,
  image_url,
  internal_url,
  external_url,
  is_pinned,
}: NewsItemType) => {
  const colorScheme = useColorScheme();
  const themeStyles = coustomTheme();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    setCurrentPage(pageIndex);
  };

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * screenWidth,
      animated: true,
    });
    setCurrentPage(index);
  };

  return (
    <View style={[styles.newsItem, themeStyles.contrast]}>
     
      {is_pinned && (
        <AntDesign
          name="pushpin"
          size={24}
          color={colorScheme === "dark" ? "#fff" : "#000"}
          style={styles.pinIconStyle}
        />
      )}

      {isAdmin && (
        <ThemedView style={styles.newsMenu}>
          <NewsMenu id={id} is_pinned={is_pinned || false} />
        </ThemedView>
      )}
      {title && title.trim() !== "" && (
        <ThemedText style={styles.newsTitle} type="defaultSemiBold">
          {title}
        </ThemedText>
      )}
      {body_text && body_text.trim() !== "" && (
        <ThemedText style={styles.newsContent}>{body_text}</ThemedText>
      )}

      {external_url && external_url.length > 0 && (
        <ThemedView style={styles.linksContainer}>
          {external_url.map((url, index) => (
            <RenderLinkNewsItem
            key={`external-url-${index}-${url}`} 
              url={url}
              index={index}
              isExternal={true}
            />
          ))}
        </ThemedView>
      )}

      {internal_url && internal_url.length > 0 && (
        <ThemedView style={styles.linksContainer}>
          {internal_url.map((url, index) => (
            <RenderLinkNewsItem
            key={`internal-url-${index}-${url}`} 
              url={url}
              index={index}
              isExternal={false}
            />
          ))}
        </ThemedView>
      )}
      {image_url && image_url.length > 0 && (
        <View>
          <FlatList
            ref={flatListRef}
            data={image_url}
            horizontal
            pagingEnabled
            snapToInterval={screenWidth} // Ensure snapping aligns with image width
            snapToAlignment="center"
            decelerationRate="fast" 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.image}
                  contentFit="cover"
                  allowDownscaling={true}
                />
              </View>
            )}
          />
          {/* Dots Pagination */}
          <View style={styles.dotsContainer}>
            {image_url.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => handleDotPress(index)}
              >
                <View
                  style={[
                    styles.dot,
                    currentPage === index ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <ThemedText style={styles.newsDate}>{formatDate(created_at)}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  newsItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    gap: 10,
  },
  pinIconStyle: {
    flex: 1,
    alignSelf: "flex-end",
    transform: [{ rotateY: "180deg" }],
  },
  newsMenu: {
    backgroundColor: "transparent",
    flex: 1,
    alignSelf: "flex-end",
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  newsContent: {
    fontSize: 18,
  },
  linksContainer: {
    backgroundColor: "transparent",
  },
  image: {
    width: screenWidth,
    height: imageHeight,
    borderRadius: 10,
  },
  imageContainer: {
    width: screenWidth,
    height: imageHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#000",
  },
  inactiveDot: {
    backgroundColor: "#A4B0BD",
  },
  newsDate: {
    fontSize: 14,
    color: Colors.universal.fadeColor,
  },
});
