// src/pages/NotFound.jsx
import { Button, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Container sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h2" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Página no encontrada
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Volver al inicio
      </Button>
    </Container>
  );
}
