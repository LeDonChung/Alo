import 'dotenv/config';

export default {
  expo: {
    name: "alo-mobile-frontend",
    slug: "alo-mobile-frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: ["expo-secure-store"],
    
    extra: {
      API_URL: process.env.API_URL,
      SOCKET_URL: process.env.SOCKET_URL,
    }
  }
};
