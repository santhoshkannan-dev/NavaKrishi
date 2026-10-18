import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./context/CartContext";
import BasketSidebar from "./components/marketplace/BasketSidebar";

function App() {
  return (
    <CartProvider>
      <BasketSidebar />
      <AppRoutes />
    </CartProvider>
  );
}

export default App;