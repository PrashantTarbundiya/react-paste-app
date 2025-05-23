import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => (
  <div className="flex gap-4 p-4 bg-gray-900 text-white place-content-evenly rounded-md">
    <NavLink to="/">Home</NavLink>
    <NavLink to="/pastes">Pastes</NavLink>
  </div>
);

export default Navbar;
