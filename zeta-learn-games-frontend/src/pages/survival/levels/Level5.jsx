import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import "./Level5.css";

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
  8. Return automatically to the old station background.
  9. GO TO THE GLASS opens the Level 05 game-details screen on the same station scene.
  10. GLASS GAME starts the actual glass game directly.
  11. Choose the safe glass panels.
*/

const SAFE_PATH = [0, 0, 0, 1, 0, 1, 1, 0, 1, 1];

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
    <div className={`l5-player l4-style-player l5-player-${state}`}>
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

function BirdFlightScene() {
  return (
    <div className="l5-bird-flight-scene" aria-hidden="true">
      <div className="l5-bird-flight-sky" />
      <div className="l5-bird-flight-floor" />

      <div className="l5-bird-flight-platform">
        <div className="l5-bird-flight-glass l5-bird-flight-glass-left" />
        <div className="l5-bird-flight-glass l5-bird-flight-glass-right" />
      </div>

      <div className="l5-bird-flight-door">
        <div className="l5-bird-flight-door-inner" />
        <div className="l5-bird-flight-door-handle" />
        <span>EXIT</span>
      </div>
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
  const TOTAL_STEPS = 10;
  const ROW_GAP = 130;
  const START_Y = 1600;
  // Keep every row in the same straight two-column layout.
  const LEFT_X = 42;
  const RIGHT_X = 58;

  // Player starts below Glass 1.
  const PLAYER_FEET_OFFSET = 15;
  const START_PLAYER_Y = START_Y + 145;
  const CAMERA_PLAYER_Y = 480;
  const SAFE = [0, 0, 0, 1, 0, 1, 1, 0, 1, 1];

  const panelFor = (row, side) => ({
    id: `row-${row}-${side === 0 ? "L" : "R"}`,
    row,
    side,
    x: side === 0 ? LEFT_X : RIGHT_X,
    y: START_Y - row * ROW_GAP,
  });

  const [row, setRow] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [playerWorldY, setPlayerWorldY] = useState(START_PLAYER_Y);
  const [scrollY, setScrollY] = useState(START_PLAYER_Y - CAMERA_PLAYER_Y);
  const [brokenPanels, setBrokenPanels] = useState([]);
  const [failedRow, setFailedRow] = useState(null);
  const [moving, setMoving] = useState(false);
  const [falling, setFalling] = useState(false);
  const [redPanel, setRedPanel] = useState(null);
  const [failed, setFailed] = useState(false);
  const [finished, setFinished] = useState(false);

  const isBroken = (panelId) => brokenPanels.includes(panelId);

  const choose = (side) => {
    if (moving || failed || finished || row >= TOTAL_STEPS) return;

    const panel = panelFor(row, side);
    if (isBroken(panel.id)) return;

    setMoving(true);
    setRedPanel(null);
    setPlayerX(panel.x);
    setPlayerWorldY(panel.y + PLAYER_FEET_OFFSET);

    window.setTimeout(() => {
      const safe = SAFE[row] === side;

      if (!safe) {
        setBrokenPanels((prev) =>
          prev.includes(panel.id) ? prev : [...prev, panel.id]
        );
        setRedPanel(panel);
        setFalling(true);

        setFailedRow(row);
        window.setTimeout(() => {
          setFailed(true);
          setMoving(false);
        }, 900);
        return;
      }

      const completedRow = row;
      const nextRow = row + 1;
      const completedPanel = panelFor(completedRow, side);

      // IMPORTANT:
      // The player must stay on the glass he just completed.
      // The NEXT row becomes selectable, but the player does NOT jump
      // onto that next row before making the next choice.
      setRow(nextRow);
      setFalling(false);
      setRedPanel(null);
      setPlayerX(completedPanel.x);
      setPlayerWorldY(completedPanel.y + PLAYER_FEET_OFFSET);

      if (nextRow === TOTAL_STEPS) {
        setScrollY(Math.max(0, completedPanel.y + PLAYER_FEET_OFFSET - CAMERA_PLAYER_Y));
        setFinished(true);

        // Completion is now confirmed by the live EXIT button below.
        // The result is saved once here, but navigation happens only
        // when the player clicks ENTER THE EXIT DOOR.
        (async () => {
          try {
            await api.post("survival/level/complete/", {
              level: 5,
              result: "WIN",
            });
          } catch (error) {
            console.error("Level 5 completion error:", error);
          }
        })();
      } else {
        // Scroll just enough to bring the NEXT glass row into the
        // player's view while keeping the player visibly standing
        // on the glass row that was just completed.
        const nextPanel = panelFor(nextRow, 0);
        setScrollY(Math.max(0, completedPanel.y + PLAYER_FEET_OFFSET - CAMERA_PLAYER_Y));
      }

      window.setTimeout(() => setMoving(false), 900);
    }, 700);
  };

  const retry = () => {
    // Every failed attempt starts again from the beginning.
    // Broken panels are intentionally NOT cleared.
    setRow(0);
    setPlayerX(50);
    setPlayerWorldY(START_PLAYER_Y);
    setScrollY(START_PLAYER_Y - CAMERA_PLAYER_Y);
    setMoving(false);
    setFalling(false);
    setRedPanel(null);
    setFailed(false);
    setFinished(false);
  };

  const visibleRows = Array.from({ length: TOTAL_STEPS }, (_, index) => index);

  return (
    <main className="l5-glass-game">
      <div className="l5-crossing-header">
        <div className="l5-crossing-title">
          <span>LEVEL 05</span>
          <strong>GLASS STEPPING STONES</strong>
        </div>
        <div className="l5-crossing-progress">
          CROSSING {row} / {TOTAL_STEPS}
          <div className="l5-crossing-progress-track">
            <div
              className="l5-crossing-progress-fill"
              style={{ width: `${(row / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="l5-crossing-viewport">
        <div
          className="l5-crossing-world l5-straight-crossing-world"
          style={{ transform: `translate3d(0, ${-scrollY}px, 0)` }}
        >
          <div className="l5-straight-center-line" />

          {visibleRows.map((index) => {
            const left = panelFor(index, 0);
            const right = panelFor(index, 1);
            const leftBroken = isBroken(left.id);
            const rightBroken = isBroken(right.id);
            const current = index === row;
            const passed = index < row;

            return (
              <div
                key={index}
                className="l5-straight-row"
                style={{ top: `${left.y}px` }}
              >
                <button
                  type="button"
                  className={`l5-glass-panel l5-choice-panel l5-straight-panel ${
                    leftBroken ? "l5-glass-broken" : ""
                  } ${current ? "l5-current-row" : ""} ${passed ? "l5-passed-row" : ""}`}
                  disabled={!current || moving || failed || finished || leftBroken}
                  onClick={() => choose(0)}
                >
                  {leftBroken ? (
                    <>
                      <span className="l5-broken-crack crack-a" />
                      <span className="l5-broken-crack crack-b" />
                      <span className="l5-broken-crack crack-c" />
                      <span className="l5-broken-word">BROKEN</span>
                    </>
                  ) : (
                    <>
                      <span className="l5-glass-shine" />
                      <span className="l5-choice-label">LEFT</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`l5-glass-panel l5-choice-panel l5-straight-panel ${
                    rightBroken ? "l5-glass-broken" : ""
                  } ${current ? "l5-current-row" : ""} ${passed ? "l5-passed-row" : ""}`}
                  disabled={!current || moving || failed || finished || rightBroken}
                  onClick={() => choose(1)}
                >
                  {rightBroken ? (
                    <>
                      <span className="l5-broken-crack crack-a" />
                      <span className="l5-broken-crack crack-b" />
                      <span className="l5-broken-crack crack-c" />
                      <span className="l5-broken-word">BROKEN</span>
                    </>
                  ) : (
                    <>
                      <span className="l5-glass-shine" />
                      <span className="l5-choice-label">RIGHT</span>
                    </>
                  )}
                </button>

                <span className="l5-row-number">{index + 1}</span>
              </div>
            );
          })}

          {finished && (
            <div
              className="l5-final-exit l5-straight-final-exit"
              style={{
                left: `${playerX}%`,
                top: `${START_Y - (TOTAL_STEPS - 1) * ROW_GAP - 145}px`,
              }}
            >
              <div className="l5-final-exit-light" />
              <div className="l5-final-exit-door">EXIT</div>
            </div>
          )}

          {!finished && (
            <div
              className={`l5-straight-player ${falling ? "l5-straight-player-falling" : ""}`}
              style={{
                left: `${playerX}%`,
                top: `${playerWorldY}px`,
              }}
            >
              <Player state="glass" />
            </div>
          )}
        </div>
      </div>

      {redPanel && <div className="l5-red-light-flash" />}

      {failed && (
        <div className="l5-glass-failure-overlay">
          <div className="l5-glass-failure-card l5-red-failure-card">
            <div className="l5-failure-red-line" />
            <div className="l5-failure-eyebrow">RED LIGHT</div>
            <h2>TRY AGAIN TOMORROW</h2>
            <p>
              The broken glass remains broken.
              <br />
              Choose the other glass on your next attempt.
            </p>
            <button type="button" className="l5-come-again-button" onClick={retry}>
              COME AGAIN
            </button>
          </div>
        </div>
      )}

      {finished && (
        <div className="l5-glass-complete-overlay">
          <div className="l5-glass-complete-card l5-exit-ready-card">
            <div className="l5-complete-eyebrow">CROSSING COMPLETE</div>
            <h2>THE EXIT IS OPEN</h2>
            <p>You survived all 10 glass stages.</p>
            <button
              type="button"
              className="l5-enter-exit-button"
              onClick={onWin}
            >
              ENTER THE EXIT DOOR
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Level5() {
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

    const leaveTimer = setTimeout(() => setPhase("birdFlight"), 550);
    return () => clearTimeout(leaveTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "birdFlight") return;

    const returnTimer = setTimeout(() => setPhase("returnStation"), 3000);
    return () => clearTimeout(returnTimer);
  }, [phase]);

  const startBird = () => {
    setPhase("birdApproach");
  };

  const goToGlass = () => {
    // Go directly from the station scene to the game-details screen.
    // The old GlassPreview / ENTER THE GAME screen is intentionally removed.
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
      ) : phase === "birdFlight" ? (
        <div className="l5-bird-flight-only-scene">
          <BirdFlightScene />
          <div className="l5-bird-layer l5-bird-flight" aria-hidden="true">
            <Bird />
          </div>
        </div>
      ) : (
        <div className={`l5-scene l5-phase-${phase}`}>
          <StationBackground />

          <GreenTrain doorOpen={doorOpen} />

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

          {(phase === "birdApproach" || phase === "birdHit") && (
            <>
              <Player state="center" />

              <div
                className={`l5-bird-layer ${
                  phase === "birdApproach"
                    ? "l5-bird-approach"
                    : "l5-bird-hit"
                }`}
                aria-hidden="true"
              >
                <Bird />
              </div>

              {phase === "birdHit" && <div className="l5-hit-flash" />}
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

          {phase === "gameDetails" && (
            <>
              {/* Keep the player/train station scene. The old large glass-preview
                  screen is intentionally not shown here. */}
              <StationBackground />
              <GreenTrain doorOpen={doorOpen} />
              <Player state="center" />

              <div className="l5-game-details-overlay l5-station-details-overlay">
                <div className="l5-game-details-card l5-station-details-card">
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
                      <span>Choose LEFT or RIGHT on every row.</span>
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
                    GLASS GAME
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

export default Level5;
