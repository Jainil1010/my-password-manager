import { Route, Routes } from "react-router";
import HomeScreen from "./screens/HomeScreen";
import ItemDetailScreen from "./screens/ItemDetailScreen";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="*" element={<HomeScreen />} />
            <Route path="/item/:id" element={<ItemDetailScreen />} />
        </Routes>
    );
}
