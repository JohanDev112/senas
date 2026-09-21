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
    permissions: ["android.permission.CAMERA", "android.permission.INTERNET"],
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
    "./plugins/withNoCompressWasm",
    [
      "expo-build-properties",
      {
        // el WebView carga el bundle de MediaPipe desde el servidor HTTP
        // local embebido en la app (ver src/ml/localAssetServer.ts), no
        // desde file:// -- Android bloquea trafico HTTP plano por default
        // desde API 28, hay que habilitarlo explicitamente para el
        // loopback (127.0.0.1).
        android: { usesCleartextTraffic: true },
      },
    ],
  ],
  extra: {
    router: {},
    eas: {
      projectId: "71f294a8-c93d-4766-906f-f3668d50145f",
    },
  },
  owner: "johangondev",
};

export default config;
