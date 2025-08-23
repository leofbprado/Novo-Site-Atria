import { vehicles } from "@/data/categories";

export default function CarsCategories() {
  return (
    <section className="vehicles-section-two">
      <div className="boxcar-container">
        <div className="boxcar-title text-center">
          <h2>A Vehicle For Every Lifestyle</h2>
        </div>
        <div className="row">
          {vehicles.map((vehicle, index) => (
            <div
              className="Vehicle-block col-lg-2 col-md-6 col-sm-6"
              key={index}
            >
              <div className="inner-box">
                <div className="image-box">
                  <figure className="image">
                    <a href="#">
                      <img fetchpriority="low" alt={vehicle.title} src={vehicle.src} width={vehicle.width} height={vehicle.height} loading="lazy" decoding="async" />
                    </a>
                  </figure>
                </div>
                <div className="content-box">
                  <h6 className="title">{vehicle.title}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
