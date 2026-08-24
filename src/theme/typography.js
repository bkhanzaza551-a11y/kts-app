import { Platform } from 'react-native';

const FONTS = {
  regular: Platform.select({ ios: 'Inter-Regular', android: 'Inter-Regular' }),
  medium: Platform.select({ ios: 'Inter-Medium', android: 'Inter-Medium' }),
  semiBold: Platform.select({ ios: 'Inter-SemiBold', android: 'Inter-SemiBold' }),
  bold: Platform.select({ ios: 'Inter-Bold', android: 'Inter-Bold' }),
};

export const TYPOGRAPHY = {
  h1: { fontFamily: FONTS.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  h2: { fontFamily: FONTS.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontFamily: FONTS.semiBold, fontSize: 20, lineHeight: 26 },
  h4: { fontFamily: FONTS.semiBold, fontSize: 18, lineHeight: 24 },
  body1: { fontFamily: FONTS.regular, fontSize: 16, lineHeight: 22 },
  body2: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
  body3: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16 },
  caption: { fontFamily: FONTS.medium, fontSize: 11, lineHeight: 14, letterSpacing: 0.3 },
  button: { fontFamily: FONTS.semiBold, fontSize: 16, lineHeight: 20, letterSpacing: 0.5 },
  buttonSmall: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 16, letterSpacing: 0.3 },
  tabLabel: { fontFamily: FONTS.medium, fontSize: 11, lineHeight: 14 },
  price: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28 },
  stat: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 32 },
};

export default TYPOGRAPHY;
