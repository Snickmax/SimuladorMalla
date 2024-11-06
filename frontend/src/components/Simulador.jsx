import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Simulador.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './Login';

const Simulador = () => {
    const [asignaturas, setAsignaturas] = useState({});
    const [carreras, setCarreras] = useState([]);
    const [selectedCarrera, setSelectedCarrera] = useState('');
    const [estadoAsignaturas, setEstadoAsignaturas] = useState({});
    const [user, setUser] = useState(null);
    const [creditosSeleccionados, setCreditosSeleccionados] = useState(0);

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

    useEffect(() => {
        const fetchCreditos = async () => {
            if (selectedCarrera) {
                try {
                    const response = await axios.get(`http://localhost:8000/creditos-asignaturas/?carreraId=${selectedCarrera}`);
                    const asignaturasConCreditos = response.data;
                    setAsignaturas(prev => {
                        return asignaturasConCreditos.reduce((acc, asignatura) => {
                            acc[asignatura.id] = asignatura;
                            return acc;
                        }, {});
                    });
                } catch (error) {
                    console.error("Error al obtener créditos:", error);
                }
            }
        };

        fetchCreditos();
    }, [selectedCarrera]);

    const handleCarreraChange = async (e) => {
        const carreraId = e.target.value;
        setSelectedCarrera(carreraId);

        if (carreraId) {
            try {
                const response = await axios.get(`http://localhost:8000/asignaturas/?carreraId=${carreraId}`);
                setAsignaturas(response.data);
                setEstadoAsignaturas({});
                setCreditosSeleccionados(0);
            } catch (error) {
                console.error('Error fetching asignaturas:', error);
            }
        } else {
            setAsignaturas({});
            setEstadoAsignaturas({});
            setCreditosSeleccionados(0);
        }
    };

    const handleAsignaturaClick = (asignatura) => {
        if (!user) {
            console.log('Necesitas iniciar sesión para seleccionar una asignatura');
            return;
        }

        const currentEstado = estadoAsignaturas[asignatura.id] || 'noCursado';
        let nuevoEstado;

        if (currentEstado === 'noCursado') {
            if (creditosSeleccionados + asignatura.creditos > 30) {
                alert("No puedes seleccionar más de 30 créditos.");
                return;
            }
            nuevoEstado = 'enCurso';
            setCreditosSeleccionados(prev => prev + asignatura.creditos);
        } else if (currentEstado === 'enCurso') {
            nuevoEstado = 'aprobado';
            setCreditosSeleccionados(prev => prev - asignatura.creditos);
        } else if (currentEstado === 'aprobado') {
            nuevoEstado = 'noCursado';
        }

        setEstadoAsignaturas(prevState => ({
            ...prevState,
            [asignatura.id]: nuevoEstado,
        }));

        console.log(`Asignatura: ${asignatura.nombre} - Estado: ${nuevoEstado}`);
    };

    const guardarAsignaturas = async () => {
        // Obtener las asignaturas según su estado
        const asignaturasEnCurso = Object.entries(estadoAsignaturas)
            .filter(([_, estado]) => estado === 'enCurso')
            .map(([id]) => id);
    
        const asignaturasAprobadas = Object.entries(estadoAsignaturas)
            .filter(([_, estado]) => estado === 'aprobado')
            .map(([id]) => id);
    
        const asignaturasNoCursadas = Object.entries(estadoAsignaturas)
            .filter(([_, estado]) => estado === 'noCursado')
            .map(([id]) => id);
    
        // Verificar si el usuario está autenticado y tiene un email válido
        if (user) {
            console.log("Email:", user.email);
            console.log("Asignaturas en curso:", asignaturasEnCurso);
            console.log("Asignaturas aprobadas:", asignaturasAprobadas);
            console.log("Asignaturas no cursadas:", asignaturasNoCursadas);
    
            try {
                // Crear el objeto con todos los datos
                const dataToSend = {
                    email: user.email,
                    asignaturas_en_curso: asignaturasEnCurso,
                    asignaturas_aprobadas: asignaturasAprobadas,
                    asignaturas_a_eliminar: asignaturasNoCursadas
                };
    
                // Realizar la solicitud POST al backend para guardar y eliminar asignaturas
                await axios.post('http://localhost:8000/guardar-asignaturas/', dataToSend);
                console.log("Asignaturas guardadas y relaciones eliminadas en Neo4j");
    
            } catch (error) {
                console.error("Error al guardar o eliminar asignaturas:", error.response ? error.response.data : error.message);
            }
        } else {
            console.error("No hay usuario autenticado. No se puede guardar asignaturas.");
        }
    };
    
    

    return (
        <GoogleOAuthProvider clientId="1092419716281-mregl22qvg3k1qtgmcgg2ecaem5j2ckq.apps.googleusercontent.com">
            <div>
                <div className='header'>
                    <h1>Simulador de Avance</h1>
                    <Login setUser={setUser} />
                    <select value={selectedCarrera} onChange={handleCarreraChange}>
                        {carreras.map((carrera) => (
                            <option key={carrera.id} value={carrera.id}>{carrera.nombre}</option>
                        ))}
                    </select>
                </div>

                {user && (
                    <div className="user-info">
                        <img src={user.picture} alt="User" className="user-image" />
                        <h4>{user.name}</h4>
                        <p>Créditos seleccionados: {creditosSeleccionados}</p>
                    </div>
                )}

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
                                                        onClick={() => handleAsignaturaClick(practica)}
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
                                                    onClick={() => handleAsignaturaClick(asignatura)}
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
                    <button className="guardar-boton" onClick={guardarAsignaturas}>Guardar</button>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Simulador;