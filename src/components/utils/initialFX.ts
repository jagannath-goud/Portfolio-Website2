import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { smoother } from "../Navbar";

export function initialFX() {
  document.body.style.overflowY = "auto";
  smoother.paused(false);
  document.getElementsByTagName("main")[0].classList.add("main-active");
  gsap.to("body", {
    backgroundColor: "#0b080c",
    duration: 0.5,
    delay: 1,
  });

  var landingText = new SplitText(
    [".landing-info h3", ".landing-intro h2", ".landing-intro h1"],
    {
      type: "chars,lines",
      linesClass: "split-line",
    }
  );
  gsap.fromTo(
    landingText.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );
  let TextProps = { type: "chars,lines", linesClass: "split-h2" };

  const roles = gsap.utils.toArray(".landing-role") as HTMLElement[];
  const splits = roles.map(role => new SplitText(role, TextProps));

  gsap.fromTo(
    splits[0].chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );

  gsap.fromTo(
    ".landing-info-h2",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      y: 0,
      delay: 0.8,
    }
  );
  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      delay: 0.1,
    }
  );

  roles.forEach((role, i) => {
    role.style.opacity = "1";
    if (i !== 0) {
      gsap.set(splits[i].chars, { opacity: 0, y: 80 });
    }
  });

  const tl = gsap.timeline({ repeat: -1 });
  const wordDuration = 3;

  splits.forEach((split, i) => {
    const nextIndex = (i + 1) % splits.length;
    const nextSplit = splits[nextIndex];

    tl.to(split.chars, {
      y: -80,
      opacity: 0,
      duration: 1.0,
      ease: "power3.inOut",
      stagger: 0.05
    }, `+=${wordDuration}`)
    .fromTo(nextSplit.chars,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.0,
        ease: "power3.inOut",
        stagger: 0.05
      },
      "<"
    );
  });
}

