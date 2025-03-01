# Smart Farming Chatbot

## Overview 🌱

A sophisticated chatbot application designed to empower farmers with AI-driven insights. The application collects farm-related data, processes it using OpenAI's GPT-4, and delivers actionable recommendations through an interactive interface featuring text, charts, graphs, and tables.

## Tech Stack 🛠️

- **Frontend**:
  - React Native with TypeScript
  - Expo & Expo Router
  - React Native Paper (UI Framework)
- **Backend**:
  - Supabase
- **AI Engine**:
  - OpenAI GPT-4

## Application Flow 🔄

### 1. Authentication Flow

#### Welcome Screen

- Initial welcome message
- Options to Sign Up or Sign In
- Navigation to respective authentication pages

#### Sign-Up Process

- Required information:
  - Full Name
  - Email Address
  - Password
- Account creation in Supabase
- Automatic redirection to Chatbot interface

#### Sign-In Process

- Required credentials:
  - Email
  - Password
- Supabase authentication
- Seamless redirection to Chatbot interface

### 2. Core Chatbot Interface

#### Chat Features

- Intuitive chat UI
- Dynamic conversation flow
- Interactive input collection
- Multi-format response display

#### Input Collection System

The chatbot systematically gathers essential farm data:

- Field information (name/location)
- Budget constraints
- Available equipment
- Current fertilizers & pesticides inventory
- Pesticide usage preferences
- Crop details (types & varieties)

#### AI Processing Capabilities

- Structured prompt engineering with GPT-4
- Advanced soil analysis using geolocation
- Comprehensive recommendations for:
  - Tillage methodologies
  - Fertilizer & pesticide selection
  - Weekly maintenance schedules
  - Yield predictions
  - ROI analysis

#### Visual Data Presentation

Responses are enriched with:

- Interactive charts
- Detailed tables
- Analytical graphs
- Visual recommendations

#### Additional Features

- Image upload functionality
- Conversation history
- Real-time support

## Database Architecture 📊

### Users Table

| Column     | Type      | Description           |
| ---------- | --------- | --------------------- |
| id         | UUID      | Unique identifier     |
| name       | String    | User's full name      |
| email      | String    | Unique email address  |
| password   | String    | Encrypted password    |
| created_at | Timestamp | Account creation date |
| updated_at | Timestamp | Last update timestamp |

### Conversations Table

| Column      | Type      | Description                         |
| ----------- | --------- | ----------------------------------- |
| id          | UUID      | Unique identifier                   |
| user_id     | UUID      | User reference                      |
| messages    | JSON      | Conversation history with farm data |
| created_at  | Timestamp | Creation timestamp                  |
| updated_at  | Timestamp | Last message timestamp              |
| title       | String    | Conversation title                  |
| is_archived | Boolean   | Archive status                      |

## Project Structure 📁

```
smart-farming-chatbot/
├── app/                      # Main application directory
│   ├── _layout.tsx          # Root layout component
│   ├── index.tsx            # Entry point
│   ├── (auth)/              # Authentication routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (main)/             # Main app routes
│   │   ├── chat/
│   │   ├── profile/
│   │   └── settings/
│   └── api/                # API route handlers
├── assets/                 # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
├── components/            # Reusable components
│   ├── common/           # Shared components
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Card/
│   ├── chat/            # Chat-specific components
│   ├── farm/            # Farm-related components
│   └── layout/          # Layout components
├── constants/           # Application constants
│   ├── theme.ts
│   ├── config.ts
│   └── api.ts
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useChat.ts
│   └── useFarm.ts
├── services/          # API and external services
│   ├── api/
│   ├── supabase/
│   └── openai/
├── store/            # State management
│   ├── auth/
│   ├── chat/
│   └── farm/
├── types/           # TypeScript type definitions
├── utils/          # Utility functions
├── .env           # Environment variables
├── app.json      # Expo config
├── babel.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Navigation Structure 🗺️

```
WelcomeScreen
├── SignUpScreen
├── SignInScreen
└── ChatbotScreen
```
