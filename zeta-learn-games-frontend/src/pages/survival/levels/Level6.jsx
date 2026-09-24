import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Level6.css";

const ITEMS = [
  {
    id: "ticket",
    name: "TICKET",
    symbol: "🎫",
  },
  {
    id: "map",
    name: "MAP",
    symbol: "🗺️",
  },
  {
    id: "fuel",
    name: "FUEL",
    symbol: "⛽",
  },
  {
    id: "marbles",
    name: "MARBLES",
    symbol: "🔮",
  },
  {
    id: "key",
    name: "KEY",
    symbol: "🔑",
  },
];

export default function Level6() {
  const navigate = useNavigate();

  const [stage, setStage] = useState("arrival");
  const [placedItems, setPlacedItems] = useState([]);

  /*
   * ARRIVAL
   * ↓
   * INTRO
   * ↓
   * ITEM PLACEMENT
   * ↓
   * DOOR OPENING
   * ↓
   * PLAYER ENTERING
   * ↓
   * DOOR CLOSING
   * ↓
   * ESCAPED
   */

  useEffect(() => {
    if (stage !== "arrival") return;

    const timer = setTimeout(() => {
      setStage("intro");
    }, 2200);

    return () => clearTimeout(timer);
  }, [stage]);

  const placeItem = (item) => {
    if (stage !== "items") return;

    if (placedItems.includes(item.id)) return;

    setPlacedItems((previous) => [
      ...previous,
      item.id,
    ]);
  };

  const allItemsPlaced =
    placedItems.length === ITEMS.length;

  const openDoor = () => {
    if (!allItemsPlaced) return;

    setStage("opening");
  };

  useEffect(() => {
    if (stage !== "opening") return;

    const timer = setTimeout(() => {
      setStage("entering");
    }, 2600);

    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "entering") return;

    const timer = setTimeout(() => {
      setStage("closing");
    }, 3200);

    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "closing") return;

    const timer = setTimeout(() => {
      setStage("escaped");
    }, 2200);

    return () => clearTimeout(timer);
  }, [stage]);

  /*
   * INTRO SCREEN
   */
  if (stage === "intro") {
    return (
      <div className="level6-page">

        <div className="level6-background" />
        <div className="level6-vignette" />
        <div className="level6-grain" />

        <div className="level6-intro">

          <div className="level6-small-title">
            SURVIVAL CHALLENGE
          </div>

          <h1>THE FINAL DOOR</h1>

          <div className="level6-divider" />

          <p>
            Five things were collected
            <br />
            during your survival.
          </p>

          <p className="level6-warning-text">
            THEY ARE THE ONLY WAY OUT.
          </p>

          <button
            className="level6-primary-button"
            onClick={() => setStage("items")}
          >
            APPROACH THE DOOR
          </button>

        </div>

      </div>
    );
  }

  /*
   * ESCAPED SCREEN
   */
  if (stage === "escaped") {
    return (
      <div className="level6-page level6-escape-screen">

        <div className="level6-escape-glow" />
        <div className="level6-vignette" />
        <div className="level6-grain" />

        <div className="level6-escape-content">

          <div className="level6-escape-line" />

          <div className="level6-small-title">
            SURVIVAL COMPLETE
          </div>

          <h1>YOU HAVE ESCAPED</h1>

          <p>
            You survived every level.
          </p>

          <p>
            The final door is behind you.
          </p>

          <div className="level6-escape-line" />

          <button
            className="level6-primary-button"
            onClick={() =>
              navigate("/survival-challenge/lobby")
            }
          >
            RETURN TO LOBBY
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="level6-page">

      {/* BACKGROUND */}
      <div className="level6-background" />
      <div className="level6-vignette" />
      <div className="level6-grain" />

      {/* TOP HEADER */}
      <div className="level6-header">

        <div className="level6-header-left">
          FINAL DOOR
        </div>

        <div className="level6-header-right">
          LEVEL 06
        </div>

      </div>

      {/* MAIN SCENE */}
      <div className="level6-scene">

        {/* FLOOR */}
        <div className="level6-floor" />

        {/* PLAYER */}
        <div
          className={`
            level6-player

            ${
              stage === "entering"
                ? "level6-player-entering"
                : ""
            }

            ${
              stage === "closing"
                ? "level6-player-inside"
                : ""
            }
          `}
        >

          <div className="player-head" />

          <div className="player-body" />

          <div className="player-arm player-arm-left" />

          <div className="player-arm player-arm-right" />

          <div className="player-leg player-leg-left" />

          <div className="player-leg player-leg-right" />

        </div>

        {/* FINAL DOOR */}
        <div
          className={`
            level6-door-container

            ${
              stage === "opening" ||
              stage === "entering"
                ? "door-open"
                : ""
            }

            ${
              stage === "closing"
                ? "door-closing"
                : ""
            }
          `}
        >

          <div className="level6-door-frame">

            <div className="level6-door-sign">
              FINAL EXIT
            </div>

            <div className="level6-door">

              <div className="door-panel door-panel-left">
                <div className="door-symbol">
                  ◈
                </div>
              </div>

              <div className="door-panel door-panel-right">
                <div className="door-symbol">
                  ◈
                </div>
              </div>

              <div className="door-inside-glow" />

            </div>

          </div>

        </div>

      </div>

      {/* ARRIVAL MESSAGE */}
      {stage === "arrival" && (
        <div className="level6-bottom-message">
          <span>YOU HAVE REACHED</span>
          <strong>THE FINAL DOOR</strong>
        </div>
      )}

      {/* ITEM AREA */}
      {stage === "items" && (
        <div className="level6-item-panel">

          <div className="level6-panel-heading">
            FINAL DOOR
          </div>

          <div className="level6-panel-description">
            PLACE ALL FIVE ITEMS
          </div>

          <div className="level6-items">

            {ITEMS.map((item) => {

              const placed =
                placedItems.includes(item.id);

              return (
                <button
                  key={item.id}
                  className={`
                    level6-item

                    ${
                      placed
                        ? "level6-item-placed"
                        : ""
                    }
                  `}
                  disabled={placed}
                  onClick={() => placeItem(item)}
                >

                  <div className="level6-item-symbol">
                    {placed ? "✓" : item.symbol}
                  </div>

                  <div className="level6-item-name">
                    {item.name}
                  </div>

                  <div className="level6-item-status">
                    {placed
                      ? "ACCEPTED"
                      : "PLACE"}
                  </div>

                </button>

              );

            })}

          </div>

          {/* PROGRESS */}
          <div className="level6-progress">

            <div className="level6-progress-text">
              {placedItems.length} / 5
            </div>

            <div className="level6-progress-track">

              <div
                className="level6-progress-fill"
                style={{
                  width: `${
                    (placedItems.length / 5) *
                    100
                  }%`,
                }}
              />

            </div>

          </div>

          {/* OPEN BUTTON */}
          {allItemsPlaced && (
            <button
              className="level6-open-door-button"
              onClick={openDoor}
            >
              OPEN THE FINAL DOOR
            </button>
          )}

        </div>
      )}

      {/* OPENING */}
      {stage === "opening" && (
        <div className="level6-cinematic-message">

          <span>
            ALL ITEMS ACCEPTED
          </span>

          <strong>
            FINAL DOOR OPENING
          </strong>

        </div>
      )}

      {/* ENTERING */}
      {stage === "entering" && (
        <div className="level6-cinematic-message">

          <span>
            THE WAY IS OPEN
          </span>

          <strong>
            ESCAPE
          </strong>

        </div>
      )}

      {/* CLOSING */}
      {stage === "closing" && (
        <div className="level6-cinematic-message">

          <span>
            EXIT COMPLETE
          </span>

          <strong>
            DOOR CLOSING
          </strong>

        </div>
      )}

    </div>
  );
}