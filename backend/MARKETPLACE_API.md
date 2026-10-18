# NavaKrishi Marketplace API Documentation

## Base URL
```
http://127.0.0.1:8000/api
```

## Authentication
All endpoints that modify data (POST, PUT, PATCH, DELETE) require authentication using JWT tokens.
Include the token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

---

## Endpoints

### Categories

#### List All Categories
```
GET /categories/
```
**Query Parameters:** None

**Response:**
```json
[
  {
    "id": 1,
    "name": "Vegetables",
    "description": "Fresh vegetables from local farmers",
    "icon": "🥬",
    "created_at": "2024-05-21T10:30:00Z"
  }
]
```

#### Get Single Category
```
GET /categories/{id}/
```

**Response:**
```json
{
  "id": 1,
  "name": "Vegetables",
  "description": "Fresh vegetables from local farmers",
  "icon": "🥬",
  "created_at": "2024-05-21T10:30:00Z"
}
```

---

### Products

#### List All Products
```
GET /products/
```

**Query Parameters:**
- `category` (int): Filter by category ID
- `min_price` (decimal): Minimum price filter
- `max_price` (decimal): Maximum price filter
- `search` (string): Search by title or description
- `farmer` (int): Filter by farmer ID

**Example:**
```
GET /products/?category=1&min_price=2&max_price=10&search=tomato
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Heirloom Tomatoes",
    "farmer": {
      "id": 1,
      "username": "green_valley_farms",
      "email": "green_valley@example.com",
      "first_name": "Green",
      "last_name": "Valley"
    },
    "category": {
      "id": 1,
      "name": "Vegetables",
      "description": "Fresh vegetables from local farmers",
      "icon": "🥬",
      "created_at": "2024-05-21T10:30:00Z"
    },
    "description": "Beautiful heirloom tomatoes with rich, complex flavors",
    "price": "4.50",
    "unit": "lb",
    "quantity_available": 100,
    "image": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
    "badge": "Organic Certified",
    "badge_color": "bg-[#dff5d8] text-[#267320]",
    "rating": 4.8,
    "reviews": 124,
    "is_active": true,
    "created_at": "2024-05-21T10:30:00Z",
    "updated_at": "2024-05-21T10:30:00Z"
  }
]
```

#### Get Single Product
```
GET /products/{id}/
```

**Response:** Single product object (see above)

#### Create Product (Farmer Only)
```
POST /products/
```

**Required Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Organic Tomatoes",
  "category_id": 1,
  "description": "Fresh organic tomatoes",
  "price": "5.00",
  "unit": "lb",
  "quantity_available": 50,
  "image": "https://example.com/image.jpg",
  "badge": "Organic Certified",
  "badge_color": "bg-[#dff5d8] text-[#267320]",
  "is_active": true
}
```

**Response:** Created product object with id

#### Update Product (Farmer Only)
```
PUT /products/{id}/
PATCH /products/{id}/
```

**Request Body:** Same fields as create (all optional for PATCH)

#### Delete Product (Farmer Only)
```
DELETE /products/{id}/
```

#### Get My Products (Farmer Only)
```
GET /products/my_products/
```

**Response:** Array of products created by the authenticated farmer

#### Add Product to Cart
```
POST /products/{id}/add_to_cart/
```

**Request Body:**
```json
{
  "quantity": 2
}
```

**Response:**
```json
{
  "detail": "Product added to cart.",
  "cart": {
    "id": 1,
    "user": 5,
    "items": [...],
    "total_price": 25.50,
    "total_items": 3,
    "created_at": "2024-05-21T10:30:00Z",
    "updated_at": "2024-05-21T10:30:00Z"
  }
}
```

---

### Shopping Cart

#### Get My Cart
```
GET /cart/my-cart/
```

**Response:**
```json
{
  "id": 1,
  "user": 5,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "title": "Heirloom Tomatoes",
        ...
      },
      "quantity": 2,
      "total_price": 9.00,
      "added_at": "2024-05-21T10:30:00Z"
    }
  ],
  "total_price": 25.50,
  "total_items": 3,
  "created_at": "2024-05-21T10:30:00Z",
  "updated_at": "2024-05-21T10:30:00Z"
}
```

#### Add Item to Cart
```
POST /cart/add-item/
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response:** Updated cart object

#### Update Cart Item Quantity
```
POST /cart/update-item/
```

**Request Body:**
```json
{
  "cart_item_id": 1,
  "quantity": 5
}
```

**Response:** Updated cart object

#### Remove Item from Cart
```
POST /cart/remove-item/
```

**Request Body:**
```json
{
  "cart_item_id": 1
}
```

**Response:** Updated cart object

#### Clear Cart
```
POST /cart/clear/
```

**Response:** Empty cart object

---

## Frontend Usage Example

### Get Products
```javascript
import API from './api/axios';

// Get all products
const response = await API.get('/products/');
console.log(response.data);

// Get filtered products
const response = await API.get('/products/?category=1&min_price=2&max_price=10');
console.log(response.data);
```

### Add to Cart
```javascript
// Add product to cart
const response = await API.post('/products/1/add_to_cart/', {
  quantity: 2
});
console.log(response.data);
```

### Get Cart
```javascript
// Get user's cart
const response = await API.get('/cart/my-cart/');
console.log(response.data);
```

### Update Cart
```javascript
// Update item quantity
const response = await API.post('/cart/update-item/', {
  cart_item_id: 1,
  quantity: 5
});
console.log(response.data);

// Remove item
const response = await API.post('/cart/remove-item/', {
  cart_item_id: 1
});
console.log(response.data);

// Clear cart
const response = await API.post('/cart/clear/');
console.log(response.data);
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Quantity must be at least 1."
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

---

## Database Models

### Category
- `id`: Primary Key
- `name`: String (unique)
- `description`: Text
- `icon`: String (emoji or icon name)
- `created_at`: DateTime

### Product
- `id`: Primary Key
- `title`: String
- `farmer`: ForeignKey(User)
- `category`: ForeignKey(Category)
- `description`: Text
- `price`: Decimal
- `unit`: String (e.g., 'lb', 'kg', 'oz', 'pk')
- `quantity_available`: Integer
- `image`: URL
- `badge`: String (e.g., 'Organic Certified')
- `badge_color`: String (Tailwind classes)
- `rating`: Float (0-5)
- `reviews`: Integer
- `is_active`: Boolean
- `created_at`: DateTime
- `updated_at`: DateTime

### Cart
- `id`: Primary Key
- `user`: OneToOne(User)
- `created_at`: DateTime
- `updated_at`: DateTime

### CartItem
- `id`: Primary Key
- `cart`: ForeignKey(Cart)
- `product`: ForeignKey(Product)
- `quantity`: Integer
- `added_at`: DateTime
- Unique constraint on (cart, product)

---

## Admin Interface

Access the Django admin at `http://127.0.0.1:8000/admin/`

All models are registered and fully configurable through the admin interface:
- **Categories**: Manage marketplace categories
- **Products**: Manage all products, farmers, pricing, availability
- **Carts**: View user shopping carts
- **Cart Items**: View items in user carts
