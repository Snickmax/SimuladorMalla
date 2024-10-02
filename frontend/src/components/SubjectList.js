import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SubjectList = () => {
    const [subjects, setSubjects] = useState([]);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get('http://localhost:8000/asignaturas/');
            setSubjects(response.data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    return (
        <div>
            <h2>Lista de Asignaturas</h2>
            <ul>
                {subjects.length > 0 ? (
                    subjects.map((subject) => (
                        <li key={subject.id}>
                            {subject.nombre} (ID: {subject.id}) - Créditos: {subject.creditos}
                        </li>
                    ))
                ) : (
                    <li>No hay asignaturas registradas.</li>
                )}
            </ul>
        </div>
    );
};

export default SubjectList;
