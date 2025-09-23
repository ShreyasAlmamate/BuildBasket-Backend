# BuildBasket Backend

A comprehensive e-commerce backend API built with Node.js, Express, and MongoDB for the BuildBasket platform.

## Features

### Seller Management
- **Region Selection**: Sellers can select specific regions for sales
- **Fixed Fare Definition**: Set region-specific fares with commission calculation
- **GST Calculation**: Configurable GST rates with real-time calculation
- **Wallet Integration**: Support for SG Finserv and direct payment methods
- **Order Management**: Status updates and delivery invoice uploads
- **Analytics Dashboard**: Sales performance, top commodities, regional analysis, and revenue breakdown

### Core Features
- User authentication and authorization
- Product management
- Order processing
- Payment handling
- Real-time chat system
- Admin dashboard
- Commission management
- Price history tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary integration
- **Real-time**: Socket.io
- **Validation**: Built-in Express validation

## API Endpoints

### Seller Features
- `GET /api/seller/regions` - Get seller regions
- `POST /api/seller/regions` - Add new region
- `DELETE /api/seller/regions/:region` - Remove region
- `PUT /api/seller/regions/:region/fare` - Update region fare
- `GET /api/seller/wallet` - Get wallet balance
- `PUT /api/seller/payment-method` - Update payment method
- `GET /api/seller/analytics` - Get analytics data
- `GET /api/seller/orders` - Get seller orders
- `PUT /api/seller/orders/:orderId/status` - Update order status
- `POST /api/seller/orders/:orderId/invoice` - Upload delivery invoice

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `GET /api/orders/:id` - Get order details

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ShreyasAlmamate/BuildBasket-Backend.git
cd BuildBasket-Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
DB_URL=mongodb://localhost:27017/almaMate
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the development server:
```bash
npm start
```

## Database Models

### Seller Model
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String (default: 'seller'),
  status: String (default: 'pending'),
  payment: String (default: 'inactive'),
  method: String,
  image: String,
  shopInfo: Object,
  regions: [String],
  regionFares: [{ region: String, fare: Number }],
  gstRate: Number (default: 18),
  paymentMethod: String (enum: ['direct', 'sg_finserv'])
}
```

### Order Model
```javascript
{
  orderId: ObjectId,
  sellerId: ObjectId,
  products: Array,
  price: Number,
  payment_status: String,
  shippingInfo: String,
  delivery_status: String,
  date: String,
  delivery_invoice: String
}
```

## Authentication

The API uses JWT-based authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API returns consistent error responses:

```javascript
{
  "error": "Error message",
  "success": false
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.

---

**BuildBasket Backend** - Powering the future of e-commerce
