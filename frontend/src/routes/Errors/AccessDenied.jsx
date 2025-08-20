import React from "react";
import { Box, Typography, Button } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from "react-router-dom";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="80vh"
      textAlign="center"
      p={3}
    >
      <LockOutlinedIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Acceso Denegado
      </Typography>
      <Typography variant="body1" mb={3}>
        No tenés permiso para ver esta página.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
        Volver
      </Button>
    </Box>
  );
}
