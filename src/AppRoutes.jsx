import { Route, Routes } from "react-router";
import HomeScreen from "./screens/HomeScreen";
import ItemDetailScreen from "./screens/ItemDetailScreen";
import ItemFormScreen from "./screens/ItemFormScreen";
import GeneratorScreen from "./screens/GeneratorScreen";
import SettingsScreen from "./screens/SettingsScreen";
import NeverSaveScreen from "./screens/NeverSaveScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="*" element={<HomeScreen />} />
            <Route path="/item/:id" element={<ItemDetailScreen />} />
            <Route path="/new" element={<ItemFormScreen />} />
            <Route path="/edit/:id" element={<ItemFormScreen />} />
            <Route path="/generator" element={<GeneratorScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/never-save" element={<NeverSaveScreen />} />
            <Route path="/change-password" element={<ChangePasswordScreen />} />
        </Routes>
    );
}
