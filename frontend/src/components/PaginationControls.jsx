import React from "react";
import {
  Pagination,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";

/**
 * A component that displays pagination controls, allowing the user to
 * navigate through the pages and to change the number of rows per page.
 *
 * @param {Object} props The component props.
 * @param {number} props.currentPage The current page number.
 * @param {number} props.totalPages The total number of pages.
 * @param {function} props.onChange Called when the user changes the page.
 * @param {number} props.rowsPerPage The number of rows per page.
 * @param {function} props.onRowsPerPageChange Called when the user changes
 *   the number of rows per page.
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  onChange,
  rowsPerPage,
  onRowsPerPageChange,
}) {
  const handlePageChange = (event, value) => {
    onChange(value);
  };

  const handleRowsPerPageChange = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Stack spacing={2} alignItems="center" mt={2}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="rows-per-page-label">Filas por pág.</InputLabel>
            <Select
          labelId="rows-per-page-label"
          value={rowsPerPage}
          label="Filas por pág."
          onChange={handleRowsPerPageChange}
        >
          {[5, 10, 20, 40, 50, 100].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
        </Grid>
        <Grid item>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        variant="outlined"
        shape="rounded"
      />
        </Grid>
    </Grid>
    </Stack>
  );
}
