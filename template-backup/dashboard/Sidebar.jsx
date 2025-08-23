import React from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    href: "/dashboard",
    src: "/images/icons/dash1.svg",
    width: 18,
    height: 18,
    label: "Dashboard",
  },
  {
    href: "/my-listings",
    src: "/images/icons/dash2.svg",
    width: 22,
    height: 22,
    label: "My Listings",
  },
  {
    href: "/add-listings",
    src: "/images/icons/dash3.svg",
    width: 22,
    height: 22,
    label: "Add Listings",
  },
  {
    href: "/favorite",
    src: "/images/icons/dash4.svg",
    width: 18,
    height: 18,
    label: "My Favorites",
  },
  {
    href: "/saved",
    src: "/images/icons/dash5.svg",
    width: 18,
    height: 18,
    label: "Saved Search",
  },
  {
    href: "/messages",
    src: "/images/icons/dash6.svg",
    width: 18,
    height: 18,
    label: "Messages",
  },
  {
    href: "/profile",
    src: "/images/icons/dash7.svg",
    width: 18,
    height: 18,
    label: "My Profile",
  },
  {
    href: "#",
    src: "/images/icons/dash8.svg",
    width: 18,
    height: 18,
    label: "Logout",
    isExternal: true,
  },
];
export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <div className="side-bar">
      <ul className="nav-list">
        {menuItems.map((item, index) => (
          <li key={index}>
            {item.isExternal ? (
              <a href={item.href}>
                <img
                  alt=""
                  src={item.src}
                  width={item.width}
                  height={item.height}
                />
                {item.label}
              </a>
            ) : (
              <Link
                to={item.href}
                className={pathname == item.href ? "menuActive" : ""}
              >
                <img
                  alt=""
                  src={item.src}
                  width={item.width}
                  height={item.height}
                />
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
