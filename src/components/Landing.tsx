import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              C. JAGANNATH
              <br />
              <span>GOUD</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>A Passionate</h3>
            <h2 className="landing-info-h2">
              <div className="landing-role">Founder</div>
              <div className="landing-role" style={{ opacity: 0 }}>Developer</div>
              <div className="landing-role" style={{ opacity: 0 }}>Startup Builder</div>
              <div className="landing-role" style={{ opacity: 0 }}>Entrepreneur</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
