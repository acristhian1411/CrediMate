// generate a list of clients with material-ui tables
import React from 'react';
import { useEffect, useState, lazy, Suspense} from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Button,
    TextField,
    InputAdornment, 
    IconButton,
    Tab
 } from '@mui/material';
import AlertMessage from "@/components/Alert";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
const MidModal = lazy(() => import("@/components/Modal"));
const DeleteDialog = lazy(() => import("@/components/DeleteDialog"));
import Form from './Form';
import { api } from '../../api';


export default function ClientsIndex({setHeaderDescription}) {
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [edit, setEdit] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setClients(await api.clients.list());
  };

  // search functionality
  const searchClients = async (searchTerm) => {
    if (searchTerm) {
      const results = await api.clients.search(searchTerm);
      setClients(results);
    } else {
      load();
    }
  };

  useEffect(() => {
    load();
    setHeaderDescription("Clientes");
  }, [setHeaderDescription]);

  const handleOpenDelete = (item) => {
    setClient(item);
    setOpenDelete(true);
  };

    const closeModal = () => {
        setOpenModal(false);
        load();
    };

    const openModalForm = (client, edit) => {
        setClient(client);
        setEdit(edit);
        setOpenModal(true);
    };

    const showAlert = (message, severity) => {
        setAlert({ message, severity });
        setTimeout(() => setAlert(null), 3000);
    };

        const handleDelete = async () => {
        try {
          await api.clients.remove(client.id);
          showAlert("Cliente se eliminó con exito", "success");
          setOpenDelete(false);
          load();
        } catch (err) {
          console.log(err);
          showAlert("Ocurrió un error mientras se eliminaba el cliente", "error");
        }
    };

  return (
    <div style={{ padding: 16 }}>
      {/* <h1 align="center">Lista de Clientes</h1> */}
        <TextField 
            label="Buscar cliente" 
            variant="outlined" 
            style={{ marginBottom: 20, width: '100%', marginTop: 16 }} 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                searchClients(e.target.value);
              }
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            value={searchTerm}
            sx={{ marginBottom: "16px", width: "300px" }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => searchClients(searchTerm)}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
        />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Documento</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell colSpan={2} align='center'>
                <Button variant="contained" color="primary" onClick={() => openModalForm(null, false)}>
                  Nuevo Cliente
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.doc}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.lastname}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>
                  <Link to={`/clientes/show/${client.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="info" >
                      Ver
                    </Button>
                  </Link>
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="warning" onClick={() => openModalForm(client, true)}>
                    Editar
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="error" onClick={() => handleOpenDelete(client)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

{/* Modal con formulario de creación o edición */}
            <Suspense fallback={<div>Loading...</div>}>
                <MidModal open={openModal} onClose={closeModal}>
                    <Form 
                        onClose={closeModal} 
                        edit={edit} 
                        client={client}
                        showAlert={showAlert}
                    />
                </MidModal>
            </Suspense>
            {/* Alerta de confirmación de acciones (creación, edición, eliminación) */}
            {alert != null && (
                    <AlertMessage 
                        message={alert.message} 
                        severity={alert.severity}
                        open={alert != null}
                        handleClose={() => setAlert(null)}
                    />
                )
            }
            {/* Modal de confirmación de eliminación */}
            <Suspense fallback={<div>Loading...</div>}>
                <DeleteDialog
                    open={openDelete}
                    onClose={() => setOpenDelete(false)}
                    onConfirm={handleDelete}
                    title="Eliminar cliente"
                    message="Está seguro de eliminar este cliente?"
                />
            </Suspense>

    </div>
  );
}
