import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.maaambika.ratesadmin",
  appName: "Maa Ambika Rates Admin",
  webDir: "dist-android",
  android: {
    webContentsDebuggingEnabled: false,
  },
};

export default config;
