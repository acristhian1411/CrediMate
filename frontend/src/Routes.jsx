import React, { lazy, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, useMediaQuery } from '@mui/material';
import Layout from '@/components/Layout';
import Dashboard from '@/routes/Home/Dashboard';
import NotFound from '@/routes/Errors/NotFound';
import Profile from '@/routes/User/Profile';
// const Countries = lazy(() => import("@/routes/Countries/Index"));
// const CountryShow = lazy(() => import("@/routes/Countries/Show"));
// const Departments = lazy(() => import("@/routes/Departments/Index"));
// const DepartmentShow = lazy(() => import("@/routes/Departments/Show"));
// const Persons = lazy(() => import("@/routes/Persons/Index"));
// const PersonShow = lazy(() => import("@/routes/Persons/Show"));
const AccessDenied = lazy(() => import("@/routes/Errors/AccessDenied"));
import ClientsIndex from "./routes/Clients/Index";

export default function AppRoutes() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useState(() => {
        const stored = localStorage.getItem('darkMode');
        return stored === null ? prefersDarkMode : stored === 'true';
    });
    const [headerDesc, setHeaderDesc] = useState('');
    const loading = false;
    if (loading) {
        return <div>Loading...</div>;
    }
    const toggleDarkMode = ()=>{
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode ? 'true' : 'false');
    }

    function setHeaderDescription(desc){
        setHeaderDesc(desc);
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} header={headerDesc} />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/profile" element={<Profile setHeaderDescription={setHeaderDescription} />} />
                    <Route path="/clientes" 
                        element={ <ClientsIndex setHeaderDescription={setHeaderDescription}/> } 
                    />
                    {/* <Route path="/clientes/show/:id" 
                        element={ <CountryShow setHeaderDescription={setHeaderDescription}/> } 
                    /> */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
}
