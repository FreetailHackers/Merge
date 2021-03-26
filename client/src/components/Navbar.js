import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav>
    <Link to="/">Merge</Link>
    <br />
    <Link to="/database">Database (temp)</Link>
  </nav>
);

export default Navbar;
