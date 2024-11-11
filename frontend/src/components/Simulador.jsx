import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Simulador.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

function Simulador({ user }) {
    const [asignaturas, setAsignaturas] = useState({});
    const [carreras, setCarreras] = useState([]);
    const [selectedCarrera, setSelectedCarrera] = useState('');
    const [estadoAsignaturas, setEstadoAsignaturas] = useState({});
    const [creditosSeleccionados, setCreditosSeleccionados] = useState(0);

    useEffect(() => {
        const fetchCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:8000/carreras/');
                setCarreras(response.data);
                const response1 = await axios.get(`http://localhost:8000/asignaturas/?carreraId=${response.data[0]['id']}`);
                setAsignaturas(response1.data);

                const response2 = await axios.get(`http://localhost:8000/obtener-estados/?email=${user.email}`);
                console.log(response2);
                setEstadoAsignaturas(response2.data.estados);
                setCreditosSeleccionados(response2.data.totalcreditos);
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

        const prerrequisitos = asignatura.prerrequisitos || [];
        const todosPrerrequisitosAprobados = prerrequisitos.every((pr) => estadoAsignaturas[pr.id] === 'aprobado');

        if (!todosPrerrequisitosAprobados) {
            alert("No puedes seleccionar esta asignatura hasta que todos los prerrequisitos estén aprobados.");
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
        const asignaturasEnCurso = Object.entries(estadoAsignaturas)
            .filter(([_, estado]) => estado === 'enCurso')
            .map(([id]) => id);

        const asignaturasAprobadas = Object.entries(estadoAsignaturas)
            .filter(([_, estado]) => estado === 'aprobado')
            .map(([id]) => id);

        const asignaturasNoCursadas = Object.entries(estadoAsignaturas)
            .filter(([_, estado]) => estado === 'noCursado')
            .map(([id]) => id);

        if (user) {
            console.log("Email:", user.email);
            console.log("Asignaturas en curso:", asignaturasEnCurso);
            console.log("Asignaturas aprobadas:", asignaturasAprobadas);
            console.log("Asignaturas no cursadas:", asignaturasNoCursadas);

            try {
                const dataToSend = {
                    email: user.email,
                    asignaturas_en_curso: asignaturasEnCurso,
                    asignaturas_aprobadas: asignaturasAprobadas,
                    asignaturas_a_eliminar: asignaturasNoCursadas
                };

                await axios.post('http://localhost:8000/guardar-asignaturas/', dataToSend);
                console.log("Asignaturas guardadas y relaciones eliminadas en Neo4j");
            } catch (error) {
                console.error("Error al guardar o eliminar asignaturas:", error.response ? error.response.data : error.message);
            }
        } else {
            console.error("No hay usuario autenticado. No se puede guardar asignaturas.");
        }
    };

    const getBackgroundStyle = (asignatura) => {
        const currentEstado = estadoAsignaturas[asignatura.id] || 'noCursado';
        if (currentEstado === 'noCursado') return { backgroundColor: 'white' };
        else if (currentEstado === 'enCurso') return { backgroundColor: 'orange' };
        else if (currentEstado === 'aprobado') return { backgroundColor: 'green' };
        return { backgroundColor: 'white' };
    };

    const renderTooltip = (props, creditos) => (
        <Tooltip id="button-tooltip" {...props}>
            Créditos: {creditos}
        </Tooltip>
    );

    return (
        <div>
            <div className='header'>
                <h1>Simulador de Avance</h1>
                <select value={selectedCarrera} onChange={handleCarreraChange}>
                    {carreras.map((carrera) => (
                        <option key={carrera.id} value={carrera.id}>{carrera.nombre}</option>
                    ))}
                </select>
            </div>
            <p>Créditos seleccionados: {creditosSeleccionados}</p>

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
                                                <OverlayTrigger
                                                    key={practica.id}
                                                    placement="top"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={(props) => renderTooltip(props, practica.creditos)}
                                                >
                                                    <div
                                                        className='ulPractica'
                                                        onClick={() => handleAsignaturaClick(practica)}
                                                        style={getBackgroundStyle(practica)}
                                                    >
                                                        <div className='ilPractica'>
                                                            {practica.nombre}
                                                        </div>
                                                    </div>
                                                </OverlayTrigger>
                                            ))}
                                        </div>
                                    )}
                                    <div className='ulAsignatura'>
                                        {asignaturasSinPracticas.map(asignatura => (
                                            <OverlayTrigger
                                                key={asignatura.id}
                                                placement="top"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={(props) => renderTooltip(props, asignatura.creditos)}
                                            >
                                                <div
                                                    className="cuadro ilAsignatura"
                                                    onClick={() => handleAsignaturaClick(asignatura)}
                                                    style={getBackgroundStyle(asignatura)}
                                                >
                                                    {asignatura.nombre}
                                                </div>
                                            </OverlayTrigger>
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
    );
};

export default Simulador;
