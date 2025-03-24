/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Color palette for the Gompile app
 * 
 * Color codes:
 * - 952727: Deep Red
 * - F5BD42: Yellow Gold
 * - 3B79B8: Blue
 * - 12141F: Dark Navy (background)
 * - 2D314C: Navy Purple
 * - ACB8C2: Light Gray
 * - ECECEC: Almost White
 */

const primaryColor = '#952727';
const secondaryColor = '#F5BD42';
const accentColor = '#3B79B8';

export const Colors = {
  light: {
    text: '#12141F',
    background: '#ECECEC',
    tint: primaryColor,
    tabIconDefault: '#ACB8C2',
    tabIconSelected: primaryColor,
    card: '#FFFFFF',
    border: '#ACB8C2',
    notification: '#952727',
    success: '#3B79B8',
    warning: '#F5BD42',
    error: '#952727',
    info: '#3B79B8',
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    placeholder: '#ACB8C2',
    navyPurple: '#2D314C'
  },
  dark: {
    text: '#ECECEC',
    background: '#12141F',
    tint: secondaryColor,
    tabIconDefault: '#2D314C',
    tabIconSelected: secondaryColor,
    card: '#2D314C',
    border: '#3B79B8',
    notification: '#952727',
    success: '#3B79B8',
    warning: '#F5BD42',
    error: '#952727',
    info: '#3B79B8',
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    placeholder: '#ACB8C2',
    darkNavy: '#12141F',
    navyPurple: '#2D314C',
    lightGray: '#ACB8C2',
    almostWhite: '#ECECEC'
  },
};
