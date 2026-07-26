import { useState } from "react";
import "./setup-wizard.css";

const EMPTY_PG = {
  host: "localhost",
  port: "5432",
  database: "",
  user: "",
  password: "",
  ssl: false,
};

export default function SetupWizard({ onComplete }) {
  const [engine, setEngine] = useState("sqlite");
  const [pgConfig, setPgConfig] = useState(EMPTY_PG);
  const [testState, setTestState] = useState("idle");
  const [testError, setTestError] = useState("");
  const [saving, setSaving] = useState(false);

  function updatePg(field, value) {
    setPgConfig((prev) => ({ ...prev, [field]: value }));
    setTestState("idle");
  }

  async function handleTestConnection() {
    setTestState("testing");
    setTestError("");
    const result = await window.setupApi.testPostgres(pgConfig);
    if (result.ok) {
      setTestState("ok");
    } else {
      setTestState("error");
      setTestError(result.error || "No se pudo conectar.");
    }
  }

  async function handleContinue() {
    setSaving(true);
    const config =
      engine === "sqlite"
        ? { engine: "sqlite" }
        : { engine: "postgres", postgres: pgConfig };
    await window.setupApi.saveConfig(config);
    setSaving(false);
    onComplete?.(config);
  }

  const pgFieldsFilled =
    pgConfig.host && pgConfig.database && pgConfig.user && pgConfig.password;
  const canContinue =
    engine === "sqlite" || (engine === "postgres" && testState === "ok");

  return (
    <div className="setup-wizard">
      <div className="setup-card">
        <h1>Configurar base de datos</h1>
        <p className="setup-subtitle">
          Elegí dónde va a guardar CreditMate tus clientes y créditos.
        </p>

        <div className="engine-options">
          <button
            type="button"
            className={`engine-option ${engine === "sqlite" ? "selected" : ""}`}
            onClick={() => setEngine("sqlite")}
          >
            <span className="engine-title">SQLite local</span>
            <span className="engine-desc">
              Archivo local en esta computadora. No requiere configuración.
            </span>
          </button>

          <button
            type="button"
            className={`engine-option ${engine === "postgres" ? "selected" : ""}`}
            onClick={() => setEngine("postgres")}
          >
            <span className="engine-title">PostgreSQL</span>
            <span className="engine-desc">
              Servidor propio o remoto. Útil si varias personas comparten los
              datos.
            </span>
          </button>
        </div>

        {engine === "postgres" && (
          <div className="pg-form">
            <div className="field-row">
              <label>
                Host
                <input
                  type="text"
                  value={pgConfig.host}
                  onChange={(e) => updatePg("host", e.target.value)}
                  placeholder="localhost"
                />
              </label>
              <label className="field-port">
                Puerto
                <input
                  type="text"
                  value={pgConfig.port}
                  onChange={(e) => updatePg("port", e.target.value)}
                  placeholder="5432"
                />
              </label>
            </div>

            <label>
              Base de datos
              <input
                type="text"
                value={pgConfig.database}
                onChange={(e) => updatePg("database", e.target.value)}
                placeholder="creditmate"
              />
            </label>

            <div className="field-row">
              <label>
                Usuario
                <input
                  type="text"
                  value={pgConfig.user}
                  onChange={(e) => updatePg("user", e.target.value)}
                />
              </label>
              <label>
                Contraseña
                <input
                  type="password"
                  value={pgConfig.password}
                  onChange={(e) => updatePg("password", e.target.value)}
                />
              </label>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={pgConfig.ssl}
                onChange={(e) => updatePg("ssl", e.target.checked)}
              />
              Usar SSL
            </label>

            <div className="test-row">
              <button
                type="button"
                className="test-button"
                onClick={handleTestConnection}
                disabled={!pgFieldsFilled || testState === "testing"}
              >
                {testState === "testing" ? "Probando…" : "Probar conexión"}
              </button>
              {testState === "ok" && (
                <span className="test-ok">Conexión exitosa</span>
              )}
              {testState === "error" && (
                <span className="test-error">{testError}</span>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          className="continue-button"
          onClick={handleContinue}
          disabled={!canContinue || saving}
        >
          {saving ? "Guardando…" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
