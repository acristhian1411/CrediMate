import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
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
      const data = new FormData();
      data.append('doc', formData.doc);
      data.append('name', formData.name);
      data.append('lastname', formData.lastname);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
       console.log('data to submit: ', Object.fromEntries(data.entries()))
      await api.clients.create(data)
      
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
      sx={{ maxWidth: 400, mx: "auto", mt: 4 }}
    >
      <Typography variant="h5" gutterBottom>
        {edit ? "Editar Cliente" : "Crear nuevo Cliente"}
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Documento"
          name="doc"
          value={formData.doc}
          onChange={e => setFormData(f => ({ ...f, doc: e.target.value }))}
          fullWidth
        />
        <TextField
          label="Nombre"
          name="name"
          value={formData.name}
          onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
          required
          fullWidth
        />
        <TextField
          label="Apellido"
          name="lastname"
          value={formData.lastname}
          onChange={e => setFormData(f => ({ ...f, lastname: e.target.value }))}
          required
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
          fullWidth
        />
        <TextField
          label="Teléfono"
          name="phone"
          value={formData.phone}
          onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
          fullWidth
        />
        <TextField
          label="Dirección"
          name="address"
          value={formData.address}
          onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
          fullWidth
        />
        <Button variant="contained" color="primary" type="submit">
          {edit ? "Editar" : "Crear"}
        </Button>
        <Button variant="contained" type="reset" color="error" onClick={onClose}>
          Cancelar
        </Button>
      </Stack>
    </Box>
  );
}
