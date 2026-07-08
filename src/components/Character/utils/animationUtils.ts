import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { eyebrowBoneNames, typingBoneNames } from "../../../data/boneData";

const boneNameMap: { [key: string]: string } = {
  "spine006": "Head",
  "spine.006": "Head",
  "spine005": "Neck",
  "spine.005": "Neck",
  "forearmL": "LeftForeArm",
  "forearm.L": "LeftForeArm",
  "forearmR": "RightForeArm",
  "forearm.R": "RightForeArm",
  "handL": "LeftHand",
  "hand.L": "LeftHand",
  "handR": "RightHand",
  "hand.R": "RightHand",
  "upper_armL": "LeftArm",
  "upper_arm.L": "LeftArm",
  "upper_armR": "RightArm",
  "upper_arm.R": "RightArm",
  "thighL": "LeftUpLeg",
  "thigh.L": "LeftUpLeg",
  "thighR": "RightUpLeg",
  "thigh.R": "RightUpLeg",
  "shinL": "LeftLeg",
  "shin.L": "LeftLeg",
  "shinR": "RightLeg",
  "shin.R": "RightLeg",
  "footL": "LeftFoot",
  "foot.L": "LeftFoot",
  "footR": "RightFoot",
  "foot.R": "RightFoot"
};

function retargetClip(clip: THREE.AnimationClip): THREE.AnimationClip {
  const retargetedTracks = clip.tracks.map((track) => {
    let trackName = track.name;
    Object.keys(boneNameMap).forEach((oldName) => {
      const newName = boneNameMap[oldName];
      const regex = new RegExp(`\\b${oldName.replace(".", "\\.")}\\b`, "g");
      trackName = trackName.replace(regex, newName);
    });
    const newTrack = track.clone();
    newTrack.name = trackName;
    return newTrack;
  });
  return new THREE.AnimationClip(clip.name, clip.duration, retargetedTracks);
}

const setAnimations = (gltf: GLTF, sourceAnimations?: THREE.AnimationClip[]) => {
  let character = gltf.scene;
  let mixer = new THREE.AnimationMixer(character);
  
  // Check if this is the new model with the 'Head' bone (Avaturn skeleton)
  const isNewModel = character.getObjectByName("Head") !== undefined;

  const originalAnimations = sourceAnimations || gltf.animations || [];
  const processedAnimations = isNewModel
    ? originalAnimations.map(clip => retargetClip(clip))
    : originalAnimations;

  if (processedAnimations.length > 0) {
    const introClip = processedAnimations.find(
      (clip) => clip.name === "introAnimation"
    );
    if (introClip) {
      const introAction = mixer.clipAction(introClip);
      introAction.setLoop(THREE.LoopOnce, 1);
      introAction.clampWhenFinished = true;
      introAction.play();
    }

    const clipNames = ["key1", "key2", "key5", "key6"];
    clipNames.forEach((name) => {
      const clip = processedAnimations.find((anim) => anim.name === name);
      if (clip) {
        const action = mixer?.clipAction(clip);
        action!.play();
        action!.timeScale = 1.2;
      }
    });

    let typingAction: THREE.AnimationAction | null = null;
    typingAction = createBoneAction(mixer, "typing", typingBoneNames, processedAnimations, isNewModel);
    if (typingAction) {
      typingAction.enabled = true;
      typingAction.play();
      typingAction.timeScale = 1.2;
    }
  }

  function startIntro() {
    if (processedAnimations.length === 0) return;
    const introClip = processedAnimations.find(
      (clip) => clip.name === "introAnimation"
    );
    if (introClip) {
      const introAction = mixer.clipAction(introClip);
      introAction.clampWhenFinished = true;
      introAction.reset().play();
    }
    setTimeout(() => {
      const blink = processedAnimations.find((clip) => clip.name === "Blink");
      if (blink) {
        mixer.clipAction(blink).play().fadeIn(0.5);
      }
    }, 2500);
  }

  function hover(_gltf: GLTF, hoverDiv: HTMLDivElement) {
    if (processedAnimations.length === 0) return;
    let eyeBrowUpAction = createBoneAction(
      mixer,
      "browup",
      eyebrowBoneNames,
      processedAnimations,
      isNewModel
    );
    let isHovering = false;
    if (eyeBrowUpAction) {
      eyeBrowUpAction.setLoop(THREE.LoopOnce, 1);
      eyeBrowUpAction.clampWhenFinished = true;
      eyeBrowUpAction.enabled = true;
    }
    const onHoverFace = () => {
      if (eyeBrowUpAction && !isHovering) {
        isHovering = true;
        eyeBrowUpAction.reset();
        eyeBrowUpAction.enabled = true;
        eyeBrowUpAction.setEffectiveWeight(4);
        eyeBrowUpAction.fadeIn(0.5).play();
      }
    };
    const onLeaveFace = () => {
      if (eyeBrowUpAction && isHovering) {
        isHovering = false;
        eyeBrowUpAction.fadeOut(0.6);
      }
    };
    if (!hoverDiv) return;
    hoverDiv.addEventListener("mouseenter", onHoverFace);
    hoverDiv.addEventListener("mouseleave", onLeaveFace);
    return () => {
      hoverDiv.removeEventListener("mouseenter", onHoverFace);
      hoverDiv.removeEventListener("mouseleave", onLeaveFace);
    };
  }

  return { mixer, startIntro, hover };
};

const createBoneAction = (
  mixer: THREE.AnimationMixer,
  clip: string,
  boneNames: string[],
  processedAnimations: THREE.AnimationClip[],
  isNewModel: boolean
): THREE.AnimationAction | null => {
  const AnimationClip = processedAnimations.find((anim) => anim.name === clip);
  if (!AnimationClip) {
    console.error(`Animation "${clip}" not found.`);
    return null;
  }

  const mappedBoneNames = isNewModel
    ? boneNames.map(name => boneNameMap[name] || name)
    : boneNames;
  const filteredClip = filterAnimationTracks(AnimationClip, mappedBoneNames);

  return mixer.clipAction(filteredClip);
};

const filterAnimationTracks = (
  clip: THREE.AnimationClip,
  boneNames: string[]
): THREE.AnimationClip => {
  const filteredTracks = clip.tracks.filter((track) =>
    boneNames.some((boneName) => track.name.includes(boneName))
  );

  return new THREE.AnimationClip(
    clip.name + "_filtered",
    clip.duration,
    filteredTracks
  );
};

export default setAnimations;
