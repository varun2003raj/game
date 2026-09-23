import { useEffect, useRef, useState } from "react";
import api from "../../../api/axios";
import "./Level1.css";

const PHASE = {
  INTRO: "intro",
  STATION: "station",
  MACHINE: "machine",
  COIN: "coin",
  TICKET: "ticket",
  BOARDING: "boarding",
  TICKET_REVEAL: "ticket-reveal",
};

/* =========================================================
   STATION
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
   TRAIN
========================================================= */

function Train({ doorOpen, departing }) {
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

        {/* TRAIN DOOR */}

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
   PLAYER
========================================================= */

function Player({ walking, entered }) {

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
   TICKET MACHINE
========================================================= */

function TicketMachine({ onClick }) {
  return (
    <button
      className="ticket-machine-wrap"
      onClick={onClick}
    >

      <div className="machine-arrow">
        ↓
      </div>

      <div className="ticket-machine">

        <div className="machine-header">

          <span>
            🎫 TICKET MACHINE
          </span>

          <i />

        </div>

        <div className="machine-screen">

          <small>
            RAILWAY SERVICE
          </small>

          <strong>
            ● ONLINE
          </strong>

          <span>
            TICKET AVAILABLE
          </span>

        </div>

        <div className="machine-slot">

          <span>
            INSERT / COLLECT
          </span>

          <b>
            TRAVEL TICKET
          </b>

        </div>

        <div className="machine-button">
          GET TICKET
        </div>

        <div className="machine-lights">
          <i />
          <i />
          <i />
        </div>

      </div>

      <div className="machine-caption">
        CLICK TO USE
      </div>

    </button>
  );
}

/* =========================================================
   COIN
========================================================= */

function Coin({
  spinning,
  result,
}) {
  return (
    <div
      className={`coin ${
        spinning
          ? "coin-spinning"
          : ""
      } ${
        result === "TAIL"
          ? "coin-tail"
          : ""
      }`}
    >

      <div className="coin-front">
        <span>H</span>
      </div>

      <div className="coin-back">
        <span>T</span>
      </div>

    </div>
  );
}

/* =========================================================
   TICKET
========================================================= */

function Ticket() {
  return (
    <div className="ticket-perspective">

      <div className="ticket-3d">

        <div className="ticket-face ticket-front">

          <div className="ticket-perforation top" />

          <div className="ticket-brand">

            <strong>
              OLD RAILWAY
            </strong>

            <span>
              SERVICE
            </span>

          </div>

          <div className="ticket-number">
            NO. 000731
          </div>

          <div className="ticket-title">
            TRAVEL TICKET
          </div>

          <div className="ticket-route">

            <div>
              <small>
                FROM
              </small>

              <strong>
                OLD STATION
              </strong>
            </div>

            <span>
              →
            </span>

            <div>
              <small>
                TO
              </small>

              <strong>
                HOME
              </strong>
            </div>

          </div>

          <div className="ticket-details">

            <div>
              <small>
                DATE
              </small>

              <b>
                21 SEP
              </b>
            </div>

            <div>
              <small>
                TIME
              </small>

              <b>
                23:45
              </b>
            </div>

            <div>
              <small>
                COACH
              </small>

              <b>
                A1
              </b>
            </div>

            <div>
              <small>
                SEAT
              </small>

              <b>
                17
              </b>
            </div>

          </div>

          <div className="ticket-barcode">
            || ||| | |||| || | |||| |
          </div>

          <div className="ticket-footer">
            ONE WAY • PASSENGER 01
          </div>

          <div className="ticket-perforation bottom" />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   COIN GAME
========================================================= */

function CoinGame({ onWin }) {

  const [round, setRound] =
    useState(1);

  const [wins, setWins] =
    useState(0);

  const [losses, setLosses] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(15);

  const [choice, setChoice] =
    useState(null);

  const [result, setResult] =
    useState(null);

  const [spinning, setSpinning] =
    useState(false);

  const timerRef =
    useRef(null);

  useEffect(() => {

    if (
      result ||
      spinning ||
      choice
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleChoice("HEAD");
      return;
    }

    timerRef.current =
      setTimeout(() => {

        setTimeLeft(
          value => value - 1
        );

      }, 1000);

    return () => {
      clearTimeout(
        timerRef.current
      );
    };

  }, [
    timeLeft,
    result,
    spinning,
    choice,
  ]);

  const handleChoice = (
    selected
  ) => {

    if (
      choice ||
      result ||
      spinning
    ) {
      return;
    }

    clearTimeout(
      timerRef.current
    );

    setChoice(selected);
    setSpinning(true);

    /*
      INTENTIONAL TRAP

      ROUND 1 = WIN
      ROUND 2 = LOSS
      ROUND 3 = WIN
    */

    const forcedResult =
      round === 2
        ? "TAIL"
        : "HEAD";

    const won =
      round !== 2;

    setTimeout(() => {

      setSpinning(false);

      setResult({
        coin: forcedResult,
        won,
      });

      if (won) {

        setWins(
          value => value + 1
        );

      } else {

        setLosses(
          value => value + 1
        );

      }

    }, 1800);
  };

  const nextRound = () => {

    if (wins >= 2) {

      onWin();

      return;
    }

    if (round >= 3) {

      onWin();

      return;
    }

    setRound(
      value => value + 1
    );

    setChoice(null);
    setResult(null);
    setSpinning(false);
    setTimeLeft(15);
  };

  return (
    <div className="coin-game">

      <div className="coin-top">

        <div>

          <span>
            LEVEL 01
          </span>

          <h1>
            TICKET CHALLENGE
          </h1>

        </div>

        <div className="coin-warning">
          {timeLeft} SEC
        </div>

      </div>

      <div className="coin-stats">

        <div>
          <span>
            ROUND
          </span>

          <strong>
            {round}/3
          </strong>
        </div>

        <div>
          <span>
            WINS
          </span>

          <strong>
            {wins}
          </strong>
        </div>

        <div>
          <span>
            LOSSES
          </span>

          <strong>
            {losses}
          </strong>
        </div>

        <div>
          <span>
            TOTAL ATTEMPTS
          </span>

          <strong>
            {round}
          </strong>
        </div>

        <div>
          <span>
            TIME
          </span>

          <strong>
            {timeLeft}
          </strong>
        </div>

      </div>

      <div className="coin-progress">

        <div
          className="coin-progress-fill"
          style={{
            width:
              `${(round / 3) * 100}%`,
          }}
        />

      </div>

      <div className="coin-stage">

        <div className="coin-glow" />

        <Coin
          spinning={spinning}
          result={result?.coin}
        />

        {spinning && (
          <div className="coin-status">
            FLIPPING...
          </div>
        )}

        {result &&
          !spinning && (

            <div
              className={`result-box ${
                result.won
                  ? "result-win"
                  : "result-loss"
              }`}
            >

              <span>
                ROUND RESULT
              </span>

              <strong>
                {result.won
                  ? "YOU WIN"
                  : "YOU LOSE"}
              </strong>

              <small>
                COIN:{" "}
                {result.coin}
              </small>

            </div>

          )}

      </div>

      {!result &&
        !spinning && (

          <div className="choice-area">

            <h2>
              CHOOSE HEAD OR TAIL
            </h2>

            <p>
              You have 15 seconds.
            </p>

            <div className="choice-buttons">

              <button
                onClick={() =>
                  handleChoice("HEAD")
                }
              >

                <span>
                  H
                </span>

                HEAD

              </button>

              <button
                onClick={() =>
                  handleChoice("TAIL")
                }
              >

                <span>
                  T
                </span>

                TAIL

              </button>

            </div>

          </div>

        )}

      {result && (

        <button
          className="coin-next-button"
          onClick={nextRound}
        >

          {wins >= 2
            ? "CLAIM YOUR TICKET →"
            : "NEXT ROUND →"}

        </button>

      )}

    </div>
  );
}

/* =========================================================
   BOARDING SEQUENCE
========================================================= */

function BoardingSequence({
  onComplete,
}) {

  const [stage, setStage] =
    useState("opening");

  useEffect(() => {

    // 0.0s  : train is standing, door closed
    // 1.5s  : door opens
    // 1.5s  : player starts walking to the door
    // 4.8s  : player enters the train
    // 5.8s  : door closes
    // 6.5s  : train starts moving LEFT -> RIGHT
    // 11.5s : train has left the scene

    const openTimer = setTimeout(() => {
      setStage("walking");
    }, 1500);

    const insideTimer = setTimeout(() => {
      setStage("inside");
    }, 4800);

    const closeTimer = setTimeout(() => {
      setStage("closed");
    }, 5800);

    const departTimer = setTimeout(() => {
      setStage("departing");
    }, 6500);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 11500);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(insideTimer);
      clearTimeout(closeTimer);
      clearTimeout(departTimer);
      clearTimeout(finishTimer);
    };

  }, [onComplete]);

  // Door stays open while the player walks inside.
  const doorOpen =
    stage === "opening" ||
    stage === "walking";

  // Player walks toward the train only during boarding.
  const playerWalking =
    stage === "walking";

  // Once the player reaches the door, hide the player to represent
  // the player being inside the train.
  const playerEntered =
    stage === "inside" ||
    stage === "closed" ||
    stage === "departing";

  // This class triggers the existing train LEFT -> RIGHT animation.
  const trainMoving =
    stage === "departing";

  return (
    <div className="level1-screen boarding-screen">

      <Station />

      <Train
        doorOpen={doorOpen}
        departing={trainMoving}
      />

      <Player
        walking={playerWalking}
        entered={playerEntered}
      />

      {stage === "opening" && (
        <div className="boarding-message">
          <span>TICKET ACCEPTED</span>
          <strong>OPENING TRAIN DOOR...</strong>
        </div>
      )}

      {stage === "walking" && (
        <div className="boarding-message">
          <span>BOARDING</span>
          <strong>ENTERING THE TRAIN...</strong>
        </div>
      )}

      {stage === "inside" && (
        <div className="boarding-message">
          <span>BOARDING COMPLETE</span>
          <strong>DOORS CLOSING...</strong>
        </div>
      )}

      {stage === "closed" && (
        <div className="boarding-message">
          <span>TRAIN READY</span>
          <strong>DEPARTING...</strong>
        </div>
      )}

      {stage === "departing" && (
        <div className="boarding-message">
          <span>DEPARTING</span>
          <strong>GOODBYE...</strong>
        </div>
      )}

    </div>
  );
}

/* =========================================================
   DANGEROUS TICKET BACKSIDE
========================================================= */

function DangerousTicket() {
  return (
    <div className="danger-ticket">

      <div className="danger-ticket-top">

        <span>
          ⚠
        </span>

        <strong>
          RAILWAY AUTHORITY
        </strong>

        <span>
          ⚠
        </span>

      </div>

      <div className="danger-ticket-title">
        ENTRY TICKET
      </div>

      <div className="danger-ticket-line" />

      <div className="danger-ticket-warning">

        <strong>
          THIS IS NOT A
          <br />
          TRAVEL TICKET
        </strong>

      </div>

      <div className="danger-ticket-message">

        YOU HAVE BEEN
        <br />
        ACCEPTED.

      </div>

      <div className="danger-ticket-destination">

        <span>
          DESTINATION
        </span>

        <strong>
          UNKNOWN
        </strong>

      </div>

      <div className="danger-ticket-code">
        ENTRY: 000731
      </div>

      <div className="danger-ticket-bottom">
        ⚠ KEEP THIS TICKET
      </div>

    </div>
  );
}

/* =========================================================
   LEVEL 1
========================================================= */

export default function Level1() {

  const [phase, setPhase] =
    useState(PHASE.INTRO);

  const [hasTicket, setHasTicket] =
    useState(false);

  /*
   * Prevent duplicate backend completion requests.
   */
  const [savingCompletion, setSavingCompletion] =
    useState(false);

  /* =======================================================
     SAVE LEVEL 1 COMPLETION
  ======================================================= */

  const completeLevel1 = async () => {

    if (savingCompletion) {
      return;
    }

    try {

      setSavingCompletion(true);

      console.log(
        "LEVEL 1 COMPLETE - SAVING TO BACKEND..."
      );

      const response = await api.post(
        "survival/level/complete/",
        {
          level: 1,
          result: "WIN",
        }
      );

      console.log(
        "LEVEL 1 COMPLETION SAVED:",
        response.data
      );

      /*
       * Only return to the lobby after
       * the backend confirms the completion.
       */

      window.location.assign(
        "/survival-challenge/lobby"
      );

    } catch (error) {

      console.error(
        "LEVEL 1 COMPLETION ERROR:",
        error.response?.data || error
      );

      setSavingCompletion(false);

      alert(
        error.response?.data?.detail ||
        "Unable to save Level 1 completion. Please try again."
      );
    }
  };

  /* =======================================================
     INTRO
  ======================================================= */

  if (phase === PHASE.INTRO) {

    return (
      <div className="level1-screen">

        <Station />

        <div className="intro-story">

          <span>
            LEVEL 01
          </span>

          <h1>
            THE LAST TRAIN
          </h1>

          <div className="story-line" />

          <p>
            I want to go home.
          </p>

          <p>
            But this station is empty.
          </p>

          <p>
            There is only one train.
            <br />
            I don't have a ticket.
            <br />
            There is only one ticket machine.
          </p>

          <button
            onClick={() =>
              setPhase(PHASE.STATION)
            }
          >
            ENTER THE STATION →
          </button>

        </div>

      </div>
    );
  }

  /* =======================================================
     STATION
  ======================================================= */

  if (phase === PHASE.STATION) {

    return (
      <div className="level1-screen">

        <Station />

        <Train
          doorOpen={false}
          departing={false}
        />

        <Player
          walking={false}
          entered={false}
        />

        <div className="station-story">

          <span>
            OLD RAILWAY STATION
          </span>

          <h1>
            I WANT TO GO HOME
          </h1>

          <p>
            There is only one train.
            <br />
            I have no ticket.
          </p>

        </div>

        <TicketMachine
          onClick={() =>
            setPhase(PHASE.MACHINE)
          }
        />

      </div>
    );
  }

  /* =======================================================
     MACHINE
  ======================================================= */

  if (phase === PHASE.MACHINE) {

    return (
      <div className="machine-screen-page">

        <div className="machine-large">

          <div className="machine-large-header">

            OLD RAILWAY AUTHORITY

            <span>
              ● ONLINE
            </span>

          </div>

          <div className="machine-large-display">

            <small>
              SERVICE STATUS
            </small>

            <strong>
              LAST ONE TRAIN LEFT
            </strong>

            <p>
              NEXT TRAIN WILL COME TOMORROW
            </p>

            <div className="machine-danger">
              NO OTHER OPTIONS
            </div>

          </div>

          <button
            onClick={() =>
              setPhase(PHASE.COIN)
            }
          >
            GET TICKET
          </button>

        </div>

      </div>
    );
  }

  /* =======================================================
     COIN
  ======================================================= */

  if (phase === PHASE.COIN) {

    return (
      <div className="level1-screen coin-screen">

        <CoinGame
          onWin={() =>
            setPhase(PHASE.TICKET)
          }
        />

      </div>
    );
  }

  /* =======================================================
     TICKET
  ======================================================= */

  if (phase === PHASE.TICKET) {

    return (
      <div className="ticket-screen-page">

        <div className="ticket-heading">

          <span>
            REWARD UNLOCKED
          </span>

          <h1>
            YOUR TRAVEL TICKET
          </h1>

          <p>
            Collect the ticket before boarding.
          </p>

        </div>

        <Ticket />

        {!hasTicket ? (

          <button
            className="collect-ticket-button"
            onClick={() => {

              setHasTicket(true);

            }}
          >
            🎫 COLLECT TICKET
          </button>

        ) : (

          <button
            className="board-ticket-button"
            onClick={() =>
              setPhase(PHASE.BOARDING)
            }
          >
            🚆 BOARD THE TRAIN
          </button>

        )}

        {hasTicket && (

          <div className="inventory-ticket">
            ✓ TICKET COLLECTED
          </div>

        )}

      </div>
    );
  }

  /* =======================================================
     BOARDING
  ======================================================= */

  if (phase === PHASE.BOARDING) {

    return (
      <BoardingSequence
        onComplete={() =>
          setPhase(
            PHASE.TICKET_REVEAL
          )
        }
      />
    );
  }

  /* =======================================================
     TICKET REVEAL

     THIS IS THE END OF LEVEL 1.
  ======================================================= */

  if (phase === PHASE.TICKET_REVEAL) {

    return (
      <div className="danger-ticket-screen">

        <div className="danger-background" />

        <div className="danger-vignette" />

        <div className="danger-ticket-content">

          <div className="danger-label">
            UNKNOWN DESTINATION
          </div>

          <DangerousTicket />

          <div className="danger-final-text">

            <span>
              LEVEL 01 COMPLETE
            </span>

            <h1>
              SOMETHING IS WRONG.
            </h1>

            <p>
              The train is gone.
            </p>

            <button
              className="return-lobby-button"
              onClick={completeLevel1}
              disabled={savingCompletion}
            >
              {savingCompletion
                ? "SAVING PROGRESS..."
                : "← RETURN TO SURVIVAL LOBBY"}
            </button>

          </div>

        </div>

      </div>
    );
  }

  return null;
}