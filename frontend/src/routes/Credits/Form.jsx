import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Autocomplete,
} from "@mui/material";
import { api } from "../../api";
import { formatNumber, disFormatNumber } from "../../utils/formatNumbers";
import FormFees from "../Fees/Form";

export default function FormCredit({ onClose, edit, credit, showAlert }) {
  let date = new Date();
  const [formData, setFormData] = useState({
    id: credit?.id || "",
    client_id: credit?.client_id || "",
    client_name: credit?.client_name || "",
    amount: credit?.amount || "",
    fees_qty: credit?.fees_qty || "",
    fee_amount: credit?.fee_amount || "",
    interest_rate: credit?.interest_rate || "",
    start_date: credit?.start_date || date.toISOString().split("T")[0],
    status: credit?.status || "",
    loading: false,
  });
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Datos del crédito", "Cuotas"];
  const [clients, setClients] = useState([]);

  const handleNext = (e) => {
    e?.preventDefault();
    if (activeStep === 0) {
      handleSubmit();
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFeeAmountChange = (e) => {
    // const value = parseFloat(disFormatNumber(e.target.value));
    const value = e.target.value;
    setFormData((f) => ({ ...f, fee_amount: value }));
  };

  /**
   * Asynchronously performs a search for clients based on a search term,
   * and updates the state variable 'clients' with the results.
   *
   * @param {Event} e - The event object that triggered the search.
   * @return {Promise<void>} - A Promise that resolves when the state variable
   * has been updated.
   */
  const searchClient = async (searchTerm) => {
    const results = await api.clients.search(searchTerm);
    setClients(results);
  };

  const loadClients = async () => {
    setClients(await api.clients.list());
  };

  /**
   * Updates the 'client_id' and 'client_name' fields of the 'formData' state
   * variable based on the selected client.
   *
   * @param {Event} event - The event object that triggered the change.
   * @param {Object} value - The selected client object with 'id' and 'name'
   * properties.
   * @return {void} This function does not return anything.
   */
  function handleClientChange(event, value) {
    setFormData((prev) => ({
      ...prev,
      client_id: value?.id || "",
      client_name: value?.name ? `${value?.name} ${value?.lastname}` : "",
    }));
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.credits.create(formData);
      showAlert("Crédito creado exitosamente", "success");
    } catch (err) {
      console.error(err);
      showAlert("Error al crear Crédito", "error");
    }
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.credits.update(formData);
      showAlert("Crédito editado exitosamente", "success");
    } catch (err) {
      console.error(err);
      showAlert("Error al editar Crédito", "error");
    }
  };

  const handleSubmit = edit ? handleEdit : handleCreate;

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <Box
      component="form"
      onSubmit={(e) => handleNext(e)}
      sx={{ maxWidth: 900, mx: "auto", mt: 4 }}
    >
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        {edit ? "Editar Crédito" : "Crear nuevo Crédito"}
      </Typography>
      <Box sx={{ width: "500px" }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              {/* 
            // TODO: Implementar búsqueda de clientes
            */}
              <Box sx={{ width: "235px" }}>
                <Autocomplete
                  options={clients}
                  sx={{ width: "100%" }}
                  getOptionLabel={(option) =>
                    option.name + " " + option.lastname
                  }
                  onChange={handleClientChange}
                  // fullWidth
                  onInputChange={(event, newInputValue, reason) => {
                    if (reason === "input") {
                      searchClient(newInputValue);
                    }
                  }}
                  value={
                    clients.find((c) => c.id === formData.client_id) || null
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      name="client_id"
                      // fullWidth
                      required
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid item xs={3} sm={3}>
              <TextField
                label="Monto total"
                amount="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, amount: e.target.value }))
                }
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={3} sm={3}>
              <TextField
                label="Cantidad de cuotas"
                amount="fees_qty"
                type="number"
                value={formData.fees_qty}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    fees_qty: e.target.value,
                    fee_amount: (
                      parseFloat(formData.amount) / parseFloat(e.target.value)
                    ).toFixed(2),
                  }))
                }
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={3} sm={3}>
              <TextField
                label="Monto por cuota"
                amount="fee_amount"
                type="text"
                value={formData.fee_amount}
                onChange={handleFeeAmountChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tasa de interés"
                amount="interest_rate"
                type="number"
                value={formData.interest_rate}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, interest_rate: e.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha de inicio"
                amount="start_date"
                type="date"
                sx={{ width: "235px" }}
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, start_date: e.target.value }))
                }
                fullWidth
              />
            </Grid>
          </Grid>
        )}
        {activeStep === 1 && (
          <container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormFees
                creditId={formData.id}
                creditData={formData}
                edit={edit}
                showTitle={false}
              />
            </Grid>
          </container>
        )}
        <Grid item xs={12} sm={12} m={3}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mr: 2 }}
          >
            Siguiente
          </Button>
          <Button
            variant="contained"
            type="reset"
            color="error"
            onClick={onClose}
          >
            Cancelar
          </Button>
        </Grid>
      </Box>
    </Box>
  );
}
