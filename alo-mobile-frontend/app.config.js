import 'dotenv/config';

export default {
  expo: {
    name: "Alo",
    slug: "alo-mobile-frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
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
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#ffffff"
      },
      package: "com.ledonchung398.alomobilefrontend"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: ["expo-secure-store"],
    
    extra: {
      API_URL: process.env.API_URL,
      SOCKET_URL: process.env.SOCKET_URL,
      eas: {
        projectId: "6b0cf9c3-93ec-4d38-8bd7-6a73731ebe3a"
      }
    }
  }
};
