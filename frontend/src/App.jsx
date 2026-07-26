import { useEffect, useState, useMemo } from "react";
import { api } from "./api";
import ClientsIndex from "./routes/Clients/Index";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, useMediaQuery } from "@mui/material";
import AppRoutes from "./Routes";
import SetupWizard from "./setup/SetupWizard";

export default function App() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    doc: "",
    name: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
  });
  const [needsSetup, setNeedsSetup] = useState(null);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode],
  );
  const load = async () => {
    setClients(await api.clients.list());
  };

  useEffect(() => {
    load();
    window.setupApi?.hasConfig().then((has) => setNeedsSetup(!has));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.clients.create(form);
    setForm({
      doc: "",
      name: "",
      lastname: "",
      email: "",
      phone: "",
      address: "",
    });
    load();
  };

  if (needsSetup === null) return null;

  if (needsSetup) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SetupWizard onComplete={() => setNeedsSetup(false)} />
      </ThemeProvider>
    );
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </>
  );
}
