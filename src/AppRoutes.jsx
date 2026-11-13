import { Route, Routes } from "react-router";
import HomeScreen from "./screens/HomeScreen";
import ItemDetailScreen from "./screens/ItemDetailScreen";
import ItemFormScreen from "./screens/ItemFormScreen";
import GeneratorScreen from "./screens/GeneratorScreen";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="*" element={<HomeScreen />} />
            <Route path="/item/:id" element={<ItemDetailScreen />} />
            <Route path="/new" element={<ItemFormScreen />} />
            <Route path="/edit/:id" element={<ItemFormScreen />} />
            <Route path="/generator" element={<GeneratorScreen />} />
        </Routes>
    );
}
