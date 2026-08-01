import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const EMPTY_PG = {
  host: "localhost",
  port: "5432",
  database: "",
  user: "",
  password: "",
  ssl: false,
};

function normalizeConfig(config) {
  if (!config || config.engine === "sqlite") {
    return { engine: "sqlite" };
  }

  return {
    engine: "postgres",
    postgres: {
      host: config.postgres?.host || "localhost",
      port: String(config.postgres?.port || "5432"),
      database: config.postgres?.database || "",
      user: config.postgres?.user || "",
      password: config.postgres?.password || "",
      ssl: !!config.postgres?.ssl,
    },
  };
}

export default function DbConnection({ setHeaderDescription }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testState, setTestState] = useState("idle");
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [alert, setAlert] = useState(null);

  const [currentConfig, setCurrentConfig] = useState({ engine: "sqlite" });
  const [engine, setEngine] = useState("sqlite");
  const [pgConfig, setPgConfig] = useState(EMPTY_PG);

  useEffect(() => {
    setHeaderDescription?.("Conexión DB");
  }, [setHeaderDescription]);

  useEffect(() => {
    let mounted = true;

    async function loadConfig() {
      try {
        const current = await window.migrationApi.getCurrentConfig();
        const normalized = normalizeConfig(current);
        if (!mounted) return;
        setCurrentConfig(normalized);

        if (normalized.engine === "postgres") {
          setEngine("postgres");
          setPgConfig(normalized.postgres);
        }
      } catch (error) {
        if (!mounted) return;
        setAlert({
          severity: "error",
          message: "No se pudo leer la configuración actual.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadConfig();

    return () => {
      mounted = false;
    };
  }, []);

  const pgFieldsFilled =
    pgConfig.host && pgConfig.database && pgConfig.user && pgConfig.password;

  const canRun = useMemo(() => {
    if (!confirmOverwrite || saving) return false;
    if (engine === "postgres" && testState !== "ok") return false;
    if (engine === "postgres" && !pgFieldsFilled) return false;
    return true;
  }, [confirmOverwrite, saving, engine, testState, pgFieldsFilled]);

  const targetConfig =
    engine === "sqlite"
      ? { engine: "sqlite" }
      : {
          engine: "postgres",
          postgres: {
            ...pgConfig,
            port: Number(pgConfig.port) || 5432,
          },
        };

  function updatePg(field, value) {
    setPgConfig((prev) => ({ ...prev, [field]: value }));
    setTestState("idle");
  }

  async function handleTestConnection() {
    setTestState("testing");
    setAlert(null);
    const result = await window.setupApi.testPostgres(pgConfig);
    if (result.ok) {
      setTestState("ok");
      setAlert({
        severity: "success",
        message: "Conexión PostgreSQL exitosa.",
      });
    } else {
      setTestState("error");
      setAlert({
        severity: "error",
        message: result.error || "No se pudo conectar.",
      });
    }
  }

  async function handleRunMigration() {
    const accepted = window.confirm(
      "Esta acción sobrescribirá todos los datos de la base de destino. ¿Deseas continuar?",
    );
    if (!accepted) return;

    setSaving(true);
    setAlert(null);

    const result = await window.migrationApi.run({
      targetConfig,
      overwriteDestination: true,
    });

    if (result.ok) {
      setAlert({
        severity: "success",
        message:
          "Migración completada. La aplicación se reiniciará automáticamente en unos segundos.",
      });
      return;
    }

    setSaving(false);
    setAlert({
      severity: "error",
      message: result.error || "No se pudo migrar la información.",
    });
  }

  if (loading) {
    return <Box sx={{ p: 3 }}>Cargando configuración...</Box>;
  }

  return (
    <Paper elevation={2} sx={{ p: 3, width: "min(860px, 96%)", mt: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Cambio de conexión</Typography>
        <Typography variant="body2" color="text.secondary">
          Configura un nuevo motor y migra todos los datos actuales. El destino
          se sobrescribe completamente.
        </Typography>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Conexión actual
          </Typography>
          <Typography variant="body1">
            {currentConfig.engine === "sqlite"
              ? "SQLite local"
              : `PostgreSQL (${currentConfig.postgres?.host}:${currentConfig.postgres?.port}/${currentConfig.postgres?.database})`}
          </Typography>
        </Box>

        <TextField
          select
          label="Motor destino"
          value={engine}
          onChange={(e) => {
            setEngine(e.target.value);
            setTestState("idle");
          }}
          sx={{ maxWidth: 300 }}
        >
          <MenuItem value="sqlite">SQLite local</MenuItem>
          <MenuItem value="postgres">PostgreSQL</MenuItem>
        </TextField>

        {engine === "postgres" && (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Host"
                value={pgConfig.host}
                onChange={(e) => updatePg("host", e.target.value)}
                fullWidth
              />
              <TextField
                label="Puerto"
                value={pgConfig.port}
                onChange={(e) => updatePg("port", e.target.value)}
                sx={{ width: { xs: "100%", sm: 180 } }}
              />
            </Stack>

            <TextField
              label="Base de datos"
              value={pgConfig.database}
              onChange={(e) => updatePg("database", e.target.value)}
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Usuario"
                value={pgConfig.user}
                onChange={(e) => updatePg("user", e.target.value)}
                fullWidth
              />
              <TextField
                label="Contraseña"
                type="password"
                value={pgConfig.password}
                onChange={(e) => updatePg("password", e.target.value)}
                fullWidth
              />
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={pgConfig.ssl}
                  onChange={(e) => updatePg("ssl", e.target.checked)}
                />
              }
              label="Usar SSL"
            />

            <Button
              variant="outlined"
              onClick={handleTestConnection}
              disabled={!pgFieldsFilled || testState === "testing"}
              sx={{ width: "fit-content" }}
            >
              {testState === "testing" ? "Probando..." : "Probar conexión"}
            </Button>
          </Stack>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={confirmOverwrite}
              onChange={(e) => setConfirmOverwrite(e.target.checked)}
            />
          }
          label="Confirmo que se sobrescribirá toda la base de destino"
        />

        {alert && <Alert severity={alert.severity}>{alert.message}</Alert>}

        <Button
          variant="contained"
          onClick={handleRunMigration}
          disabled={!canRun}
        >
          {saving ? "Migrando..." : "Migrar y cambiar conexión"}
        </Button>
      </Stack>
    </Paper>
  );
}
