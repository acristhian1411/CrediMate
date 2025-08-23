import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Grid
} from "@mui/material";
import {api} from "../../api";

export default function Form({onClose, edit, client, showAlert}) {
  const [formData, setFormData] = useState({
    id: client?.id || "",
    doc: client?.doc || "",
    name: client?.name || "",
    lastname: client?.lastname || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
  });


  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.clients.create(formData)
      showAlert("Cliente creado exitosamente", "success");
    } catch (err) {
      console.error(err);
      showAlert("Error al crear Cliente", "error");
    }
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.clients.update(formData);
      showAlert("Cliente editado exitosamente", "success");
    } catch (err) {
      console.error(err);
      showAlert("Error al editar Cliente", "error");
    }
  };

  const handleSubmit = edit ? handleEdit : handleCreate;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 500, mx: "auto", mt: 4 }}
    >
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        {edit ? "Editar Cliente" : "Crear nuevo Cliente"}
      </Typography>

      {/* <Stack spacing={2}> */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>    
            <TextField
              label="Documento"
              name="doc"
              value={formData.doc}
              onChange={e => setFormData(f => ({ ...f, doc: e.target.value }))}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>        
            <TextField
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>        
            <TextField
              label="Apellido"
              name="lastname"
              value={formData.lastname}
              onChange={e => setFormData(f => ({ ...f, lastname: e.target.value }))}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>        
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>            
            <TextField
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>        
            <TextField
              label="Dirección"
              name="address"
              value={formData.address}
              onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>        
            <Button variant="contained" color="primary" type="submit" sx={{ mr: 2 }}>
              {edit ? "Editar" : "Crear"}
            </Button>
            <Button variant="contained" type="reset" color="error" onClick={onClose}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
        
      {/* </Stack> */}
    </Box>
  );
}
