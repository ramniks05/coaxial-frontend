# Learning Management System (LMS)

A modern React-based online learning management system with authentication.

## Features

- 🏠 **Home Page**: Beautiful landing page with features showcase
- 🔐 **Authentication**: Login and registration with email/password
- 📱 **Responsive Design**: Mobile-friendly interface
- 🎨 **Modern UI**: Clean and intuitive user interface
- 📊 **Dashboard**: User dashboard after successful login

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd learning-management-system
```

2. Install dependencies:
```bash
npm install
```


4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── HomePage.js          # Landing page component
│   ├── HomePage.css         # Home page styles
│   ├── LoginPage.js         # Login form component
│   ├── RegisterPage.js      # Registration form component
│   ├── AuthPage.css         # Shared auth page styles
│   ├── Dashboard.js         # User dashboard component
│   └── Dashboard.css        # Dashboard styles
├── App.js                   # Main app component with routing
├── App.css                  # Global app styles
├── index.js                 # App entry point
└── index.css                # Global styles
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technologies Used

- **React 18** - Frontend framework
- **React Router DOM** - Client-side routing
- **CSS3** - Styling with modern features
- **HTML5** - Semantic markup

## Features Overview

### Home Page
- Hero section with call-to-action buttons
- Features showcase
- Navigation to login/register pages
- Responsive design

### Authentication
- Email/password login and registration
- Form validation
- Error handling
- User session management

### Dashboard
- Welcome message with user information
- Feature cards for future functionality
- Logout functionality
- Responsive layout


## Customization

The application is built with modularity in mind. You can easily:

- Add new pages by creating components and adding routes
- Customize the styling by modifying CSS files
- Integrate with backend APIs
- Add more authentication providers
- Extend the dashboard functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
