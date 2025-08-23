import React from "react";

export default function Overview() {
  return (
    <>
      <h4 className="title">Car Overview</h4>
      <div className="row">
        <div className="content-column col-lg-6 col-md-12 col-sm-12">
          <div className="inner-column">
            <ul className="list">
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-1.svg" width={18} height={18} alt="" loading="lazy" decoding="async" />
                  Body
                </span>
                SUV
              </li>
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-2.svg" width={18} height={18} alt="" loading="lazy" decoding="async" />
                  Mileage
                </span>
                28.000 miles
              </li>
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-3.svg" width={18} height={18} alt="" loading="lazy" decoding="async" />
                  Fuel Type
                </span>
                Petrol
              </li>
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-4.svg" width={16} height={16} alt="" loading="lazy" decoding="async" />
                  Year
                </span>
                2023
              </li>
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-5.svg" width={16} height={16} alt="" loading="lazy" decoding="async" />
                  Transmission
                </span>
                Automatics
              </li>
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-6.svg" width={18} height={18} alt="" loading="lazy" decoding="async" />
                  Drive Type
                </span>
                Front Wheel Drive
              </li>
            </ul>
          </div>
        </div>
        <div className="content-column col-lg-6 col-md-12 col-sm-12">
          <div className="inner-column">
            <ul className="list">
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-7.svg" width={18} height={18} alt="" loading="lazy" decoding="async" />
                  Condition
                </span>
                Used
              </li>
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-8.svg" width={18} height={18} alt="" loading="lazy" decoding="async" />
                  Engine Size
                </span>
                4.8L
              </li>
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-9.svg" width={18} height={18} alt="" loading="lazy" decoding="async" />
                  Doors
                </span>
                5-door
              </li>
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-10.svg" width={18} height={18} alt="" loading="lazy" decoding="async" />
                  Cylinders
                </span>
                6
              </li>
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-11.svg" width={18} height={18} alt="" loading="lazy" decoding="async" />
                  Color
                </span>
                Blue
              </li>
              <li>
                <span>
                  <img fetchpriority="low" src="/images/resource/insep1-12.svg" width={18} height={18} alt="" loading="lazy" decoding="async" />
                  VIN
                </span>
                ZN682AVA2P7429564
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
