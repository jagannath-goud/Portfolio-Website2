import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLoading } from "../context/LoadingProvider";

gsap.registerPlugin(useGSAP);

interface Project {
  title: string;
  category: string;
  tools: string;
  image: string;
}

const projectsList: Project[] = [
  {
    title: "SmartPrinter Platform",
    category: "Client Portal",
    tools: "React, TypeScript, TailwindCSS, Supabase",
    image: "/images/projects/project1.webp",
  },
  {
    title: "SmartPrinter Admin",
    category: "Analytics & Management",
    tools: "React, Recharts, PostgreSQL, Node.js",
    image: "/images/projects/project2.webp",
  },
  {
    title: "Printer Agent",
    category: "Hardware Controller",
    tools: "Node.js, Raspberry Pi, IoT, Cups, Linux",
    image: "/images/projects/project3.webp",
  },
  {
    title: "Portfolio Website",
    category: "Developer Showcase",
    tools: "React, Three.js, GSAP, CSS Modules",
    image: "/images/projects/project4.webp",
  },
  {
    title: "Franchise System",
    category: "Business Operations",
    tools: "Next.js, Supabase Database, Dashboard Flow",
    image: "/images/projects/project5.webp",
  },
  {
    title: "Future Innovations",
    category: "AI Automation",
    tools: "Python, PyTorch, Neural Networks",
    image: "/images/projects/project6.webp",
  },
];

const Work = () => {
  const { isLoading } = useLoading();

  useGSAP(() => {
    if (isLoading) return;

    let translateX: number = 0;

    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      if (box.length === 0) return;
      const rectLeft = document
        .querySelector(".work-container")!
        .getBoundingClientRect().left;
      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
      let padding: number =
        parseInt(window.getComputedStyle(box[0]).padding) / 2;
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
    }

    setTranslateX();

    let timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`, // Use actual scroll width
        scrub: true,
        pin: true,
        id: "projects",
      },
    });

    timeline.to(".work-flex", {
      x: -translateX,
      ease: "none",
    });

    ScrollTrigger.refresh();

    // Clean up
    return () => {
      timeline.kill();
      const trigger = ScrollTrigger.getById("projects");
      if (trigger) {
        trigger.kill(true); // revert spacer styles
      }
    };
  }, [isLoading]);

  return (
    <div className="work-section" id="projects">
      <div className="work-container section-container">
        <h2>
          My <span>Projects</span>
        </h2>
        <div className="work-flex">
          {projectsList.map((project, index) => (
            <div className="work-box" key={index}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>

                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage image={project.image} alt={project.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
