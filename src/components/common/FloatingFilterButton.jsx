import React, { useState, useEffect } from "react";

const FloatingFilterButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile and show button when scrolled
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const toggleVisibility = () => {
      if (window.pageYOffset > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const openFilter = () => {
    window.dispatchEvent(new CustomEvent('openFilterSidebar'));
  };

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <>
      {isVisible && (
        <div
          className="floating-filter-button"
          onClick={openFilter}
          style={{ 
            position: "fixed",
            bottom: "180px", // 60px acima do botão de scroll (120px + 60px)
            right: "20px",
            width: "40px",
            height: "40px",
            backgroundColor: "#405FF2",
            color: "#ffffff",
            border: "none",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(64, 95, 242, 0.3)",
            zIndex: 999,
            transition: "all 0.3s ease",
            fontSize: "16px"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(64, 95, 242, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(64, 95, 242, 0.3)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
          </svg>
        </div>
      )}
    </>
  );
};

export default FloatingFilterButton;