import React from "react";
import { Alert, Snackbar } from "@mui/material";

/**
 * A component to display a message to the user.
 * 
 * @param {{message: string, severity: 'error' | 'warning' | 'info' | 'success', open: boolean, handleClose: (event: React.SyntheticEvent<Element, Event> | Event, reason?: string) => void}} props
 * @returns {JSX.Element}
 */
export default function AlertMessage({message, severity, open, handleClose}) {
    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
}
