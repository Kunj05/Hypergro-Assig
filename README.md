## 📌 Authentication Endpoints

### Register a New User
- **Method:** `POST`
- **Endpoint:** `/api/register`
- **Description:** Registers a new user.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
    "token": "eyJhbG...",
    "user": {
        "id": "123...",
        "email": "user@example.com"
    }
}
```

---

### User Login
- **Method:** `POST`
- **Endpoint:** `/api/login`
- **Description:** Authenticates a user and returns an access token.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
    "token": "eyJhbG..."
}
```

---

## 🏠 Property Endpoints

### Create a Property
- **Method:** `POST`
- **Endpoint:** `/api/properties`
- **Description:** Adds a new property to the database.
- **Headers:**  
    `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "title": "Modern Apartment",
    "price": 250000,
    "location": "New York",
    "bedrooms": 2,
    "bathrooms": 1,
    "amenities": ["pool", "gym"],
    "tags": ["modern", "city-view"]
}
```

**Response (200 OK):**
```json
{
    "_id": "123...",
    "title": "Modern Apartment",
    "price": 250000,
    "location": "New York",
    "bedrooms": 2,
    "bathrooms": 1,
    "amenities": ["pool", "gym"],
    "tags": ["modern", "city-view"]
}
```

---

### Get All Properties
- **Method:** `GET`
- **Endpoint:** `/api/properties`
- **Description:** Retrieves a list of all properties.

**Response (200 OK):**
```json
[
    {
        "_id": "123...",
        "title": "Modern Apartment",
        "price": 250000
        // ...
    },
    {
        "_id": "124...",
        "title": "Cozy House",
        "price": 180000
        // ...
    }
]
```

---

### Get Property by ID
- **Method:** `GET`
- **Endpoint:** `/api/properties/:id`
- **Description:** Retrieves a specific property by its ID.

**Response (200 OK):**
```json
{
    "_id": "123...",
    "title": "Modern Apartment",
    "price": 250000
    // ...
}
```

---

### Update Property
- **Method:** `PUT`
- **Endpoint:** `/api/properties/:id`
- **Description:** Updates an existing property using its ID.
- **Headers:**  
    `Authorization: Bearer <token>`

**Request Body:**  
_Same as Create a Property_

**Response (200 OK):**
```json
{
    "message": "Property updated successfully"
}
```

---

### Delete Property
- **Method:** `DELETE`
- **Endpoint:** `/api/properties/:id`
- **Description:** Deletes a property by ID.
- **Headers:**  
    `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
    "message": "Property deleted"
}
```

---

## 🔍 Filtering Endpoint

### Advanced Property Filtering
- **Method:** `GET`
- **Endpoint:** `/api/filter`
- **Description:** Returns properties matching specific filter criteria.
- **Example:**  
    `GET /api/filter?minPrice=100000&maxPrice=300000&bedrooms=2`
- **Headers:**  
    `Authorization: Bearer <token>`

**Response (200 OK):**
```json
[
    {
        "id": "123...",
        "title": "Modern Apartment",
        "price": 250000
        // ...
    }
]
```

---

## ❤️ Favorites Endpoints

### Add to Favorites
- **Method:** `POST`
- **Endpoint:** `/api/favorites/:propertyId`
- **Description:** Adds the specified property to the user's favorites.
- **Headers:**  
    `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
    "message": "Property added to favorites"
}
```

---

### Get User's Favorites
- **Method:** `GET`
- **Endpoint:** `/api/favorites`
- **Description:** Retrieves the user's list of favorite properties.
- **Headers:**  
    `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
    "favorites": [
        {
            "id": "123...",
            "title": "Modern Apartment"
            // ...
        }
    ]
}
```

---

### Remove from Favorites
- **Method:** `DELETE`
- **Endpoint:** `/api/favorites/:propertyId`
- **Description:** Removes the specified property from the user's favorites.
- **Headers:**  
    `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
    "message": "Removed from favorites successfully"
}
```

---

## 🔎 User Search Endpoint

### Search Users by Email
- **Method:** `GET`
- **Endpoint:** `/api/users/search?email=<email>`
- **Description:** Searches for users by email address.

**Example:**  
`GET /api/users/search?email=user1@gmail.com`

**Response (200 OK):**
```json
{
    "message": "User found"
}
```

---

## 📢 Recommendations Feature Endpoints

### Recommend a Property
- **Method:** `POST`
- **Endpoint:** `/api/recommend/:recipientEmail/:propertyId`
- **Description:** Sends a property recommendation to a user via their email.

**Example:**  
`POST /api/recommend/user1@gmail.com/PROP2100`

**Response (200 OK):**
```json
{
    "message": "Recommendation sent successfully"
}
```

---

### Get Received Recommendations
- **Method:** `GET`
- **Endpoint:** `/api/recommendations`
- **Description:** Retrieves all property recommendations received by the user.

**Response (200 OK):**
```json
[
    {
        "_id": "323",
        "propid": "PROP2332",
        "userid": "22132"
    }
]
```