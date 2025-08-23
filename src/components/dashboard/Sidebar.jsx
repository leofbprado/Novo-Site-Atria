import React from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    href: "/favorite",
    src: "/images/icons/dash4.svg",
    width: 18,
    height: 18,
    label: "Meus Favoritos",
  },
  {
    href: "#",
    src: "/images/icons/dash8.svg",
    width: 18,
    height: 18,
    label: "Sair",
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
                <img fetchpriority="low" decoding="async" loading="lazy" alt="" src={item.src} width={item.width} height={item.height} />
                {item.label}
              </a>
            ) : (
              <Link
                to={item.href}
                className={pathname == item.href ? "menuActive" : ""}
              >
                <img fetchpriority="low" decoding="async" loading="lazy" alt="" src={item.src} width={item.width} height={item.height} />
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
