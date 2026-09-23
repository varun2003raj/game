import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

import stationBackground from "../../assets/survival/station.jpg";

import "./SurvivalLobby.css";

/* =========================================================
   DESTINATIONS
========================================================= */

const destinations = [
  {
    id: 1,
    level: "LEVEL 01",
    name: "COIN CHALLENGE",
    route: "/survival-challenge/level-1",
  },

  {
    id: 2,
    level: "LEVEL 02",
    name: "RED LIGHT",
    route: "/survival-challenge/level-2",
  },

  {
    id: 3,
    level: "LEVEL 03",
    name: "MARBLES",
    route: "/survival-challenge/level-3",
  },

  {
    id: 4,
    level: "LEVEL 04",
    name: "MONSTER ESCAPE",
    route: "/survival-challenge/level-4",
  },

  {
    id: 5,
    level: "LEVEL 05",
    name: "GLASS BRIDGE",
    route: "/survival-challenge/level-5",
  },
];

/* =========================================================
   MAIN
========================================================= */

export default function SurvivalLobby() {
  const navigate = useNavigate();

  const [survivalData, setSurvivalData] =
    useState(null);

  const [cloudReleased, setCloudReleased] =
    useState(false);

  /* =======================================================
     LOAD SURVIVAL DATA
  ======================================================= */

  useEffect(() => {
    loadSurvivalData();
  }, []);

  const loadSurvivalData = async () => {
    try {
      const response =
        await api.get("survival/");

      setSurvivalData(
        response.data
      );
    } catch (error) {
      console.error(
        "Failed to load survival data:",
        error
      );
    }
  };

  /* =======================================================
     SURVIVAL DATA
  ======================================================= */

  const score =
    survivalData?.total_score ?? 0;

  const attempts =
    survivalData?.total_attempts ?? 0;

  const deaths =
    survivalData?.total_deaths ?? 0;

  const status =
    survivalData?.status ??
    "IN_PROGRESS";

  /* =======================================================
     INVENTORY
  ======================================================= */

  const inventory =
    survivalData?.inventory ?? {};

  const hasTicket =
    inventory.ticket === true;

  const hasMap =
    inventory.map_collected === true;

  const hasFuel =
    inventory.fuel === true;

  const hasMarbles =
    inventory.marbles === true;

  const hasKey =
    inventory.key === true;

  /* =======================================================
     MAP → CLOUD REVEAL
  ======================================================= */

  useEffect(() => {
    if (!hasMap) {
      setCloudReleased(false);
      return;
    }

    const timer =
      setTimeout(() => {
        setCloudReleased(true);
      }, 500);

    return () =>
      clearTimeout(timer);
  }, [hasMap]);

  /* =======================================================
     OPEN LEVEL
  ======================================================= */

  const openLevel = (
    destination
  ) => {
    /*
      Level 1 and 2 are available
      from the beginning.

      Level 3, 4 and 5 are revealed
      only after getting the map.
    */

    if (
      destination.id >= 3 &&
      !cloudReleased
    ) {
      return;
    }

    navigate(
      destination.route
    );
  };

  /* =======================================================
     FINAL DOOR
  ======================================================= */

  const openFinalDoor = () => {
    if (!cloudReleased) {
      return;
    }

    navigate(
      "/survival-challenge/final"
    );
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetGame = async () => {
    try {
      await api.post(
        "survival/reset/"
      );

      setCloudReleased(false);

      await loadSurvivalData();
    } catch (error) {
      console.error(
        "Reset failed:",
        error
      );
    }
  };

  return (
    <div className="survival-lobby">

      {/* =================================================
          FULL SCREEN BACKGROUND
      ================================================= */}

      <img
        src={stationBackground}
        className="station-background"
        alt=""
        draggable="false"
      />

      {/* =================================================
          CINEMATIC OVERLAY
      ================================================= */}

      <div className="cinematic-overlay" />

      <div className="vignette" />

      <div className="film-grain" />

      {/* =================================================
          WORLD
      ================================================= */}

      <div className="lobby-world">

        {/* =================================================
            PATH BETWEEN DESTINATIONS
        ================================================= */}

        <div className="journey-lines">

          <div className="journey-line line-1" />

          <div className="journey-line line-2" />

          <div className="journey-line line-3" />

          <div className="journey-line line-4" />

          <div className="journey-line line-5" />

        </div>

        {/* =================================================
            LEVEL 1
        ================================================= */}

        <Destination
          destination={
            destinations[0]
          }
          className="destination-one"
          locked={false}
          onClick={() =>
            openLevel(
              destinations[0]
            )
          }
        />

        {/* =================================================
            LEVEL 2
        ================================================= */}

        <Destination
          destination={
            destinations[1]
          }
          className="destination-two"
          locked={false}
          onClick={() =>
            openLevel(
              destinations[1]
            )
          }
        />

        {/* =================================================
            LEVEL 3
        ================================================= */}

        <Destination
          destination={
            destinations[2]
          }
          className="destination-three"
          locked={!cloudReleased}
          onClick={() =>
            openLevel(
              destinations[2]
            )
          }
        />

        {/* =================================================
            LEVEL 4
        ================================================= */}

        <Destination
          destination={
            destinations[3]
          }
          className="destination-four"
          locked={!cloudReleased}
          onClick={() =>
            openLevel(
              destinations[3]
            )
          }
        />

        {/* =================================================
            LEVEL 5
        ================================================= */}

        <Destination
          destination={
            destinations[4]
          }
          className="destination-five"
          locked={!cloudReleased}
          onClick={() =>
            openLevel(
              destinations[4]
            )
          }
        />

        {/* =================================================
            FINAL DOOR
        ================================================= */}

        <FinalDoor
          locked={!cloudReleased}
          onClick={
            openFinalDoor
          }
        />

        {/* =================================================
            CLOUD
        ================================================= */}

        <div
          className={`cloud-cover ${
            cloudReleased
              ? "cloud-cover-open"
              : ""
          }`}
        >

          <CloudPiece
            className="cloud-piece-one"
          />

          <CloudPiece
            className="cloud-piece-two"
          />

          <CloudPiece
            className="cloud-piece-three"
          />

          <CloudPiece
            className="cloud-piece-four"
          />

          <CloudPiece
            className="cloud-piece-five"
          />

          <CloudPiece
            className="cloud-piece-six"
          />

        </div>

        {/* =================================================
            PLAYER
        ================================================= */}

        <Player2D />

        {/* =================================================
            TRAIN
        ================================================= */}

        <Train2D />

        {/* =================================================
            TRACK
        ================================================= */}

        <Track />

      </div>

      {/* =================================================
          LEFT STATUS
      ================================================= */}

      <div className="status-panel">

        <div className="panel-heading">
          SURVIVAL
          <br />
          STATUS
        </div>

        <div className="status-row">
          <span>SCORE</span>

          <strong>
            {score}
          </strong>
        </div>

        <div className="status-row">
          <span>ATTEMPTS</span>

          <strong>
            {attempts}
          </strong>
        </div>

        <div className="status-row">
          <span>DEATHS</span>

          <strong>
            {deaths}
          </strong>
        </div>

        <div className="status-row">
          <span>STATUS</span>

          <strong className="status-value">
            {status}
          </strong>
        </div>

        <button
          className="reset-button"
          onClick={
            resetGame
          }
        >
          RESET
        </button>

      </div>

      {/* =================================================
          RIGHT INVENTORY
      ================================================= */}

      <div className="inventory-panel">

        <div className="panel-heading">
          INVENTORY
        </div>

        <InventoryItem
          icon="🎫"
          name="TICKET"
          active={
            hasTicket
          }
        />

        <InventoryItem
          icon="🗺️"
          name="MAP"
          active={
            hasMap
          }
        />

        <InventoryItem
          icon="⛽"
          name="FUEL"
          active={
            hasFuel
          }
        />

        <InventoryItem
          icon="⚫"
          name="MARBLES"
          active={
            hasMarbles
          }
        />

        <InventoryItem
          icon="🔑"
          name="KEY"
          active={
            hasKey
          }
        />

      </div>

      {/* =================================================
          BOTTOM MESSAGE
      ================================================= */}

      <div className="scroll-message">
        SURVIVE THE JOURNEY
      </div>

    </div>
  );
}

/* =========================================================
   DESTINATION
========================================================= */

function Destination({
  destination,
  className,
  locked,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`destination ${
        className
      } ${
        locked
          ? "destination-locked"
          : "destination-unlocked"
      }`}
      onClick={onClick}
      disabled={locked}
    >

      {/* BIG LEVEL TEXT */}

      <div className="destination-level">
        {destination.level}
      </div>

      {/* STATION */}

      <div className="small-station">

        <div className="station-roof" />

        <div className="station-wall">

          <div className="station-window station-window-left" />

          <div className="station-door">

            <span>
              {locked
                ? "LOCKED"
                : "ENTER"}
            </span>

          </div>

          <div className="station-window station-window-right" />

        </div>

      </div>

      {/* NAME */}

      <div className="destination-name">
        {destination.name}
      </div>

      {/* LOCK */}

      {locked && (
        <div className="destination-lock">
          🔒
        </div>
      )}

    </button>
  );
}

/* =========================================================
   FINAL DOOR
========================================================= */

function FinalDoor({
  locked,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`final-door ${
        locked
          ? "destination-locked"
          : "destination-unlocked"
      }`}
      onClick={onClick}
      disabled={locked}
    >

      <div className="final-title">
        FINAL DOOR
      </div>

      <div className="final-building">

        <div className="final-frame">

          <div className="final-door-inner">

            <div className="final-symbol">
              ?
            </div>

          </div>

        </div>

      </div>

      {locked && (
        <div className="final-lock">
          🔒
        </div>
      )}

    </button>
  );
}

/* =========================================================
   CLOUD PIECE
========================================================= */

function CloudPiece({
  className,
}) {
  return (
    <div
      className={`cloud-piece ${
        className
      }`}
    >
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

/* =========================================================
   PLAYER
========================================================= */

function Player2D() {
  return (
    <div className="lobby-player">

      <div className="player-head" />

      <div className="player-body" />

      <div className="player-arm player-arm-left" />

      <div className="player-arm player-arm-right" />

      <div className="player-leg player-leg-left" />

      <div className="player-leg player-leg-right" />

    </div>
  );
}

/* =========================================================
   TRAIN
========================================================= */

function Train2D() {
  return (
    <div className="lobby-train">

      {/* FRONT */}

      <div className="train-front">

        <div className="train-front-window" />

        <div className="train-headlight" />

      </div>

      {/* MAIN BODY */}

      <div className="train-body">

        <div className="train-roof" />

        <div className="train-windows">

          <span />
          <span />
          <span />
          <span />

        </div>

        <div className="train-door">

          <div />

        </div>

        <div className="train-bottom" />

      </div>

      {/* WHEELS */}

      <div className="train-wheel wheel-one" />

      <div className="train-wheel wheel-two" />

      <div className="train-wheel wheel-three" />

    </div>
  );
}

/* =========================================================
   TRACK
========================================================= */

function Track() {
  return (
    <div className="track">

      <div className="rail rail-one" />

      <div className="rail rail-two" />

      <div className="sleepers">

        {Array.from({
          length: 70,
        }).map(
          (_, index) => (
            <span
              key={index}
            />
          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   INVENTORY ITEM
========================================================= */

function InventoryItem({
  icon,
  name,
  active,
}) {
  return (
    <div
      className={`inventory-item ${
        active
          ? "inventory-active"
          : "inventory-locked"
      }`}
    >

      <div className="inventory-icon">
        {icon}
      </div>

      <div className="inventory-info">

        <strong>
          {name}
        </strong>

        <small>
          {active
            ? "ACQUIRED"
            : "LOCKED"}
        </small>

      </div>

    </div>
  );
}