import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();

  return(
    <>
      <Outlet />
    </>
  );
}

export default Layout;