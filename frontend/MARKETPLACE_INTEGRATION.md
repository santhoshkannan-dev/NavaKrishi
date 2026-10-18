# Marketplace Frontend Integration Guide

This guide shows how to integrate the marketplace API with the React components.

## API Service File

The `api/marketplace.js` file provides all necessary functions for:
- Fetching categories
- Fetching products with filters
- Managing shopping cart
- Creating/updating/deleting products (farmer only)

## Component Integration Examples

### 1. ProductGrid Component

```jsx
import { useState, useEffect } from 'react';
import { productsAPI } from '../api/marketplace';
import MarketProductCard from './MarketProductCard';

const ProductGrid = ({ filters = {} }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getAllProducts(filters);
        setProducts(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <MarketProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
```

### 2. MarketProductCard Component

```jsx
import { useState } from 'react';
import { productsAPI, cartAPI } from '../api/marketplace';

const MarketProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await cartAPI.addItem(product.id, quantity);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error adding to cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow">
      <img 
        src={product.image} 
        alt={product.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{product.title}</h3>
        <p className="text-gray-600">{product.farmer.username}</p>
        
        {product.badge && (
          <span className={`inline-block ${product.badge_color} px-2 py-1 rounded text-sm mt-2`}>
            {product.badge}
          </span>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-[#1f6d1a]">
            ${product.price}/{product.unit}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">★ {product.rating}</span>
            <span className="text-gray-600 text-sm">({product.reviews})</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="flex-1 bg-[#1f6d1a] text-white px-4 py-2 rounded hover:bg-[#1a5a15] disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>

        {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default MarketProductCard;
```

### 3. FilterSidebar Component

```jsx
import { useState } from 'react';

const FilterSidebar = ({ onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });

  const categories = [
    { id: 1, name: 'Vegetables' },
    { id: 2, name: 'Fruits' },
    { id: 3, name: 'Grains & Pulses' },
    { id: 4, name: 'Organic Honey' },
  ];

  const handleCategoryChange = (categoryId) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    onFilterChange({ 
      category: newCategory,
      min_price: priceRange.min,
      max_price: priceRange.max,
    });
  };

  const handlePriceChange = (e) => {
    const newRange = { ...priceRange, min: parseFloat(e.target.value) };
    setPriceRange(newRange);
    onFilterChange({
      category: selectedCategory,
      min_price: newRange.min,
      max_price: newRange.max,
    });
  };

  return (
    <aside className="w-72 bg-[#f5f5f3] border-r border-gray-200 min-h-screen p-8 hidden lg:block">
      {/* Categories */}
      <div className="space-y-6 mb-12">
        <h3 className="text-xl font-bold text-[#012d1d]">Categories</h3>
        <div className="space-y-4">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedCategory === cat.id}
                onChange={() => handleCategoryChange(cat.id)}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xl font-bold text-[#012d1d] mb-6">Price Range</h3>
        <input
          type="range"
          min="0"
          max="500"
          value={priceRange.min}
          onChange={handlePriceChange}
          className="w-full"
        />
        <div className="flex justify-between mt-4 text-gray-500">
          <span>${priceRange.min}</span>
          <span>$500</span>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
```

### 4. BasketSidebar Component

```jsx
import { useState, useEffect } from 'react';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { cartAPI } from '../api/marketplace';

const BasketSidebar = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartAPI.getCart();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const updated = await cartAPI.updateItem(itemId, newQuantity);
      setCart(updated);
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const updated = await cartAPI.removeItem(itemId);
      setCart(updated);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  if (loading) return <div>Loading cart...</div>;
  if (!cart) return <div>Cart unavailable</div>;

  return (
    <aside className="w-80 border-l border-gray-200 bg-white min-h-screen p-6 hidden xl:flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-[#012d1d]">My Basket</h2>
        <span className="bg-[#1f6d1a] text-white px-4 py-1 rounded-full text-sm">
          {cart.total_items} Items
        </span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 py-8 space-y-8 overflow-y-auto">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <img
              src={item.product.image}
              alt={item.product.title}
              className="w-20 h-20 rounded-xl object-cover"
            />

            <div className="flex-1">
              <h3 className="font-bold text-[#012d1d]">{item.product.title}</h3>
              <p className="text-gray-500 mt-1">
                {item.quantity} × ${item.product.price}
              </p>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <FiMinus />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <FiPlus />
                </button>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 ml-auto"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span className="text-[#1f6d1a]">${cart.total_price.toFixed(2)}</span>
        </div>
        <button className="w-full bg-[#1f6d1a] text-white py-3 rounded-lg font-bold hover:bg-[#1a5a15]">
          Checkout
        </button>
      </div>
    </aside>
  );
};

export default BasketSidebar;
```

### 5. Marketplace Main Component

```jsx
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FilterSidebar from '../components/marketplace/FilterSidebar';
import ProductGrid from '../components/marketplace/ProductGrid';
import BasketSidebar from '../components/marketplace/BasketSidebar';

const Marketplace = () => {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <Navbar />

      <main className="pt-18 flex max-w-400 mx-auto">
        <FilterSidebar onFilterChange={handleFilterChange} />

        <section className="flex-1 p-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h1 className="text-5xl font-bold text-[#012d1d]">
                Organic Marketplace
              </h1>
              <p className="text-gray-500 text-lg mt-3">
                Fresh, AI-vetted produce directly from trusted local farmers.
              </p>
            </div>

            <button className="border border-gray-300 px-6 py-3 rounded-full hover:bg-gray-100 transition">
              Sort: Relevant
            </button>
          </div>

          <ProductGrid filters={filters} />
        </section>

        <BasketSidebar />
      </main>

      <Footer />
    </>
  );
};

export default Marketplace;
```

## Usage Instructions

1. **Import the marketplace API service** in your components:
   ```jsx
   import { productsAPI, cartAPI, categoriesAPI } from '../api/marketplace';
   ```

2. **Fetch data on component mount**:
   ```jsx
   useEffect(() => {
     productsAPI.getAllProducts().then(setProducts);
   }, []);
   ```

3. **Handle async operations with loading and error states**:
   ```jsx
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   ```

4. **Pass product/cart data to child components** via props

5. **Update parent state** when cart changes to keep UI in sync

## API Response Structure

All API functions return the following structure:
- **List endpoints**: Array of objects
- **Single endpoint**: Single object
- **Action endpoints** (add/update/remove): Updated parent object (e.g., cart)

## Error Handling

Wrap all API calls in try-catch blocks:
```jsx
try {
  const data = await productsAPI.getProduct(id);
} catch (error) {
  console.error('API Error:', error);
  // Handle error - show message to user
}
```

## Authentication

The axios instance in `api/axios.js` automatically includes the JWT token from localStorage.
Make sure the token is stored as `token` in localStorage after login.
