/* eslint-disable react/no-unknown-property */
import { useGSAP } from '@gsap/react';
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';

export default function Model(props) {
  const { nodes, materials } = useGLTF('/models/3jsWorld.glb');
  const characterRef = useRef();
  const isMoving = useRef(false);
  const initialY = useRef(null);

  // Jump state
  const jumpCount = useRef(0);      // 0 = grounded, 1 = first jump used, 2 = double jump used
  const isJumping = useRef(false);
  const jumpTimeline = useRef(null);

  // Physics / movement constants
  const CAPSULE_RADIUS = 0.35;
  const CAPSULE_HEIGHT = 1;
  const BOUNCE_HEIGHT = 5;          // Cosmetic hop height during tile movement
  const JUMP_HEIGHT = 22;           // First jump peak height
  const DOUBLE_JUMP_HEIGHT = 16;    // Second jump peak height
  const MAX_STEP_HEIGHT = 12;       // Max height difference the character can step up onto

  const colliderOctree = useRef(new Octree()).current;
  const playerCollider = useRef(new Capsule(
    new THREE.Vector3(0, CAPSULE_RADIUS, 0),
    new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
    CAPSULE_RADIUS
  )).current;

  const environmentRef = useRef();

  useEffect(() => {
    if (environmentRef.current) {
      colliderOctree.fromGraphNode(environmentRef.current);
    }
  }, [nodes]);


  useGSAP(() => {
    // Store the character's initial Y once on first run
    if (characterRef.current && initialY.current === null) {
      initialY.current = characterRef.current.position.y;
    }

    // Raycast straight down from high altitude to find the floor surface Y at (x, z).
    // Returns the hit Y coordinate, or null if nothing was hit.
    function getRayFloorY(x, z) {
      const ray = new THREE.Ray(
        new THREE.Vector3(x, 1000, z),
        new THREE.Vector3(0, -1, 0)
      );
      const hit = colliderOctree.rayIntersect(ray);
      return hit ? hit.position.y : null;
    }

    // ── JUMP ────────────────────────────────────────────────────────────────────
    function doJump() {
      if (jumpCount.current >= 2 || !characterRef.current) return;

      // Kill any in-flight jump so double-jump starts from current height
      if (jumpTimeline.current) {
        jumpTimeline.current.kill();
        jumpTimeline.current = null;
      }

      jumpCount.current++;
      isJumping.current = true;

      const currentY = characterRef.current.position.y;
      const jumpH = jumpCount.current === 1 ? JUMP_HEIGHT : DOUBLE_JUMP_HEIGHT;
      const landingY = initialY.current !== null ? initialY.current : -4.0;

      jumpTimeline.current = gsap.timeline({
        onComplete: () => {
          isJumping.current = false;
          jumpCount.current = 0;
          jumpTimeline.current = null;
        }
      });

      // Rise to peak
      jumpTimeline.current.to(characterRef.current.position, {
        y: currentY + jumpH,
        duration: 0.45,
        ease: 'power2.out',
      });

      // Fall back to floor
      jumpTimeline.current.to(characterRef.current.position, {
        y: landingY,
        duration: 0.4,
        ease: 'power2.in',
      });
    }

    // ── MOVEMENT ─────────────────────────────────────────────────────────────────
    function moveCharacter(newPos, targetRotation) {
      if (!characterRef.current) return;

      const scale = 5.596;
      const currentFloorY = initialY.current !== null ? initialY.current : -4.0;
      const currentPos = characterRef.current.position;

      // ── Floor height detection ───────────────────────────────────────────────
      // Raycast at both current and destination positions.
      // The *difference* between hits gives us the true floor height change,
      // regardless of any world-space offset between the character origin and the surface.
      const srcRayY = getRayFloorY(currentPos.x, currentPos.z);
      const dstRayY = getRayFloorY(newPos.x, newPos.z);

      let destFloorY = currentFloorY;
      if (srcRayY !== null && dstRayY !== null) {
        destFloorY = currentFloorY + (dstRayY - srcRayY);
      }

      // Block movement if the platform is too high to step onto
      if (destFloorY - currentFloorY > MAX_STEP_HEIGHT) {
        isMoving.current = false;
        return;
      }

      // ── Capsule collision at destination ─────────────────────────────────────
      const tempCollider = playerCollider.clone();
      tempCollider.start.set(newPos.x, destFloorY + CAPSULE_RADIUS * scale, newPos.z);
      tempCollider.end.set(newPos.x, destFloorY + CAPSULE_HEIGHT * scale - CAPSULE_RADIUS * scale, newPos.z);
      tempCollider.radius = CAPSULE_RADIUS * scale;

      const result = colliderOctree.capsuleIntersect(tempCollider);
      if (result && result.normal.y < 0.5) {
        // Wall collision — block movement
        isMoving.current = false;
        return;
      }

      // ── Commit the move ───────────────────────────────────────────────────────
      isMoving.current = true;
      initialY.current = destFloorY;

      // Moving resets jump state so the player can jump again after landing
      if (jumpTimeline.current) {
        jumpTimeline.current.kill();
        jumpTimeline.current = null;
        isJumping.current = false;
        jumpCount.current = 0;
      }

      gsap.killTweensOf(characterRef.current.position);
      gsap.killTweensOf(characterRef.current.rotation);

      // Arc peak sits above whichever surface is higher
      const peakY = Math.max(currentFloorY, destFloorY) + BOUNCE_HEIGHT;

      const t1 = gsap.timeline({
        onComplete: () => { isMoving.current = false; }
      });

      // XZ slide
      t1.to(characterRef.current.position, {
        x: newPos.x,
        z: newPos.z,
        duration: 0.5,
        ease: 'power2.out',
      }, 0);

      // Rotation
      t1.to(characterRef.current.rotation, {
        y: targetRotation,
        duration: 0.5,
        ease: 'power2.out',
      }, 0);

      // Rise to arc peak
      t1.to(characterRef.current.position, {
        y: peakY,
        duration: 0.25,
        ease: 'power2.out',
      }, 0);

      // Land on destination floor
      t1.to(characterRef.current.position, {
        y: destFloorY,
        duration: 0.25,
        ease: 'power2.in',
      }, 0.25);
    }

    // ── INPUT ─────────────────────────────────────────────────────────────────
    const onKeyDown = (event) => {
      if (!characterRef.current) return;

      // Space: jump — not blocked by isMoving so you can jump mid-move
      if (event.key === ' ') {
        event.preventDefault();
        doJump();
        return;
      }

      // Movement keys are blocked while a tile move is in progress
      if (isMoving.current) return;

      let newPos = { ...characterRef.current.position };
      let targetRotation = 0;

      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          newPos.x -= 5;
          targetRotation = -Math.PI;
          break;
        case 's':
        case 'arrowdown':
          newPos.x += 5;
          targetRotation = 0;
          break;
        case 'a':
        case 'arrowleft':
          newPos.z += 5;
          targetRotation = -Math.PI / 2;
          break;
        case 'd':
        case 'arrowright':
          newPos.z -= 5;
          targetRotation = Math.PI / 2;
          break;
        default:
          return;
      }

      moveCharacter(newPos, targetRotation);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });


  return (
    <group {...props} dispose={null}>
      <group ref={characterRef} position={[38.753, -4.0, -120.953]} rotation={[0, -Math.PI / 2, 0]} scale={5.596}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001.geometry}
          material={materials.body}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_1.geometry}
          material={materials.eye}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_2.geometry}
          material={materials.nose}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_3.geometry}
          material={materials.leg}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube001_4.geometry}
          material={materials['Material.001']}
        />
      </group>
      <group ref={environmentRef}>
        <group position={[1.57, 0, 82.897]} scale={2.151}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017.geometry}
            material={materials['Material.004']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_1.geometry}
            material={materials['Material.005']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_2.geometry}
            material={materials['treee leaves']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_3.geometry}
            material={materials.center}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_4.geometry}
            material={materials['Material.002']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_5.geometry}
            material={materials['Material.003']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_6.geometry}
            material={materials.rock}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_7.geometry}
            material={materials['Material.012']}
          />

          {/* car */}
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_8.geometry}
            material={materials['Material.013']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_9.geometry}
            material={materials['Material.014']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_10.geometry}
            material={materials['Material.015']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_11.geometry}
            material={materials['Material.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_12.geometry}
            material={materials['Material.016']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_13.geometry}
            material={materials['Material.018']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane017_14.geometry}
            material={materials['Material.017']}
          />
        </group>
        <group position={[-159.315, 29.217, 70.748]} scale={[1.367, 12.194, 16.041]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube005.geometry}
            material={materials.frame}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube005_1.geometry}
            material={materials.image1}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube005_2.geometry}
            material={materials['Material.004']}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/3jsWorld.glb')
