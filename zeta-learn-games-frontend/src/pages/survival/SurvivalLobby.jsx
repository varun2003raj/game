import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

import gate from "../../assets/survival/gate.png";

import "./SurvivalLobby.css";

const stations = [
  {
    number: "01",
    name: "COIN CHALLENGE",
    shortName: "COIN",
    description: "Choose your fate",
    path: "/survival-challenge/level-1",
    objective: "Predict the result of the coin flip and survive the round.",
    rules: "Choose Head or Tail before each flip. Win 2 out of 3 rounds to survive.",
    time: "15 SEC",
    reward: "FUEL SYMBOL",
  },
  {
    number: "02",
    name: "RED LIGHT",
    shortName: "RED LIGHT",
    description: "Move when allowed",
    path: "/survival-challenge/level-2",
    objective: "Reach the finish line without being caught moving during Red Light.",
    rules: "Move during Green Light. Stop immediately when Red Light appears.",
    time: "60 SEC",
    reward: "MAP",
  },
  {
    number: "03",
    name: "MARBLES",
    shortName: "MARBLES",
    description: "Risk everything",
    path: "/survival-challenge/level-3",
    objective: "Win the marble challenge and take your opponent's marbles.",
    rules: "Use odd or even guesses to win marbles. Reach 20 to survive.",
    time: "90 SEC",
    reward: "20 MARBLES",
  },
  {
    number: "04",
    name: "MONSTER ESCAPE",
    shortName: "ESCAPE",
    description: "Don't get caught",
    path: "/survival-challenge/level-4",
    objective: "Find the keys and escape before the monster catches you.",
    rules: "Collect all required keys and reach the exit while avoiding the monster.",
    time: "120 SEC",
    reward: "KEY",
  },
  {
    number: "05",
    name: "GLASS BRIDGE",
    shortName: "GLASS",
    description: "Choose carefully",
    path: "/survival-challenge/level-5",
    objective: "Cross the glass bridge by choosing the safe panels.",
    rules: "Choose left or right at every step. One panel is safe and the other breaks.",
    time: "90 SEC",
    reward: "FINAL SYMBOL",
  },
];

const itemInfo = {
  ticket: {
    label: "TRAVEL TICKET",
    icon: "🎫",
    text: "The ticket earned after surviving the first trial.",
  },
  map: {
    label: "STATION MAP",
    icon: "🗺️",
    text: "The map recovered during Level 2. It reveals the hidden territory.",
  },
  fuel: {
    label: "FUEL CAN",
    icon: "⛽",
    text: "Fuel collected during the Survival Round.",
  },
  marbles: {
    label: "MARBLES",
    icon: "⚫",
    text: "Twenty black marbles taken during the marble challenge.",
  },
  key: {
    label: "ESCAPE KEY",
    icon: "🔑",
    text: "A key recovered during the monster escape.",
  },
};

function getInventoryValue(inventory, key) {
  if (!inventory) return false;
  return Boolean(
    inventory[key] ??
      inventory[`${key}_collected`] ??
      inventory[`${key}Collected`]
  );
}

function getMarbleCount(inventory) {
  return (
    Number(
      inventory?.marbles ??
        inventory?.marble_count ??
        inventory?.marbles_collected ??
        0
    ) || 0
  );
}

function ProgressMarker({ currentLevel, allCompleted }) {
  return (
    <div className="progress-marker">
      <span className="progress-marker-line" />
      <span>
        {allCompleted ? "ALL TRIALS CLEARED" : `CURRENT TRIAL 0${currentLevel}`}
      </span>
    </div>
  );
}

function ItemViewer({ item, onClose }) {
  const [flipped, setFlipped] = useState(false);
  const info = itemInfo[item];

  if (!info) return null;

  return (
    <div className="item-viewer-overlay" onClick={onClose}>
      <div className="item-viewer" onClick={(e) => e.stopPropagation()}>
        <button className="viewer-close" onClick={onClose}>×</button>

        <div className="viewer-kicker">SURVIVAL INVENTORY</div>
        <h2>{info.label}</h2>

        {item === "ticket" ? (
          <button
            className={`ticket-card ${flipped ? "flipped" : ""}`}
            onClick={() => setFlipped((v) => !v)}
          >
            <div className="ticket-face ticket-front">
              <span className="ticket-symbol">🎫</span>
              <strong>SURVIVAL EXPRESS</strong>
              <small>ONE WAY · VALID</small>
              <b>CLICK TO FLIP</b>
            </div>
            <div className="ticket-face ticket-back">
              <span>PASSENGER</span>
              <strong>SURVIVAL ROUND</strong>
              <small>THE JOURNEY CONTINUES</small>
              <b>CLICK TO FLIP</b>
            </div>
          </button>
        ) : item === "map" ? (
          <div className="large-map">
            <div className="map-grid" />
            <div className="map-title">STATION MAP</div>
            <div className="map-route route-one">01</div>
            <div className="map-route route-two">02</div>
            <div className="map-route route-three">03</div>
            <div className="map-route route-four">04</div>
            <div className="map-route route-five">05</div>
            <div className="map-route route-final">06</div>
          </div>
        ) : item === "marbles" ? (
          <div className="marble-viewer">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="large-marble" />
            ))}
          </div>
        ) : (
          <div className={`large-object object-${item}`}>
            <span>{info.icon}</span>
          </div>
        )}

        <p className="viewer-description">{info.text}</p>
        {item === "ticket" && (
          <p className="viewer-hint">Click the ticket to view front / back.</p>
        )}
      </div>
    </div>
  );
}

function Inventory({ inventory, onOpen }) {
  const ticket = getInventoryValue(inventory, "ticket");
  const map = getInventoryValue(inventory, "map_collected") || getInventoryValue(inventory, "map");
  const fuel =
    getInventoryValue(inventory, "fuel") ||
    getInventoryValue(inventory, "fuel_collected") ||
    getInventoryValue(inventory, "fuel_symbol");
  const marbles = getMarbleCount(inventory);
  const key =
    getInventoryValue(inventory, "key") ||
    getInventoryValue(inventory, "keys_collected") ||
    getInventoryValue(inventory, "key_collected");

  const items = [
    { id: "ticket", icon: "🎫", active: ticket },
    { id: "map", icon: "🗺️", active: map },
    { id: "fuel", icon: "⛽", active: fuel },
    { id: "marbles", icon: "⚫", active: marbles > 0 },
    { id: "key", icon: "🔑", active: key },
  ];

  return (
    <aside className="inventory-panel">
      <div className="side-kicker">SURVIVAL INVENTORY</div>
      <h2>COLLECTED ITEMS</h2>

      <div className="inventory-list">
        {items.map((item) => (
          <button
            key={item.id}
            className={`inventory-item ${item.active ? "collected" : "empty"}`}
            disabled={!item.active}
            onClick={() => item.active && onOpen(item.id)}
          >
            <span className="inventory-icon">{item.icon}</span>
            <span className="inventory-copy">
              <strong>{itemInfo[item.id].label}</strong>
              <small>
                {item.id === "marbles"
                  ? `${marbles}/20`
                  : item.active
                    ? "COLLECTED"
                    : "NOT COLLECTED"}
              </small>
            </span>
            {item.active && <span className="inventory-arrow">↗</span>}
          </button>
        ))}
      </div>
    </aside>
  );
}

function StatusPanel({
  survivalDay,
  backendLevel,
  totalScore,
  totalAttempts,
  totalDeaths,
  resetting,
  onReset,
}) {
  return (
    <aside className="status-panel">
      <div className="side-kicker">PLAYER STATUS</div>
      <h2>SURVIVAL RECORD</h2>

      <div className="status-grid">
        <div><small>DAY</small><strong>{survivalDay}</strong></div>
        <div><small>LEVEL</small><strong>0{backendLevel}</strong></div>
        <div><small>ATTEMPTS</small><strong>{totalAttempts}</strong></div>
        <div><small>DEATHS</small><strong>{totalDeaths}</strong></div>
        <div className="score-cell"><small>SCORE</small><strong>{totalScore}</strong></div>
      </div>

      <button
        className="reset-button"
        disabled={resetting}
        onClick={onReset}
      >
        {resetting ? "RESETTING..." : "↻ RESET RUN"}
      </button>
    </aside>
  );
}

function WorldStation({
  station,
  levelNumber,
  unlocked,
  completed,
  current,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={onClick}
      className={[
        "simple-level",
        completed ? "completed" : "",
        current ? "current" : "",
        unlocked ? "unlocked" : "locked",
      ].join(" ")}
    >
      <div className="level-circle">
        <span>{levelNumber}</span>
      </div>

      <div className="simple-level-label">
        <small>LEVEL</small>
        <strong>0{levelNumber}</strong>
        <span>
          {completed ? "CLEARED" : unlocked ? "ENTER" : "LOCKED"}
        </span>
      </div>
    </button>
  );
}

function FinalDoor({ allCompleted, onEnter }) {
  return (
    <button
      type="button"
      disabled={!allCompleted}
      className={`final-door-world ${allCompleted ? "unlocked" : "locked"}`}
      onClick={onEnter}
    >
      <div className="final-door-aura" />

      <div className="final-door-frame">
        <div className="final-door-crown">06</div>
        <img src={gate} alt="Final Door" />
        <div className="final-door-center">
          {allCompleted ? "ENTER" : "🔒"}
        </div>
        <div className="final-door-light" />
      </div>

      <div className="final-door-label">
        <small>ADDITIONAL DESTINATION</small>
        <strong>THE FINAL DOOR</strong>
        <span>{allCompleted ? "LEVEL 06 · ENTER" : "LOCKED · COMPLETE 01—05"}</span>
      </div>
    </button>
  );
}

function CinematicWorld({
  backendLevel,
  completedLevels,
  mapCollected,
  allCompleted,
  onEnterLevel,
  onFinalDoor,
}) {
  return (
    <main className="cinematic-world">
      <div className={`simple-world ${mapCollected ? "map-revealed" : ""}`}>
        <div className="world-background">
          <div className="world-image-layer" />
          <div className="world-sky-glow" />
        </div>

        <div className="world-destinations simple-levels">
          {stations.map((station, index) => {
            const levelNumber = index + 1;
            const completed = completedLevels.has(levelNumber);
            const unlocked = levelNumber <= backendLevel || completed;

            return (
              <WorldStation
                key={station.number}
                station={station}
                levelNumber={levelNumber}
                unlocked={unlocked}
                completed={completed}
                current={levelNumber === backendLevel && !completed}
                onClick={() => unlocked && onEnterLevel(station.path)}
              />
            );
          })}

          <FinalDoor
            allCompleted={allCompleted}
            onEnter={onFinalDoor}
          />
        </div>

        {!mapCollected && (
          <div className="cloud-wall">
            <div className="cloud cloud-1" />
            <div className="cloud cloud-2" />
            <div className="cloud cloud-3" />
            <div className="cloud cloud-4" />
            <div className="cloud cloud-5" />

            <div className="cloud-text">
              <strong>UNKNOWN TERRITORY</strong>
              <span>THE MAP WILL REVEAL THE WAY</span>
            </div>
          </div>
        )}

        {mapCollected && (
          <div className="cloud-reveal">
            <div className="drifting-cloud reveal-cloud-1" />
            <div className="drifting-cloud reveal-cloud-2" />
            <div className="drifting-cloud reveal-cloud-3" />
          </div>
        )}
      </div>

      <ProgressMarker
        currentLevel={backendLevel}
        allCompleted={allCompleted}
      />
    </main>
  );
}

export default function SurvivalLobby() {
  const navigate = useNavigate();

  const [survivalData, setSurvivalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [viewerItem, setViewerItem] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchSurvivalData = async () => {
      try {
        setLoading(true);
        setApiError("");

        const response = await api.get("survival/");

        if (alive) setSurvivalData(response.data);
      } catch (error) {
        console.error("SURVIVAL API ERROR:", error);

        if (!alive) return;

        if (error.response?.status === 404) {
          setApiError("No active Survival run.");
        } else if (error.response?.status === 401) {
          setApiError("Please login first.");
        } else {
          setApiError("Unable to load Survival data.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchSurvivalData();

    return () => {
      alive = false;
    };
  }, []);

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Start a new Survival Round?\n\nYour previous run will be saved in history."
    );

    if (!confirmed) return;

    try {
      setResetting(true);

      await api.post("survival/reset/");

      const response = await api.get("survival/");
      setSurvivalData(response.data);
    } catch (error) {
      console.error("SURVIVAL RESET ERROR:", error);

      if (error.response?.status === 401) {
        alert("Please login first.");
      } else {
        alert(
          error?.response?.data?.detail ||
          "Unable to reset Survival Round."
        );
      }
    } finally {
      setResetting(false);
    }
  };

  const backendLevel = Number(survivalData?.current_level || 1);
  const survivalDay = Number(survivalData?.survival_day || 1);
  const totalScore = Number(survivalData?.total_score || 0);
  const totalAttempts = Number(survivalData?.total_attempts || 0);
  const totalDeaths = Number(survivalData?.total_deaths || 0);

  const levelProgress = survivalData?.level_progress || [];
  const inventory = survivalData?.inventory || {};

  const completedLevels = useMemo(() => {
    const result = new Set();

    levelProgress.forEach((level) => {
      if (level?.status === "COMPLETED") {
        result.add(Number(level.level_number));
      }
    });

    return result;
  }, [levelProgress]);

  const allCompleted =
    [1, 2, 3, 4, 5].every((level) => completedLevels.has(level)) ||
    survivalData?.status === "COMPLETED";

  const mapCollected =
    getInventoryValue(inventory, "map_collected") ||
    getInventoryValue(inventory, "map");

  const getLevelProgress = (levelNumber) =>
    levelProgress.find(
      (level) => Number(level.level_number) === levelNumber
    );

  if (loading) {
    return (
      <div className="survival-loading">
        <div className="loading-ring" />
        <p>LOADING SURVIVAL WORLD</p>
      </div>
    );
  }

  return (
    <div className="survival-lobby-page">
      <CinematicWorld
        backendLevel={backendLevel}
        completedLevels={completedLevels}
        mapCollected={mapCollected}
        allCompleted={allCompleted}
        onEnterLevel={(path) => navigate(path)}
        onFinalDoor={() => {
          if (!allCompleted) return;

          // Change this route when Level 6 is created.
          navigate("/survival-challenge/level-6");
        }}
      />

      <header className="world-header">
        <button
          className="back-button"
          onClick={() => navigate("/survival-challenge")}
        >
          ← BACK
        </button>

        <div className="world-title">
          <span>GAME 05 · SURVIVAL ROUND</span>
          <strong>THE SURVIVAL WORLD</strong>
        </div>
      </header>

      <div className="world-status-left">
        <StatusPanel
          survivalDay={survivalDay}
          backendLevel={backendLevel}
          totalScore={totalScore}
          totalAttempts={totalAttempts}
          totalDeaths={totalDeaths}
          resetting={resetting}
          onReset={handleReset}
        />
      </div>

      <div className="world-inventory-right">
        <Inventory
          inventory={inventory}
          onOpen={setViewerItem}
        />
      </div>

      <div className="world-intro">
        <span>SURVIVAL ROUND · FIVE TRIALS · ONE FINAL DOOR</span>
        <h1>THE SURVIVAL WORLD</h1>
        <p>Move from left to right. Survive every destination.</p>
      </div>

      {apiError && (
        <div className="api-error">
          {apiError}
        </div>
      )}

      {viewerItem && (
        <ItemViewer
          item={viewerItem}
          onClose={() => setViewerItem(null)}
        />
      )}
    </div>
  );
}
