import { useEffect, useState } from "react";

export default function LevelDetailsModal({
  station,
  onClose,
  onStart,
}) {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (!station) return;

    const timer = setTimeout(() => {
      setShowCard(true);
    }, 80);

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      clearTimeout(timer);
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [station, onClose]);

  if (!station) return null;

  return (
    <>
      {/* =====================================================
          LEVEL 1 ANIMATIONS
      ===================================================== */}

      <style>
        {`
          @keyframes missionCardEnter {
            0% {
              opacity: 0;
              transform:
                translateY(100vh)
                rotate(14deg)
                scale(0.65);
            }

            55% {
              opacity: 1;
              transform:
                translateY(-24px)
                rotate(-3deg)
                scale(1.04);
            }

            75% {
              transform:
                translateY(7px)
                rotate(1deg)
                scale(0.99);
            }

            100% {
              opacity: 1;
              transform:
                translateY(0)
                rotate(0deg)
                scale(1);
            }
          }

          @keyframes coinFloat {
            0%, 100% {
              transform:
                translateY(0)
                rotateY(0deg);
            }

            50% {
              transform:
                translateY(-10px)
                rotateY(180deg);
            }
          }

          @keyframes coinGlow {
            0%, 100% {
              opacity: 0.25;
              transform: scale(0.92);
            }

            50% {
              opacity: 0.65;
              transform: scale(1.08);
            }
          }

          @keyframes particleOne {
            0% {
              opacity: 0;
              transform:
                translate(0, 10px)
                scale(0.3);
            }

            25% {
              opacity: 1;
            }

            100% {
              opacity: 0;
              transform:
                translate(-65px, -90px)
                scale(1);
            }
          }

          @keyframes particleTwo {
            0% {
              opacity: 0;
              transform:
                translate(0, 10px)
                scale(0.3);
            }

            25% {
              opacity: 1;
            }

            100% {
              opacity: 0;
              transform:
                translate(65px, -110px)
                scale(1);
            }
          }

          @keyframes particleThree {
            0% {
              opacity: 0;
              transform:
                translate(0, 10px)
                scale(0.3);
            }

            25% {
              opacity: 1;
            }

            100% {
              opacity: 0;
              transform:
                translate(20px, -130px)
                scale(0.8);
            }
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-150%) skewX(-20deg);
            }

            100% {
              transform: translateX(250%) skewX(-20deg);
            }
          }

          @keyframes warningPulse {
            0%, 100% {
              opacity: 0.3;
            }

            50% {
              opacity: 0.8;
            }
          }

          @keyframes lineGrow {
            from {
              width: 0;
              opacity: 0;
            }

            to {
              width: 70px;
              opacity: 1;
            }
          }

          .mission-card-enter {
            animation:
              missionCardEnter
              0.85s
              cubic-bezier(0.16, 1, 0.3, 1)
              forwards;
          }

          .coin-float {
            animation:
              coinFloat
              3s
              ease-in-out
              infinite;
          }

          .coin-glow {
            animation:
              coinGlow
              2.4s
              ease-in-out
              infinite;
          }

          .particle-one {
            animation:
              particleOne
              2.4s
              ease-out
              infinite;
          }

          .particle-two {
            animation:
              particleTwo
              2.7s
              ease-out
              infinite;
          }

          .particle-three {
            animation:
              particleThree
              2.2s
              ease-out
              infinite;
          }

          .card-shimmer {
            animation:
              shimmer
              3s
              ease-in-out
              infinite;
          }

          .warning-pulse {
            animation:
              warningPulse
              2s
              ease-in-out
              infinite;
          }

          .line-grow {
            animation:
              lineGrow
              0.7s
              ease-out
              0.4s
              both;
          }
        `}
      </style>

      {/* =====================================================
          BACKDROP
      ===================================================== */}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-8"
        style={{
          background:
            "radial-gradient(circle at center, rgba(35,25,5,0.20), rgba(0,0,0,0.93) 72%)",
          backdropFilter: "blur(12px)",
        }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        {/* =================================================
            GOLDEN AMBIENT GLOW
        ================================================= */}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.15), transparent 68%)",
            filter: "blur(75px)",
          }}
        />

        {/* =================================================
            FLOATING PARTICLES
        ================================================= */}

        <div className="pointer-events-none absolute left-1/2 top-1/2">
          <span
            className="particle-one absolute text-xl"
            style={{
              color: "#fbbf24",
            }}
          >
            ✦
          </span>

          <span
            className="particle-two absolute text-sm"
            style={{
              color: "#fde68a",
            }}
          >
            ✧
          </span>

          <span
            className="particle-three absolute text-lg"
            style={{
              color: "#f59e0b",
            }}
          >
            ◆
          </span>
        </div>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div
          className={`relative w-full max-w-lg ${
            showCard ? "mission-card-enter" : ""
          }`}
          style={{
            opacity: showCard ? undefined : 0,
          }}
        >
          <div
            className="relative overflow-hidden rounded-[28px] border"
            style={{
              minHeight: "610px",

              borderColor:
                "rgba(245,158,11,0.38)",

              background:
                "linear-gradient(145deg, #181209 0%, #0b0906 55%, #030303 100%)",

              boxShadow:
                "0 35px 120px rgba(245,158,11,0.18), 0 25px 70px rgba(0,0,0,0.85)",
            }}
          >
            {/* =================================================
                TOP GOLD LINE
            ================================================= */}

            <div
              className="h-[3px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #fbbf24, transparent)",
                boxShadow:
                  "0 0 25px rgba(245,158,11,0.45)",
              }}
            />

            {/* =================================================
                SHIMMER
            ================================================= */}

            <div
              className="card-shimmer pointer-events-none absolute left-0 top-0 h-full w-24"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.035), transparent)",
              }}
            />

            {/* =================================================
                CLOSE BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-xs text-white/40 transition duration-300 hover:border-orange-300/40 hover:bg-orange-300/10 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="px-7 pb-2 pt-8 text-center sm:px-10">
              <p
                className="text-[8px] font-black tracking-[0.55em]"
                style={{
                  color: "#fbbf24",
                }}
              >
                SURVIVAL ROUND
              </p>

              <div className="mt-3 flex items-center justify-center gap-3">
                <div className="h-px w-10 bg-white/10" />

                <p className="text-[8px] font-bold tracking-[0.35em] text-white/35">
                  STATION 01
                </p>

                <div className="h-px w-10 bg-white/10" />
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-[0.1em] text-white sm:text-4xl">
                THE LAST TRAIN
              </h2>

              <p
                className="mt-2 text-[9px] font-bold tracking-[0.35em]"
                style={{
                  color: "#fcd34d",
                }}
              >
                YOUR JOURNEY BEGINS HERE
              </p>
            </div>

            {/* =================================================
                COIN
            ================================================= */}

            <div className="relative flex h-40 items-center justify-center">
              {/* Glow */}

              <div
                className="coin-glow absolute h-40 w-40 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(245,158,11,0.32), transparent 68%)",
                  filter: "blur(18px)",
                }}
              />

              {/* Outer ring */}

              <div
                className="absolute h-32 w-32 rounded-full border"
                style={{
                  borderColor:
                    "rgba(251,191,36,0.14)",
                }}
              />

              {/* Inner ring */}

              <div
                className="absolute h-28 w-28 rounded-full border"
                style={{
                  borderColor:
                    "rgba(251,191,36,0.22)",
                }}
              />

              {/* Coin */}

              <div
                className="coin-float relative flex h-24 w-24 items-center justify-center rounded-full border-4"
                style={{
                  borderColor: "#fbbf24",

                  background:
                    "radial-gradient(circle at 32% 28%, #fef3c7, #fbbf24 35%, #d97706 68%, #78350f 100%)",

                  boxShadow:
                    "inset 0 0 18px rgba(255,255,255,0.35), 0 0 45px rgba(245,158,11,0.42)",
                }}
              >
                <div
                  className="flex h-[76px] w-[76px] items-center justify-center rounded-full border"
                  style={{
                    borderColor:
                      "rgba(255,255,255,0.30)",
                  }}
                >
                  <span
                    className="text-4xl font-black"
                    style={{
                      color: "#713f12",
                      textShadow:
                        "0 1px 1px rgba(255,255,255,0.4)",
                    }}
                  >
                    $
                  </span>
                </div>
              </div>

              {/* Sparks */}

              <span className="absolute left-[31%] top-8 text-xs text-yellow-300/60">
                ✦
              </span>

              <span className="absolute right-[31%] top-14 text-sm text-orange-300/60">
                ✧
              </span>

              <span className="absolute bottom-4 left-[38%] text-[9px] text-yellow-200/50">
                ◆
              </span>
            </div>

            {/* =================================================
                STORY
            ================================================= */}

            <div className="px-7 text-center sm:px-10">
              <div
                className="line-grow mx-auto h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #f59e0b, transparent)",
                }}
              />

              <p className="mt-5 text-[11px] font-black tracking-[0.18em] text-white/85">
                THE STATION IS ABANDONED.
              </p>

              <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/45">
                No passengers.
                <br />
                No station staff.
                <br />
                <span className="text-white/70">
                  Only one train remains.
                </span>
              </p>

              <p className="mt-4 text-[10px] font-bold tracking-[0.12em] text-white/60">
                You need a ticket to board.
              </p>
            </div>

            {/* =================================================
                CHALLENGE
            ================================================= */}

            <div className="px-7 py-6 sm:px-10">
              <div
                className="relative overflow-hidden rounded-2xl border p-5 text-center"
                style={{
                  borderColor:
                    "rgba(245,158,11,0.22)",

                  background:
                    "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(0,0,0,0.35))",
                }}
              >
                <p
                  className="text-[7px] font-black tracking-[0.45em]"
                  style={{
                    color: "#fbbf24",
                  }}
                >
                  EARN YOUR TICKET
                </p>

                <p className="mt-3 text-xl font-black tracking-[0.08em] text-white">
                  WIN THE COIN CHALLENGE
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[8px] font-black tracking-[0.2em] text-white/50">
                    HEAD
                  </span>

                  <span
                    className="text-xs font-black"
                    style={{
                      color: "#fbbf24",
                    }}
                  >
                    VS
                  </span>

                  <span className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[8px] font-black tracking-[0.2em] text-white/50">
                    TAIL
                  </span>
                </div>

                <p className="mt-4 text-[8px] tracking-[0.25em] text-white/30">
                  WIN 2 OUT OF 3
                </p>
              </div>
            </div>

            {/* =================================================
                REWARD
            ================================================= */}

            <div
              className="border-y px-7 py-5 text-center sm:px-10"
              style={{
                borderColor:
                  "rgba(245,158,11,0.12)",

                background:
                  "rgba(245,158,11,0.025)",
              }}
            >
              <p className="text-[7px] font-black tracking-[0.45em] text-white/30">
                YOUR REWARD
              </p>

              <div className="mt-3 flex items-center justify-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg border"
                  style={{
                    borderColor:
                      "rgba(251,191,36,0.30)",
                    background:
                      "rgba(251,191,36,0.07)",
                  }}
                >
                  <span className="text-xl">
                    🎟️
                  </span>
                </div>

                <div className="text-left">
                  <p className="text-xs font-black tracking-[0.2em] text-yellow-200">
                    TRAVEL TICKET
                  </p>

                  <p className="mt-1 text-[8px] tracking-[0.18em] text-white/30">
                    PERMISSION TO BOARD
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                SMALL MYSTERY WARNING
            ================================================= */}

            <div className="px-7 pt-5 text-center sm:px-10">
              <p
                className="warning-pulse text-[7px] font-black tracking-[0.35em]"
                style={{
                  color:
                    "rgba(251,191,36,0.45)",
                }}
              >
                ⚠ ONE TRAIN REMAINS ⚠
              </p>
            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="flex gap-3 px-7 py-6 sm:px-10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[9px] font-black tracking-[0.2em] text-white/40 transition duration-300 hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
              >
                CLOSE
              </button>

              <button
                type="button"
                onClick={onStart}
                className="relative flex-1 overflow-hidden rounded-xl px-4 py-3.5 text-[9px] font-black tracking-[0.2em] text-black transition duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #fde68a, #f59e0b)",

                  boxShadow:
                    "0 0 30px rgba(245,158,11,0.25)",
                }}
              >
                <span className="relative z-10">
                  PLAY FOR THE TICKET →
                </span>

                <span
                  className="card-shimmer pointer-events-none absolute inset-y-0 left-0 w-14"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}