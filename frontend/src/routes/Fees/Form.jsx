import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { api } from "../../api";

function FormFees({ creditId, setOpenModal, fee, edit, showTitle, creditData }) {
  const [formData, setFormData] = useState(
    [
      {
        amount: fee?.amount || '',
        expirate_at: fee?.expirate_at || '',
        credit_id: fee?.credit_id || '',
      }
    ]
  );

  useEffect(() => {
    if(!edit && creditData){
        const currentFeesLength = formData.length;
        const remainingFees = creditData.fees_qty - currentFeesLength;
        for (let i = 0; i < remainingFees; i++) {
            addFees((creditData.fee_amount * (1 + creditData.interest_rate / 100)).toFixed(2));
        }
    }
    //  fee && setFormData(fee);
  }, [creditData]);

  const handleChange = (e, index) => {
    setFormData(f => f.map((fee, i) => i === index ? { ...fee, [e.target.name]: e.target.value } : fee));
  };

  const addFees = (amount = 0) => {
    console.log('amount', amount);
    setFormData(f => [...f, { amount: amount, expirate_at: '', credit_id: creditId }]);
  };

  const removeFees = (index) => {
    setFormData(f => f.filter((fee, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (edit) {
        await api.fees.update(fee.id, formData);
        showAlert("Cuota editada exitosamente", "success");
      } else {
        await api.fees.create(formData);
        showAlert("Cuota creada exitosamente", "success");
      }
      setOpenModal(false);
    } catch (err) {
      showAlert("Error al guardar la cuota", "error");
    }
  };

  return (
    <Box component="form" onSubmit={handleSave} noValidate sx={{ mt: 4 }}>
      {
        showTitle && (
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            {
              edit ? 'Editar Cuotas' : 'Crear cuotas'
            }
          </Typography>
        )
      }
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Monto</TableCell>
            <TableCell>Fecha de vencimiento</TableCell>
            <TableCell colSpan={2}>{''}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formData.length > 0 && formData.map((fee, index) => (
          <TableRow key={index}>

          <TableCell>
            <TextField
              autoComplete="amount"
              name="amount"
              sx={{ width: '170px' }}
              required
              fullWidth
              id="amount"
              label={`Cuota ${index + 1}`}
              autoFocus
              value={fee.amount}
              onChange={(e) => handleChange(e, index)}
            />
          </TableCell>
          <TableCell>
            <TextField
              required
              fullWidth
              id="due_date"
              label="Fecha de vencimiento"
              name="due_date"
              type="date"
              defaultValue={fee.due_date}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => handleChange(e, index)}
            />
          </TableCell>
          <TableCell>
            <Tooltip title="Agregar cuota">
              <IconButton variant="outlined" color="primary" onClick={addFees} sx={{ mr: 2 }}>
                  <AddIcon />
                </IconButton>
            </Tooltip>
          </TableCell>
          <TableCell>
            {formData.length > 1 && (
              <Tooltip title="Eliminar cuota">
              <IconButton variant="outlined" color="secondary" onClick={() => removeFees(index)} sx={{ mr: 2 }}>
                <DeleteIcon />
              </IconButton>
              </Tooltip>
            )}
          </TableCell>
        </TableRow>
        ))}
        </TableBody>

      </Table>
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Guardar
      </Button>
    </Box>
  );
}

export default FormFees;
