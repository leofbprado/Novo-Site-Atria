import React, { useState } from "react";
import { brandLogoUrl, brandDisplayName } from "../utils/brand.js";

export default function BrandLogo({ brand, size = 24, title, className = "" }) {
  const [error, setError] = useState(false);
  const url = brandLogoUrl(brand);
  const label = brandDisplayName(brand);

  if (!url || error) {
    // Fallback: iniciais num badge circular padronizado
    const initials = (label || "?").trim().slice(0, 2).toUpperCase();
    return (
      <span
        className={`brand-fallback ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          borderRadius: "9999px",
          background: "#f1f5f9",
          color: "#0f172a",
          fontSize: Math.max(10, size * 0.45),
          fontWeight: 700,
          lineHeight: 1
        }}
        title={title || label}
        aria-label={label}
      >
        {initials}
      </span>
    );
  }

  // Só adiciona params de transformação para URLs do Cloudinary
  const isCloudinary = url.includes("cloudinary.com");
  const finalUrl = isCloudinary
    ? `${url}${url.includes("?") ? "&" : "?"}h=${size}&w=${size}&c=fit&f=auto&q=auto`
    : url;

  return (
    <img
      src={finalUrl}
      alt={label}
      title={title || label}
      className={`brand-logo ${className}`}
      style={{
        height: size,
        width: "auto",
        display: "inline-block",
        verticalAlign: "middle",
        objectFit: "contain"
      }}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
    />
  );
}