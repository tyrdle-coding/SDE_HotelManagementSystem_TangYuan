import { RouterProvider } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { AuthProvider } from './components/AuthContext';
import { router } from './router';

// Compose top-level providers before rendering the route tree.
export default function App() {
  return (
    <AuthProvider>
      <ParallaxProvider>
        <RouterProvider router={router} />
      </ParallaxProvider>
    </AuthProvider>
  );
}
