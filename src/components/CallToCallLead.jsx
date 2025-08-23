import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { analytics } from '@/lib/analytics';

function trackGa4(eventName, params = {}) {
  try { window.gtag && window.gtag("event", eventName, params); } catch {}
}
function trackMeta(eventName, params = {}) {
  try { window.fbq && window.fbq("trackCustom", eventName, params); } catch {}
}

export default function CallToCallLead({
  dealerPhone = "+5519999999999",   // número real da loja (E.164 recomendado)
  vehicle = {},                     // { id, title, brand, model, year, price }
  endpoint = "/api/leads/call",     // backend local; pode trocar por Formspree
  useFormspree = false,             // true para mandar direto p/ Formspree
  formspreeUrl = "",                // ex: "https://formspree.io/f/xxxxxxx"
  buttonClassName = "btn-call",
  children = "Ligar Agora"
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const overlayRef = useRef(null);
  const scrollYRef = useRef(0);

  // Abre modal
  const onOpen = () => setOpen(true);

  // Lock scroll + esconder barra fixa (como no filtro)
  useEffect(() => {
    const body = document.body;
    const fixedBar = document.querySelector(".fixed-bottom-menu");
    if (open) {
      scrollYRef.current = window.scrollY || 0;
      body.classList.add("calllead-open");
      body.style.position = "fixed";
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      if (fixedBar) fixedBar.setAttribute("aria-hidden", "true");
    } else {
      body.classList.remove("calllead-open");
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      if (fixedBar) fixedBar.removeAttribute("aria-hidden");
      window.scrollTo(0, scrollYRef.current || 0);
    }
  }, [open]);

  // ESC/backdrop
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onBackdrop = (e) => { if (e.target === overlayRef.current) setOpen(false); };
    document.addEventListener("keydown", onKey);
    overlayRef.current?.addEventListener("click", onBackdrop);
    return () => {
      document.removeEventListener("keydown", onKey);
      overlayRef.current?.removeEventListener("click", onBackdrop);
    };
  }, [open]);

  // Validação simples
  const cleanPhone = (v) => String(v).replace(/[^\d]/g, "");
  const isValid = () => name.trim().length >= 2 && cleanPhone(phone).length >= 10;

  async function sendLead() {
    const payload = {
      type: "call_click",
      name: name.trim(),
      phone: "+" + cleanPhone(phone), // ajuste se não quiser E.164
      vehicle: {
        id: vehicle?.id ?? null,
        title: vehicle?.title ?? null,
        brand: vehicle?.brand ?? null,
        model: vehicle?.model ?? null,
        year: vehicle?.year ?? null,
        price: vehicle?.price ?? null,
        url: typeof window !== "undefined" ? window.location.href : null,
      },
      ts: new Date().toISOString()
    };

    // Tracking antes do submit
    trackGa4("lead_call_form_submit", { vehicle_id: payload.vehicle.id, brand: payload.vehicle.brand });
    trackMeta("LeadCallFormSubmit", { vehicle_id: payload.vehicle.id });

    try {
      setSubmitting(true);
      if (useFormspree && formspreeUrl) {
        await fetch(formspreeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      
      // Analytics: Track lead generation for call
      analytics.generateLead('call_to_call_form', payload.vehicle.id, {
        vehicle_info: payload.vehicle,
        lead_source: 'Call to Call Lead'
      });
      
    } catch (e) {
      // não bloquear a ligação por erro de rede
      console.warn("sendLead error", e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid()) return;
    await sendLead();

    // Tracking do click‑to‑call
    trackGa4("call_click", { phone: dealerPhone, vehicle_id: vehicle?.id });
    trackMeta("CallClick", { phone: dealerPhone, vehicle_id: vehicle?.id });

    // Dispara a ligação
    window.location.href = `tel:${dealerPhone}`;

    // Fecha modal
    setOpen(false);
  }

  const modal = !open ? null : (
    <div ref={overlayRef} className="calllead-overlay" role="dialog" aria-modal="true" aria-hidden={!open}>
      <div className="calllead-panel">
        <div className="calllead-header">
          <h2>Fale com a Átria</h2>
          <button className="calllead-close" aria-label="Fechar" onClick={() => setOpen(false)}>✕</button>
        </div>

        <form className="calllead-content" onSubmit={handleSubmit}>
          <label className="field">
            <span>Seu nome</span>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Seu celular</span>
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              required
            />
          </label>

          <p className="disclaimer">
            Ao enviar, vamos iniciar a ligação para <strong>{dealerPhone}</strong>.
          </p>
        </form>

        <div className="calllead-footer">
          <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancelar</button>
          <button
            type="submit"
            form="" // não necessário, usamos onSubmit do form acima
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!isValid() || submitting}
          >
            {submitting ? "Enviando..." : "Ligar agora"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" className={buttonClassName} onClick={onOpen}>
        {children}
      </button>
      {typeof document !== "undefined" ? createPortal(modal, document.body) : null}
    </>
  );
}