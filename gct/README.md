# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


# Trello to Google Chat Bridge

A secure application that connects Trello cards to Google Chat spaces, allowing you to send card information directly to Google Chat channels. This application has been redesigned from a single-file HTML application to a secure, modern React application with a proper backend.

## Security Improvements

The original application had several security issues:
- Hardcoded API keys and tokens in the frontend
- Hardcoded webhook URLs exposed to all users
- No authentication or authorization

This new version addresses these issues by:
- Moving all sensitive data to environment variables on the server
- Adding user authentication with JWT
- Storing webhook URLs securely in a database
- Implementing proper authorization checks

## Project Structure

### Frontend (React)
```
trello-to-chat-app/
├── public/
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── TrelloList.js
│   │   ├── TrelloCard.js
│   │   ├── CardModal.js
│   │   ├── SearchBar.js
│   │   └── [CSS files]
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   └── index.js
├── .env
└── package.json
```

### Backend (Node.js/Express)
```
server/
├── server.js
├── models/
│   ├── User.js
│   └── Webhook.js
├── routes/
│   ├── auth.js
│   ├── trello.js
│   └── googleChat.js
├── middleware/
│   └── auth.js
├── .env
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- MongoDB installed and running
- Trello API key and token
- Google Chat webhook URLs

### Backend Setup
1. Clone the repository
2. Navigate to the server directory
3. Install dependencies: `npm install`
4. Create a `.env` file based on the template
5. Start the server: `npm start`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Create a `.env` file with `REACT_APP_API_URL=http://localhost:5000` (or your server URL)
4. Start the development server: `npm start`

## Deployment

### For Development
- Frontend: `npm start` (runs on http://localhost:3000)
- Backend: `npm start` (runs on http://localhost:5000)

### For Production
1. Build the frontend: `npm run build`
2. Serve the static files using Nginx or Apache
3. Run the backend with PM2 or similar process manager

## Features

- **Authentication**: Secure login system
- **Dashboard**: View Trello boards and lists
- **Search**: Search for cards by title, description, or labels
- **Card Details**: View card details including labels and due dates
- **Send to Chat**: Send card information to Google Chat channels
- **Webhook Management**: Add, edit, and manage Google Chat webhooks

## Security Best Practices

1. **Environment Variables**: All sensitive information is stored in environment variables
2. **JWT Authentication**: Secure user authentication with JWT tokens
3. **HTTPS**: Ensure you deploy with HTTPS for secure communication
4. **Input Validation**: Server-side validation of all inputs
5. **Rate Limiting**: Implement rate limiting to prevent abuse (add this in production)

## Adding New Google Chat Webhooks

1. Login to the application
2. Go to the Webhooks section (to be implemented)
3. Add a new webhook with a name and the webhook URL from Google Chat

Remember to keep your `.env` files secure and never commit them to version control!