import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import "./Level4.css";

/* =========================================================
   LEVEL 4 — 2D CINEMATIC HIDE & SEEK
   No Three.js / WebGL.
   Same story + 3 keys + many monsters + hiding + exit.
========================================================= */

const WORLD_SCALE = 4.5;

const L4 = {
  width: 110 * WORLD_SCALE,
  height: 100 * WORLD_SCALE,

  // Player starts on the bottom corridor.
  start: { x: 0, y: 43 },
  exit: { x: 0, y: -44 },

  // Every key is placed ON a corridor, never inside a wall.
  keys: [
    { id: 1, x: -43, y: 27 },
    { id: 2, x: 43, y: -2 },
    { id: 3, x: -39, y: -31 },
  ],

  monsters: [
    { id: 1, x: -43, y: 36, speed: 7.0, type: "PATROL" },
    { id: 2, x: -27, y: 27, speed: 7.5, type: "WANDERER" },
    { id: 3, x: -8, y: 27, speed: 7.0, type: "GUARD" },
    { id: 4, x: 12, y: 27, speed: 8.0, type: "HUNTER" },
    { id: 5, x: 43, y: 27, speed: 7.0, type: "PATROL" },
    { id: 6, x: 43, y: 8, speed: 8.0, type: "HUNTER" },
    { id: 7, x: 27, y: -2, speed: 7.0, type: "WANDERER" },
    { id: 8, x: 8, y: -2, speed: 7.5, type: "GUARD" },
    { id: 9, x: -12, y: -2, speed: 8.0, type: "HUNTER" },
    { id: 10, x: -43, y: -2, speed: 7.0, type: "PATROL" },
    { id: 11, x: -41, y: -24, speed: 8.0, type: "HUNTER" },
    { id: 12, x: -27, y: -31, speed: 7.0, type: "WANDERER" },
    { id: 13, x: -8, y: -31, speed: 7.5, type: "PATROL" },
    { id: 14, x: 10, y: -31, speed: 8.0, type: "HUNTER" },
    { id: 15, x: 27, y: -31, speed: 7.0, type: "GUARD" },
    { id: 16, x: 43, y: -31, speed: 8.0, type: "HUNTER" },
  ],
};

// Expand the original maze without changing its gameplay layout.
L4.start = { x: L4.start.x * WORLD_SCALE, y: L4.start.y * WORLD_SCALE };
L4.exit = { x: L4.exit.x * WORLD_SCALE, y: L4.exit.y * WORLD_SCALE };
L4.keys = L4.keys.map((key) => ({ ...key, x: key.x * WORLD_SCALE, y: key.y * WORLD_SCALE }));
L4.monsters = L4.monsters.map((monster) => ({ ...monster, x: monster.x * WORLD_SCALE, y: monster.y * WORLD_SCALE, speed: monster.speed * 0.92 }));

// Thick walls create a real maze: the player must follow the open corridors.
// Coordinate system: X = left/right, Y = bottom/top.
const WALLS_BASE = [
  // Outer station walls
  { x: 0, y: -49, w: 110, h: 2 },
  { x: -54, y: 0, w: 2, h: 100 },
  { x: 54, y: 0, w: 2, h: 100 },

  // Upper maze / horizontal blocks
  { x: -28, y: 37, w: 48, h: 5 },
  { x: 29, y: 37, w: 43, h: 5 },
  { x: -31, y: 17, w: 40, h: 5 },
  { x: 29, y: 17, w: 40, h: 5 },

  // Middle maze
  { x: -29, y: -9, w: 44, h: 5 },
  { x: 31, y: -9, w: 38, h: 5 },
  { x: -29, y: -22, w: 44, h: 5 },
  { x: 31, y: -22, w: 38, h: 5 },

  // Lower maze
  { x: -29, y: -40, w: 44, h: 5 },
  { x: 31, y: -40, w: 38, h: 5 },

  // Vertical blocks — deliberately leave alternating corridor openings
  { x: -47, y: 27, w: 5, h: 16 },
  { x: -47, y: 4, w: 5, h: 18 },
  { x: -47, y: -19, w: 5, h: 17 },
  { x: -47, y: -36, w: 5, h: 12 },

  { x: -19, y: 27, w: 5, h: 16 },
  { x: -19, y: 5, w: 5, h: 17 },
  { x: -19, y: -18, w: 5, h: 18 },
  { x: -19, y: -36, w: 5, h: 12 },

  { x: 19, y: 27, w: 5, h: 16 },
  { x: 19, y: 5, w: 5, h: 17 },
  { x: 19, y: -18, w: 5, h: 18 },
  { x: 19, y: -36, w: 5, h: 12 },

  { x: 47, y: 27, w: 5, h: 16 },
  { x: 47, y: 4, w: 5, h: 18 },
  { x: 47, y: -19, w: 5, h: 17 },
  { x: 47, y: -36, w: 5, h: 12 },

  // Extra short walls make the route feel like a Hunter Assassin map
  { x: -36, y: 8, w: 15, h: 4 },
  { x: -7, y: 8, w: 12, h: 4 },
  { x: 35, y: 8, w: 14, h: 4 },
  { x: -36, y: -14, w: 14, h: 4 },
  { x: 7, y: -14, w: 14, h: 4 },
  { x: 36, y: -14, w: 14, h: 4 },
];

const WALLS = WALLS_BASE.map((wall) => ({
  ...wall,
  x: wall.x * WORLD_SCALE,
  y: wall.y * WORLD_SCALE,
  w: wall.w * WORLD_SCALE,
  h: wall.h * WORLD_SCALE,
}));

const HIDING_SPOTS_BASE = [
  { id: 1, x: -43, y: 36, label: "LOCKER" },
  { id: 2, x: 43, y: 18, label: "STORAGE" },
  { id: 3, x: -43, y: -9, label: "CABINET" },
  { id: 4, x: 43, y: -31, label: "LOCKER" },
  { id: 5, x: -8, y: -31, label: "CABINET" },
];

const HIDING_SPOTS = HIDING_SPOTS_BASE.map((spot) => ({
  ...spot,
  x: spot.x * WORLD_SCALE,
  y: spot.y * WORLD_SCALE,
}));

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function pointStyle(point) {
  return {
    left: `${((point.x + L4.width / 2) / L4.width) * 100}%`,
    top: `${((L4.height / 2 - point.y) / L4.height) * 100}%`,
  };
}

function intersectsWall(x, y, radius = 2.2) {
  for (const wall of WALLS) {
    const halfW = wall.w / 2 + radius;
    const halfH = wall.h / 2 + radius;
    if (
      x > wall.x - halfW &&
      x < wall.x + halfW &&
      y > wall.y - halfH &&
      y < wall.y + halfH
    ) {
      return true;
    }
  }
  return false;
}

/* =========================================================
   CINEMATIC STATION
========================================================= */

function Station() {
  return (
    <>
      <div className="sky">
        <div className="moon" />
        <div className="stars stars-1" />
        <div className="stars stars-2" />
        <div className="stars stars-3" />
      </div>
      <div className="station-building">
        <div className="station-roof" />
        <div className="station-sign">STATION 04</div>
        <div className="station-window sw1" />
        <div className="station-window sw2" />
        <div className="station-window sw3" />
        <div className="station-window sw4" />
        <div className="station-door" />
      </div>
      <div className="platform"><div className="platform-edge" /></div>
      <div className="railway">
        <div className="rail rail-left" />
        <div className="rail rail-right" />
        {Array.from({ length: 18 }).map((_, index) => (
          <div key={index} className="sleeper" style={{ top: `${index * 6}%` }} />
        ))}
      </div>
      <div className="lamp lamp-left"><div className="lamp-light" /></div>
      <div className="lamp lamp-right"><div className="lamp-light" /></div>
      <div className="fog fog-1" />
      <div className="fog fog-2" />
      <div className="fog fog-3" />
    </>
  );
}

function Train({ doorOpen }) {
  return (
    <div className="train">
      <div className="train-roof" />
      <div className="train-body">
        <div className="train-window window-1" />
        <div className="train-window window-2" />
        <div className="train-window window-3" />
        <div className={`train-door ${doorOpen ? "door-open" : ""}`}>
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

function LastStationTrain({ doorOpen = false, departing = false } = {}) {
  return (
    <div className={`last-station-train ${departing ? "completion-train-departing" : ""}`}>
      <div className="last-train">
        <div className="last-train-roof" />
        <div className="last-train-body">
          <div className="last-train-window last-window-1" />
          <div className="last-train-window last-window-2" />
          <div className="last-train-window last-window-3" />
          <div className={`last-train-door ${doorOpen ? "completion-door-open" : ""}`}>
            <div className="last-door-window" />
            <div className="last-door-panel" />
          </div>
          <div className="last-train-window last-window-4" />
          <div className="last-train-headlight" />
          <div className="last-train-label">END OF THE LINE</div>
        </div>
        <div className="last-train-wheel last-wheel-1" />
        <div className="last-train-wheel last-wheel-2" />
        <div className="last-train-wheel last-wheel-3" />
        <div className="last-train-wheel last-wheel-4" />
      </div>
    </div>
  );
}

function Player({ visible, walking, trainJourney }) {
  if (!visible) return null;
  return (
    <div className={`player ${trainJourney ? "player-train-journey" : walking ? "player-walking" : "player-standing"}`}>
      <div className="player-head"><div className="player-hair" /></div>
      <div className="player-body" />
      <div className="player-arm arm-left"><div className="player-hand" /></div>
      <div className="player-arm arm-right"><div className="player-hand" /></div>
      <div className="player-leg leg-left"><div className="player-shoe" /></div>
      <div className="player-leg leg-right"><div className="player-shoe" /></div>
    </div>
  );
}

function CompletionPlayer({ phase }) {
  // Once the player has entered the green train, remove the player
  // completely from the DOM. He must never appear anywhere during
  // door closing or train departure.
  if (
    phase === "inside" ||
    phase === "closed" ||
    phase === "departing" ||
    phase === "complete"
  ) {
    return null;
  }

  const walking = phase === "walking";
  const entering = phase === "entering";
  const showKey =
    phase === "walking" ||
    phase === "atTrain";

  return (
    <div
      className={`level4-completion-player ${
        walking ? "completion-player-walking" : ""
      } ${entering ? "completion-player-entering" : ""}`}
    >
      <div className="completion-player-shadow" />
      <div className="completion-player-body">
        <div className="completion-player-head">
          <div className="completion-player-hair" />
        </div>
        <div className="completion-player-jacket" />
        <div className="completion-player-arm completion-arm-left" />
        <div className="completion-player-arm completion-arm-right">
          {showKey && <span className="completion-key-in-hand" />}
        </div>
        <div className="completion-player-leg completion-leg-left" />
        <div className="completion-player-leg completion-leg-right" />
      </div>
    </div>
  );
}

function Level4CompletionCinematic({ onReturn }) {
  /*
   * Final Level 4 sequence:
   * 1. The old train remains parked in its original position.
   * 2. The player walks to the NEW train's door while holding the key.
   * 3. At the door: key disappears + door opens at the same moment.
   * 4. Player enters one second later.
   * 5. Door closes.
   * 6. New train departs smoothly.
   */
  const [phase, setPhase] = useState("walking");

  useEffect(() => {
    const timers = [
      // Player walks from the centre to the GREEN train door.
      setTimeout(() => setPhase("atTrain"), 4800),

      // KEY DISAPPEARS + GREEN TRAIN DOOR OPENS.
      setTimeout(() => setPhase("doorOpen"), 5600),

      // Exactly 1 second after opening, player enters.
      setTimeout(() => setPhase("entering"), 6600),

      // Player is now fully inside and is removed from the scene.
      setTimeout(() => setPhase("inside"), 7700),

      // Door closes while the player remains completely invisible.
      setTimeout(() => setPhase("closed"), 8500),

      // Only the GREEN train starts moving to the RIGHT.
      setTimeout(() => setPhase("departing"), 9000),

      // When the green train has completely left the screen,
      // go directly back to the lobby. No completion card.
      setTimeout(() => onReturn(), 15000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const newTrainDoorOpen =
    phase === "doorOpen" ||
    phase === "entering" ||
    phase === "inside";

  const newTrainDeparting =
    phase === "departing" || phase === "complete";

  return (
    <div className="level4-completion-page">
      <div className="level4-completion-scene">

        {/* SAME STATION BACKGROUND AS THE LEVEL 4/5 STATION SCENE */}
        <Station />

        {/* OLD TRAIN — LEFT SIDE — never moves during the ending. */}
        <div className="level4-completion-old-train">
          <Train doorOpen={false} />
        </div>

        {/* NEW GREEN TRAIN — RIGHT SIDE — the train opened with the key. */}
        <div
          className={`level4-completion-new-train ${
            newTrainDeparting ? "level4-new-train-departing" : ""
          }`}
        >
          <LastStationTrain
            doorOpen={newTrainDoorOpen}
            departing={false}
          />
        </div>

        <CompletionPlayer phase={phase} />

        {phase === "walking" && (
          <div className="completion-story-text">
            <span>THREE KEYS RECOVERED</span>
            <strong>I CAN FINALLY LEAVE.</strong>
          </div>
        )}

        {phase === "atTrain" && (
          <div className="completion-story-text completion-story-left">
            <span>THE NEW TRAIN</span>
            <strong>THE KEY SHOULD OPEN THIS DOOR.</strong>
          </div>
        )}

        {phase === "doorOpen" && (
          <div className="completion-story-text completion-story-left">
            <span>ACCESS GRANTED</span>
            <strong>THE KEY WORKED.</strong>
          </div>
        )}

        {phase === "departing" && (
          <div className="completion-story-text completion-story-center">
            <span>STATION 04</span>
            <strong>THE TRAIN IS MOVING.</strong>
          </div>
        )}


      </div>
    </div>
  );
}

function StoryPanel({ title, children, buttonText, onNext }) {
  return (
    <div className="level4-story-overlay">
      <div className="level4-story-panel">
        <div className="level4-story-kicker">STATION 04</div>
        <h1>{title}</h1>
        <div className="level4-story-content">{children}</div>
        <button type="button" className="level4-story-button" onClick={onNext}>{buttonText}</button>
      </div>
    </div>
  );
}

function GameDetails({ onStart }) {
  return (
    <div className="level4-details-overlay">
      <div className="level4-details-panel">
        <div className="level4-details-kicker">SURVIVAL CHALLENGE · LEVEL 04</div>
        <h1>HIDE &amp; SEEK</h1>
        <p className="level4-details-intro">
          The station is not empty. Find the three keys, avoid the monsters, and escape through the locked exit.
        </p>
        <div className="level4-details-grid">
          <div className="level4-detail-card"><span className="detail-icon">🔑</span><strong>OBJECTIVE</strong><p>Find all 3 keys hidden inside the station.</p></div>
          <div className="level4-detail-card"><span className="detail-icon">👹</span><strong>DANGER</strong><p>Many monsters patrol, wander, guard areas, and hunt when they detect you.</p></div>
          <div className="level4-detail-card"><span className="detail-icon">🫥</span><strong>SURVIVE</strong><p>Hide, break line of sight, and escape when detected.</p></div>
          <div className="level4-detail-card"><span className="detail-icon">🚪</span><strong>ESCAPE</strong><p>Collect all three keys and reach the exit.</p></div>
        </div>
        <div className="level4-controls"><span><b>W A S D</b> MOVE</span><span><b>E</b> INTERACT</span></div>
        <button type="button" className="level4-story-button level4-start-button" onClick={onStart}>START THE SEARCH</button>
      </div>
    </div>
  );
}

/* =========================================================
   2D GAMEPLAY — LARGE TOP-DOWN STEALTH MAP
   Cinematic section above is intentionally unchanged.
========================================================= */

const GAME_WORLD = { width: 4200, height: 3000 };
const PLAYER_RADIUS = 18;
const PLAYER_SPEED = 285;
const MONSTER_RADIUS = 18;
const VISION_DISTANCE = 310;
const VISION_HALF_ANGLE = Math.atan(51 / 310);

const GAME_WALLS = [
  // outer boundary
  { x: 0, y: 1450, w: 4200, h: 70 }, { x: 0, y: -1450, w: 4200, h: 70 },
  { x: -2065, y: 0, w: 70, h: 2900 }, { x: 2065, y: 0, w: 70, h: 2900 },
  // upper rooms
  { x: -1500, y: 1050, w: 900, h: 70 }, { x: 350, y: 1050, w: 700, h: 70 }, { x: 1400, y: 1050, w: 900, h: 70 },
  { x: -1050, y: 650, w: 70, h: 700 }, { x: -250, y: 780, w: 70, h: 440 }, { x: 650, y: 720, w: 70, h: 800 }, { x: 1500, y: 650, w: 70, h: 700 },
  // central maze
  { x: -1600, y: 300, w: 650, h: 70 }, { x: -500, y: 300, w: 500, h: 70 }, { x: 550, y: 300, w: 650, h: 70 }, { x: 1550, y: 300, w: 650, h: 70 },
  { x: -1250, y: -50, w: 70, h: 650 }, { x: -700, y: -380, w: 70, h: 700 }, { x: -100, y: -80, w: 70, h: 520 }, { x: 500, y: -420, w: 70, h: 850 }, { x: 1120, y: -50, w: 70, h: 700 }, { x: 1650, y: -380, w: 70, h: 750 },
  // lower rooms
  { x: -1550, y: -850, w: 900, h: 70 }, { x: -350, y: -850, w: 650, h: 70 }, { x: 800, y: -850, w: 800, h: 70 }, { x: 1750, y: -850, w: 450, h: 70 },
  { x: -1000, y: -1120, w: 70, h: 520 }, { x: -300, y: -1150, w: 70, h: 600 }, { x: 350, y: -1080, w: 70, h: 480 }, { x: 1050, y: -1180, w: 70, h: 650 }, { x: 1500, y: -1080, w: 70, h: 500 },
  // extra cover blocks / choke points
  { x: -1650, y: 720, w: 360, h: 55 }, { x: -1450, y: -520, w: 420, h: 55 }, { x: -250, y: 620, w: 330, h: 55 }, { x: 820, y: 560, w: 420, h: 55 },
  { x: 1380, y: -560, w: 400, h: 55 }, { x: 750, y: -1220, w: 430, h: 55 }, { x: -650, y: -1220, w: 360, h: 55 },
  { x: 1600, y: 850, w: 350, h: 55 }, { x: 1650, y: -250, w: 300, h: 55 },
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
].map(([x,y,w,h],i)=>({id:i+1,x,y,w,h}));

const GAME_KEYS = [
  // Three keys are intentionally placed far apart.
  { id: 1, x: -1800, y: 500 },
  { id: 2, x: 0, y: -500 },
  { id: 3, x: 1800, y: -1100 },
];

const GAME_HIDING = [
  { id: 1, x: -1880, y: 950, label: 'LOCKER' },
  { id: 2, x: 1450, y: 920, label: 'STORAGE' },
  { id: 3, x: -1730, y: -700, label: 'CABINET' },
  { id: 4, x: 1760, y: -650, label: 'LOCKER' },
  { id: 5, x: 820, y: -1050, label: 'CABINET' },
];

const GAME_MONSTERS = [
  // Exactly 10 monsters. All starting positions are checked against
  // walls/crates and deliberately separated so they are not trapped.
  [-650, 900, 0.0, 'GUARD'],
  [350, 900, Math.PI, 'PATROL'],
  [1100, 900, Math.PI, 'HUNTER'],
  [1850, 450, Math.PI / 2, 'GUARD'],
  [-1750, 500, 0.0, 'WANDERER'],
  [-1000, -500, Math.PI, 'PATROL'],
  [-350, -500, 0.0, 'HUNTER'],
  [800, -300, Math.PI / 2, 'GUARD'],
  [1450, -500, Math.PI, 'PATROL'],
  [500, -1300, Math.PI / 2, 'HUNTER'],
].map(([x,y,angle,type],i)=>({
  id:i+1,
  x,
  y,
  angle,
  type,
  speed:type==='HUNTER'?145:type==='PATROL'?110:95,
  roamTargetX:x,
  roamTargetY:y,
  alert:false,
  chaseUntil:0,
}));

const GAME_START = { x: -1750, y: 1200 };
const GAME_EXIT = { x: 1750, y: 1180 };

function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function worldStyle(x,y){return {left:`calc(50% + ${x}px)`,top:`calc(50% - ${y}px)`};}
function rectCollision(x,y,r,rect){
  const cx=clamp(x,rect.x-rect.w/2,rect.x+rect.w/2);
  const cy=clamp(y,rect.y-rect.h/2,rect.y+rect.h/2);
  return Math.hypot(x-cx,y-cy)<r;
}
function blocked(x,y,r=PLAYER_RADIUS){
  if(x<-GAME_WORLD.width/2+r||x>GAME_WORLD.width/2-r||y<-GAME_WORLD.height/2+r||y>GAME_WORLD.height/2-r)return true;
  return GAME_WALLS.some(w=>rectCollision(x,y,r,w)) || CRATES.some(c=>rectCollision(x,y,r,c));
}
function lineBlocked(a,b){
  const steps=Math.ceil(dist(a,b)/24);
  for(let i=1;i<steps;i++){
    const t=i/steps; const x=a.x+(b.x-a.x)*t; const y=a.y+(b.y-a.y)*t;
    if(GAME_WALLS.some(w=>rectCollision(x,y,2,w))||CRATES.some(c=>rectCollision(x,y,2,c)))return true;
  }
  return false;
}
function isInsideMonsterLight(monster, player){
  const dx = player.x - monster.x;
  const dy = player.y - monster.y;
  const d = Math.hypot(dx, dy);
  if (d <= 0.001 || d > VISION_DISTANCE) return false;

  // Match the visible red cone: 310px long and 51px half-width at its tip.
  const forwardX = Math.cos(monster.angle);
  const forwardY = Math.sin(monster.angle);
  const forward = dx * forwardX + dy * forwardY;
  if (forward <= 0 || forward > VISION_DISTANCE) return false;

  const side = Math.abs(dx * forwardY - dy * forwardX);
  const halfWidth = (51 / 310) * forward;
  if (side > halfWidth) return false;

  // The light cannot see through walls or crates.
  return !lineBlocked(monster, player);
}

function canSee(monster, player){
  return isInsideMonsterLight(monster, player);
}

// ONLY entering the visible red light can start a chase.
function monsterLightTriggered(monster, player){
  return isInsideMonsterLight(monster, player);
}

function randomRoamTarget(monster){
  for(let attempt=0; attempt<24; attempt++){
    const x=(Math.random()*(GAME_WORLD.width-220))-((GAME_WORLD.width-220)/2);
    const y=(Math.random()*(GAME_WORLD.height-220))-((GAME_WORLD.height-220)/2);
    if(!blocked(x,y,MONSTER_RADIUS+8)) return {x,y};
  }
  return {x:monster.x,y:monster.y};
}

function moveRoamingMonster(monster, dt){
  let targetX=monster.roamTargetX;
  let targetY=monster.roamTargetY;

  if(!Number.isFinite(targetX) || !Number.isFinite(targetY) || Math.hypot(targetX-monster.x,targetY-monster.y)<55){
    const target=randomRoamTarget(monster);
    targetX=target.x;
    targetY=target.y;
  }

  const dx=targetX-monster.x;
  const dy=targetY-monster.y;
  const distance=Math.hypot(dx,dy);
  if(distance<1){
    const target=randomRoamTarget(monster);
    return {...monster,roamTargetX:target.x,roamTargetY:target.y,alert:false};
  }

  const angle=Math.atan2(dy,dx);
  const step=monster.speed*0.72*dt;
  const nx=monster.x+Math.cos(angle)*step;
  const ny=monster.y+Math.sin(angle)*step;

  if(blocked(nx,ny,MONSTER_RADIUS)){
    const target=randomRoamTarget(monster);
    return {...monster,roamTargetX:target.x,roamTargetY:target.y,angle:Math.atan2(target.y-monster.y,target.x-monster.x),alert:false};
  }

  return {...monster,x:nx,y:ny,angle,roamTargetX:targetX,roamTargetY:targetY,alert:false};
}

function GameMap({player,keysCollected,monsters,hidden,walking,detected,nearKey,nearHide,exitNear}){
  const camX=player.x,camY=player.y;
  return <div className="l4-2d-game-viewport">
    <div className="l4-game-world" style={{'--cam-x':`${camX}px`,'--cam-y':`${camY}px`}}>
      <div className="l4-world-floor" />
      <div className="l4-world-grid" />
      <div className="l4-zone-label" style={worldStyle(-1250,780)}>WEST STORAGE</div>
      <div className="l4-zone-label" style={worldStyle(900,780)}>MAIN HALL</div>
      <div className="l4-zone-label" style={worldStyle(1450,-700)}>EAST STORAGE</div>
      <div className="l4-zone-label" style={worldStyle(-850,-950)}>SERVICE</div>
      {GAME_WALLS.map((w,i)=><div key={`w${i}`} className="l4-big-wall" style={{...worldStyle(w.x,w.y),width:w.w,height:w.h}}><i/></div>)}
      {CRATES.map(c=><div key={`c${c.id}`} className="l4-crate" style={{...worldStyle(c.x,c.y),width:c.w,height:c.h}}><i/><b/><span/></div>)}
      {GAME_HIDING.map(h=><div key={h.id} className={`l4-hiding-object ${nearHide===h.id?'near':''}`} style={worldStyle(h.x,h.y)}><span>▣</span><small>{h.label}</small></div>)}
      {GAME_KEYS.map(k=>!keysCollected.includes(k.id)&&<div key={k.id} className={`l4-game-key ${nearKey===k.id?'near':''}`} style={worldStyle(k.x,k.y)}><div className="key-visual"><span className="key-ring"/><span className="key-shaft"/><span className="key-tooth tooth-one"/><span className="key-tooth tooth-two"/></div><small>KEY {k.id}</small></div>)}
      <div className={`l4-game-exit ${keysCollected.length===3?'unlocked':''} ${exitNear?'near':''}`} style={worldStyle(GAME_EXIT.x,GAME_EXIT.y)}><span>EXIT</span><b>↗</b></div>
      {monsters.map(m=>{
        const angleDeg=m.angle*180/Math.PI;
        return <div key={m.id} className={`l4-game-monster ${m.alert?'alert':''}`} style={worldStyle(m.x,m.y)}>
          <div className={`l4-vision-cone ${m.alert ? "chase-light" : ""}`} style={{ transform: `rotate(${-angleDeg}deg)` }} />
          <div className="l4-monster-character">
            <div className="monster-head"><i className="monster-hair"/><i className="monster-eye eye-left"/><i className="monster-eye eye-right"/></div>
            <div className="monster-body"/>
            <div className="monster-arm monster-arm-left"/>
            <div className="monster-arm monster-arm-right"/>
            <div className="monster-leg monster-leg-left"/>
            <div className="monster-leg monster-leg-right"/>
          </div>
          <small>M{m.id}</small>{m.alert&&<em>!</em>}
        </div>
      })}
    </div>
    {/* The camera is centered on the player, so render the player in screen-space.
        This guarantees the player is always visible while the world scrolls underneath. */}
    <div className={`l4-camera-player station-style-player ${walking?'player-walking':'player-standing'} ${hidden?'hidden':''}`}>
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
  </div>;
}

function MiniMap({player,keysCollected,monsters}){
  return <div className="l4-hunter-minimap"><div className="l4-minimap-head"><span>STATION 04</span><b>MAP</b></div><div className="l4-minimap-world">
    {GAME_WALLS.map((w,i)=><div key={i} className="mini-wall" style={{left:`${((w.x+GAME_WORLD.width/2-w.w/2)/GAME_WORLD.width)*100}%`,top:`${((GAME_WORLD.height/2-w.y-w.h/2)/GAME_WORLD.height)*100}%`,width:`${w.w/GAME_WORLD.width*100}%`,height:`${w.h/GAME_WORLD.height*100}%`}}/>)}
    {CRATES.map(c=><div key={c.id} className="mini-crate" style={{left:`${((c.x+GAME_WORLD.width/2-c.w/2)/GAME_WORLD.width)*100}%`,top:`${((GAME_WORLD.height/2-c.y-c.h/2)/GAME_WORLD.height)*100}%`,width:`${c.w/GAME_WORLD.width*100}%`,height:`${c.h/GAME_WORLD.height*100}%`}}/>)}
    {GAME_KEYS.map(k=>!keysCollected.includes(k.id)&&<i key={k.id} className="mini-key" style={{left:`${((k.x+GAME_WORLD.width/2)/GAME_WORLD.width)*100}%`,top:`${((GAME_WORLD.height/2-k.y)/GAME_WORLD.height)*100}%`}}><span>{k.id}</span></i>)}
    {monsters.map(m=><i key={m.id} className="mini-monster" style={{left:`${((m.x+GAME_WORLD.width/2)/GAME_WORLD.width)*100}%`,top:`${((GAME_WORLD.height/2-m.y)/GAME_WORLD.height)*100}%`}}/>)}
    <i className="mini-exit" style={{left:`${((GAME_EXIT.x+GAME_WORLD.width/2)/GAME_WORLD.width)*100}%`,top:`${((GAME_WORLD.height/2-GAME_EXIT.y)/GAME_WORLD.height)*100}%`}}>E</i>
    <i className="mini-player" style={{left:`${((player.x+GAME_WORLD.width/2)/GAME_WORLD.width)*100}%`,top:`${((GAME_WORLD.height/2-player.y)/GAME_WORLD.height)*100}%`}}/>
  </div></div>;
}

function L4Game({ onComplete }) {
  const [player, setPlayer] = useState(GAME_START);
  const playerRef = useRef({ ...GAME_START });

  const [keysCollected, setKeysCollected] = useState([]);
  const keysRef = useRef([]);

  const [monsters, setMonsters] = useState(() =>
    GAME_MONSTERS.map((monster) => ({ ...monster }))
  );
  const monstersRef = useRef(
    GAME_MONSTERS.map((monster) => ({ ...monster }))
  );

  const [hidden, setHidden] = useState(false);
  const hiddenRef = useRef(false);

  const [walking, setWalking] = useState(false);
  const walkingRef = useRef(false);

  const [nearKey, setNearKey] = useState(null);
  const nearKeyRef = useRef(null);

  const [nearHide, setNearHide] = useState(null);
  const nearHideRef = useRef(null);

  const [exitNear, setExitNear] = useState(false);
  const exitNearRef = useRef(false);

  const [detected, setDetected] = useState(false);
  const detectedRef = useRef(false);

  const [dead, setDead] = useState(false);
  const [escaped, setEscaped] = useState(false);

  // Level 4 time limit: 5 minutes.
  const [timeLeft, setTimeLeft] = useState(300);
  const timerExpiredRef = useRef(false);

  const completeOnce = useRef(false);
  const input = useRef({});

  keysRef.current = keysCollected;
  hiddenRef.current = hidden;

  const die = useCallback(() => {
    if (dead || escaped) return;

    input.current = {};
    setDetected(false);
    detectedRef.current = false;
    setDead(true);

    api
      .post("survival/level/complete/", {
        level: 4,
        result: "DEATH",
        keys_collected: keysRef.current.length,
      })
      .catch(() => {});
  }, [dead, escaped]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const validKeys = [
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "KeyE",
      ];

      if (!validKeys.includes(event.code)) return;

      event.preventDefault();
      input.current[event.code] = true;

      if (event.code !== "KeyE" || dead || escaped) return;

      if (nearKeyRef.current !== null) {
        const newKeys = [
          ...keysRef.current,
          nearKeyRef.current,
        ];

        keysRef.current = newKeys;
        setKeysCollected(newKeys);

        nearKeyRef.current = null;
        setNearKey(null);
        input.current.KeyE = false;
        return;
      }

      if (nearHideRef.current !== null) {
        const nextHidden = !hiddenRef.current;

        hiddenRef.current = nextHidden;
        setHidden(nextHidden);

        if (nextHidden) {
          detectedRef.current = false;
          setDetected(false);
        }

        input.current.KeyE = false;
        return;
      }

      if (
        exitNearRef.current &&
        keysRef.current.length === 3
      ) {
        input.current = {};
        setEscaped(true);
      }
    };

    const handleKeyUp = (event) => {
      input.current[event.code] = false;
    };

    document.addEventListener("keydown", handleKeyDown, {
      passive: false,
    });
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [dead, escaped]);

  // Five-minute countdown.
  useEffect(() => {
    if (dead || escaped || timerExpiredRef.current) return;

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          timerExpiredRef.current = true;
          input.current = {};
          detectedRef.current = false;
          setDetected(false);
          setDead(true);

          api
            .post("survival/level/complete/", {
              level: 4,
              result: "TIMEOUT",
              keys_collected: keysRef.current.length,
            })
            .catch(() => {});

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dead, escaped]);

  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  const timerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  useEffect(() => {
    let animationFrame = 0;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.035);
      lastTime = now;

      if (!dead && !escaped) {
        let dx = 0;
        let dy = 0;

        if (input.current.KeyD || input.current.ArrowRight) {
          dx += 1;
        }
        if (input.current.KeyA || input.current.ArrowLeft) {
          dx -= 1;
        }
        if (input.current.KeyW || input.current.ArrowUp) {
          dy += 1;
        }
        if (input.current.KeyS || input.current.ArrowDown) {
          dy -= 1;
        }

        const isWalking = Boolean(
          !hiddenRef.current && (dx !== 0 || dy !== 0)
        );

        if (isWalking !== walkingRef.current) {
          walkingRef.current = isWalking;
          setWalking(isWalking);
        }

        if (isWalking) {
          const length = Math.hypot(dx, dy) || 1;
          dx /= length;
          dy /= length;

          const currentPlayer = playerRef.current;
          const nextX =
            currentPlayer.x + dx * PLAYER_SPEED * dt;
          const nextY =
            currentPlayer.y + dy * PLAYER_SPEED * dt;

          if (!blocked(nextX, currentPlayer.y)) {
            currentPlayer.x = nextX;
          }

          if (!blocked(currentPlayer.x, nextY)) {
            currentPlayer.y = nextY;
          }

          playerRef.current = currentPlayer;
          setPlayer({ ...currentPlayer });
        } else if (walkingRef.current) {
          walkingRef.current = false;
          setWalking(false);
        }

        const currentPlayer = playerRef.current;

        let closestKey = null;
        let closestKeyDistance = Infinity;

        for (const key of GAME_KEYS) {
          if (keysRef.current.includes(key.id)) continue;

          const keyDistance = dist(currentPlayer, key);

          if (keyDistance < closestKeyDistance) {
            closestKeyDistance = keyDistance;
            closestKey = key.id;
          }
        }

        const nextNearKey =
          closestKeyDistance < 62 ? closestKey : null;

        if (nextNearKey !== nearKeyRef.current) {
          nearKeyRef.current = nextNearKey;
          setNearKey(nextNearKey);
        }

        let closestHide = null;
        let closestHideDistance = Infinity;

        for (const hidingSpot of GAME_HIDING) {
          const hidingDistance = dist(
            currentPlayer,
            hidingSpot
          );

          if (hidingDistance < closestHideDistance) {
            closestHideDistance = hidingDistance;
            closestHide = hidingSpot.id;
          }
        }

        const nextNearHide =
          closestHideDistance < 72 ? closestHide : null;

        if (nextNearHide !== nearHideRef.current) {
          nearHideRef.current = nextNearHide;
          setNearHide(nextNearHide);
        }

        const isNearExit =
          dist(currentPlayer, GAME_EXIT) < 78;

        if (isNearExit !== exitNearRef.current) {
          exitNearRef.current = isNearExit;
          setExitNear(isNearExit);
        }

        let playerWasDetected = false;

        const nextMonsters = monstersRef.current.map(
          (monster) => {
            const nowMs = now;

            /*
             * IMPORTANT:
             * A roaming monster can detect the player ONLY when
             * the player is inside that monster's visible red cone.
             */
            const redLightHit =
              !hiddenRef.current &&
              monsterLightTriggered(monster, currentPlayer);

            if (!monster.alert && redLightHit) {
              const angle = Math.atan2(
                currentPlayer.y - monster.y,
                currentPlayer.x - monster.x
              );

              playerWasDetected = true;

              return {
                ...monster,
                alert: true,
                chaseUntil: nowMs + 6500,
                angle,
                roamTargetX: monster.x,
                roamTargetY: monster.y,
              };
            }

            /*
             * Once alerted, the monster keeps chasing.
             * It does NOT stop just because the player stops moving.
             */
            if (
              !hiddenRef.current &&
              monster.alert &&
              monster.chaseUntil > nowMs
            ) {
              let monsterX = monster.x;
              let monsterY = monster.y;

              const angle = Math.atan2(
                currentPlayer.y - monsterY,
                currentPlayer.x - monsterX
              );

              const chaseStep =
                monster.speed * 1.35 * dt;

              const nextMonsterX =
                monsterX + Math.cos(angle) * chaseStep;
              const nextMonsterY =
                monsterY + Math.sin(angle) * chaseStep;

              if (
                !blocked(
                  nextMonsterX,
                  monsterY,
                  MONSTER_RADIUS
                )
              ) {
                monsterX = nextMonsterX;
              }

              if (
                !blocked(
                  monsterX,
                  nextMonsterY,
                  MONSTER_RADIUS
                )
              ) {
                monsterY = nextMonsterY;
              }

              playerWasDetected = true;

              return {
                ...monster,
                x: monsterX,
                y: monsterY,
                angle,
                alert: true,
              };
            }

            /*
             * Chase expired. The monster returns to independent
             * random roaming instead of remaining locked on the player.
             */
            const roamingMonster = moveRoamingMonster(
              monster,
              dt
            );

            return {
              ...roamingMonster,
              alert: false,
              chaseUntil: 0,
            };
          }
        );

        monstersRef.current = nextMonsters;
        setMonsters(nextMonsters);

        if (
          playerWasDetected &&
          !detectedRef.current
        ) {
          detectedRef.current = true;
          setDetected(true);
        }

        if (
          !playerWasDetected &&
          detectedRef.current
        ) {
          detectedRef.current = false;
          setDetected(false);
        }

        const caught = nextMonsters.some(
          (monster) =>
            dist(monster, currentPlayer) < 38
        );

        if (caught && !hiddenRef.current) {
          die();
        }
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [dead, escaped, die]);

  useEffect(() => {
    if (!escaped || completeOnce.current) return;

    completeOnce.current = true;

    const saveCompletion = async () => {
      try {
        await api.post("survival/level/complete/", {
          level: 4,
          result: "WIN",
          keys_collected: keysRef.current.length,
        });
      } catch (error) {
        // The game can still complete if the API is unavailable.
      }

      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 400);
    };

    saveCompletion();
  }, [escaped, onComplete]);

  const retry = () => {
    input.current = {};

    walkingRef.current = false;
    setWalking(false);

    playerRef.current = { ...GAME_START };
    setPlayer({ ...GAME_START });

    keysRef.current = [];
    setKeysCollected([]);

    hiddenRef.current = false;
    setHidden(false);

    nearKeyRef.current = null;
    setNearKey(null);

    nearHideRef.current = null;
    setNearHide(null);

    exitNearRef.current = false;
    setExitNear(false);

    detectedRef.current = false;
    setDetected(false);

    const resetMonsters = GAME_MONSTERS.map(
      (monster) => ({
        ...monster,
        alert: false,
        chaseUntil: 0,
        roamTargetX: monster.x,
        roamTargetY: monster.y,
      })
    );

    monstersRef.current = resetMonsters;
    setMonsters(resetMonsters);

    setDead(false);
    setEscaped(false);
    setTimeLeft(300);
    timerExpiredRef.current = false;
    completeOnce.current = false;
  };

  useEffect(() => {
    document.body.classList.add("l4-game-active");

    return () => {
      document.body.classList.remove("l4-game-active");
    };
  }, []);

  return (
    <div className="level4-2d-game hunter-style-game">
      <header className="hunter-top-left">
        <span>STATION 04</span>
        <h1>HIDE &amp; SEEK</h1>
        <p>Collect 3 keys and reach the exit</p>
      </header>

      <div className="hunter-top-right">
        <div className={`hunter-timer ${timeLeft <= 60 ? "warning" : ""}`}>
          <small>TIME LEFT</small>
          <strong>{timerText}</strong>
        </div>

        <div>
          <small>KEYS</small>
          <strong>{keysCollected.length} / 3</strong>
          <span className="key-icons">
            {[1, 2, 3].map((id) => (
              <i
                key={id}
                className={
                  keysCollected.includes(id)
                    ? "collected"
                    : ""
                }
              >
                ◆
              </i>
            ))}
          </span>
        </div>

        <div
          className={`exit-status ${
            keysCollected.length === 3 ? "open" : ""
          }`}
        >
          <small>EXIT</small>
          <strong>
            {keysCollected.length === 3
              ? "UNLOCKED"
              : "LOCKED"}
          </strong>
        </div>
      </div>

      <GameMap
        player={player}
        keysCollected={keysCollected}
        monsters={monsters}
        hidden={hidden}
        walking={walking}
        detected={detected}
        nearKey={nearKey}
        nearHide={nearHide}
        exitNear={exitNear}
      />

      <MiniMap
        player={player}
        keysCollected={keysCollected}
        monsters={monsters}
      />

      <div className="hunter-legend">
        <span>
          <i className="you-dot" />
          You
        </span>
        <span>
          <i className="enemy-dot" />
          Monster
        </span>
        <span>
          <i className="key-dot" />
          Key
        </span>
        <span>
          <i className="exit-dot" />
          Exit
        </span>
      </div>

      <div className="hunter-controls">
        <div className="keys-grid">
          <b>W</b>
          <b>A</b>
          <b>S</b>
          <b>D</b>
        </div>
        <span>Move</span>
        <div className="e-key">E</div>
        <span>Interact / Hide</span>
      </div>

      <div
        className={`hunter-status ${
          detected ? "danger" : ""
        }`}
      >
        {detected
          ? "⚠ DETECTED — BREAK LINE OF SIGHT"
          : hidden
            ? "HIDDEN — STAY QUIET"
            : "UNSEEN — STAY HIDDEN"}
      </div>

      <div className="hunter-objective">
        <b>
          {keysCollected.length === 3
            ? "ESCAPE"
            : "STAY HIDDEN"}
        </b>
        <span>
          {keysCollected.length === 3
            ? "REACH THE EXIT"
            : "SURVIVE"}
        </span>
        <span>
          {keysCollected.length < 3
            ? "FIND THE KEYS"
            : "EXIT UNLOCKED"}
        </span>
        <span>ESCAPE</span>
      </div>

      {nearKey !== null &&
        !hidden &&
        !dead &&
        !escaped && (
          <div className="hunter-interaction">
            <b>KEY {nearKey}</b>
            <span>PRESS E TO TAKE</span>
          </div>
        )}

      {nearHide !== null && !dead && !escaped && (
        <div className="hunter-interaction">
          <b>{hidden ? "HIDING" : "HIDING SPOT"}</b>
          <span>
            PRESS E TO {hidden ? "EXIT" : "HIDE"}
          </span>
        </div>
      )}

      {exitNear &&
        keysCollected.length === 3 &&
        !dead &&
        !escaped && (
          <div className="hunter-interaction">
            <b>EXIT READY</b>
            <span>PRESS E TO ESCAPE</span>
          </div>
        )}

      {dead && (
        <div className="l4-result-overlay">
          <div className="l4-result-card">
            <div className="l4-result-kicker">
              STATION 04
            </div>
            <h1>{timerExpiredRef.current ? "TIME IS UP" : "YOU WERE CAUGHT"}</h1>
            <p>
              {timerExpiredRef.current
                ? "Five minutes are over. The station has gone dark."
                : "The monsters found you."}
            </p>
            <button
              type="button"
              className="level4-story-button"
              onClick={retry}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {escaped && (
        <div className="l4-result-overlay">
          <div className="l4-result-card">
            <div className="l4-result-kicker">
              LEVEL 04
            </div>
            <h1>ESCAPE</h1>
            <p>
              Three keys recovered. The station door is open.
            </p>
            <div className="l4-complete-line">
              LEVEL 04 CLEARED
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN LEVEL 4 — STORY + GAME
========================================================= */

export default function Level4() {
  const navigate = useNavigate();
  const [doorOpen, setDoorOpen] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [playerWalking, setPlayerWalking] = useState(false);
  const [arrivalFinished, setArrivalFinished] = useState(false);
  const [storyStep, setStoryStep] = useState("arrival");
  const [trainJourney, setTrainJourney] = useState(false);
  const [trainLocked, setTrainLocked] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const doorTimer = setTimeout(() => setDoorOpen(true), 6500);
    const playerTimer = setTimeout(() => { setPlayerVisible(true); setPlayerWalking(true); }, 7350);
    const finishTimer = setTimeout(() => { setPlayerWalking(false); setArrivalFinished(true); setStoryStep("lastStation"); }, 10350);
    return () => { clearTimeout(doorTimer); clearTimeout(playerTimer); clearTimeout(finishTimer); };
  }, []);

  const startTrainCheck = () => {
    setStoryStep("trainCheck");
    setTrainJourney(true);
    setTrainLocked(false);
    setTimeout(() => setTrainLocked(true), 2800);
    setTimeout(() => { setTrainJourney(false); setTrainLocked(false); setStoryStep("findKey"); }, 6000);
  };

  const startGame = () => { setGameStarted(true); setStoryStep("game"); };
  const onComplete = () => setStoryStep("completion");
  const returnToLobby = () => navigate("/survival-challenge/lobby");

  if (gameStarted && storyStep === "completion") {
    return <Level4CompletionCinematic onReturn={returnToLobby} />;
  }

  if (gameStarted) return <L4Game onComplete={onComplete} />;

  return (
    <div className="level4-page">
      <div className="level4-scene">
        <Station />
        <LastStationTrain />
        <div className="level4-arrival-train"><Train doorOpen={doorOpen} /></div>
        <Player visible={playerVisible} walking={playerWalking} trainJourney={trainJourney} />

        {arrivalFinished && storyStep === "lastStation" && (
          <StoryPanel title="THE LAST STATION" buttonText="NEXT" onNext={startTrainCheck}>
            <p>This is the last station.</p>
            <p>The train will not move any further from here.</p>
            <p>There is another train standing on the other side of the platform.</p>
            <p className="story-emphasis">Maybe that train can take me somewhere.</p>
          </StoryPanel>
        )}

        {storyStep === "trainCheck" && trainJourney && <div className="level4-action-text"><div className="action-kicker">THE OTHER TRAIN</div><div className="action-line">I need to see if I can use it.</div></div>}
        {storyStep === "trainCheck" && trainLocked && <div className="level4-locked-message"><div className="locked-symbol">🔒</div><div className="locked-title">DOOR LOCKED</div><div className="locked-subtitle">THIS TRAIN CANNOT BE OPENED</div></div>}

        {storyStep === "findKey" && (
          <StoryPanel title="THE DOOR IS LOCKED" buttonText="NEXT" onNext={() => setStoryStep("details")}>
            <p>I can't open this train.</p>
            <p>There must be a way to unlock it.</p>
            <p>If this really is the last train...</p>
            <p className="story-emphasis">I need to find the key.</p>
          </StoryPanel>
        )}

        {storyStep === "details" && <GameDetails onStart={startGame} />}
      </div>
    </div>
  );
}
