import React from "react";
import {
  Modal,
  Box,
  IconButton,
  Fade,
  Backdrop
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * A modal component that is centered in the middle of the screen.
 *
 * @param {boolean} open - Whether the modal is open.
 * @param {function} onClose - Function to be called when the modal is closed.
 * @param {ReactNode} children - The content of the modal.
 *
 * @returns {ReactElement} A `Modal` component.
 */
export default function MidModal({ children, open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
            maxHeight: '90vh',
            overflowY: 'auto',
            width: 'auto',
            minWidth: 300
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          {children}
        </Box>
      </Fade>
    </Modal>
  );
}
