import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Manos LSM",
  slug: "manos-lsm",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "manoslsm",
  userInterfaceStyle: "dark",
  backgroundColor: "#14111C",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.manoslsm.app",
    infoPlist: {
      NSCameraUsageDescription:
        "Manos LSM usa la camara para reconocer letras y palabras de Lengua de Senas Mexicana en tiempo real.",
    },
  },
  android: {
    package: "com.manoslsm.app",
    adaptiveIcon: {
      backgroundColor: "#14111C",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    permissions: ["android.permission.CAMERA"],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-splash-screen",
    [
      "expo-camera",
      {
        cameraPermission:
          "Manos LSM usa la camara para reconocer letras y palabras de Lengua de Senas Mexicana en tiempo real.",
      },
    ],
    "./plugins/withMediapipeAssets",
  ],
  extra: {
    router: {},
  },
};

export default config;
