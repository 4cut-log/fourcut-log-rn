import {Dimensions, Platform, TextStyle} from 'react-native';

const {width, height} = Dimensions.get('window');

// 디자인 기준 사이즈 (iPhone 15 기준)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/**
 * 디바이스 너비에 맞게 수평 스케일
 */
export const scaleWidth = (size: number): number => {
  return Math.round((width / BASE_WIDTH) * size * 100) / 100;
};

/**
 * 디바이스 높이에 맞게 수직 스케일
 */
export const scaleHeight = (size: number): number => {
  const scaled = (height / BASE_HEIGHT) * size;
  const rate = Platform.OS === 'android' ? 0.95 : 1;
  return Math.round(scaled * rate * 100) / 100;
};

/**
 * 디바이스 너비에 맞게 폰트 스케일
 */
export const scaleFont = (size: number): number => {
  return Math.round((width / BASE_WIDTH) * size * 100) / 100;
};

/**
 * 폰트 기본 스타일
 * @param color 기본값 #000000
 * @param fontSize 기본값 14
 * @param fontWeight 기본값 400
 */
export const textStyle = ({
  color = '#000000',
  fontSize = scaleFont(14),
  fontWeight = '400',
  letterSpacing = scaleFont(-0.4),
}: Partial<TextStyle> = {}): TextStyle => {
  return {
    color,
    fontSize,
    fontWeight,
    letterSpacing,
    fontFamily: 'AppleSDGothicNeoR',
    fontStyle: 'normal',
  };
};
