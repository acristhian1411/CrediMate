import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";

/**
 * A dialog component for confirming delete actions.
 *
 * @param {boolean} open - Determines whether the dialog is open.
 * @param {function} onClose - Function to call when the dialog is closed.
 * @param {function} onConfirm - Function to call when the delete action is confirmed.
 * @param {string} [title="Delete Confirmation"] - The title of the dialog.
 * @param {string} [message="Are you sure you want to delete this item?"] - The message displayed in the dialog.
 */
export default function DeleteDialog({ open, onClose, onConfirm, title = "Delete Confirmation", message = "Are you sure you want to delete this item?" }) {
    // console.log(open)
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
