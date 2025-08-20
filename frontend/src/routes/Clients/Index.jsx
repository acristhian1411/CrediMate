// generate a list of clients with material-ui tables
import React from 'react';
import { api } from '../../api';
import { useEffect, useState } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Button,
    TextField
 } from '@mui/material';

export default function ClientsIndex() {
  const [clients, setClients] = useState([]);

  const load = async () => {
    setClients(await api.clients.list());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1 align="center">Lista de Clientes</h1>
        <TextField 
            label="Buscar cliente" 
            variant="outlined" 
            style={{ marginBottom: 16, width: '100%' }} 
            // onChange={(e) => {
            // const searchTerm = e.target.value.toLowerCase();
            // setClients(clients.filter(client => client.name.toLowerCase().includes(searchTerm)));
            // }}
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
                  <Button variant="contained" color="primary" onClick={() => console.log(`Edit client ${client.id}`)}>
                    Editar
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="secondary" onClick={() => console.log(`Delete client ${client.id}`)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
