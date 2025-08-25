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
// import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
const MidModal = lazy(() => import("@/components/Modal"));
const DeleteDialog = lazy(() => import("@/components/DeleteDialog"));
import Form from './Form';
import { api } from '../../api';


export default function CreditsIndex({setHeaderDescription}) {
  const [credits, setCredits] = useState([]);
  const [credit, setCredit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [edit, setEdit] = useState(false);
  // const navigate = useNavigate();

  const load = async () => {
    setCredits(await api.credits.listAll());
  };

  // search functionality
  const searchCredits = async (searchTerm) => {
    if (searchTerm) {
      const results = await api.credits.search(searchTerm);
      setCredits(results);
    } else {
      load();
    }
  };

  useEffect(() => {
    load();
    setHeaderDescription("Créditos");
  }, [setHeaderDescription]);

  const handleOpenDelete = (item) => {
    setCredit(item);
    setOpenDelete(true);
  };

    const closeModal = () => {
        setOpenModal(false);
        load();
    };

    const openModalForm = (credit, edit) => {
        setCredit(credit);
        setEdit(edit);
        setOpenModal(true);
    };

    const showAlert = (message, severity) => {
        setAlert({ message, severity });
        setTimeout(() => setAlert(null), 3000);
    };

        const handleDelete = async () => {
        try {
          await api.credits.remove(credit.id);
          showAlert("Crédito se eliminó con éxito", "success");
          setOpenDelete(false);
          load();
        } catch (err) {
          console.log(err);
          showAlert("Ocurrió un error mientras se eliminaba el crédito", "error");
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
                searchCredits(e.target.value);
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
                                    onClick={() => searchCredits(searchTerm)}
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
              <TableCell>ID Crédito</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell colSpan={3} align='center'>
                <Button variant="contained" color="primary" onClick={() => openModalForm(null, false)}>
                  Nuevo Crédito
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {credits.map((credit) => (
              <TableRow key={credit.id}>
                <TableCell>{credit.id}</TableCell>
                <TableCell>{credit.clientName}</TableCell>
                <TableCell>{credit.amount}</TableCell>
                <TableCell>{credit.date}</TableCell>
                <TableCell>{credit.status}</TableCell>
                <TableCell>
                  <Link to={`/creditos/show/${credit.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="info" >
                      Ver
                    </Button>
                  </Link>
                  <Button variant="contained" color="warning" onClick={() => openModalForm(credit, true)}>
                    Editar
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="error" onClick={() => handleOpenDelete(credit)}>
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
                        credit={credit}
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
