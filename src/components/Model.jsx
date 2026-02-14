/* eslint-disable react/no-unknown-property */
import { useGSAP } from '@gsap/react';
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';

export default function Model(props) {
  const { nodes, materials, scene } = useGLTF('/models/3jsWorld.glb');
  const characterRef = useRef(); // Use a ref for the character
  // Use ref for isMoving to avoid stale closures in event listeners
  const isMoving = useRef(false);
  const initialY = useRef(null);

  //physics
  const GRAVITY = 30;
  const CAPSULE_RADIUS = 0.35;
  const CAPSULE_HEIGHT = 1;
  const JUMP_HEIGHT = 15;
  const MOVE_SPEED = 1;


  const colliderOctree = useRef(new Octree()).current;
  const playerCollider = useRef(new Capsule(
    new THREE.Vector3(0, CAPSULE_RADIUS, 0),
    new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
    CAPSULE_RADIUS
  )).current;

  let playerVelocity = new THREE.Vector3();
  let playerOnFloor = false;

  const environmentRef = useRef();

  useEffect(() => {
    if (environmentRef.current) {
      colliderOctree.fromGraphNode(environmentRef.current);
    }
  }, [nodes]);


  useGSAP(() => {
    if (characterRef.current && initialY.current === null) {
      initialY.current = characterRef.current.position.y;
    }

    function moveCharacter(newPos, targetRotation) {
      if (!characterRef.current) return;

      // Update collider position to check collision
      const scale = 5.596;
      const tempCollider = playerCollider.clone();

      tempCollider.start.set(newPos.x, newPos.y + CAPSULE_RADIUS * scale, newPos.z);
      tempCollider.end.set(newPos.x, newPos.y + CAPSULE_HEIGHT * scale - CAPSULE_RADIUS * scale, newPos.z);
      tempCollider.radius = CAPSULE_RADIUS * scale;

      const result = colliderOctree.capsuleIntersect(tempCollider);

      if (result) {
        // If interaction with wall (not floor), block.
        // Floor normal relies on Y up.
        if (result.normal.y < 0.5) {
          // Wall
          isMoving.current = false;
          return;
        }
      }

      isMoving.current = true;

      // Reset Y position
      if (initialY.current !== null) {
        characterRef.current.position.y = initialY.current;
      }

      gsap.killTweensOf(characterRef.current.position);
      gsap.killTweensOf(characterRef.current.rotation);

      const t1 = gsap.timeline({
        onComplete: () => {
          isMoving.current = false;
        }
      });

      t1.to(characterRef.current.position, {
        x: newPos.x,
        z: newPos.z,
        duration: 0.5,
        ease: 'power2.out',
      });

      t1.to(characterRef.current.rotation, {
        y: targetRotation,
        duration: 0.5,
        ease: 'power2.out',
      }, 0);

      t1.to(characterRef.current.position, {
        y: (initialY.current || -4.0) + 5,
        duration: 0.25,
        yoyo: true,
        repeat: 1,
      }, 0);
    }

    const onKeyDown = (event) => {
      // Check ref current value
      if (isMoving.current) return;
      if (!characterRef.current) return;

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

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
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
            class
            onClick={(e) => console.log('click')}

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

