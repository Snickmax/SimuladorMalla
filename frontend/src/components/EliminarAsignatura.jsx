import React, { useState } from 'react';
import axios from 'axios';

const EliminarAsignatura = () => {
    const [id, setId] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Realiza la solicitud DELETE
            await axios.delete(`http://localhost:8000/asignaturas/${id}/`);
            alert('Asignatura eliminada con éxito'); // Mensaje de éxito
            setId(''); // Limpiar el campo
        } catch (error) {
            console.error('Error al eliminar la asignatura:', error.response);
            alert('Error al eliminar la asignatura'); // Mensaje de error
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="ID de la Asignatura"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
            />
            <button type="submit">Eliminar Asignatura</button>
        </form>
    );
};

export default EliminarAsignatura;
