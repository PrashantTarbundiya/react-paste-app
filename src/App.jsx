import React from 'react';
import Navbar from './components/navbar';
import Home from './components/Home';
import Paste from './components/Paste';
import ViewPaste from './components/ViewPaste';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Navbar />
        <Home />
      </>
    ),
  },
  {
    path: '/pastes',
    element: (
      <>
        <Navbar />
        <Paste />
      </>
    ),
  },
  {
    path: '/pastes/:id',
    element: (
      <>
        <Navbar />
        <ViewPaste />
      </>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
