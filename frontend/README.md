# Six Cities Frontend

Frontend for the Six Cities rental service application. This is a simple HTML/JavaScript application that communicates with the REST API backend.

## Features

### Implemented Scenarios

1. **User Registration** - Users can create new accounts with email, password, and user type (ordinary/pro)
2. **User Login** - Users can login with email and password to get authentication token
3. **User Authentication Check** - The application checks user authentication status on load
4. **View Offers List** - Display paginated list of rental offers on the home page
5. **View Offer Details** - View detailed information about a specific offer including photos and comments
6. **Add Offer** - Authenticated users can create new rental offers
7. **Add Comment** - Authenticated users can add comments to offers
8. **Favorites Management** - Users can add/remove offers to/from their favorites
9. **User Logout** - Users can logout and clear their session

## Project Structure

```
frontend/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── api.js              # API client module
│   └── app.js              # Main application logic
├── package.json            # Project dependencies
└── README.md               # This file
```

## Running the Application

### Prerequisites

- Node.js installed
- The backend API server running on `http://localhost:4000`

### Installation

```bash
cd frontend
npm install
```

### Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Resources

The frontend communicates with the following API endpoints:

### Authentication

- `POST /api/auth/login` - User login (email, password)
- `POST /api/auth/logout` - User logout
- `GET /api/users/me` - Get current user info (requires auth token)

### Users

- `POST /api/users` - Register new user

### Offers

- `GET /api/offers?limit=60` - Get list of offers
- `GET /api/offers/:offerId` - Get offer details
- `POST /api/offers` - Create new offer (requires auth)
- `PATCH /api/offers/:offerId` - Update offer (requires auth, owner only)
- `DELETE /api/offers/:offerId` - Delete offer (requires auth, owner only)
- `GET /api/offers/premium/:city` - Get premium offers for city

### Comments

- `GET /api/offers/:offerId/comments` - Get comments for offer
- `POST /api/comments` - Create comment (requires auth)

### Favorites

- `GET /api/favorites` - Get user's favorite offers (requires auth)
- `POST /api/favorites/:offerId` - Add offer to favorites (requires auth)
- `DELETE /api/favorites/:offerId` - Remove offer from favorites (requires auth)
- `GET /api/favorites/:offerId/check` - Check if offer is in favorites (requires auth)

## Data Structures

### Offer Object

```javascript
{
  id: string,
  title: string,
  description: string,
  publishDate: string,
  city: string,
  previewImage: string,
  images: string[],
  isPremium: boolean,
  isFavorite: boolean,
  rating: number,
  type: 'apartment' | 'house' | 'room' | 'hotel',
  rooms: number,
  guests: number,
  price: number,
  amenities: string[],
  author: {
    id: string,
    email: string,
    firstname: string,
    lastname: string,
    userType: 'ordinary' | 'pro',
    avatarPath?: string
  },
  commentCount: number,
  location: {
    latitude: number,
    longitude: number
  }
}
```

### User Object

```javascript
{
  id: string,
  email: string,
  firstname: string,
  lastname: string,
  userType: 'ordinary' | 'pro',
  avatarPath?: string
}
```

### Comment Object

```javascript
{
  id: string,
  text: string,
  publishDate: string,
  rating: number,
  author: {
    id: string,
    email: string,
    firstname: string,
    lastname: string,
    userType: 'ordinary' | 'pro',
    avatarPath?: string
  }
}
```

## Authentication

The application uses JWT token-based authentication:

1. User logs in with email and password
2. Backend returns a JWT token
3. Token is stored in localStorage
4. Token is sent in Authorization header for protected requests: `Authorization: Bearer <token>`

## Development Notes

- The API client is in `src/api.js` and handles all HTTP requests
- Main application logic is in `src/app.js` with page rendering functions
- HTML/CSS is in `public/index.html`
- The application uses ES6 modules (import/export)
- CORS is handled by the backend which accepts requests from localhost:3000

## Troubleshooting

### "Cannot connect to API"

Make sure:
- Backend API is running on `http://localhost:4000`
- CORS middleware is enabled on the backend
- Frontend is running on `http://localhost:3000`

### "Authentication failed"

Check:
- User credentials are correct
- Backend user registration is working
- JWT_SECRET is configured on the backend

### Token expires

- The application will automatically redirect to login if token is invalid
- Delete localStorage `authToken` to manually clear cached token

## Browser Support

- Modern browsers with ES6 module support
- Chrome, Firefox, Safari, Edge (recent versions)

## Future Enhancements

- Add more detailed error handling
- Implement real-time notifications
- Add photo upload for offers and avatars
- Implement advanced filtering and search
- Add map view for offers
- Implement offer editing functionality
- Add user profile management
