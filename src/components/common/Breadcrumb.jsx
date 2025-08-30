import React from "react";
import PropTypes from "prop-types";
// se o arquivo existir, mantém o estilo do projeto (ok ignorar se não existir)
import "@/styles/breadcrumb.css";

/**
 * Breadcrumb básico (Bootstrap-like)
 * props.items: [{ label: "Início", href: "/" }, { label: "Financiamento" }]
 */
function Breadcrumb({ items = [], className = "", containerClass = "container" }) {
  const lastIndex = items.length - 1;

  return (
    <div className={`boxcar-breadcrumb ${className}`}>
      <div className={containerClass}>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb m-0 py-3">
            {items.map((item, idx) => {
              const isLast = idx === lastIndex || !item.href;
              return (
                <li
                  key={idx}
                  className={`breadcrumb-item ${isLast ? "active" : ""}`}
                  {...(isLast ? { "aria-current": "page" } : {})}
                >
                  {isLast ? (
                    item.label
                  ) : (
                    <a href={item.href}>{item.label}</a>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      href: PropTypes.string,
    })
  ),
  className: PropTypes.string,
  containerClass: PropTypes.string,
};

export { Breadcrumb };
export default Breadcrumb;
