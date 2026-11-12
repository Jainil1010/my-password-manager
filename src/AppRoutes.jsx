import { Route, Routes } from "react-router";
import HomeScreen from "./screens/HomeScreen";

export default function AppRoutes () {
    return (
        <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="*" element={<HomeScreen />} />
        </Routes>
    )
}