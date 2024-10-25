import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Simulador.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './Login'; // Asegúrate de importar el componente Login

const Simulador = () => {
    const [asignaturas, setAsignaturas] = useState({});
    const [carreras, setCarreras] = useState([]);
    const [selectedCarrera, setSelectedCarrera] = useState('');
    const [estadoAsignaturas, setEstadoAsignaturas] = useState({});
    const [user, setUser] = useState(null); // Estado para almacenar la información del usuario

    useEffect(() => {
        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:8000/carreras/');
                setCarreras(response.data);
                const response1 = await axios.get(`http://localhost:8000/asignaturas/?carreraId=${response.data[0]['id']}`);
                setAsignaturas(response1.data);
            } catch (error) {
                console.error('Error fetching carreras:', error);
            }
        };

        fetchCarreras();
    }, []);

    const handleCarreraChange = async (e) => {
        const carreraId = e.target.value;
        setSelectedCarrera(carreraId);

        if (carreraId) {
            try {
                const response = await axios.get(`http://localhost:8000/asignaturas/?carreraId=${carreraId}`);
                setAsignaturas(response.data);
                setEstadoAsignaturas({}); // Reiniciar los estados de las asignaturas
            } catch (error) {
                console.error('Error fetching asignaturas:', error);
            }
        } else {
            setAsignaturas({});
            setEstadoAsignaturas({}); // Reiniciar los estados de las asignaturas
        }
    };

    const handleAsignaturaClick = (asignatura) => {
        if (!user) {
            console.log('Necesitas iniciar sesión para seleccionar una asignatura');
            return;
        }

        const currentEstado = estadoAsignaturas[asignatura.id] || 'noCursado';
        const nuevoEstado = currentEstado === 'noCursado' ? 'enCurso' :
                            currentEstado === 'enCurso' ? 'aprobado' : 'noCursado';

        setEstadoAsignaturas(prevState => ({
            ...prevState,
            [asignatura.id]: nuevoEstado,
        }));

        console.log(`Asignatura: ${asignatura.nombre} - Estado: ${nuevoEstado}`);
    };

    return (
        <GoogleOAuthProvider clientId="TU_CLIENT_ID_AQUI">
            <div>
                <div className='header'>
                    <h1>Simulador de Avance</h1>
                    <Login setUser={setUser} /> {/* Aquí se integra el componente de Login */}
                    <select value={selectedCarrera} onChange={handleCarreraChange}>
                        {carreras.map((carrera) => (
                            <option key={carrera.id} value={carrera.id}>{carrera.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className='simulador'>
                    <div className="simulador-container">
                        {Object.keys(asignaturas).map(semestre => {
                            const asignaturasSemestre = asignaturas[semestre];
                            const practicas = asignaturasSemestre.filter(asignatura => asignatura.nombre.includes('Práctica'));
                            const asignaturasSinPracticas = asignaturasSemestre.filter(asignatura => !asignatura.nombre.includes('Práctica'));

                            return (
                                <div key={semestre} className="semestre-columna">
                                    <h3>Semestre {semestre}</h3>
                                    <div className="contenido-semestre">
                                        {practicas.length > 0 && (
                                            <div className="practica-columna">
                                                {practicas.map(practica => (
                                                    <div className='ulPracticas'
                                                        key={practica.id}
                                                        onClick={() => handleAsignaturaClick(practica)} // Asegúrate de que el onClick está aquí
                                                    >
                                                        <div className='ilPracticas'>
                                                            {practica.nombre}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className='ulAsignaturas'>
                                            {asignaturasSinPracticas.map(asignatura => (
                                                <div
                                                    key={asignatura.id}
                                                    className="cuadro ilAsignaturas"
                                                    onClick={() => handleAsignaturaClick(asignatura)} // Asegúrate de que el onClick está aquí
                                                >
                                                    {asignatura.nombre}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Simulador;
