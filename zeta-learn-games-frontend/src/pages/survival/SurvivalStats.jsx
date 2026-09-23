import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./survivalStats.css";

export default function SurvivalStats() {
  const navigate = useNavigate();

  const [survival, setSurvival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);

  // =========================================================
  // RESET SURVIVAL ROUND
  // =========================================================

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Start a new Survival Round?\n\nYour previous run will be saved in history."
    );

    if (!confirmed) {
      return;
    }

    try {
      setResetting(true);

      const response = await api.post(
        "survival/reset/"
      );

      console.log(
        "Survival reset:",
        response.data
      );

      // Reset frontend lobby progress
      localStorage.setItem(
        "survivalProgress",
        "0"
      );

      // Go back to Survival Lobby
      navigate(
        "/survival-challenge/lobby"
      );

    } catch (error) {
      console.error(
        "Failed to reset Survival Round:",
        error
      );

      alert(
        error?.response?.data?.detail ||
        "Failed to reset Survival Round."
      );

    } finally {
      setResetting(false);
    }
  };

  // =========================================================
  // FETCH SURVIVAL STATS
  // =========================================================

  useEffect(() => {
    const fetchSurvivalStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "survival/"
        );

        setSurvival(response.data);

      } catch (err) {
        console.error(
          "Survival stats API error:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Please login to view your survival statistics."
          );
        } else {
          setError(
            "Unable to load your survival statistics."
          );
        }

      } finally {
        setLoading(false);
      }
    };

    fetchSurvivalStats();
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="survival-stats-page">

        <div className="survival-stats-loading">
          LOADING SURVIVAL DATA...
        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="survival-stats-page">

        <div className="survival-stats-error">
          {error}
        </div>

      </div>
    );
  }

  // =========================================================
  // NO DATA
  // =========================================================

  if (!survival) {
    return null;
  }

  // =========================================================
  // DATA
  // =========================================================

  const levelProgress =
    survival.level_progress || [];

  const attempts =
    survival.attempt_history || [];

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="survival-stats-page">

      <div className="survival-stats-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="survival-stats-header">

          <span className="survival-stats-label">
            GAME 05
          </span>

          <h1>
            SCORE & ATTEMPTS
          </h1>

          <p>
            Your personal Survival Round statistics.
          </p>

          {/* RESET BUTTON */}

          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="survival-reset-button"
          >
            {resetting
              ? "RESETTING..."
              : "RESET SURVIVAL ROUND"}
          </button>

        </header>


        {/* =================================================
            MAIN SUMMARY
        ================================================= */}

        <section className="personal-summary-grid">

          {/* TOTAL SCORE */}

          <div className="personal-stat-card">

            <span>
              TOTAL SCORE
            </span>

            <strong>
              {survival.total_score}
            </strong>

          </div>


          {/* TOTAL ATTEMPTS */}

          <div className="personal-stat-card">

            <span>
              TOTAL ATTEMPTS
            </span>

            <strong>
              {survival.total_attempts}
            </strong>

          </div>


          {/* TOTAL DEATHS */}

          <div className="personal-stat-card">

            <span>
              TOTAL DEATHS
            </span>

            <strong>
              {survival.total_deaths}
            </strong>

          </div>


          {/* SURVIVAL DAY */}

          <div className="personal-stat-card">

            <span>
              SURVIVAL DAY
            </span>

            <strong>
              {survival.survival_day}
            </strong>

          </div>

        </section>


        {/* =================================================
            CURRENT LEVEL
        ================================================= */}

        <section className="current-level-card">

          <div>

            <span>
              CURRENT LEVEL
            </span>

            <h2>
              LEVEL {survival.current_level} / 5
            </h2>

          </div>


          <div className="current-level-status">

            {survival.status}

          </div>

        </section>


        {/* =================================================
            LEVEL PROGRESS
        ================================================= */}

        <section className="stats-section">

          <div className="stats-section-heading">

            <div>

              <span>
                PERSONAL PROGRESS
              </span>

              <h2>
                LEVEL PERFORMANCE
              </h2>

            </div>

          </div>


          <div className="level-performance-table-wrapper">

            <table className="level-performance-table">

              <thead>

                <tr>

                  <th>
                    LEVEL
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    ATTEMPTS
                  </th>

                  <th>
                    DEATHS
                  </th>

                  <th>
                    BEST SCORE
                  </th>

                </tr>

              </thead>


              <tbody>

                {[1, 2, 3, 4, 5].map(
                  (levelNumber) => {

                    const level =
                      levelProgress.find(
                        (item) =>
                          item.level_number ===
                          levelNumber
                      );

                    return (
                      <tr
                        key={levelNumber}
                      >

                        <td>

                          <strong>
                            LEVEL{" "}
                            {String(
                              levelNumber
                            ).padStart(2, "0")}
                          </strong>

                        </td>


                        <td>

                          <span
                            className={`level-status ${
                              level?.status?.toLowerCase() ||
                              "locked"
                            }`}
                          >
                            {level?.status ||
                              "LOCKED"}
                          </span>

                        </td>


                        <td>
                          {level?.attempts ?? 0}
                        </td>


                        <td>
                          {level?.deaths ?? 0}
                        </td>


                        <td>
                          {level?.best_score ?? 0}
                        </td>

                      </tr>
                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =================================================
            ATTEMPT HISTORY
        ================================================= */}

        <section className="stats-section">

          <div className="stats-section-heading">

            <div>

              <span>
                GAME HISTORY
              </span>

              <h2>
                ATTEMPT HISTORY
              </h2>

            </div>

            <span>
              {attempts.length} ATTEMPTS
            </span>

          </div>


          {attempts.length === 0 ? (

            <div className="no-attempts">

              No attempts recorded yet.

            </div>

          ) : (

            <div className="attempt-history-table-wrapper">

              <table className="attempt-history-table">

                <thead>

                  <tr>

                    <th>
                      LEVEL
                    </th>

                    <th>
                      ATTEMPT
                    </th>

                    <th>
                      DAY
                    </th>

                    <th>
                      RESULT
                    </th>

                    <th>
                      SCORE
                    </th>

                    <th>
                      DEATH
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {attempts.map(
                    (attempt, index) => (

                      <tr
                        key={`${attempt.level_number}-${attempt.attempt_number}-${index}`}
                      >

                        <td>
                          LEVEL{" "}
                          {attempt.level_number}
                        </td>


                        <td>
                          #{attempt.attempt_number}
                        </td>


                        <td>
                          DAY{" "}
                          {attempt.survival_day}
                        </td>


                        <td>

                          <span
                            className={`attempt-result ${attempt.result.toLowerCase()}`}
                          >
                            {attempt.result}
                          </span>

                        </td>


                        <td>
                          {attempt.score}
                        </td>


                        <td>
                          {attempt.is_death
                            ? "YES"
                            : "NO"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>

    </div>
  );
}