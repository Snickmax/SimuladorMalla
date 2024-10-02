import React, { useState } from 'react';
import axios from 'axios';

const SubjectForm = () => {
    const [id, setId] = useState('');
    const [creditos, setCreditos] = useState('');
    const [nombre, setNombre] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:8000/asignaturas/', {
            id,
            creditos,
            nombre,
        });
        setId('');
        setCreditos('');
        setNombre('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
            />
            <input
                type="number"
                placeholder="Créditos"
                value={creditos}
                onChange={(e) => setCreditos(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
            />
            <button type="submit">Agregar Asignatura</button>
        </form>
    );
};

export default SubjectForm;
