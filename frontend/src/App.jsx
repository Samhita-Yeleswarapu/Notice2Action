import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import AppPage from './pages/AppPage.jsx';
import NoticePage from './pages/NoticePage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<AppPage />} />
      <Route path="/notice/:id" element={<NoticePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
