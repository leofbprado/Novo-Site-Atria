import {
  blogLinks,
  homeLinks,
  megaMenuData,
  pages,
} from "@/data/menu";
import { Link, useLocation } from "react-router-dom";

import React from "react";

export default function Nav({ white = false }) {
  const { pathname } = useLocation();
  const isMenuActive = (menuItem) => {
    let active = false;
    if (menuItem.href?.includes("/")) {
      if (menuItem.href?.split("/")[1] == pathname.split("/")[1]) {
        active = true;
      }
    }
    if (menuItem.length) {
      active = menuItem.some(
        (elm) => elm.href?.split("/")[1] == pathname.split("/")[1]
      );
    }
    if (menuItem.length) {
      menuItem.forEach((item) => {
        item.links?.forEach((elm2) => {
          if (elm2.href?.includes("/")) {
            if (elm2.href?.split("/")[1] == pathname.split("/")[1]) {
              active = true;
            }
          }
          if (elm2.length) {
            elm2.forEach((item2) => {
              item2?.links?.forEach((elm3) => {
                if (elm3.href.split("/")[1] == pathname.split("/")[1]) {
                  active = true;
                }
              });
            });
          }
        });
        if (item.href?.includes("/")) {
          if (item.href?.split("/")[1] == pathname.split("/")[1]) {
            active = true;
          }
        }
      });
    }

    return active;
  };

  return (
    <>
      <li className="current">
        <Link 
          to="/"
          className={pathname === "/" ? "menuActive" : ""}
          style={{ color: white ? '#ffffff' : '#000000' }}
        >
          Início
        </Link>
      </li>
      
      <li className="current">
        <Link 
          to="/estoque"
          className={pathname.includes("/estoque") || pathname.includes("/inventory") ? "menuActive" : ""}
          style={{ color: white ? '#ffffff' : '#000000' }}
        >
          Estoque
        </Link>
      </li>

      <li className="current">
        <Link 
          to="/simulador"
          className={pathname.includes("/simulador") || pathname.includes("/loan-calculator") ? "menuActive" : ""}
          style={{ color: white ? '#ffffff' : '#000000' }}
        >
          Simular Financiamento
        </Link>
      </li>

      <li className="current">
        <Link 
          to="/vender"
          className={pathname.includes("/vender") || pathname === "/venda-seu-carro" ? "menuActive" : ""}
          style={{ color: white ? '#ffffff' : '#000000' }}
        >
          Vender meu carro
        </Link>
      </li>

      <li className="current">
        <Link 
          to="/blog"
          className={pathname.includes("/blog") ? "menuActive" : ""}
          style={{ color: white ? '#ffffff' : '#000000' }}
        >
          Blog
        </Link>
      </li>

      <li className="current">
        <Link 
          to="/sobre"
          className={pathname.includes("/sobre") || pathname === "/about" ? "menuActive" : ""}
          style={{ color: white ? '#ffffff' : '#000000' }}
        >
          Sobre a Átria
        </Link>
      </li>
    </>
  );
}