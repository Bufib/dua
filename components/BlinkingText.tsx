import { BlinkingTextProps } from "@/utils/types";
import React, { useEffect, useRef } from "react";
import { Animated, useColorScheme } from "react-native";

const BlinkingText = ({
  text,
  style,
  lightColor = "#057958",
  darkColor = "#2ea853",
  blinkDuration = 500,
  startDelay = 0,
  useTheming = true,
  children,
  textProps = {},
}: BlinkingTextProps) => {
  const colorScheme = useColorScheme();
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Add initial delay if specified
    const initialDelay = startDelay > 0 ? Animated.delay(startDelay) : null;

    const blink = Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: blinkDuration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: blinkDuration,
        useNativeDriver: true,
      }),
    ]);

    // Combine delay with blink animation if delay exists
    const animation = initialDelay
      ? Animated.sequence([initialDelay, Animated.loop(blink)])
      : Animated.loop(blink);

    animation.start();

    return () => {
      opacityAnim.stopAnimation();
    };
  }, [blinkDuration, startDelay]);

  const getThemeColor = () => {
    if (!useTheming) return style?.color;
    return colorScheme === "dark" ? darkColor : lightColor;
  };

  return (
    <Animated.Text
      {...textProps}
      style={[
        style,
        {
          opacity: opacityAnim,
          color: getThemeColor(),
        },
      ]}
    >
      {text || children}
    </Animated.Text>
  );
};
export default BlinkingText;
