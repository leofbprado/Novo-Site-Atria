import { Link } from "react-router-dom";

/**
 * Unified Breadcrumb Component
 * Handles all breadcrumb cases with clean, minimal styling
 * @param {Array} items - Array of breadcrumb items with label and href
 */
export default function Breadcrumb({ items = [] }) {
  // Clean and filter items
  const clean = items
    .filter(Boolean)
    .map(i => ({ 
      label: (i.label || "").trim(), 
      href: i.href?.trim() 
    }))
    .filter(i => i.label.length > 0);
  
  if (!clean.length) return null;

  return (
    <nav aria-label="breadcrumb" className="breadcrumb">
      <ol>
        {clean.map((it, idx) => (
          <li 
            key={idx} 
            {...(idx === clean.length - 1 ? { 'aria-current': 'page' } : {})}
          >
            {it.href && idx !== clean.length - 1 ? (
              <Link to={it.href}>{it.label}</Link>
            ) : (
              it.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}