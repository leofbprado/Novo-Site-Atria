// ✅ SIMPLE SLIDER - Substituto temporário para rc-slider
import React, { useState } from 'react';

const SimpleSlider = ({ 
  range = false, 
  min = 0, 
  max = 100, 
  defaultValue = range ? [min, max] : min,
  onChange = () => {},
  ...props 
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e, index = null) => {
    const newValue = parseInt(e.target.value);
    
    if (range) {
      const newRange = [...value];
      newRange[index] = newValue;
      setValue(newRange);
      onChange(newRange);
    } else {
      setValue(newValue);
      onChange(newValue);
    }
  };

  if (range) {
    return (
      <div className="simple-slider-range" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={(e) => handleChange(e, 0)}
          style={{ flex: 1 }}
        />
        <span>${value[0].toLocaleString()}</span>
        <span>-</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={(e) => handleChange(e, 1)}
          style={{ flex: 1 }}
        />
        <span>${value[1].toLocaleString()}</span>
      </div>
    );
  }

  return (
    <div className="simple-slider">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        style={{ width: '100%' }}
      />
      <div style={{ textAlign: 'center', marginTop: '5px' }}>
        ${value.toLocaleString()}
      </div>
    </div>
  );
};

export default SimpleSlider;