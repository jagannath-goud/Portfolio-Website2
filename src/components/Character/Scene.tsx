import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  const [character, setChar] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);
      loadCharacter().then((gltf) => {
        if (gltf) {
          const character = gltf.scene;
          setChar(character);
          scene.add(character);

          const isNewModel = character.getObjectByName("Head") !== undefined;

          // Check if animations are embedded in the loaded character model (e.g. original model)
          const hasAnimations = gltf.animations && gltf.animations.length > 0;

          const initModelWithAnimations = (originalAnimations: THREE.AnimationClip[]) => {
            const animations = setAnimations(gltf, originalAnimations);
            hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
            mixer = animations.mixer;

            if (isNewModel) {
              // Avaturn model: target "Head" bone, no mesh hiding, no transparent plane
              headBone = character.getObjectByName("Head") || null;
              screenLight = character.getObjectByName("screenlight") || null;
            } else {
              // Original model: target "spine006" bone, hide original head meshes, attach transparent face cutout
              headBone = character.getObjectByName("spine006") || 
                         character.getObjectByName("spine_006") || 
                         character.getObjectByName("spine.006") || 
                         null;
              
              if (!headBone) {
                character.traverse((c) => {
                  const cName = c.name.toLowerCase();
                  if (cName.includes("spine") && cName.includes("006")) {
                    headBone = c;
                  }
                });
              }

              screenLight = character.getObjectByName("screenlight") || null;

              // Hide original mouth/teeth/glasses, but keep head/hair/eyes/ears visible for solid 3D backing
              character.traverse((child: any) => {
                if (child.isMesh) {
                  const mesh = child as THREE.Mesh;
                  child.castShadow = true;
                  child.receiveShadow = true;
                  mesh.frustumCulled = true;

                  const name = child.name.toLowerCase();
                  if (name === "userfacecutout") return;
                  if (
                    name.includes("teeth") ||
                    name.includes("glasses") ||
                    name.includes("beard") ||
                    name.includes("mouth")
                  ) {
                    child.visible = false;
                  }
                }
              });

              // Apply your face texture directly to the head mesh material as its skin!
              const headMesh = character.getObjectByName("Cube_002") || 
                               character.getObjectByName("Cube.002") || 
                               null;
              
              if (headMesh && (headMesh as THREE.Mesh).isMesh) {
                const mesh = headMesh as THREE.Mesh;
                const originalMaterial = mesh.material as THREE.MeshStandardMaterial;
                const faceMaterial = originalMaterial.clone();
                
                // Set skin base color matching your cartoon avatar's skin tone
                faceMaterial.color.set("#d4956a");
                
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(
                  "/images/avatar.png",
                  (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    
                    // Align the face features texture map
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    
                    faceMaterial.map = texture;
                    faceMaterial.needsUpdate = true;
                    mesh.material = faceMaterial;
                  },
                  undefined,
                  (err) => {
                    console.error("Failed to load avatar face texture:", err);
                  }
                );
              }
            }

            progress.loaded().then(() => {
              setTimeout(() => {
                light.turnOnLights();
                animations.startIntro();
              }, 2500);
            });
            window.addEventListener("resize", () =>
              handleResize(renderer, camera, canvasDiv, character)
            );
          };

          if (hasAnimations) {
            // Original model: use embedded animations directly (no extra file required!)
            initModelWithAnimations(gltf.animations);
          } else {
            // Avaturn model: load external animations clip reference file as fallback
            const animationsLoader = new GLTFLoader();
            animationsLoader.load(
              "/models/animations.glb",
              (animGltf: any) => {
                initModelWithAnimations(animGltf.animations);
              },
              undefined,
              (err: any) => {
                console.error("Failed to load fallback animations reference:", err);
                initModelWithAnimations([]);
              }
            );
          }
        }
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", (event) => {
        onMouseMove(event);
      });
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const animate = () => {
        requestAnimationFrame(animate);
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();
      return () => {
        clearTimeout(debounce);
        scene.clear();
        renderer.dispose();
        window.removeEventListener("resize", () =>
          handleResize(renderer, camera, canvasDiv, character!)
        );
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
