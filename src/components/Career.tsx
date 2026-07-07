import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container" id="smartprinter">
      <div className="career-container">
        <h2>
          Journey
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech Student</h4>
                <h5>Computer Science & Engineering</h5>
              </div>
              <h3>2024 - PRESENT</h3>
            </div>
            <p>
              Acquiring foundational knowledge in computer science, software design patterns, database architecture, and IoT systems while researching automation.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Founder & CEO</h4>
                <h5>SmartPrinter</h5>
              </div>
              <h3>2025 - PRESENT</h3>
            </div>
            <p>
              Launched SmartPrinter, building a hardware-integrated self-service printer platform, coordinating mechanical automation, cloud API systems, and product development.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Scaling Operations</h4>
                <h5>SmartPrinter</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Scaling print-stations across educational institutions and offices, implementing secure cloud endpoints, and expanding the franchise network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
