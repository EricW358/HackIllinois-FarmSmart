import { ExpoConfig } from "expo/config";

// In SDK 46 and lower, use the following import instead:
// import { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: "FarmSmart",
  slug: "Farmer",
  web: {
    favicon: "./assets/favicon.png",
    name: "FarmSmart",
    shortName: "FarmSmart",
    description: "Your AI farming assistant",
  },
};

export default config;
