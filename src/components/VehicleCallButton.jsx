import React from 'react';
import CallToCallLead from './CallToCallLead';

export default function VehicleCallButton({ vehicle, className = "btn btn-primary" }) {
  // Extract vehicle data for the call lead form
  const vehicleData = {
    id: vehicle?.id || vehicle?.uuid,
    title: `${vehicle?.marca} ${vehicle?.modelo} ${vehicle?.ano}`,
    brand: vehicle?.marca,
    model: vehicle?.modelo,
    year: vehicle?.ano,
    price: vehicle?.preco || vehicle?.price
  };

  return (
    <CallToCallLead
      dealerPhone="+5519999999999" // Replace with actual dealer phone
      vehicle={vehicleData}
      endpoint="/api/leads/call"
      buttonClassName={className}
    >
      <i className="fas fa-phone"></i> Ligar Agora
    </CallToCallLead>
  );
}