import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';

interface Props {
  visible: boolean;
  message: string;
  duration?: number;
  onHide: () => void;
}

export default function ToastAlert({
  visible,
  message,
  duration = 2000,
  onHide,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(duration - 400),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setTimeout(onHide, 0));
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, {opacity}]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    backgroundColor: 'rgba(30,30,30,0.85)',
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(14),
    borderRadius: scaleWidth(10),
    maxWidth: '75%',
    zIndex: 9999,
  },
  message: {
    ...textStyle({fontSize: scaleFont(16), color: '#fff'}),
    textAlign: 'center',
    lineHeight: scaleFont(23),
  },
});
