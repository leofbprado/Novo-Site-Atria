import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ContactModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  carItem,
  initialMessage = ""
}) {
  const overlayRef = useRef(null);
  const scrollYRef = useRef(0);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  
  const [formData, setFormData] = useState({
    nome: '',
    celular: '',
    email: '',
    mensagem: initialMessage
  });

  // Resetar formulário quando abrir
  useEffect(() => {
    if (isOpen && initialMessage) {
      setFormData(prev => ({
        ...prev,
        mensagem: initialMessage
      }));
    }
  }, [isOpen, initialMessage]);

  // Travar rolagem e ocultar barra fixa inferior com acessibilidade
  useEffect(() => {
    const body = document.body;
    const fixedBar = document.querySelector(".fixed-bottom-menu");
    
    if (isOpen) {
      scrollYRef.current = window.scrollY || 0;
      body.classList.add("contact-form-open");
      body.style.position = "fixed";
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      
      if (fixedBar) {
        fixedBar.setAttribute("aria-hidden", "true");
      }
    } else {
      body.classList.remove("contact-form-open");
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      
      if (fixedBar) {
        fixedBar.removeAttribute("aria-hidden");
      }
      
      window.scrollTo(0, scrollYRef.current || 0);
    }
    
    return () => {
      // Cleanup ao desmontar
      body.classList.remove("contact-form-open");
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      
      if (fixedBar) {
        fixedBar.removeAttribute("aria-hidden");
      }
    };
  }, [isOpen]);

  // Fechar com ESC e clique no backdrop
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    const onBackdrop = (e) => { 
      if (e.target === overlayRef.current) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", onKey);
    overlayRef.current?.addEventListener("click", onBackdrop);

    return () => {
      document.removeEventListener("keydown", onKey);
      overlayRef.current?.removeEventListener("click", onBackdrop);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Máscara para celular
    if (name === 'celular') {
      const maskedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
      setFormData(prev => ({ ...prev, [name]: maskedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome.trim() || !formData.celular.trim()) {
      alert('Por favor, preencha seu nome e celular.');
      return;
    }
    
    // Chamar a função onSubmit do componente pai
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  // Só renderiza se estiver no browser
  if (typeof document === "undefined") return null;

  const overlay = (
    <div
      ref={overlayRef}
      className={`contact-overlay ${isOpen ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-hidden={!isOpen}
    >
      <div className="contact-panel" data-state={isOpen ? "open" : "closed"}>
        {/* HEADER */}
        <div className="contact-header">
          <h2 id={titleId}>Entre em contato</h2>
          <button 
            className="contact-close" 
            aria-label="Fechar" 
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* CONTEÚDO ROLÁVEL */}
        <div className="contact-content" role="form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Seu nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                placeholder="Digite seu nome"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="celular">Seu celular</label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                required
                placeholder="(11) 99999-9999"
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Seu melhor e-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mensagem">Mensagem</label>
              <textarea
                id="mensagem"
                name="mensagem"
                value={formData.mensagem}
                onChange={handleInputChange}
                rows="6"
                placeholder="Digite sua mensagem"
              />
            </div>
          </form>
        </div>

        {/* FOOTER FIXO */}
        <div className="contact-footer">
          <button 
            type="button" 
            className="btn-outline" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleSubmit}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );

  // Criar o portal diretamente no body
  return createPortal(overlay, document.body);
}