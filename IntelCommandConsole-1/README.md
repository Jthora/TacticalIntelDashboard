# IntelCommandConsole

## Overview
IntelCommandConsole is a modular React application designed for visualizing and managing feeds in a tactical intelligence dashboard. The application features a user-friendly interface with a sidebar for feed selection, a refined feed visualizer, and settings management.

## Project Structure
The project is organized into several key directories and files:

- **src/**: Contains the main application code.
  - **App.tsx**: The main entry point of the application, setting up routing and layout.
  - **App.css**: Styles for the main application layout.
  - **assets/**: Static assets including images and styles.
  - **components/**: Reusable components such as FeedItem, FeedVisualizer, and Sidebar.
  - **controllers/**: Logic for managing feeds.
  - **models/**: Data models defining the structure of feeds.
  - **pages/**: Page components for HomePage, SettingsPage, and FeedPage.
  - **routes/**: Routing logic for the application.
  - **services/**: API calls and data fetching for feeds.
  - **types/**: TypeScript type definitions used throughout the application.

## Features
- **HomePage**: Displays the FeedVisualizer and Sidebar for feed selection.
- **SettingsPage**: Allows users to manage feeds and their settings.
- **Sidebar**: Provides navigation for selecting different feeds.
- **FeedVisualizer**: Visualizes the feeds in a user-friendly manner.
- **Persistent Storage**: Utilizes local storage to maintain the list of feeds across sessions.

## Getting Started
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd IntelCommandConsole
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.