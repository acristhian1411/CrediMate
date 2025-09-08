// generate a list of fees with material-ui tables
import React, { useEffect, useState, lazy, Suspense } from 'react';
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
  Box,
  Link
} from '@mui/material';
import AlertMessage from "@/components/Alert";
import SearchIcon from "@mui/icons-material/Search";
import {formatNumber} from '@/utils/formatNumbers';

const FeesIndex = ({creditId}) => {
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    setFees(await api.fees.listByCredit(creditId));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleClear = () => {
    setSearch('');
  };

  const filteredFees = fees;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        
        
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha de vencimiento</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>{""}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFees.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell>{fee.expirate_at}</TableCell>
                <TableCell>{formatNumber(fee.amount)}</TableCell>
                <TableCell>{fee.status ? 'Pagada' : 'Pendiente'}</TableCell>
                <TableCell>
                  <Button component={Link} to={`/fees/${fee.id}/edit`} variant="contained" size="small">Pagar</Button>
                </TableCell>
              </TableRow>
            ))}
            {fees.length > 0 && (
              <TableRow>
                <TableCell>
                  Total
                </TableCell>
                <TableCell colSpan={3} align="left">
                  {formatNumber(fees.reduce((total, fee) => total + fee.amount, 0))}
                </TableCell>
              </TableRow>
            )}
            {fees.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay cuotas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FeesIndex;
