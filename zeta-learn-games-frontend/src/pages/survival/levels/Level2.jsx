import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import {
  Text,
  Html,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";

import * as THREE from "three";

import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

import mapImage from "../../../assets/survival/map.png";

import "./Level1.css";
import "./level2.css";


/* =========================================================
   CONSTANTS
========================================================= */

const GAME_TIME = 300;

const WORLD_WIDTH = 120;
const WORLD_DEPTH = 100;

const PLAYER_SPEED = 7;

const START_POSITION = {
  x: 0,
  z: 38,
};

const MAP_POSITION = {
  x: 48,
  z: -38,
};

const TRAIN_POSITION = {
  x: 0,
  z: 38,
};


/* =========================================================
   LEVEL 1 STYLE STATION
   SAME BASIC VISUAL LANGUAGE AS LEVEL 1
========================================================= */

function Station() {
  return (
    <>
      <div className="sky">
        <div className="moon" />

        <div className="stars stars-1" />
        <div className="stars stars-2" />
      </div>

      <div className="station-building">
        <div className="station-roof" />

        <div className="station-sign">
          OLD STATION
        </div>

        <div className="station-window sw1" />
        <div className="station-window sw2" />
        <div className="station-window sw3" />
        <div className="station-window sw4" />

        <div className="station-door" />
      </div>

      <div className="platform">
        <div className="platform-edge" />
      </div>

      <div className="railway">
        <div className="rail rail-left" />
        <div className="rail rail-right" />

        {Array.from({ length: 18 }).map((_, index) => (
          <div
            key={index}
            className="sleeper"
            style={{
              top: `${index * 6}%`,
            }}
          />
        ))}
      </div>

      <div className="lamp lamp-left">
        <div className="lamp-light" />
      </div>

      <div className="lamp lamp-right">
        <div className="lamp-light" />
      </div>

      <div className="fog fog-1" />
      <div className="fog fog-2" />
    </>
  );
}


/* =========================================================
   SAME LEVEL 1 TRAIN
========================================================= */

function Train({
  doorOpen = false,
  departing = false,
}) {
  return (
    <div
      className={`train ${
        departing
          ? "train-departing"
          : ""
      }`}
    >
      <div className="train-roof" />

      <div className="train-body">

        <div className="train-window window-1" />
        <div className="train-window window-2" />
        <div className="train-window window-3" />

        <div
          className={`train-door ${
            doorOpen
              ? "door-open"
              : ""
          }`}
        >
          <div className="door-inside" />

          <div className="door-left" />
          <div className="door-right" />
        </div>

        <div className="train-window window-4" />
        <div className="train-window window-5" />

        <div className="train-headlight" />
      </div>

      <div className="train-wheel wheel-1" />
      <div className="train-wheel wheel-2" />
      <div className="train-wheel wheel-3" />
      <div className="train-wheel wheel-4" />
    </div>
  );
}


/* =========================================================
   SAME LEVEL 1 PLAYER
========================================================= */

function Player({
  walking = false,
  entered = false,
}) {
  if (entered) {
    return null;
  }

  return (
    <div
      className={`player ${
        walking
          ? "player-walking"
          : ""
      }`}
    >
      <div className="player-head" />

      <div className="player-body" />

      <div className="player-arm arm-left" />
      <div className="player-arm arm-right" />

      <div className="player-leg leg-left" />
      <div className="player-leg leg-right" />
    </div>
  );
}


/* =========================================================
   CINEMATIC CONTINUATION
========================================================= */

function Level2Cinematic({
  stage,
  onContinue,
  onStart,
  onCompleteStory,
}) {
  const [doorOpen, setDoorOpen] = useState(false);
  const [walking, setWalking] = useState(false);
  const [showStory, setShowStory] = useState(false);

  useEffect(() => {
    if (stage !== "arrival") {
      return;
    }

    setDoorOpen(false);
    setWalking(false);
    setShowStory(false);

    // Arrival sequence: train enters smoothly -> stops -> door opens -> player exits.
    // The player is hidden until the door is actually open.
    const openTimer = setTimeout(() => {
      setDoorOpen(true);
    }, 6500);

    // Let the doors finish opening before the player steps out.
    const walkTimer = setTimeout(() => {
      setWalking(true);
    }, 7350);

    // The player walks continuously to the center. Only after the walk is complete
    // do we reveal the cinematic narration.
    const storyTimer = setTimeout(() => {
      setWalking(false);
      setShowStory(true);
    }, 10350);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(walkTimer);
      clearTimeout(storyTimer);
    };
  }, [stage]);

  /* =======================================================
     GAME DETAILS
  ======================================================= */

  if (stage === "details") {
    return (
      <main className="level1-screen level2-details-cinematic">
        <Station />

        <div className="level2-details-train">
          <Train
            doorOpen={true}
            departing={false}
          />
        </div>

        <div className="level2-details-overlay" />

        <div className="level2-details-content">
          <div className="level2-details-heading">
            <div className="level2-details-small">SURVIVAL ROUND</div>
            <h1>LEVEL 02</h1>
            <h2>THE ABANDONED STATION</h2>
            <div className="level2-details-heading-line" />
          </div>

          <div className="level2-details-grid">
            <section className="level2-detail-section level2-objective-section">
              <span className="level2-detail-label">OBJECTIVE</span>
              <p>Find the physical station map.</p>
              <p>Return to the exact place where you started.</p>
              <p>Reveal the map and find your way back to the train.</p>
            </section>

            <section className="level2-detail-section level2-controls-section">
              <span className="level2-detail-label">CONTROLS</span>
              <div className="level2-controls-layout">
                <div className="level2-keypad" aria-label="Movement controls">
                  <div className="level2-key-row">
                    <kbd>W</kbd>
                  </div>
                  <div className="level2-key-row">
                    <kbd>A</kbd>
                    <kbd>S</kbd>
                    <kbd>D</kbd>
                  </div>
                </div>
                <div className="level2-control-text">
                  <div>W / ↑ <span>Move Forward</span></div>
                  <div>S / ↓ <span>Move Backward</span></div>
                  <div>A / ← <span>Move Left</span></div>
                  <div>D / → <span>Move Right</span></div>
                  <div><kbd className="level2-e-key">E</kbd> <span>Interact / Take Map</span></div>
                </div>
              </div>
            </section>

            <section className="level2-detail-section level2-signal-section">
              <span className="level2-detail-label">SIGNAL SYSTEM</span>
              <div className="level2-signal-row green">
                <b>GREEN</b><span>Movement allowed.</span>
              </div>
              <div className="level2-signal-row yellow">
                <b>YELLOW</b><span>Stop. Movement is disabled.</span>
              </div>
              <div className="level2-signal-row red">
                <b>RED</b><span>Do not move.</span>
              </div>
              <strong className="level2-death-rule">MOVEMENT DURING RED = DEATH</strong>
            </section>

            <section className="level2-detail-section level2-survival-section">
              <div className="level2-mini-stat">
                <span>TIME LIMIT</span>
                <strong>05:00</strong>
              </div>
              <div className="level2-mini-stat">
                <span>SHADOWS</span>
                <strong>RED ONLY</strong>
              </div>
              <p className="level2-important-rule">
                Finding the map alone does not complete the level. You must return to your starting point and reveal it before you can return to the train.
              </p>
            </section>
          </div>

          <button
            className="level2-start-button"
            onClick={onStart}
          >
            START LEVEL 02
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     ARRIVAL + STORY
  ======================================================= */

  return (
    <main className="level1-screen level2-arrival">
      <Station />

      <div className="level2-arrival-train">
        <Train
          doorOpen={doorOpen}
          departing={false}
        />
      </div>

      <Player
        walking={walking}
        entered={!doorOpen}
      />

      <div className="level2-arrival-vignette" />

      {!showStory && (
        <div className="level2-arrival-status">
          {!doorOpen && <span>THE TRAIN IS ARRIVING...</span>}
          {doorOpen && !walking && <span>DOOR OPEN</span>}
          {walking && <span>EXITING TRAIN</span>}
        </div>
      )}

      {showStory && (
        <div
          className="level2-arrival-story"
          aria-live="polite"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            visibility: "visible",
            opacity: 1,
            pointerEvents: "auto",
          }}
        >
          <div className="level2-arrival-story-kicker">STATION 02</div>
          <div className="level2-arrival-story-line" />

          <div className="level2-arrival-story-text">
            <p>I DON'T KNOW WHERE I AM.</p>
            <p>I NEED TO FIND A WAY TO GET OUT.</p>
            <p>THERE ARE MANY PATHS FROM HERE.</p>
          </div>

          <button
            className="level2-arrival-continue"
            onClick={onContinue}
          >
            CONTINUE
          </button>
        </div>
      )}
    </main>
  );
}


/* =========================================================
   3D STATION
========================================================= */


/* ---------------------------------------------------------
   WALL
--------------------------------------------------------- */

function Wall({
  position,
  size,
  color = "#17191d",
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />

      <meshStandardMaterial
        color={color}
        roughness={0.92}
        metalness={0.05}
      />
    </mesh>
  );
}


/* ---------------------------------------------------------
   FLOOR
--------------------------------------------------------- */

function Floor() {
  return (
    <mesh
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
      receiveShadow
    >
      <planeGeometry
        args={[
          WORLD_WIDTH,
          WORLD_DEPTH,
        ]}
      />

      <meshStandardMaterial
        color="#292a29"
        roughness={0.9}
      />
    </mesh>
  );
}


/* ---------------------------------------------------------
   PILLAR
--------------------------------------------------------- */

function Pillar({
  x,
  z,
}) {
  return (
    <group
      position={[
        x,
        4,
        z,
      ]}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry
          args={[
            2,
            8,
            2,
          ]}
        />

        <meshStandardMaterial
          color="#202225"
          roughness={0.9}
        />
      </mesh>

      <mesh
        position={[
          0,
          4.1,
          0,
        ]}
      >
        <boxGeometry
          args={[
            2.8,
            0.35,
            2.8,
          ]}
        />

        <meshStandardMaterial
          color="#0c0d0f"
        />
      </mesh>
    </group>
  );
}


/* ---------------------------------------------------------
   BENCH
--------------------------------------------------------- */

function Bench({
  position,
  rotation = 0,
}) {
  return (
    <group
      position={position}
      rotation={[
        0,
        rotation,
        0,
      ]}
    >

      <mesh
        position={[
          0,
          1.2,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            5,
            0.35,
            1.2,
          ]}
        />

        <meshStandardMaterial
          color="#302a24"
          roughness={0.9}
        />
      </mesh>

      <mesh
        position={[
          0,
          2.4,
          0.45,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            5,
            2.5,
            0.3,
          ]}
        />

        <meshStandardMaterial
          color="#272321"
          roughness={0.9}
        />
      </mesh>

      <mesh
        position={[
          -1.8,
          0.6,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.25,
            1.2,
            1,
          ]}
        />

        <meshStandardMaterial
          color="#171717"
        />
      </mesh>

      <mesh
        position={[
          1.8,
          0.6,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.25,
            1.2,
            1,
          ]}
        />

        <meshStandardMaterial
          color="#171717"
        />
      </mesh>

    </group>
  );
}


/* ---------------------------------------------------------
   LAMP
--------------------------------------------------------- */

function StationLamp({
  position,
}) {
  return (
    <group position={position}>

      <mesh castShadow>
        <cylinderGeometry
          args={[
            0.15,
            0.2,
            7,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#181818"
        />
      </mesh>

      <mesh
        position={[
          0,
          3.6,
          0,
        ]}
      >
        <sphereGeometry
          args={[
            0.5,
            16,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#9a8a62"
          emissive="#705e36"
          emissiveIntensity={2}
        />
      </mesh>

      <pointLight
        position={[
          0,
          3.5,
          0,
        ]}
        intensity={5}
        distance={16}
      />

    </group>
  );
}


/* ---------------------------------------------------------
   RAILWAY TRACK
--------------------------------------------------------- */

function RailwayTrack({
  z,
}) {
  const sleepers = [];

  for (
    let i = -50;
    i <= 50;
    i += 4
  ) {
    sleepers.push(i);
  }

  return (
    <group>

      <mesh
        position={[
          0,
          0.08,
          z,
        ]}
        rotation={[
          0,
          0,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            WORLD_WIDTH,
            0.15,
            8,
          ]}
        />

        <meshStandardMaterial
          color="#111111"
          roughness={1}
        />
      </mesh>

      <mesh
        position={[
          -2,
          0.2,
          z,
        ]}
      >
        <boxGeometry
          args={[
            WORLD_WIDTH,
            0.15,
            0.15,
          ]}
        />

        <meshStandardMaterial
          color="#55504a"
          metalness={0.8}
        />
      </mesh>

      <mesh
        position={[
          2,
          0.2,
          z,
        ]}
      >
        <boxGeometry
          args={[
            WORLD_WIDTH,
            0.15,
            0.15,
          ]}
        />

        <meshStandardMaterial
          color="#55504a"
          metalness={0.8}
        />
      </mesh>

      {sleepers.map((x) => (
        <mesh
          key={x}
          position={[
            x,
            0.12,
            z,
          ]}
        >
          <boxGeometry
            args={[
              0.6,
              0.2,
              7,
            ]}
          />

          <meshStandardMaterial
            color="#29231d"
          />
        </mesh>
      ))}

    </group>
  );
}


/* ---------------------------------------------------------
   CEILING
--------------------------------------------------------- */

function Ceiling() {
  return (
    <mesh
      position={[
        0,
        12,
        0,
      ]}
      receiveShadow
    >
      <boxGeometry
        args={[
          WORLD_WIDTH,
          0.5,
          WORLD_DEPTH,
        ]}
      />

      <meshStandardMaterial
        color="#0d0f12"
        roughness={1}
      />
    </mesh>
  );
}


/* ---------------------------------------------------------
   STATION SIGN
--------------------------------------------------------- */

function StationSign({
  position,
  text,
}) {
  return (
    <group position={position}>

      <mesh>
        <boxGeometry
          args={[
            7,
            2,
            0.3,
          ]}
        />

        <meshStandardMaterial
          color="#101214"
        />
      </mesh>

      <Text
        position={[
          0,
          0,
          0.2,
        ]}
        fontSize={0.65}
        color="#b7a67b"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>

    </group>
  );
}


/* ---------------------------------------------------------
   ROOM
--------------------------------------------------------- */

function Room({
  position,
  width,
  depth,
  label,
}) {
  return (
    <group position={position}>

      <Wall
        position={[
          -width / 2,
          3,
          0,
        ]}
        size={[
          1,
          6,
          depth,
        ]}
      />

      <Wall
        position={[
          width / 2,
          3,
          0,
        ]}
        size={[
          1,
          6,
          depth,
        ]}
      />

      <Wall
        position={[
          0,
          3,
          -depth / 2,
        ]}
        size={[
          width,
          6,
          1,
        ]}
      />

      <Text
        position={[
          0,
          4.7,
          -depth / 2 + 0.6,
        ]}
        rotation={[
          0,
          0,
          0,
        ]}
        fontSize={0.7}
        color="#aaa"
        anchorX="center"
      >
        {label}
      </Text>

    </group>
  );
}


/* ---------------------------------------------------------
   MAP BOARD
--------------------------------------------------------- */

function PhysicalMap({
  taken,
  near,
}) {
  const mapTexture = useLoader(THREE.TextureLoader, mapImage);

  if (taken) {
    return null;
  }

  return (
    <group position={[MAP_POSITION.x, 0, MAP_POSITION.z]}>
      {/* A clearly visible old wooden map table. */}
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.8, 1.8, 3.6]} />
        <meshStandardMaterial color="#4a3423" roughness={0.9} />
      </mesh>

      {[-2.2, 2.2].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.05, -1.2]} castShadow>
            <boxGeometry args={[0.38, 1.7, 0.38]} />
            <meshStandardMaterial color="#2b1c14" roughness={1} />
          </mesh>
          <mesh position={[x, 0.05, 1.2]} castShadow>
            <boxGeometry args={[0.38, 1.7, 0.38]} />
            <meshStandardMaterial color="#2b1c14" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* Large physical railway map, standing up so it is impossible to miss. */}
      <mesh position={[0, 3.0, -0.55]} rotation={[-0.10, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.6, 2.7, 0.12]} />
        <meshStandardMaterial color="#d8c28f" roughness={0.82} />
      </mesh>
      <mesh position={[0, 3.0, -0.63]} rotation={[-0.10, 0, 0]}>
        <planeGeometry args={[4.25, 2.35]} />
        <meshStandardMaterial
          map={mapTexture}
          color="#efe1b8"
          roughness={0.8}
          emissive={near ? "#6a5425" : "#000000"}
          emissiveIntensity={near ? 0.45 : 0.05}
        />
      </mesh>

      {/* Physical-looking map emoji marker floating directly above the object. */}
      <Html position={[0, 5.15, -0.55]} center transform distanceFactor={7} zIndexRange={[20, 0]}>
        <div className={`l2-physical-map-marker ${near ? "is-near" : ""}`}>
          <div className="l2-physical-map-emoji">🗺️</div>
          <div className="l2-physical-map-label">RAILWAY MAP</div>
        </div>
      </Html>

      {/* Small lamp makes the object readable from a distance. */}
      <mesh position={[2.1, 2.1, 0.8]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.45, 12]} />
        <meshStandardMaterial color="#171717" roughness={0.7} />
      </mesh>
      <pointLight position={[2.1, 2.55, 0.8]} intensity={near ? 3.2 : 1.7} distance={8} color="#ffd88a" />

      <Text
        position={[0, 4.15, -0.58]}
        fontSize={0.46}
        color={near ? "#fff4c4" : "#f1d98f"}
        anchorX="center"
        outlineWidth={0.04}
        outlineColor="#18120d"
      >
        {near ? "[E] TAKE MAP" : "RAILWAY MAP"}
      </Text>
    </group>
  );
}

/* ---------------------------------------------------------
   3D PLAYER
--------------------------------------------------------- */

function Player3D({
  position,
}) {
  return (
    <group
      position={[
        position[0],
        1,
        position[1],
      ]}
    >

      <mesh castShadow>
        <capsuleGeometry
          args={[
            0.45,
            1.1,
            8,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#c7c7c7"
          roughness={0.8}
        />
      </mesh>

      <mesh
        position={[
          0,
          1.05,
          0,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[
            0.42,
            16,
            16,
          ]}
        />

        <meshStandardMaterial
          color="#d4c7b8"
        />
      </mesh>

    </group>
  );
}


/* ---------------------------------------------------------
   3D SIGNAL
--------------------------------------------------------- */

function SignalTower({
  signal,
}) {
  const color =
    signal === "green"
      ? "#39ff88"
      : signal === "yellow"
      ? "#ffd83d"
      : "#ff3030";

  return (
    <group
      position={[
        0,
        6,
        -8,
      ]}
    >

      <mesh>
        <boxGeometry
          args={[
            2,
            12,
            2,
          ]}
        />

        <meshStandardMaterial
          color="#15171a"
        />
      </mesh>

      <mesh
        position={[
          0,
          2.7,
          1.1,
        ]}
      >
        <sphereGeometry
          args={[
            0.65,
            20,
            20,
          ]}
        />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={
            signal === "red"
              ? 4
              : 2
          }
        />
      </mesh>

      <Text
        position={[
          0,
          4.2,
          1.1,
        ]}
        fontSize={0.55}
        color={color}
        anchorX="center"
      >
        {signal.toUpperCase()}
      </Text>

    </group>
  );
}


/* ---------------------------------------------------------
   BLACK SHADOW
   ONLY RENDERED DURING RED
--------------------------------------------------------- */

function BlackShadow({
  position,
  speed,
  direction,
  phase,
  drift,
}) {
  const ref = useRef();
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) {
      return;
    }

    elapsedRef.current += delta;
    const t = elapsedRef.current;

    // Small shadows wander in different directions and speeds.
    // They never chase the player; they simply roam through the station.
    ref.current.position.x +=
      direction *
      speed *
      (0.55 + Math.cos(t * 0.7 + phase) * 0.28) *
      delta;

    ref.current.position.z +=
      Math.sin(t * (0.45 + drift) + phase) *
      speed *
      0.42 *
      delta;

    if (ref.current.position.x > 58) ref.current.position.x = -58;
    if (ref.current.position.x < -58) ref.current.position.x = 58;
    if (ref.current.position.z > 48) ref.current.position.z = -48;
    if (ref.current.position.z < -48) ref.current.position.z = 48;
  });

  return (
    <group
      ref={ref}
      position={[
        position[0],
        1.2,
        position[1],
      ]}
      scale={[0.68, 0.68, 0.68]}
    >

      <mesh castShadow>
        <capsuleGeometry
          args={[
            0.3,
            1.8,
            5,
            8,
          ]}
        />

        <meshBasicMaterial
          color="#020202"
        />
      </mesh>

      <mesh
        position={[
          0,
          1.2,
          0,
        ]}
      >
        <sphereGeometry
          args={[
            0.32,
            8,
            8,
          ]}
        />

        <meshBasicMaterial
          color="#000000"
        />
      </mesh>

    </group>
  );
}


/* ---------------------------------------------------------
   SHADOW GROUP
--------------------------------------------------------- */

function RedShadows({
  active,
}) {
  const shadows = useMemo(
    () =>
      Array.from({
        length: 18,
      }).map((_, index) => ({
        x:
          -50 +
          Math.random() * 100,

        z:
          -45 +
          Math.random() * 80,

        speed:
          1.2 +
          Math.random() * 3.2,

        direction:
          index % 2 === 0
            ? 1
            : -1,

        phase:
          Math.random() * Math.PI * 2,

        drift:
          0.35 + Math.random() * 0.8,
      })),
    []
  );

  if (!active) {
    return null;
  }

  return (
    <group>
      {shadows.map(
        (shadow, index) => (
          <BlackShadow
            key={index}
            position={[
              shadow.x,
              shadow.z,
            ]}
            speed={
              shadow.speed
            }
            direction={
              shadow.direction
            }
            phase={shadow.phase}
            drift={shadow.drift}
          />
        )
      )}
    </group>
  );
}


/* ---------------------------------------------------------
   STATION WORLD
--------------------------------------------------------- */

function StationWorld({
  playerPosition,
  signal,
  mapTaken,
  mapNear,
  onMapNear,
  onMapTake,
}) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const targetX =
      playerPosition[0];

    const targetZ =
      playerPosition[1];

    const desiredCamera = new THREE.Vector3(
      targetX,
      13,
      targetZ + 18
    );

    camera.position.lerp(
      desiredCamera,
      1 -
        Math.pow(
          0.001,
          delta
        )
    );

    camera.lookAt(
      targetX,
      0,
      targetZ
    );
  });


  return (
    <>
      <color
        attach="background"
        args={[
          "#07090c",
        ]}
      />

      <fog
        attach="fog"
        args={[
          "#07090c",
          25,
          115,
        ]}
      />

      <ambientLight
        intensity={0.35}
      />

      <directionalLight
        position={[
          0,
          25,
          10,
        ]}
        intensity={0.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Floor />

      <Ceiling />

      {/* OUTER WALLS */}

      <Wall
        position={[
          -60,
          4,
          0,
        ]}
        size={[
          2,
          8,
          100,
        ]}
      />

      <Wall
        position={[
          60,
          4,
          0,
        ]}
        size={[
          2,
          8,
          100,
        ]}
      />

      <Wall
        position={[
          0,
          4,
          -50,
        ]}
        size={[
          120,
          8,
          2,
        ]}
      />

      <Wall
        position={[
          0,
          4,
          50,
        ]}
        size={[
          120,
          8,
          2,
        ]}
      />

      {/* CENTRAL HALL */}

      <Wall
        position={[
          -18,
          3,
          -5,
        ]}
        size={[
          1.5,
          6,
          25,
        ]}
      />

      <Wall
        position={[
          18,
          3,
          -5,
        ]}
        size={[
          1.5,
          6,
          25,
        ]}
      />

      {/* ROOMS */}

      <Room
        position={[
          -39,
          0,
          -24,
        ]}
        width={28}
        depth={20}
        label="ABANDONED ROOM"
      />

      <Room
        position={[
          39,
          0,
          20,
        ]}
        width={28}
        depth={20}
        label="OLD OFFICE"
      />

      {/* PILLARS */}

      <Pillar x={-12} z={-35} />
      <Pillar x={0} z={-35} />
      <Pillar x={12} z={-35} />

      <Pillar x={-12} z={-20} />
      <Pillar x={12} z={-20} />

      <Pillar x={-12} z={-5} />
      <Pillar x={12} z={-5} />

      <Pillar x={-12} z={12} />
      <Pillar x={12} z={12} />

      <Pillar x={-12} z={28} />
      <Pillar x={12} z={28} />

      {/* BENCHES */}

      <Bench
        position={[
          -33,
          0,
          4,
        ]}
        rotation={
          Math.PI / 2
        }
      />

      <Bench
        position={[
          -33,
          0,
          16,
        ]}
        rotation={
          Math.PI / 2
        }
      />

      <Bench
        position={[
          33,
          0,
          -5,
        ]}
        rotation={
          -Math.PI / 2
        }
      />

      <Bench
        position={[
          33,
          0,
          -17,
        ]}
        rotation={
          -Math.PI / 2
        }
      />

      {/* RAILWAY */}

      <RailwayTrack z={-43} />
      <RailwayTrack z={43} />

      {/* LAMPS */}

      <StationLamp
        position={[
          -48,
          0,
          -35,
        ]}
      />

      <StationLamp
        position={[
          48,
          0,
          -35,
        ]}
      />

      <StationLamp
        position={[
          -48,
          0,
          0,
        ]}
      />

      <StationLamp
        position={[
          48,
          0,
          0,
        ]}
      />

      <StationLamp
        position={[
          -48,
          0,
          35,
        ]}
      />

      <StationLamp
        position={[
          48,
          0,
          35,
        ]}
      />

      {/* SIGNS */}

      <StationSign
        position={[
          0,
          7,
          -45,
        ]}
        text="PLATFORM 02"
      />

      <StationSign
        position={[
          -35,
          6,
          -5,
        ]}
        text="WAITING ROOM"
      />

      <StationSign
        position={[
          35,
          6,
          12,
        ]}
        text="OFFICE"
      />

      {/* SIGNAL */}

      <SignalTower
        signal={signal}
      />

      {/* MAP */}

      <PhysicalMap
        taken={mapTaken}
        near={mapNear}
      />

      {/* PLAYER */}

      <Player3D
        position={
          playerPosition
        }
      />

      {/* BLACK SHADOWS
          IMPORTANT:
          ONLY ACTIVE DURING RED
      */}

      <RedShadows
        active={
          signal === "red"
        }
      />

    </>
  );
}


/* =========================================================
   COLLISION HELPERS
========================================================= */

const isBlocked = (
  x,
  z
) => {
  const margin = 2.2;

  /* OUTER WALLS */

  if (
    x < -57 + margin ||
    x > 57 - margin ||
    z < -47 + margin ||
    z > 47 - margin
  ) {
    return true;
  }

  /* CENTRAL WALLS */

  if (
    x > -18 - margin &&
    x < -18 + margin &&
    z > -17 &&
    z < 7
  ) {
    return true;
  }

  if (
    x > 18 - margin &&
    x < 18 + margin &&
    z > -17 &&
    z < 7
  ) {
    return true;
  }

  /* LEFT ROOM */

  if (
    x > -53 &&
    x < -25 &&
    z > -34 &&
    z < -14
  ) {
    return true;
  }

  /* RIGHT ROOM */

  if (
    x > 25 &&
    x < 53 &&
    z > 10 &&
    z < 30
  ) {
    return true;
  }

  return false;
};


/* =========================================================
   GAME COMPONENT
========================================================= */

/* =========================================================
   LEVEL 2 — FIRST-PERSON EXPLORATION GAME
   RED LIGHT / GREEN LIGHT SURVIVAL SYSTEM
========================================================= */

const L2_WORLD = {
  width: 180,
  depth: 150,
  halfW: 90,
  halfD: 75,
};

const L2_START = { x: 0, z: 58 };
const L2_MAP = { x: 48, z: -38 };
const L2_EXIT = { x: -72, z: -66 };

const L2_SPEED = 6.5;
const L2_EYE_HEIGHT = 2.0;

const L2_WALLS = [
  // central north/south partitions — deliberately leave wide passages
  { x: -30, z: 10, w: 2, d: 38 },
  { x: 30, z: 10, w: 2, d: 38 },
  { x: -30, z: -48, w: 2, d: 22 },
  { x: 30, z: -48, w: 2, d: 22 },

  // waiting hall partitions
  { x: -58, z: 18, w: 38, d: 2 },
  { x: 58, z: 18, w: 38, d: 2 },

  // office/service partitions
  { x: -58, z: -26, w: 38, d: 2 },
  { x: 58, z: -26, w: 38, d: 2 },

  // north office blocks
  { x: -58, z: -58, w: 38, d: 2 },
  { x: -34, z: -66, w: 2, d: 16 },
  { x: 34, z: -58, w: 38, d: 2 },
  { x: 58, z: -66, w: 2, d: 16 },
];

const l2RectBlocked = (x, z, wall, margin = 1.5) =>
  x > wall.x - wall.w / 2 - margin &&
  x < wall.x + wall.w / 2 + margin &&
  z > wall.z - wall.d / 2 - margin &&
  z < wall.z + wall.d / 2 + margin;

const l2CanMoveTo = (x, z) => {
  if (
    x < -L2_WORLD.halfW + 2 ||
    x > L2_WORLD.halfW - 2 ||
    z < -L2_WORLD.halfD + 2 ||
    z > L2_WORLD.halfD - 2
  ) {
    return false;
  }

  return !L2_WALLS.some((wall) => l2RectBlocked(x, z, wall));
};


/* =========================================================
   LEVEL 2 GAMEPLAY — SAME 2D WORLD STYLE AS LEVEL 4
   ONLY GAMEPLAY RULES ARE DIFFERENT:
   - one hidden physical map instead of 3 keys
   - red / yellow / green light instead of monsters
   - reach the exit after taking the map
========================================================= */

const GAME_WORLD = { width: 4200, height: 3000 };
const PLAYER_RADIUS = 18;
const GAME_PLAYER_SPEED = 285;

const GAME_WALLS = [
  { x: 0, y: 1450, w: 4200, h: 70 },
  { x: 0, y: -1450, w: 4200, h: 70 },
  { x: -2065, y: 0, w: 70, h: 2900 },
  { x: 2065, y: 0, w: 70, h: 2900 },
  { x: -1500, y: 1050, w: 900, h: 70 },
  { x: 350, y: 1050, w: 700, h: 70 },
  { x: 1400, y: 1050, w: 900, h: 70 },
  { x: -1050, y: 650, w: 70, h: 700 },
  { x: -250, y: 780, w: 70, h: 440 },
  { x: 650, y: 720, w: 70, h: 800 },
  { x: 1500, y: 650, w: 70, h: 700 },
  { x: -1600, y: 300, w: 650, h: 70 },
  { x: -500, y: 300, w: 500, h: 70 },
  { x: 550, y: 300, w: 650, h: 70 },
  { x: 1550, y: 300, w: 650, h: 70 },
  { x: -1250, y: -50, w: 70, h: 650 },
  { x: -700, y: -380, w: 70, h: 700 },
  { x: -100, y: -80, w: 70, h: 520 },
  { x: 500, y: -420, w: 70, h: 850 },
  { x: 1120, y: -50, w: 70, h: 700 },
  { x: 1650, y: -380, w: 70, h: 750 },
  { x: -1550, y: -850, w: 900, h: 70 },
  { x: -350, y: -850, w: 650, h: 70 },
  { x: 800, y: -850, w: 800, h: 70 },
  { x: 1750, y: -850, w: 450, h: 70 },
  { x: -1000, y: -1120, w: 70, h: 520 },
  { x: -300, y: -1150, w: 70, h: 600 },
  { x: 350, y: -1080, w: 70, h: 480 },
  { x: 1050, y: -1180, w: 70, h: 650 },
  { x: 1500, y: -1080, w: 70, h: 500 },
  { x: -1650, y: 720, w: 360, h: 55 },
  { x: -1450, y: -520, w: 420, h: 55 },
  { x: -250, y: 620, w: 330, h: 55 },
  { x: 820, y: 560, w: 420, h: 55 },
  { x: 1380, y: -560, w: 400, h: 55 },
  { x: 750, y: -1220, w: 430, h: 55 },
  { x: -650, y: -1220, w: 360, h: 55 },
  { x: 1600, y: 850, w: 350, h: 55 },
  { x: 1650, y: -250, w: 300, h: 55 },
];

const CRATES = [
  [-1760, 950, 150, 120], [-1580, 900, 120, 110], [-1360, 780, 130, 120], [-880, 930, 140, 120],
  [-470, 1000, 120, 110], [-50, 930, 150, 125], [260, 860, 130, 110], [850, 980, 150, 120],
  [1250, 900, 120, 120], [1680, 950, 150, 110], [1800, 650, 130, 120],
  [-1770, 150, 140, 120], [-1450, 120, 110, 110], [-850, 180, 160, 120], [-430, 90, 120, 110],
  [280, 120, 150, 130], [820, 170, 120, 110], [1300, 80, 150, 120], [1710, 160, 130, 110],
  [-1820, -700, 150, 120], [-1480, -640, 130, 110], [-900, -720, 150, 120], [-520, -600, 120, 110],
  [0, -690, 140, 120], [470, -720, 150, 110], [850, -620, 120, 110], [1250, -700, 150, 120], [1700, -650, 140, 120],
  [-1600, -1050, 120, 100], [-650, -1030, 150, 110], [300, -1050, 130, 110], [1050, -1000, 150, 110], [1600, -1030, 120, 100],
].map(([x, y, w, h], i) => ({ id: i + 1, x, y, w, h }));

/* Same physical room/area used by Level 4's first key, now containing the map. */
const GAME_MAP = { x: -1880, y: 620 };
const GAME_EXIT = { x: 1750, y: 1180 };
const GAME_START = { x: -1750, y: 1200 };

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function worldStyle(x, y) {
  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% - ${y}px)`,
  };
}

function rectCollision(x, y, r, rect) {
  const cx = clamp(x, rect.x - rect.w / 2, rect.x + rect.w / 2);
  const cy = clamp(y, rect.y - rect.h / 2, rect.y + rect.h / 2);
  return Math.hypot(x - cx, y - cy) < r;
}

function blocked(x, y, r = PLAYER_RADIUS) {
  if (
    x < -GAME_WORLD.width / 2 + r ||
    x > GAME_WORLD.width / 2 - r ||
    y < -GAME_WORLD.height / 2 + r ||
    y > GAME_WORLD.height / 2 - r
  ) return true;

  return (
    GAME_WALLS.some((wall) => rectCollision(x, y, r, wall)) ||
    CRATES.some((crate) => rectCollision(x, y, r, crate))
  );
}

function Level2MapObject({ near, taken }) {
  if (taken) return null;

  return (
    <div
      className={`l4-game-key l2-physical-map-object ${near ? "near" : ""}`}
      style={worldStyle(GAME_MAP.x, GAME_MAP.y)}
    >
      <div className="l2-map-board">
        <div className="l2-map-paper">
          <span>✦</span>
          <i />
          <b />
          <em />
        </div>
      </div>
      <small>RAILWAY MAP</small>
    </div>
  );
}

function Level2GameMap({ player, mapTaken, mapNear, exitNear, signal, walking }) {
  const red = signal === "red";

  return (
    <div className="l4-2d-game-viewport">
      <div
        className={`l4-game-world l2-level4-world ${red ? "l2-red-world" : ""}`}
        style={{ "--cam-x": `${player.x}px`, "--cam-y": `${player.y}px` }}
      >
        <div className="l4-world-floor" />
        <div className="l4-world-grid" />

        <div className="l4-zone-label" style={worldStyle(-1250, 780)}>WEST STORAGE</div>
        <div className="l4-zone-label" style={worldStyle(900, 780)}>MAIN HALL</div>
        <div className="l4-zone-label" style={worldStyle(1450, -700)}>EAST STORAGE</div>
        <div className="l4-zone-label" style={worldStyle(-850, -950)}>SERVICE</div>

        {GAME_WALLS.map((wall, index) => (
          <div
            key={`wall-${index}`}
            className="l4-big-wall"
            style={{ ...worldStyle(wall.x, wall.y), width: wall.w, height: wall.h }}
          >
            <i />
          </div>
        ))}

        {CRATES.map((crate) => (
          <div
            key={`crate-${crate.id}`}
            className="l4-crate"
            style={{ ...worldStyle(crate.x, crate.y), width: crate.w, height: crate.h }}
          >
            <i />
            <b />
            <span />
          </div>
        ))}

        <Level2MapObject near={mapNear} taken={mapTaken} />

        <div
          className={`l4-game-exit ${mapTaken ? "unlocked" : ""} ${exitNear ? "near" : ""}`}
          style={worldStyle(GAME_EXIT.x, GAME_EXIT.y)}
        >
          <span>{mapTaken ? "EXIT" : "LOCKED"}</span>
          <b>↗</b>
        </div>
      </div>

      <div className={`l4-camera-player station-style-player ${walking ? "player-walking" : "player-standing"}`}>
        <div className="player-shadow" />
        <div className="player-topdown">
          <div className="player-head"><div className="player-hair" /></div>
          <div className="player-body" />
          <div className="player-arm arm-left"><div className="player-hand" /></div>
          <div className="player-arm arm-right"><div className="player-hand" /></div>
          <div className="player-leg leg-left"><div className="player-shoe" /></div>
          <div className="player-leg leg-right"><div className="player-shoe" /></div>
        </div>
        <b>YOU</b>
      </div>

      <div className="l4-camera-vignette" />
    </div>
  );
}

function Level2MiniMap({ player, mapTaken }) {
  const px = ((player.x + GAME_WORLD.width / 2) / GAME_WORLD.width) * 100;
  const py = ((GAME_WORLD.height / 2 - player.y) / GAME_WORLD.height) * 100;
  const mapX = ((GAME_MAP.x + GAME_WORLD.width / 2) / GAME_WORLD.width) * 100;
  const mapY = ((GAME_WORLD.height / 2 - GAME_MAP.y) / GAME_WORLD.height) * 100;
  const exitX = ((GAME_EXIT.x + GAME_WORLD.width / 2) / GAME_WORLD.width) * 100;
  const exitY = ((GAME_WORLD.height / 2 - GAME_EXIT.y) / GAME_WORLD.height) * 100;

  return (
    <div className="l4-hunter-minimap l2-level2-minimap">
      <div className="l4-minimap-head">
        <span>STATION 02</span>
        <b>MAP</b>
      </div>
      <div className="l4-minimap-world">
        {GAME_WALLS.map((wall, index) => (
          <div
            key={`mw-${index}`}
            className="mini-wall"
            style={{
              left: `${((wall.x + GAME_WORLD.width / 2 - wall.w / 2) / GAME_WORLD.width) * 100}%`,
              top: `${((GAME_WORLD.height / 2 - wall.y - wall.h / 2) / GAME_WORLD.height) * 100}%`,
              width: `${(wall.w / GAME_WORLD.width) * 100}%`,
              height: `${(wall.h / GAME_WORLD.height) * 100}%`,
            }}
          />
        ))}
        {CRATES.map((crate) => (
          <div
            key={`mc-${crate.id}`}
            className="mini-crate"
            style={{
              left: `${((crate.x + GAME_WORLD.width / 2 - crate.w / 2) / GAME_WORLD.width) * 100}%`,
              top: `${((GAME_WORLD.height / 2 - crate.y - crate.h / 2) / GAME_WORLD.height) * 100}%`,
              width: `${(crate.w / GAME_WORLD.width) * 100}%`,
              height: `${(crate.h / GAME_WORLD.height) * 100}%`,
            }}
          />
        ))}
        {!mapTaken && (
          <i className="mini-key l2-mini-map" style={{ left: `${mapX}%`, top: `${mapY}%` }}>M</i>
        )}
        {mapTaken && (
          <i className="mini-exit" style={{ left: `${exitX}%`, top: `${exitY}%` }}>E</i>
        )}
        <i className="mini-player" style={{ left: `${px}%`, top: `${py}%` }} />
      </div>
    </div>
  );
}

function Level2Game({ onDeath, onComplete }) {
  const [player, setPlayer] = useState(GAME_START);
  const playerRef = useRef({ ...GAME_START });
  const input = useRef({});
  const [walking, setWalking] = useState(false);
  const walkingRef = useRef(false);
  const [mapTaken, setMapTaken] = useState(false);
  const mapTakenRef = useRef(false);
  const [mapNear, setMapNear] = useState(false);
  const mapNearRef = useRef(false);
  const [exitNear, setExitNear] = useState(false);
  const exitNearRef = useRef(false);
  const [signal, setSignal] = useState("green");
  const signalRef = useRef("green");
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [dead, setDead] = useState(false);
  const deadRef = useRef(false);
  const completedRef = useRef(false);

  mapTakenRef.current = mapTaken;
  deadRef.current = dead;

  const die = useCallback((reason) => {
    if (deadRef.current || completedRef.current) return;
    input.current = {};
    setDead(true);
    deadRef.current = true;
    onDeath(reason);
  }, [onDeath]);

  useEffect(() => {
    const down = (event) => {
      const valid = [
        "KeyW", "KeyA", "KeyS", "KeyD",
        "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyE",
      ];
      if (!valid.includes(event.code)) return;
      event.preventDefault();

      if (deadRef.current || completedRef.current) return;

      input.current[event.code] = true;

      if (event.code === "KeyE") {
        if (mapNearRef.current && !mapTakenRef.current) {
          mapTakenRef.current = true;
          setMapTaken(true);
          mapNearRef.current = false;
          setMapNear(false);
          input.current.KeyE = false;
          return;
        }

        if (exitNearRef.current && mapTakenRef.current) {
          completedRef.current = true;
          input.current = {};
          setExitNear(false);
          onComplete();
        }

        input.current.KeyE = false;
      }
    };

    const up = (event) => {
      input.current[event.code] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;

    const cycle = async () => {
      while (!cancelled && !deadRef.current && !completedRef.current) {
        signalRef.current = "green";
        setSignal("green");
        await new Promise((resolve) => setTimeout(resolve, 7000));
        if (cancelled || deadRef.current || completedRef.current) break;

        signalRef.current = "yellow";
        setSignal("yellow");
        await new Promise((resolve) => setTimeout(resolve, 2200));
        if (cancelled || deadRef.current || completedRef.current) break;

        signalRef.current = "red";
        setSignal("red");
        await new Promise((resolve) => setTimeout(resolve, 4500));
      }
    };

    cycle();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (deadRef.current || completedRef.current) return;
      setTimeLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          die("TIME RAN OUT.");
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [die]);

  useEffect(() => {
    let frame;
    let previous = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      if (!deadRef.current && !completedRef.current) {
        const keys = input.current;
        let dx = 0;
        let dy = 0;

        if (keys.KeyW || keys.ArrowUp) dy += 1;
        if (keys.KeyS || keys.ArrowDown) dy -= 1;
        if (keys.KeyA || keys.ArrowLeft) dx -= 1;
        if (keys.KeyD || keys.ArrowRight) dx += 1;

        const moving = dx !== 0 || dy !== 0;

        if (moving) {
          if (signalRef.current === "red") {
            die("YOU MOVED DURING RED LIGHT.");
          } else {
            const length = Math.hypot(dx, dy) || 1;
            dx /= length;
            dy /= length;

            const current = playerRef.current;
            const distance = GAME_PLAYER_SPEED * dt;
            const nextX = current.x + dx * distance;
            const nextY = current.y + dy * distance;
            let changed = false;

            if (!blocked(nextX, current.y)) {
              current.x = nextX;
              changed = true;
            }
            if (!blocked(current.x, nextY)) {
              current.y = nextY;
              changed = true;
            }

            if (changed) {
              setPlayer({ x: current.x, y: current.y });
            }

            if (!walkingRef.current) {
              walkingRef.current = true;
              setWalking(true);
            }
          }
        } else if (walkingRef.current) {
          walkingRef.current = false;
          setWalking(false);
        }

        const current = playerRef.current;
        const mapDistance = Math.hypot(current.x - GAME_MAP.x, current.y - GAME_MAP.y);
        const exitDistance = Math.hypot(current.x - GAME_EXIT.x, current.y - GAME_EXIT.y);
        const nearMap = mapDistance < 95;
        const nearExit = exitDistance < 110;

        mapNearRef.current = nearMap;
        exitNearRef.current = nearExit && mapTakenRef.current;
        setMapNear(nearMap);
        setExitNear(nearExit && mapTakenRef.current);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [die]);

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  return (
    <div className="level4-2d-game hunter-style-game">
      <header className="hunter-top-left">
        <span>STATION 02</span>
        <h1>RED LIGHT / GREEN LIGHT</h1>
        <p>Find the map, obey the signal, and reach the exit</p>
      </header>

      <div className="hunter-top-right">
        <div>
          <small>SIGNAL</small>
          <strong>{signal === "green" ? "GREEN" : signal === "yellow" ? "YELLOW" : "RED"}</strong>
          <span className="key-icons">
            <i className={signal === "green" ? "collected" : ""}>G</i>
            <i className={signal === "yellow" ? "collected" : ""}>Y</i>
            <i className={signal === "red" ? "collected" : ""}>R</i>
          </span>
        </div>
        <div className={`exit-status ${mapTaken ? "open" : ""}`}>
          <small>MAP</small>
          <strong>{mapTaken ? "FOUND" : "SEARCH"}</strong>
        </div>
      </div>

      <Level2GameMap
        player={player}
        mapTaken={mapTaken}
        mapNear={mapNear}
        exitNear={exitNear}
        signal={signal}
        walking={walking}
      />

      <Level2MiniMap player={player} mapTaken={mapTaken} />

      <div className="hunter-legend">
        <span><i className="you-dot" />You</span>
        <span><i className="key-dot" />Map</span>
        <span><i className="exit-dot" />Exit</span>
      </div>

      <div className="hunter-controls">
        <div className="keys-grid">
          <b>W</b><b>A</b><b>S</b><b>D</b>
        </div>
        <span>Move</span>
        <div className="e-key">E</div>
        <span>Interact</span>
      </div>

      <div className={`hunter-status ${signal === "red" ? "danger" : ""}`}>
        {signal === "red"
          ? "⚠ RED LIGHT — DO NOT MOVE"
          : signal === "yellow"
            ? "YELLOW LIGHT — GET READY"
            : "GREEN LIGHT — MOVE"}
      </div>

      <div className="hunter-objective">
        <b>{mapTaken ? "ESCAPE" : "SEARCH"}</b>
        <span>{mapTaken ? "REACH THE EXIT" : "FIND THE MAP"}</span>
        <span>{mapTaken ? "MAP RECOVERED" : "EXPLORE THE STATION"}</span>
        <span>{signal === "red" ? "FREEZE" : "FOLLOW THE SIGNAL"}</span>
      </div>

      {mapNear && !mapTaken && !dead && (
        <div className="hunter-interaction">
          <b>RAILWAY MAP</b>
          <span>PRESS E TO TAKE</span>
        </div>
      )}

      {exitNear && mapTaken && !dead && (
        <div className="hunter-interaction">
          <b>EXIT READY</b>
          <span>PRESS E TO ESCAPE</span>
        </div>
      )}

      <div className="l2-level2-timer">
        <span>TIME</span>
        <strong>{formattedTime}</strong>
      </div>

      {signal === "red" && !dead && (
        <div className="l2-red-warning">
          <strong>RED LIGHT</strong>
          <span>FREEZE</span>
        </div>
      )}

      {dead && (
        <div className="l4-result-overlay">
          <div className="l4-result-card">
            <div className="l4-result-kicker">STATION 02</div>
            <h1>YOU WERE CAUGHT</h1>
            <p>Movement during red light ended the run.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ReturnTrain({
  onFinish,
}) {
  const [stage, setStage] =
    useState("arrival");

  useEffect(() => {

    const open =
      setTimeout(() => {
        setStage("open");
      }, 2500);

    const walking =
      setTimeout(() => {
        setStage("walking");
      }, 3500);

    const inside =
      setTimeout(() => {
        setStage("inside");
      }, 6200);

    const close =
      setTimeout(() => {
        setStage("closed");
      }, 7300);

    const depart =
      setTimeout(() => {
        setStage("departing");
      }, 8000);

    const finish =
      setTimeout(() => {
        onFinish();
      }, 13000);

    return () => {
      clearTimeout(open);
      clearTimeout(walking);
      clearTimeout(inside);
      clearTimeout(close);
      clearTimeout(depart);
      clearTimeout(finish);
    };

  }, [onFinish]);


  const doorOpen =
    stage === "open" ||
    stage === "walking" ||
    stage === "inside";


  const playerWalking =
    stage === "walking";


  const playerEntered =
    stage === "inside" ||
    stage === "closed" ||
    stage === "departing";


  return (
    <main className="level1-screen level2-return-train">

      <Station />

      <Train
        doorOpen={doorOpen}
        departing={
          stage ===
          "departing"
        }
      />

      <Player
        walking={
          playerWalking
        }
        entered={
          playerEntered
        }
      />

      <div className="level2-return-overlay" />

      <div className="level2-return-message">

        {stage === "arrival" && (
          <>
            <span>
              RETURN ROUTE
            </span>

            <strong>
              THE TRAIN IS WAITING
            </strong>
          </>
        )}

        {stage === "open" && (
          <>
            <span>
              TRAIN DOOR
            </span>

            <strong>
              DOOR OPEN
            </strong>
          </>
        )}

        {stage === "walking" && (
          <>
            <span>
              BOARDING
            </span>

            <strong>
              ENTERING THE TRAIN
            </strong>
          </>
        )}

        {stage === "inside" && (
          <>
            <span>
              INSIDE
            </span>

            <strong>
              DOORS CLOSING
            </strong>
          </>
        )}

        {stage === "closed" && (
          <>
            <span>
              TRAIN READY
            </span>

            <strong>
              DEPARTING
            </strong>
          </>
        )}

        {stage === "departing" && (
          <>
            <span>
              LEVEL 02
            </span>

            <strong>
              LEAVING STATION
            </strong>
          </>
        )}

      </div>

    </main>
  );
}


/* =========================================================
   MAIN LEVEL 2
========================================================= */

export default function Level2() {

  const navigate =
    useNavigate();

  const [phase, setPhase] =
    useState("arrival");

  const [deadReason, setDeadReason] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  /* =======================================================
     STORY COMPLETE
  ======================================================= */

  const completeArrival =
    useCallback(() => {
      setPhase("story");
    }, []);


  /* =======================================================
     STORY → DETAILS
  ======================================================= */

  const continueStory =
    () => {
      setPhase(
        "details"
      );
    };


  /* =======================================================
     DETAILS → GAME
  ======================================================= */

  const startGame =
    () => {
      setPhase(
        "playing"
      );
    };


  /* =======================================================
     DEATH
  ======================================================= */

  const die =
    useCallback(
      async (reason) => {

        if (
          phase !==
          "playing"
        ) {
          return;
        }

        setDeadReason(
          reason
        );

        setPhase(
          "dead"
        );

        try {
          await api.post(
            "/survival/level/complete/",
            {
              level: 2,
              result: "DEATH",
            }
          );
        } catch (error) {
          console.error(
            "LEVEL 2 DEATH SAVE ERROR:",
            error
          );
        }
      },
      [phase]
    );


  /* =======================================================
     GAME COMPLETE
  ======================================================= */

  const completeGame =
    useCallback(() => {

      if (
        phase !==
        "playing"
      ) {
        return;
      }

      setPhase(
        "mapReveal"
      );

    }, [phase]);


  /* =======================================================
     FINAL SUBMIT
  ======================================================= */

  const finishLevel =
    async () => {

      if (saving) {
        return;
      }

      setSaving(true);

      try {

        await api.post(
          "/survival/level/complete/",
          {
            level: 2,
            result: "WIN",
          }
        );

        setPhase(
          "completed"
        );

      } catch (error) {

        console.error(
          "LEVEL 2 WIN ERROR:",
          error?.response?.data ||
            error
        );

        setDeadReason(
          "Could not save Level 2 completion."
        );

        setPhase(
          "dead"
        );

      } finally {

        setSaving(false);

      }
    };


  /* =======================================================
     RETRY
  ======================================================= */

  const retry =
    () => {

      setDeadReason(
        ""
      );

      setPhase(
        "playing"
      );
    };


  /* =======================================================
     ARRIVAL / STORY / DETAILS
  ======================================================= */

  if (
    phase === "arrival" ||
    phase === "story" ||
    phase === "details"
  ) {

    return (
      <Level2Cinematic
        stage={
          phase
        }
        onContinue={
          continueStory
        }
        onStart={
          startGame
        }
        onCompleteStory={
          completeArrival
        }
      />
    );
  }


  /* =======================================================
     GAME
  ======================================================= */

  if (
    phase ===
    "playing"
  ) {

    return (
      <Level2Game
        onDeath={
          die
        }
        onComplete={
          completeGame
        }
      />
    );
  }


  /* =======================================================
     MAP REVEAL → TRAVEL
  ======================================================= */

  if (
    phase ===
    "mapReveal"
  ) {

    return (
      <main className="level2-map-reveal-screen">

        <div className="level2-map-reveal-backdrop" />

        <section className="level2-map-reveal-panel">

          <div className="level2-map-reveal-kicker">
            LEVEL 02 • MAP RECOVERED
          </div>

          <h1>
            YOU FOUND THE WAY OUT
          </h1>

          <p className="level2-map-reveal-intro">
            The railway map reveals the route back to the train.
            Your escape route is now clear.
          </p>

          <div className="level2-map-reveal-map level2-real-map">
            <div className="level2-real-map-label">
              <span>RECOVERED RAILWAY MAP</span>
              <strong>ESCAPE ROUTE</strong>
            </div>

            <div className="level2-real-map-frame">
              <img
                src={mapImage}
                alt="Recovered railway station map"
                className="level2-real-map-image"
              />
            </div>

            <div className="level2-real-map-caption">
              <span>MAP RECOVERED</span>
              <strong>THE ROUTE BACK TO THE TRAIN IS NOW KNOWN</strong>
            </div>
          </div>

          <div className="level2-map-reveal-note">
            <span>ROUTE IDENTIFIED</span>
            <strong>THE TRAIN IS WAITING</strong>
          </div>

          <button
            className="level2-travel-button"
            onClick={() => setPhase("returnTrain")}
          >
            TRAVEL TO TRAIN
            <span>→</span>
          </button>

        </section>

      </main>
    );
  }

  /* =======================================================
     RETURN TRAIN
  ======================================================= */

  if (
    phase ===
    "returnTrain"
  ) {

    return (
      <ReturnTrain
        onFinish={
          finishLevel
        }
      />
    );
  }


  /* =======================================================
     DEATH
  ======================================================= */

  if (
    phase ===
    "dead"
  ) {

    return (
      <main className="level2-death-screen">

        <div className="level2-death-card">

          <div className="death-symbol">
            ✕
          </div>

          <span>
            SURVIVAL FAILED
          </span>

          <h1>
            YOU DIED
          </h1>

          <p>
            {deadReason}
          </p>

          <button
            onClick={
              retry
            }
          >
            RETRY LEVEL 02
          </button>

          <button
            className="secondary"
            onClick={() =>
              navigate(
                "/survival-challenge/lobby"
              )
            }
          >
            RETURN TO LOBBY
          </button>

        </div>

      </main>
    );
  }


  /* =======================================================
     COMPLETE
  ======================================================= */

  return (
    <main className="level2-complete-screen">

      <div className="level2-complete-card">

        <span>
          SURVIVAL ROUND
        </span>

        <div className="complete-symbol">
          ✓
        </div>

        <h1>
          LEVEL 02 COMPLETE
        </h1>

        <p>
          You survived the abandoned station.
        </p>

        <button
          onClick={() =>
            navigate(
              "/survival-challenge/lobby"
            )
          }
          disabled={saving}
        >
          RETURN TO LOBBY
        </button>

      </div>

    </main>
  );
}
