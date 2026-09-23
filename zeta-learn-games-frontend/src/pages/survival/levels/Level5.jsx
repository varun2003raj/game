import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import "./level5.css";

/*
  LEVEL 5 — GLASS STEPPING STONES

  Sequence:
  1. Green train enters from LEFT.
  2. Door opens.
  3. Player comes out and stands in CENTER.
  4. Story appears on RIGHT side of the same station background.
  5. White bird flies toward the player's head and hits him.
  6. Bird flies RIGHT and leaves the screen.
  7. Glass-area background is revealed.
  8. Return to the old station background.
  9. Button sends the player to the glass area.
  10. Player stands on LEFT/MIDDLE, glass bridge in center, door on RIGHT.
  11. Choose the safe glass panels.
*/

const SAFE_PATH = [0, 1, 0, 1, 1, 0, 1, 0, 1, 0];

function StationBackground() {
  return (
    <>
      <div className="l5-sky">
        <div className="l5-moon" />
        <div className="l5-stars l5-stars-1" />
        <div className="l5-stars l5-stars-2" />
        <div className="l5-stars l5-stars-3" />
      </div>

      <div className="l5-station-building">
        <div className="l5-station-roof" />
        <div className="l5-station-sign">STATION 05</div>

        <div className="l5-station-window l5-sw1" />
        <div className="l5-station-window l5-sw2" />
        <div className="l5-station-window l5-sw3" />
        <div className="l5-station-window l5-sw4" />

        <div className="l5-station-door" />
      </div>

      <div className="l5-platform">
        <div className="l5-platform-edge" />
      </div>

      <div className="l5-railway">
        <div className="l5-rail l5-rail-left" />
        <div className="l5-rail l5-rail-right" />
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="l5-sleeper"
            style={{ top: `${i * 6}%` }}
          />
        ))}
      </div>

      <div className="l5-lamp l5-lamp-left">
        <div className="l5-lamp-light" />
      </div>

      <div className="l5-lamp l5-lamp-right">
        <div className="l5-lamp-light" />
      </div>

      <div className="l5-fog l5-fog-1" />
      <div className="l5-fog l5-fog-2" />
      <div className="l5-fog l5-fog-3" />
    </>
  );
}

function GreenTrain({ doorOpen }) {
  return (
    <div className="l5-train-layer">
      <div className={`l5-green-train ${doorOpen ? "l5-train-door-open" : ""}`}>
        <div className="l5-train-roof" />

        <div className="l5-train-body">
          <div className="l5-train-window l5-window-1" />
          <div className="l5-train-window l5-window-2" />
          <div className="l5-train-window l5-window-3" />

          <div className="l5-train-door">
            <div className="l5-door-window" />
            <div className="l5-door-panel" />
            <div className="l5-door-left" />
            <div className="l5-door-right" />
          </div>

          <div className="l5-train-window l5-window-4" />

          <div className="l5-train-headlight" />
          <div className="l5-train-label">END OF THE LINE</div>
        </div>

        <div className="l5-train-wheel l5-wheel-1" />
        <div className="l5-train-wheel l5-wheel-2" />
        <div className="l5-train-wheel l5-wheel-3" />
        <div className="l5-train-wheel l5-wheel-4" />
      </div>
    </div>
  );
}

function Player({ state = "hidden" }) {
  if (state === "hidden") return null;

  return (
    <div className={`l5-player l5-player-${state}`}>
      <div className="l5-player-shadow" />

      <div className="l5-player-head">
        <div className="l5-player-hair" />
      </div>

      <div className="l5-player-body" />

      <div className="l5-player-arm l5-arm-left">
        <div className="l5-player-hand" />
      </div>

      <div className="l5-player-arm l5-arm-right">
        <div className="l5-player-hand" />
      </div>

      <div className="l5-player-leg l5-leg-left">
        <div className="l5-player-shoe" />
      </div>

      <div className="l5-player-leg l5-leg-right">
        <div className="l5-player-shoe" />
      </div>
    </div>
  );
}

function Bird() {
  return (
    <div className="l5-bird">
      <div className="l5-bird-body" />
      <div className="l5-bird-wing l5-bird-wing-left" />
      <div className="l5-bird-wing l5-bird-wing-right" />
      <div className="l5-bird-head" />
      <div className="l5-bird-eye" />
      <div className="l5-bird-beak" />
      <div className="l5-bird-tail" />
    </div>
  );
}

function Story({ onContinue }) {
  return (
    <div className="l5-story-right">
      <div className="l5-story-kicker">STATION 05</div>
      <div className="l5-story-line" />
      <h1>THE LAST CROSSING</h1>
      <p>There is nowhere else to go.</p>
      <p>Something is waiting beyond the station.</p>

      <button className="l5-cinematic-button" onClick={onContinue}>
        CONTINUE
      </button>
    </div>
  );
}

function GlassPreview({ finalScene = false }) {
  return (
    <div className={`l5-glass-world ${finalScene ? "l5-glass-final" : ""}`}>
      <div className="l5-glass-sky" />
      <div className="l5-glass-haze" />

      <div className="l5-side-path l5-path-left">
        <span>LEFT PATH</span>
      </div>

      <div className="l5-side-path l5-path-right">
        <span>RIGHT PATH</span>
      </div>

      <div className="l5-gap">
        <div className="l5-gap-depth" />
      </div>

      <div className="l5-glass-bridge">
        {SAFE_PATH.map((_, row) => (
          <div className="l5-glass-row" key={row}>
            <div className="l5-glass-panel l5-panel-left">
              <span>{row + 1}</span>
            </div>
            <div className="l5-glass-panel l5-panel-right">
              <span>{row + 1}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="l5-glass-door">
        <div className="l5-door-frame" />
        <div className="l5-door-light" />
        <div className="l5-door-handle" />
        <span>EXIT</span>
      </div>

      <div className="l5-glass-title">
        <span>STATION 05</span>
        <strong>THE GLASS CROSSING</strong>
      </div>

      {finalScene && (
        <div className="l5-glass-player-position">
          <Player state="glass" />
        </div>
      )}
    </div>
  );
}

function GlassGame({ onWin }) {
  const [row, setRow] = useState(0);
  const [message, setMessage] = useState("Choose one panel.");
  const [broken, setBroken] = useState(null);
  const [brokenPanels, setBrokenPanels] = useState([]);
  const [finished, setFinished] = useState(false);

  const choose = (side) => {
    if (finished || broken !== null || row >= SAFE_PATH.length) return;

    const alreadyBroken = brokenPanels.some(
      (panel) => panel.row === row && panel.side === side
    );

    if (alreadyBroken) return;

    if (side === SAFE_PATH[row]) {
      if (row === SAFE_PATH.length - 1) {
        setRow(SAFE_PATH.length);
        setFinished(true);
        setMessage("THE DOOR IS OPEN.");
        return;
      }

      setRow((value) => value + 1);
      setMessage(`STEP ${row + 2} — CHOOSE CAREFULLY.`);
      return;
    }

    setBroken(side);
    setBrokenPanels((prev) => {
      const alreadyBroken = prev.some(
        (panel) => panel.row === row && panel.side === side
      );

      if (alreadyBroken) return prev;
      return [...prev, { row, side }];
    });

    setTimeout(() => {
      setBroken(null);
      setRow(0);
      setMessage("THE GLASS BROKE. TRY AGAIN.");
    }, 1100);
  };

  useEffect(() => {
    if (!finished) return;

    let cancelled = false;

    const saveResult = async () => {
      try {
        await api.post("survival/level/complete/", {
          level: 5,
          result: "WIN",
        });

        if (!cancelled) onWin();
      } catch (error) {
        console.error(
          "Level 5 completion error:",
          error.response?.data || error
        );

        if (!cancelled) {
          setMessage("Completed, but the result could not be saved.");
        }
      }
    };

    saveResult();

    return () => {
      cancelled = true;
    };
  }, [finished, onWin]);

  return (
    <div className="l5-glass-game">
      <div className="l5-game-top">
        <div>
          <span>LEVEL 05</span>
          <strong>GLASS STEPPING STONES</strong>
        </div>

        <div className="l5-step-counter">
          {Math.min(row, SAFE_PATH.length)} / {SAFE_PATH.length}
        </div>
      </div>

      <div className="l5-game-stage">
        <div className="l5-game-path">
          {SAFE_PATH.map((_, index) => {
            const passed = index < row;
            const current = index === row;

            return (
              <div className="l5-game-row" key={index}>
                <button
                  type="button"
                  className={`l5-game-panel ${
                    passed ? "l5-panel-passed" : ""
                  } ${current ? "l5-panel-current" : ""} ${
                    broken === 0 && current ? "l5-panel-broken" : ""
                  } ${
                    brokenPanels.some(
                      (panel) => panel.row === index && panel.side === 0
                    )
                      ? "l5-panel-permanently-broken"
                      : ""
                  }`}
                  disabled={
                    !current ||
                    finished ||
                    brokenPanels.some(
                      (panel) => panel.row === index && panel.side === 0
                    )
                  }
                  onPointerDown={(event) => {
                    event.preventDefault();
                    choose(0);
                  }}
                  onClick={(event) => event.preventDefault()}
                >
                  LEFT
                </button>

                <button
                  type="button"
                  className={`l5-game-panel ${
                    passed ? "l5-panel-passed" : ""
                  } ${current ? "l5-panel-current" : ""} ${
                    broken === 1 && current ? "l5-panel-broken" : ""
                  } ${
                    brokenPanels.some(
                      (panel) => panel.row === index && panel.side === 1
                    )
                      ? "l5-panel-permanently-broken"
                      : ""
                  }`}
                  disabled={
                    !current ||
                    finished ||
                    brokenPanels.some(
                      (panel) => panel.row === index && panel.side === 1
                    )
                  }
                  onPointerDown={(event) => {
                    event.preventDefault();
                    choose(1);
                  }}
                  onClick={(event) => event.preventDefault()}
                >
                  RIGHT
                </button>
              </div>
            );
          })}
        </div>

        <div className="l5-game-player">
          <Player state="glass" />
        </div>

        <div className="l5-game-exit-door">
          <div className="l5-door-frame" />
          <div className="l5-door-light" />
          <span>EXIT</span>
        </div>
      </div>

      <div className="l5-game-message">{message}</div>

      {finished && (
        <div className="l5-game-finished">
          <span>LEVEL 05 COMPLETE</span>
          <strong>THE DOOR IS OPEN</strong>
        </div>
      )}
    </div>
  );
}

export default function Level5() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("arrival");
  const [doorOpen, setDoorOpen] = useState(false);
  const timers = useRef([]);

  const addTimer = (callback, delay) => {
    const timer = setTimeout(callback, delay);
    timers.current.push(timer);
    return timer;
  };

  useEffect(() => {
    if (phase !== "arrival") return;

    // The train has its own 6.2 second arrival animation.
    const openTimer = setTimeout(() => setDoorOpen(true), 6200);
    const playerTimer = setTimeout(() => setPhase("playerExit"), 6500);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(playerTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "playerExit") return;

    // Let the player finish the complete exit animation before showing the story.
    const storyTimer = setTimeout(() => setPhase("stationStory"), 3900);

    return () => clearTimeout(storyTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "birdApproach") return;

    const hitTimer = setTimeout(() => setPhase("birdHit"), 1700);
    return () => clearTimeout(hitTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "birdHit") return;

    const leaveTimer = setTimeout(() => setPhase("birdLeaving"), 550);
    return () => clearTimeout(leaveTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "birdLeaving") return;

    const revealTimer = setTimeout(() => setPhase("glassReveal"), 2600);
    return () => clearTimeout(revealTimer);
  }, [phase]);

  const startBird = () => {
    setPhase("birdApproach");
  };

  const returnToStation = () => {
    setPhase("returnStation");
  };

  const goToGlass = () => {
    setPhase("glassArea");
  };

  const enterGlassGame = () => {
    setPhase("gameDetails");
  };

  const startGlassLevel = () => {
    setPhase("glassFinal");
  };

  const completeAndLobby = () => {
    navigate("/survival-challenge/lobby");
  };

  return (
    <main className="l5-page">
      {phase === "glassFinal" ? (
        <GlassGame onWin={completeAndLobby} />
      ) : (
        <div className={`l5-scene l5-phase-${phase}`}>
          <StationBackground />

          {phase !== "glassReveal" && (
            <GreenTrain doorOpen={doorOpen} />
          )}

          {phase === "arrival" && (
            <div className="l5-status-text">
              <span>STATION 05</span>
              <strong>THE TRAIN IS ARRIVING</strong>
            </div>
          )}

          {phase === "playerExit" && (
            <Player state="exit" />
          )}

          {phase === "stationStory" && (
            <>
              <Player state="center" />
              <Story onContinue={startBird} />
            </>
          )}

          {(phase === "birdApproach" ||
            phase === "birdHit" ||
            phase === "birdLeaving") && (
            <>
              <Player state="center" />
              <div
                className={`l5-bird-layer ${
                  phase === "birdApproach"
                    ? "l5-bird-approach"
                    : phase === "birdHit"
                    ? "l5-bird-hit"
                    : "l5-bird-leaving"
                }`}
                aria-hidden="true"
              >
                <Bird />
              </div>

              {phase === "birdHit" && (
                <div className="l5-hit-flash" />
              )}
            </>
          )}

          {phase === "glassReveal" && (
            <>
              <GlassPreview />
              <button
                className="l5-return-button"
                onClick={returnToStation}
              >
                RETURN TO THE STATION
              </button>
            </>
          )}

          {phase === "returnStation" && (
            <>
              <Player state="center" />

              <div className="l5-return-story">
                <span>STATION 05</span>
                <strong>THE GLASS IS WAITING.</strong>
                <p>I have to cross it.</p>

                <button
                  className="l5-cinematic-button"
                  onClick={goToGlass}
                >
                  GO TO THE GLASS
                </button>
              </div>
            </>
          )}

          {phase === "glassArea" && (
            <>
              <GlassPreview finalScene />
              <button
                className="l5-enter-game-button"
                onClick={enterGlassGame}
              >
                ENTER THE GAME
              </button>
            </>
          )}

          {phase === "gameDetails" && (
            <>
              <GlassPreview finalScene />

              <div className="l5-game-details-overlay">
                <div className="l5-game-details-card">
                  <span className="l5-details-kicker">LEVEL 05</span>
                  <h1>GLASS STEPPING STONES</h1>
                  <div className="l5-details-line" />

                  <p>
                    Cross the glass bridge and reach the EXIT.
                  </p>

                  <div className="l5-details-rules">
                    <div>
                      <strong>OBJECTIVE</strong>
                      <span>Reach the exit door.</span>
                    </div>
                    <div>
                      <strong>RULES</strong>
                      <span>Choose one panel on every row.</span>
                    </div>
                    <div>
                      <strong>WARNING</strong>
                      <span>One panel breaks. Broken panels stay broken.</span>
                    </div>
                    <div>
                      <strong>GOAL</strong>
                      <span>Survive all 10 rows.</span>
                    </div>
                  </div>

                  <button
                    className="l5-cinematic-button l5-start-level-button"
                    onClick={startGlassLevel}
                  >
                    START LEVEL
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
