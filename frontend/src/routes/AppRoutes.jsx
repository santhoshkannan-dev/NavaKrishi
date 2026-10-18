import {
  Routes,
  Route,
} from "react-router-dom";
import Home from "../pages/Home";
import Marketplace from "../marketplace/MarketPlace";
import ProductDetails from "../product/ProductDetails";
import SignIn from "../auth/SignIn";
import SignUp from "../auth/SignUp";
import Checkout from "../checkout/Checkout";
import Settings from "../profile/Settings";
import Support from "../pages/Support";
import Impact from "../pages/Impact";
import About from "../pages/About";
import OrderSuccess from "../pages/OrderSuccess";
import SeasonalDiscovery from "../pages/customer/SeasonalDiscovery";
import Fruits from "../pages/customer/Fruits";
import Vegetables from "../pages/customer/Vegetables";
import Spices from "../pages/customer/Spices";
import Grains from "../pages/customer/Grains";
import ProtectedRoute from "./ProtectedRoute";
import FarmerRoute from "./FarmerRoute";
import FarmerDashboard from "../pages/farmer/FarmerDashboard";
import Inventory from "../pages/farmer/Inventory";
import FarmerLayout from "../layouts/FarmerLayout";
import AddProduct from "../pages/farmer/AddProduct";
import Analytics from "../pages/farmer/Analytics";
import Orders from "../pages/farmer/Orders";
import AIInsights from "../pages/farmer/AIInsights";
import SmartAgriAssistant from "../pages/farmer/SmartAgriAssistant";
import PredictionLab from "../pages/farmer/PredictionLab";
import FarmerSettings from "../pages/farmer/FarmerSettings";
import FarmerSubscription from "../pages/farmer/FarmerSubscription";
import MySubscriptions from "../pages/farmer/MySubscriptions";
import FarmerNotifications from "../pages/farmer/FarmerNotifications";
import SmartFarmIoT from "../pages/farmer/SmartFarmIoT";
import IoTDashboard from "../pages/IoTDashboard/IoTDashboard";

const AppRoutes = () => {
  return (

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/marketplace"
          element={ <Marketplace />}
        />
        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/sign-in/*"
          element={<SignIn />}
        />

        <Route
          path="/sign-up/*"
          element={<SignUp />}
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={<Support />}
        />

        <Route
          path="/impact"
          element={<Impact />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/seasonal-discovery"
          element={<SeasonalDiscovery />}
        />

        <Route
          path="/fruits"
          element={<Fruits />}
        />

        <Route
          path="/vegetables"
          element={<Vegetables />}
        />

        <Route
          path="/spices"
          element={<Spices />}
        />

        <Route
          path="/grains"
          element={<Grains />}
        />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        <Route
          path="/farmer-dashboard"
          element={
            <FarmerRoute>
              <FarmerLayout>
                <FarmerDashboard />
              </FarmerLayout>
            </FarmerRoute>
          }
        />

        <Route
          path="/farmer/inventory"
          element={
            <FarmerRoute>
              <FarmerLayout>
                <Inventory />
              </FarmerLayout>
            </FarmerRoute>
          }
        />

        <Route
          path="/farmer/add-product"
          element={
            <FarmerLayout>
              <AddProduct />
            </FarmerLayout>
          }
        />

        <Route
          path="/farmer/analytics"
          element={
            <FarmerLayout>
              <Analytics />
            </FarmerLayout>
          }
        />

        <Route
          path="/farmer/orders"
          element={
            <FarmerLayout>
              <Orders />
            </FarmerLayout>
          }
        />

        <Route
          path="/farmer/settings"
          element={
            <FarmerLayout>
              <FarmerSettings />
            </FarmerLayout>
          }
        />

        <Route
          path="/farmer/subscriptions"
          element={
            <FarmerLayout>
              <FarmerSubscription />
            </FarmerLayout>
          }
        />

        <Route
          path="/farmer/my-subscriptions"
          element={
            <FarmerLayout>
              <MySubscriptions />
            </FarmerLayout>
          }
        />

        <Route
          path="/farmer/notifications"
          element={
            <FarmerLayout>
              <FarmerNotifications />
            </FarmerLayout>
          }
        />

        <Route
          path="/farmer/ai-insights"
          element={
            <FarmerLayout>
              <AIInsights />
            </FarmerLayout>
          }
        />

        <Route
          path="/farmer/assistant"
          element={
            <FarmerLayout>
              <SmartAgriAssistant />
            </FarmerLayout>
          }
        />

        <Route
          path="/farmer/prediction-lab"
          element={
            <FarmerLayout>
              <PredictionLab />
            </FarmerLayout>
          }
        />

        <Route
          path="/farmer/iot"
          element={
            <FarmerLayout>
              <SmartFarmIoT />
            </FarmerLayout>
          }
        />

        <Route
          path="/iot-dashboard"
          element={<IoTDashboard />}
        />

        <Route
          path="/field-intelligence"
          element={<IoTDashboard />}
        />

      </Routes>
  );
};

export default AppRoutes;