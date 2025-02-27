# AdoptMe

A React Native mobile application for animal adoption, built with Expo and Supabase.

## Features

- User authentication (sign up, login, logout)
- Browse animals available for adoption
- View detailed information about each animal
- Add animals for adoption
- Adopt animals
- User profile management
- View animals you've posted and adopted

## Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Supabase (Authentication, Database, Storage)
- **Navigation**: React Navigation
- **UI Components**: React Native core components, Expo Vector Icons

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/adoptme.git
   cd adoptme
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

5. Use the Expo Go app on your mobile device to scan the QR code, or run on an emulator.

## Database Schema

### Users Table
- id (UUID, primary key)
- email (string)
- name (string)
- phone (string, optional)
- address (string, optional)
- bio (text, optional)
- avatar_url (string, optional)
- created_at (timestamp)
- updated_at (timestamp)

### Animals Table
- id (UUID, primary key)
- name (string)
- species (string)
- breed (string)
- age (integer)
- gender (string)
- description (text, optional)
- size (string, optional)
- color (string, optional)
- image_url (string)
- is_adopted (boolean)
- posted_by (UUID, foreign key to users.id)
- adopted_by (UUID, foreign key to users.id, optional)
- adopted_at (timestamp, optional)
- created_at (timestamp)
- updated_at (timestamp)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the backend services
- [Expo](https://expo.dev/) for the development framework
- [React Navigation](https://reactnavigation.org/) for the navigation system 