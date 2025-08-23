import React from 'react';
import CallToCallLead from '../CallToCallLead';

// Example component showing different ways to use CallToCallLead
export default function CallToCallExample() {
  // Sample vehicle data
  const sampleVehicle = {
    id: "12345",
    title: "Honda Civic EXL 2023",
    brand: "Honda",
    model: "Civic",
    year: "2023",
    price: 120000
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Exemplos do Componente Call-to-Call Lead</h2>
      
      <div style={{ display: 'grid', gap: '30px', marginTop: '30px' }}>
        
        {/* Example 1: Basic usage */}
        <div>
          <h3>1. Uso Básico</h3>
          <p>Botão simples com dados mínimos do veículo:</p>
          <CallToCallLead
            dealerPhone="+5519999999999"
            vehicle={sampleVehicle}
            endpoint="/api/leads/call"
          >
            Ligar Agora
          </CallToCallLead>
        </div>

        {/* Example 2: Custom styling */}
        <div>
          <h3>2. Com Estilo Personalizado</h3>
          <p>Botão com classe CSS personalizada:</p>
          <CallToCallLead
            dealerPhone="+5519999999999"
            vehicle={sampleVehicle}
            endpoint="/api/leads/call"
            buttonClassName="btn btn-success"
          >
            <i className="fas fa-phone"></i> Fale Conosco
          </CallToCallLead>
        </div>

        {/* Example 3: Using Formspree instead of backend */}
        <div>
          <h3>3. Usando Formspree (sem backend)</h3>
          <p>Enviando dados diretamente para o Formspree:</p>
          <CallToCallLead
            dealerPhone="+5519999999999"
            vehicle={sampleVehicle}
            useFormspree={true}
            formspreeUrl="https://formspree.io/f/YOUR_FORM_ID"
            buttonClassName="btn-call-primary"
          >
            <i className="fas fa-phone-alt"></i> Ligar para Vendas
          </CallToCallLead>
        </div>

        {/* Example 4: Different phone number */}
        <div>
          <h3>4. Número Diferente (Suporte)</h3>
          <p>Para diferentes departamentos:</p>
          <CallToCallLead
            dealerPhone="+5519888888888"
            vehicle={sampleVehicle}
            endpoint="/api/leads/call"
            buttonClassName="btn-outline-primary"
          >
            <i className="fas fa-headset"></i> Suporte Técnico
          </CallToCallLead>
        </div>

      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Como Usar em Seus Componentes</h3>
        <pre style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`// Import the component
import CallToCallLead from './components/CallToCallLead';

// Use in your JSX
<CallToCallLead
  dealerPhone="+5519999999999"
  vehicle={vehicleData}
  endpoint="/api/leads/call"
  buttonClassName="your-custom-class"
>
  Your button text
</CallToCallLead>`}
        </pre>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h4>Funcionalidades Principais:</h4>
        <ul>
          <li>✅ Modal fullscreen otimizado para mobile</li>
          <li>✅ Captura de Nome + Telefone antes da ligação</li>
          <li>✅ Rastreamento GA4 e Meta Pixel automático</li>
          <li>✅ Compatível com backend local ou Formspree</li>
          <li>✅ UX rápida: apenas 2 toques para ligar</li>
          <li>✅ Acessibilidade completa (ESC, backdrop, ARIA)</li>
        </ul>
      </div>
    </div>
  );
}