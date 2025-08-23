import React from "react";
import { Link } from "react-router-dom";
import {
    Grid
} from '@mui/material';
export default function Dashboard() {
    return (
        <div style={{ 
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "2rem",
            marginTop: "2rem"
         }}>
            <h1 align="center">Dashboard</h1>
            {/* <div style={{ display: "flex", justifyItems:"center", alignItems:"center", gap: "2rem", marginTop: "2rem" }}> */}
            <Grid container spacing={2} justifyContent="center">
                <Grid item>
                <Link
                    to="/creditos"
                    style={{
                        padding: "2rem 4rem",
                        fontSize: "2rem",
                        backgroundColor: "#015756ff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "1rem",
                        textDecoration: "none",
                        textAlign: "center",
                        fontWeight: "bold",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                >
                    Créditos
                </Link>
                </Grid>
                <Grid item>
                <Link
                    to="/clientes"
                    style={{
                        padding: "2rem 4rem",
                        fontSize: "2rem",
                        backgroundColor: "#43a047",
                        color: "#fff",
                        border: "none",
                        borderRadius: "1rem",
                        textDecoration: "none",
                        textAlign: "center",
                        fontWeight: "bold",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                >
                    Clientes
                </Link>
                </Grid>
                </Grid>
            {/* </div> */}
        </div>
    );
}
