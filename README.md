# FarmSmart

FarmSmart is an AI-powered farming assistant application designed to help farmers optimize crop management, access weather insights, and implement agricultural best practices. The application provides personalized recommendations, analytics, and a chat interface for interacting with the AI assistant.

![FarmSmart Logo](assets/farmsmart-logo.png)

## Features

- **AI Chat Assistant**: Get instant answers to farming questions, crop management advice, and agricultural best practices
- **Farm Analytics**: Visualize farm data with interactive charts and graphs
- **Weather Insights**: Access real-time weather data and forecasts relevant to farming
- **Satellite Mapping**: View satellite imagery of farm locations with the "@plot" command
- **Image Analysis**: Upload images of crops or soil for AI analysis
- **Markdown Formatting**: Clean, readable responses with proper formatting and highlighting
- **Cross-Platform**: Works on iOS, Android, and Web platforms

## Tech Stack

- React Native / Expo
- TypeScript
- Supabase for backend services
- React Native Paper for UI components
- Expo Location for geolocation services
- React Native Maps for satellite mapping
- Markdown rendering for formatted responses
- Linear Gradient for UI styling

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

For iOS development:

- macOS
- Xcode

For Android development:

- Android Studio
- Java Development Kit (JDK)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/mridhanbalaji/FarmSmart.git
cd FarmSmart
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Run the Application

#### For Development

```bash
# Start the Expo development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Run on Web
npx expo start:web
```

#### For Production Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for Web
npx expo export:web
```

## Project Structure

```
FarmSmart/
├── app/                  # Main application screens
│   ├── (main)/           # Main screens (authenticated)
│   │   ├── chat/         # Chat interface
│   │   ├── analytics/    # Farm analytics
│   │   └── settings/     # User settings
│   └── (auth)/           # Authentication screens
├── assets/               # Static assets
├── components/           # Reusable components
│   ├── FarmAnalyticsCharts.tsx
│   ├── SatelliteMap.tsx
│   └── ChartWrapper.tsx
├── hooks/                # Custom React hooks
│   └── useChat.ts        # Chat functionality hook
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── app.json              # Expo configuration
├── app.config.js         # Dynamic Expo configuration
└── babel.config.js       # Babel configuration
```

## Features in Detail

### AI Chat Assistant

The chat interface allows users to interact with the AI assistant by typing questions or uploading images. The assistant provides responses formatted with markdown for readability.

Special commands:

- `@plot [address]` - Displays a satellite map of the specified address

### Farm Analytics

The analytics feature provides visual representations of farm data, including:

- Crop yields
- Profit projections
- Cost analysis
- Growth trends

### Satellite Mapping

Users can view satellite imagery of specific locations by using the `@plot` command followed by an address in the chat interface.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Expo](https://expo.dev/) for the development framework
- [Supabase](https://supabase.io/) for backend services
- [React Native Paper](https://callstack.github.io/react-native-paper/) for UI components
- [React Native Maps](https://github.com/react-native-maps/react-native-maps) for mapping functionality
