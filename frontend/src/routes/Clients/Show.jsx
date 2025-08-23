import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Box,
    Breadcrumbs,
    Card,
    CardContent,
    CircularProgress,
    Typography,
    Alert,
    Button,
    Link,
    Stack
  } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../../api';

export default function Show({setHeaderDescription}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      // Simula una llamada a API, reemplaza con tu fetch real
      const fetchItem = async () => {
        try {
          const response = await api.clients.getById( id);
          console.log('Response:', response);
          if (!response) throw new Error('Error al cargar el recurso');
          const data = response;
          setItem(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchItem();
    }, [id]);
  
    if (loading) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        );
      }
    
      if (error) {
        return (
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        );
      }
    
      return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, px: 2 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Inicio
            </Link>
            <Link component={RouterLink} to="/clientes" underline="hover" color="inherit">
              Clientes
            </Link>
            <Typography color="text.primary">{item.name}</Typography>
          </Breadcrumbs>
    
          {/* Volver */}
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Volver
          </Button>
    
          {/* Card de detalle */}
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h5">{item.name}</Typography>
                <Typography variant="body1" color="text.secondary">
                  {item.lastname}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      );
};

// export default Show;