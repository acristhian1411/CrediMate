import { useState, useEffect } from "react";

export default function Profile({setHeaderDescription}) {
    let user = {
        email: ""
    };
    useEffect(() => {
        setHeaderDescription("Perfil");
    }, []);
    return (
        <div>
            <h1>Profile</h1>
            <p>{user?.email}</p>
            <button onClick={() => console.log('no hace nada')}>Logout</button>
        </div>
    );
}