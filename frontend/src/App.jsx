import { useEffect, useState, useMemo  } from 'react'
import { api } from './api'
import ClientsIndex from './routes/Clients/Index'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';
import AppRoutes from './Routes';

export default function App () {
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({ doc:'', name:'', lastname:'', email:'', phone:'', address:'' })
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  );
  const load = async () => {
    console.log('funcion para optener clientes: ', api)
    setClients(await api.clients.list())
  }

  useEffect(() => { 
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.clients.create(form)
    setForm({ doc:'', name:'', lastname:'', email:'', phone:'', address:'' })
    load()
  }

  return (
    // <div style={{ padding: 16 }}>
    //   <h1>CreditMate</h1>

    //   <form onSubmit={submit} style={{ display:'grid', gap:8, maxWidth:400 }}>
    //     <input placeholder="Documento" value={form.doc} onChange={e=>setForm(f=>({...f, doc:e.target.value}))}/>
    //     <input placeholder="Nombre" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} required />
    //     <input placeholder="Apellido" value={form.lastname} onChange={e=>setForm(f=>({...f, lastname:e.target.value}))} required />
    //     <input placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))}/>
    //     <input placeholder="Teléfono" value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))}/>
    //     <input placeholder="Dirección" value={form.address} onChange={e=>setForm(f=>({...f, address:e.target.value}))}/>
    //     <button>Guardar cliente</button>
    //   </form>

    //   {/* <h2 style={{ marginTop:24 }}>Clientes</h2>
    //   <ul>
    //     {clients.map(c => <li key={c.id}>{c.name} {c.lastname} — {c.doc}</li>)}
    //   </ul> */}
    //   <ClientsIndex  />
    // </div>
    <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
          <AppRoutes />
    </ThemeProvider>
    </>
  )
}
