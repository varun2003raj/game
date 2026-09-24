import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import "./Level1.css";
import "./Level3.css";

const GAME_TIME = 180;
const ROUND_TIME = 10;
const MAX_WAGER = 5;

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
        <div className="station-sign">STATION 03</div>
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
            style={{ top: `${index * 6}%` }}
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

function Train({ doorOpen, departing }) {
  return (
    <div className={`train ${departing ? "train-departing" : ""}`}>
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

function Player({ walking = false, entered = false, className = "" }) {
  if (entered) return null;

  return (
    <div className={`player ${walking ? "player-walking" : ""} ${className}`}>
      <div className="player-head" />
      <div className="player-body" />
      <div className="player-arm arm-left" />
      <div className="player-arm arm-right" />
      <div className="player-leg leg-left" />
      <div className="player-leg leg-right" />
    </div>
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function MarbleSet({ count, type = "player", small = false }) {
  return (
    <div className={`marble-set ${small ? "small" : ""}`}>
      {Array.from({ length: Math.max(0, Math.min(count, 20)) }).map((_, index) => (
        <span
          key={index}
          className={`glass-marble ${type === "player" ? "player-marble" : type}`}
          style={{ "--marble-index": index }}
        />
      ))}
    </div>
  );
}

function Station3Arrival({ onContinue }) {
  const [doorOpen, setDoorOpen] = useState(false);
  const [walking, setWalking] = useState(false);
  const [showStory, setShowStory] = useState(false);

  useEffect(() => {
    // Same rhythm as Level 2: train arrives first, door opens,
    // player exits, then the story appears after the walk finishes.
    const doorTimer = setTimeout(() => setDoorOpen(true), 6500);
    const walkTimer = setTimeout(() => setWalking(true), 7350);
    const storyTimer = setTimeout(() => {
      setWalking(false);
      setShowStory(true);
    }, 10350);

    return () => {
      clearTimeout(doorTimer);
      clearTimeout(walkTimer);
      clearTimeout(storyTimer);
    };
  }, []);

  return (
    <main className="level1-screen level3-arrival-page level3-arrival-scene">
      <Station />

      {/* EXACT Level-2 arrival structure */}
      <div className="level3-arrival-train">
        <Train
          doorOpen={doorOpen}
          departing={false}
        />
      </div>

      {/* Player stays hidden inside the train until the door opens, then exits and walks to center. */}
      <div className={`level3-arrival-player ${walking ? "walking" : ""}`}>
        <Player
          walking={walking}
          entered={!doorOpen}
          className={showStory ? "arrival-finished" : ""}
        />
      </div>

      {!showStory && (
        <div className="level3-arrival-status">
          {!doorOpen && <span>THE TRAIN IS ARRIVING...</span>}
          {doorOpen && !walking && <span>DOOR OPEN</span>}
          {walking && <span>EXITING TRAIN</span>}
        </div>
      )}

      {showStory && (
        <div className="level3-no-fuel-story">
          <div className="story-kicker">STATION 03</div>
          <div className="story-line" />
          <h1>NO FUEL.</h1>
          <p>The train cannot move any further.</p>
          <p>I need fuel to continue to the next station.</p>
          <button className="cinematic-button" onClick={onContinue}>
            CONTINUE <span>→</span>
          </button>
        </div>
      )}
    </main>
  );
}

function VictoryCinematic({ onFinish }) {
  const [stage, setStage] = useState("fuel");

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage("door"), 2600),
      setTimeout(() => setStage("walk"), 3900),
      setTimeout(() => setStage("inside"), 7000),
      setTimeout(() => setStage("closed"), 8100),
      setTimeout(() => setStage("depart"), 9000),
      setTimeout(() => onFinish(), 14000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  const doorOpen = stage === "door" || stage === "walk" || stage === "inside";
  const playerWalking = stage === "walk";
  const playerEntered = stage === "inside" || stage === "closed" || stage === "depart";

  return (
    <div className={`level3-page level3-victory-cinematic stage-${stage}`}>
      <div className="level3-victory-scene">
        <Station />

        <div className="level3-victory-train">
          <Train doorOpen={doorOpen} departing={stage === "depart"} />
        </div>

        {/* The stranger stays at the station for the entire ending. */}
        <div className="level3-victory-stranger">
          <Player walking={false} className="victory-stranger-blue" />
        </div>

        {/* Player boards the train carrying the fuel can. */}
        <div className={`level3-victory-player ${playerWalking ? "walking" : ""}`}>
          <Player walking={playerWalking} entered={playerEntered} />
          {(stage === "fuel" || stage === "door" || stage === "walk") && (
            <div className={`victory-fuel-can ${stage === "walk" ? "fuel-in-hand" : ""}`} aria-label="Fuel can">
              <div className="victory-fuel-can-cap" />
              <div className="victory-fuel-can-body">FUEL</div>
            </div>
          )}
        </div>

        {stage === "fuel" && (
          <div className="victory-fuel-scene">
            <div className="victory-story-kicker">MARBLE TRIAL CLEARED</div>
            <h1>THE STRANGER KEEPS HIS WORD.</h1>
            <p>He hands you the fuel needed to move the train.</p>
          </div>
        )}

        {stage === "door" && (
          <div className="victory-action-text">
            <span>FUEL ACQUIRED</span>
            <strong>THE TRAIN DOOR OPENS.</strong>
          </div>
        )}

        {stage === "walk" && (
          <div className="victory-action-text">
            <span>BOARDING</span>
            <strong>ENTERING THE TRAIN.</strong>
          </div>
        )}

        {stage === "inside" && (
          <div className="victory-action-text">
            <span>INSIDE</span>
            <strong>DOORS CLOSING.</strong>
          </div>
        )}

        {stage === "closed" && (
          <div className="victory-action-text">
            <span>TRAIN READY</span>
            <strong>DEPARTING.</strong>
          </div>
        )}

        {stage === "depart" && (
          <div className="victory-action-text departing-text">
            <span>LEVEL 03</span>
            <strong>LEAVING STATION.</strong>
          </div>
        )}
      </div>
    </div>
  );
}

function Level3() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState("arrival");
  const [playerMarbles, setPlayerMarbles] = useState(10);
  const [opponentMarbles, setOpponentMarbles] = useState(10);
  const [wager, setWager] = useState(1);
  const [choice, setChoice] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_TIME);
  const [opponentWager, setOpponentWager] = useState(null);
  const [roundTotal, setRoundTotal] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [message, setMessage] = useState("Choose your wager.");
  const [history, setHistory] = useState([]);
  const [revealStep, setRevealStep] = useState("idle");
  const [roundNumber, setRoundNumber] = useState(1);
  const [strangerArrived, setStrangerArrived] = useState(false);

  const timerRef = useRef(null);
  const resultSubmittedRef = useRef(false);
  const roundTimeoutHandledRef = useRef(false);

  useEffect(() => {
    if (phase !== "stranger") {
      setStrangerArrived(false);
      return;
    }

    setStrangerArrived(false);
    const arrivalTimer = setTimeout(() => {
      setStrangerArrived(true);
    }, 3300);

    return () => clearTimeout(arrivalTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "game" && phase !== "thinking" && phase !== "reveal") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== "game") return;

    const roundTimer = setInterval(() => {
      setRoundTimeLeft((previous) => {
        // Keep the interval alive at 0. The timeout handler below
        // immediately resets the timer to ROUND_TIME for the next round.
        // If we clear the interval here, the next round has no timer.
        if (previous <= 0) {
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(roundTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "game" || roundTimeLeft !== 0) return;
    if (roundTimeoutHandledRef.current) return;

    roundTimeoutHandledRef.current = true;

    // IMPORTANT: the 10-second timer is the decision window.
    // If the player selected BOTH wager and ODD/EVEN, the round
    // automatically plays now. There is no PLAY button anymore.
    if (choice) {
      playRound();
      return;
    }

    // No choice was made in 10 seconds: exactly one marble moves
    // from the player to the stranger. The next round starts immediately.
    const nextPlayer = Math.max(0, playerMarbles - 1);
    const nextOpponent = Math.min(20, opponentMarbles + 1);

    setPlayerMarbles(nextPlayer);
    setOpponentMarbles(nextOpponent);

    setHistory((previous) => [
      {
        round: roundNumber,
        playerWager: 0,
        opponentWager: 1,
        total: "—",
        choice: "—",
        parity: "—",
        result: "TIME OUT",
        change: "-1",
      },
      ...previous,
    ]);

    if (nextPlayer <= 0 || nextOpponent >= 20) {
      setRoundResult("lose");
      setMessage("TIME OUT — YOU LOST 1 MARBLE.");
      submitResult("DEATH").then((saved) => {
        if (saved) setPhase("finished");
      });
      return;
    }

    // No loading state. Reset everything and begin the next 10-second
    // round in the same render cycle.
    setRoundNumber((previous) => previous + 1);
    setWager(1);
    setChoice(null);
    setOpponentWager(null);
    setRoundTotal(null);
    setRoundResult(null);
    setRevealStep("idle");
    setRoundTimeLeft(ROUND_TIME);
    setMessage("NEW ROUND — CHOOSE YOUR WAGER AND ODD / EVEN.");
    roundTimeoutHandledRef.current = false;
  }, [roundTimeLeft, phase, choice, playerMarbles, opponentMarbles, roundNumber]);

  const submitResult = async (result) => {
    if (resultSubmittedRef.current) return true;

    resultSubmittedRef.current = true;

    try {
      await api.post("survival/level/complete/", {
        level: 3,
        result,
      });
      return true;
    } catch (error) {
      console.error("Level 3 result error:", error.response?.data || error);
      resultSubmittedRef.current = false;
      alert(error.response?.data?.detail || "Unable to save Level 3 result.");
      return false;
    }
  };

  useEffect(() => {
    if (timeLeft !== 0) return;
    if (phase !== "game" && phase !== "thinking" && phase !== "reveal") return;

    clearInterval(timerRef.current);

    const handleTimeout = async () => {
      const won = playerMarbles > opponentMarbles;
      const result = won ? "WIN" : "DEATH";
      const saved = await submitResult(result);
      if (!saved) return;

      setRoundResult(won ? "win" : "lose");
      setMessage("THE THREE-MINUTE TRIAL IS OVER.");
      setPhase(won ? "victory" : "finished");
    };

    handleTimeout();
  }, [timeLeft, phase, playerMarbles, opponentMarbles]);

  const startGame = () => {
    resultSubmittedRef.current = false;
    roundTimeoutHandledRef.current = false;
    setPlayerMarbles(10);
    setOpponentMarbles(10);
    setWager(1);
    setChoice(null);
    setOpponentWager(null);
    setRoundTotal(null);
    setRoundResult(null);
    setRevealStep("idle");
    setRoundNumber(1);
    setHistory([]);
    setTimeLeft(GAME_TIME);
    setRoundTimeLeft(ROUND_TIME);
    setMessage("Choose your wager and prediction before the 10-second round timer ends.");
    setPhase("game");
  };

  const playRound = () => {
    if (phase !== "game" || roundTimeLeft < 0) return;

    if (!choice) {
      setMessage("Choose ODD or EVEN first.");
      return;
    }

    const safeWager = Math.min(
      Math.max(1, wager),
      MAX_WAGER,
      playerMarbles
    );

    setWager(safeWager);
    setPhase("thinking");
    setRevealStep("opponent");
    setOpponentWager(null);
    setRoundTotal(null);
    setRoundResult(null);
    setMessage("The stranger is choosing...");

    const maxOpponentWager = Math.min(
      MAX_WAGER,
      opponentMarbles
    );

    // Fair AI: choose ODD/EVEN with equal probability first,
    // then choose a valid wager that produces that parity.
    const randomBuffer = new Uint32Array(2);
    crypto.getRandomValues(randomBuffer);

    const desiredOpponentParity = randomBuffer[0] % 2;
    const matchingWagers = Array.from(
      { length: maxOpponentWager },
      (_, index) => index + 1
    ).filter((value) => value % 2 === desiredOpponentParity);

    const aiWager =
      matchingWagers[randomBuffer[1] % matchingWagers.length];

    setTimeout(() => {
      setOpponentWager(aiWager);
      setRevealStep("locked");
      setMessage("OPPONENT LOCKED.");

      setTimeout(() => {
        const total = safeWager + aiWager;
        const parity = total % 2 === 0 ? "even" : "odd";
        const won = choice === parity;

        setRoundTotal(total);
        setRevealStep("result");
        setRoundResult(won ? "win" : "lose");

        const nextPlayer = won
          ? playerMarbles + aiWager
          : playerMarbles - safeWager;

        const nextOpponent = won
          ? opponentMarbles - aiWager
          : opponentMarbles + safeWager;

        setPlayerMarbles(nextPlayer);
        setOpponentMarbles(nextOpponent);

        const change = won ? aiWager : safeWager;

        setHistory((previous) => [
          {
            round: roundNumber,
            playerWager: safeWager,
            opponentWager: aiWager,
            total,
            choice,
            parity,
            result: won ? "WIN" : "LOSS",
            change: won ? `+${change}` : `-${change}`,
          },
          ...previous,
        ]);

        setMessage(
          won
            ? `You chose ${choice.toUpperCase()}. The total is ${total} — ${parity.toUpperCase()}. You win ${change} marble${change !== 1 ? "s" : ""}.`
            : `You chose ${choice.toUpperCase()}. The total is ${total} — ${parity.toUpperCase()}. You lose ${change} marble${change !== 1 ? "s" : ""}.`
        );

        if (nextPlayer >= 20) {
          setTimeout(async () => {
            const saved = await submitResult("WIN");
            if (!saved) return;
            setPlayerMarbles(20);
            setOpponentMarbles(0);
            setPhase("victory");
          }, 700);
          return;
        }

        if (nextPlayer <= 0 || nextOpponent >= 20) {
          setTimeout(async () => {
            const saved = await submitResult("DEATH");
            if (!saved) return;
            setPlayerMarbles(0);
            setOpponentMarbles(20);
            setPhase("finished");
            setRoundResult("lose");
          }, 700);
          return;
        }

        // Keep the result visible only briefly, then start the next round.
        setTimeout(() => {
          setRoundNumber((previous) => previous + 1);
          setWager(1);
          setChoice(null);
          setOpponentWager(null);
          setRoundTotal(null);
          setRoundResult(null);
          setRevealStep("idle");
          setRoundTimeLeft(ROUND_TIME);
          roundTimeoutHandledRef.current = false;
          setMessage("NEW ROUND — CHOOSE YOUR WAGER AND ODD / EVEN.");
          setPhase("game");
        }, 650);
      }, 450);
    }, 350);
  };

  const retryGame = () => {
    clearInterval(timerRef.current);
    resultSubmittedRef.current = false;
    startGame();
  };

  const goLobby = () => {
    navigate("/survival-challenge/lobby");
  };

  const continueToLevel4 = () => {
    navigate("/survival-challenge/level-4");
  };

  if (phase === "arrival") {
    return (
      <Station3Arrival
        onContinue={() => setPhase("stranger")}
      />
    );
  }

  if (phase === "stranger") {
    return (
      <div className="level3-page level3-stranger-page">
        <div className="level3-stranger-scene">
          <Station />

          <div className="level3-station3-static-train">
            <Train doorOpen={true} departing={false} />
          </div>

          {/* Player remains visible at the same position. */}
          <div className="level3-final-player">
            <Player walking={false} />
          </div>

          {/* Stranger enters from completely outside the screen. */}
          <div className="level3-stranger-walker">
            <Player
              walking={true}
              className="level3-stranger-colored"
            />
          </div>

          {strangerArrived && (
            <>
              <div className="level3-fuel-question" aria-live="polite">
                <div className="fuel-question-bubble">
                  <span>NEED FUEL?</span>
                </div>
              </div>

              <button
                className="fuel-yes-button"
                onClick={() => setPhase("details")}
              >
                YES
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (phase === "details") {
    return (
      <div className="level3-page marble-details-page">
        <div className="marble-details-backdrop">
          <Station />
          <div className="marble-details-overlay" />
        </div>

        <div className="marble-details-content">
          <div className="details-kicker">STATION 03 · SURVIVAL ROUND</div>
          <div className="details-number">03</div>
          <h1>MARBLES</h1>
          <p className="details-subtitle">
            Ten marbles are yours. Ten belong to the stranger.
            Win the rounds, take his marbles, and claim all twenty.
          </p>

          <div className="details-marble-showcase">
            {/* LEFT = STRANGER / BLUE */}
            <div className="details-stranger-side">
              <div className="details-owner-label">STRANGER'S MARBLES</div>
              <div className="details-marble-count">10</div>
              <div className="details-marble-word">BLUE · STRANGER</div>
              <div className="details-marble-pile">
                <MarbleSet count={10} type="opponent" />
              </div>
            </div>

            <div className="details-versus">VS</div>

            {/* RIGHT = PLAYER / BLACK */}
            <div className="details-player-side">
              <div className="details-owner-label">YOUR MARBLES</div>
              <div className="details-marble-count">10</div>
              <div className="details-marble-word">BLACK · PLAYER</div>
              <div className="details-marble-pile">
                <MarbleSet count={10} type="player" />
              </div>
            </div>
          </div>

          <div className="details-rules">
            <div className="details-rule-item">
              <span>01</span>
              <div>
                <strong>CHOOSE YOUR WAGER</strong>
                <p>Risk 1 to 5 of your marbles.</p>
              </div>
            </div>
            <div className="details-rule-item">
              <span>02</span>
              <div>
                <strong>CHOOSE ODD OR EVEN</strong>
                <p>Predict whether both wagers together make an odd or even total.</p>
              </div>
            </div>
            <div className="details-rule-item">
              <span>03</span>
              <div>
                <strong>WIN THE ROUND</strong>
                <p>If your prediction is correct, you take the stranger's wager.</p>
              </div>
            </div>
          </div>

          <div className="details-objective">
            <span>FINAL OBJECTIVE</span>
            <strong>FINISH WITH MORE MARBLES</strong>
            <small>20–0 IS A PERFECT WIN</small>
          </div>

          <button className="start-marble-button" onClick={startGame}>
            BEGIN MARBLE TRIAL <span>→</span>
          </button>
        </div>
      </div>
    );
  }

  if (phase === "game" || phase === "thinking") {
    const maxWager = Math.min(MAX_WAGER, playerMarbles);

    return (
      <div className="level3-page marble-game-page">
        <div className="marble-game-background">
          <div className="room-wall" />
          <div className="room-window" />
          <div className="room-lamp" />
          <div className="room-poster poster-one">STATION<br />03</div>
          <div className="room-poster poster-two">NO<br />EXIT</div>
          <div className="room-dust dust-one" />
          <div className="room-dust dust-two" />
        </div>

        <header className="marble-header">
          <div>
            <span>STATION 03</span>
            <strong>MARBLES</strong>
          </div>

          <div className="round-indicator">
            ROUND {roundNumber}
          </div>

          <div className="round-countdown">
            <small>ROUND TIME</small>
            <strong>{String(roundTimeLeft).padStart(2, "0")}s</strong>
          </div>

          <div className={`marble-timer ${timeLeft <= 30 ? "timer-danger" : ""}`}>
            <small>TIME</small>
            <strong>{formatTime(timeLeft)}</strong>
          </div>
        </header>

        <div className="marble-scoreboard">
          {/* LEFT = STRANGER / BLUE */}
          <div className="owner-score stranger-owner">
            <div className="owner-title">STRANGER · BLUE</div>
            <strong>{opponentMarbles}</strong>
            <span>BLUE MARBLES</span>
            <MarbleSet count={opponentMarbles} type="opponent" small />
          </div>

          <div className="score-vs">VS</div>

          {/* RIGHT = PLAYER / BLACK */}
          <div className="owner-score player-owner">
            <div className="owner-title">YOU · BLACK</div>
            <strong>{playerMarbles}</strong>
            <span>BLACK MARBLES</span>
            <MarbleSet count={playerMarbles} type="player" small />
          </div>
        </div>

        <div className="cinematic-table-scene">
          <div className="stranger-silhouette">
            <div className="opponent-head" />
            <div className="opponent-torso" />
            <div className="opponent-arm left" />
            <div className="opponent-arm right" />
          </div>

          <div className="marble-table">
            <div className="table-back-edge" />
            <div className="table-surface">
              <div className={`opponent-wager-pile ${revealStep === "opponent" ? "thinking-pile" : ""}`}>
                {revealStep === "opponent" ? (
                  <span className="hidden-wager">?</span>
                ) : (
                  <MarbleSet count={opponentWager || 0} type="opponent" />
                )}
              </div>

              {roundTotal !== null && (
                <div className="total-reveal">
                  <span>TOTAL</span>
                  <strong>{roundTotal}</strong>
                  <small>{roundTotal % 2 === 0 ? "EVEN" : "ODD"}</small>
                </div>
              )}

              <div className="player-wager-pile">
                <MarbleSet count={wager} type="player" />
              </div>

              {roundResult && (
                <div className={`table-result ${roundResult}`}>
                  {roundResult === "win" ? "YOU WIN" : "YOU LOSE"}
                </div>
              )}
            </div>
            <div className="table-front-edge" />
          </div>

          <div className="player-silhouette player-black-character">
            <div className="opponent-head" />
            <div className="opponent-torso" />
            <div className="opponent-arm left" />
            <div className="opponent-arm right" />
          </div>
        </div>

        <div className="marble-controls">
          <div className={`control-message ${message.startsWith("TIME OUT") ? "timeout-message" : ""}`}>{message}</div>

          <div className="control-row">
            <div className="control-group wager-group">
              <span className="control-label">SELECT YOUR WAGER</span>
              <div className="wager-buttons">
                {Array.from({ length: maxWager }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      className={wager === value ? "wager-button selected" : "wager-button"}
                      disabled={phase !== "game" || roundTimeLeft <= 0}
                      onClick={() => {
                        setWager(value);
                        setMessage(`You are risking ${value} marble${value !== 1 ? "s" : ""}.`);
                      }}
                    >
                      <span className="button-marble">●</span>
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="control-group parity-group">
              <span className="control-label">WHAT WILL THE TOTAL BE?</span>
              <div className="parity-buttons">
                <button
                  className={choice === "odd" ? "parity-choice selected" : "parity-choice"}
                  disabled={phase !== "game" || roundTimeLeft <= 0}
                  onClick={() => {
                    setChoice("odd");
                    setMessage("You chose ODD.");
                  }}
                >
                  ODD
                </button>
                <button
                  className={choice === "even" ? "parity-choice selected" : "parity-choice"}
                  disabled={phase !== "game" || roundTimeLeft <= 0}
                  onClick={() => {
                    setChoice("even");
                    setMessage("You chose EVEN.");
                  }}
                >
                  EVEN
                </button>
              </div>
            </div>
          </div>

          <div className={`auto-round-status ${phase === "thinking" ? "resolving" : ""}`}>
            <span className="auto-round-icon">◉</span>
            {phase === "thinking"
              ? "THE STRANGER IS CHOOSING..."
              : choice
                ? "LOCKED IN — THE ROUND WILL PLAY AUTOMATICALLY AT 00"
                : "NO CHOICE BY 00 = YOU LOSE 1 MARBLE AND THE NEXT ROUND STARTS"}
          </div>
        </div>

        <div className="history-panel">
          <div className="history-title">LAST ROUNDS</div>
          {history.length === 0 ? (
            <div className="history-empty">No rounds played</div>
          ) : (
            history.slice(0, 4).map((item) => (
              <div className="history-row" key={`${item.round}-${item.total}-${item.playerWager}`}>
                <span>R{item.round}</span>
                <span>{item.playerWager} + {item.opponentWager}</span>
                <span>{item.total}</span>
                <strong className={item.result === "WIN" ? "history-win" : "history-loss"}>
                  {item.result}
                </strong>
                <span>{item.change}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="level3-page result-page">
        <div className="result-room" />
        <div className="result-card level3-loss-card">
          <div className="result-kicker">MARBLE TRIAL</div>
          <div className="result-icon failure">✕</div>
          <h1>TRY TOMORROW.</h1>
          <p>The stranger now holds every marble. The trial is over.</p>
          <div className="final-marble-score">
            <div><span>YOU</span><strong>{playerMarbles}</strong></div>
            <div className="final-divider">—</div>
            <div><span>STRANGER</span><strong>{opponentMarbles}</strong></div>
          </div>
          <div className="level3-loss-actions">
            <button className="result-button" onClick={retryGame}>TRY AGAIN <span>↻</span></button>
            <button className="secondary-result-button" onClick={goLobby}>RETURN TO LOBBY <span>→</span></button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "victory") {
    return (
      <VictoryCinematic
        onFinish={() => setPhase("completed")}
      />
    );
  }

  if (phase === "completed") {
    return (
      <div className="level3-page level3-completed-page">
        <div className="level3-completed-backdrop">
          <Station />
          <div className="level3-completed-overlay" />
        </div>

        <div className="level3-completed-card">
          <div className="result-kicker">STATION 03 CLEARED</div>
          <div className="completed-icon">✓</div>
          <h1>THE TRAIN IS MOVING.</h1>
          <p>You earned the fuel and survived the marble trial.</p>
          <button className="result-button" onClick={goLobby}>
            RETURN TO LOBBY <span>→</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default Level3;
