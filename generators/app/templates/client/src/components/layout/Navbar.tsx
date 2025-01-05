import { NavLink, Outlet } from "react-router-dom";

export default function NavBar() {
  return (
    <div className="">
      <div className="navbar flex-row sm:flex-row">
        <ul className="flex-1 space-x-1 menu menu-horizontal sm:p-2 sm:m-2 p-0 m-0">
          <li>
            <NavLink to="/" className="btn btn-square btn-ghost z-10">
              Home
            </NavLink>
          </li>
        </ul>
        <div className="flex-none z-10">
        </div>
      </div>
      <Outlet />
    </div>
  );
}
