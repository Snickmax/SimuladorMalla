import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Simulador.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Tooltip, OverlayTrigger, Modal, Button } from 'react-bootstrap';

function Simulador({ user }) {
    const [asignaturas, setAsignaturas] = useState({});
    const [carreras, setCarreras] = useState([]);
    const [selectedCarrera, setSelectedCarrera] = useState('');
    const [estadoAsignaturas, setEstadoAsignaturas] = useState({});
    const [creditosSeleccionados, setCreditosSeleccionados] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [isCarreraCargada, setIsCarreraCargada] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Estado para ventana emergente

    // Función para convertir números a romanos
    function enteroARomano(num) {
        const valoresRomanos = [
            { valor: 10, simbolo: 'X' },
            { valor: 9, simbolo: 'IX' },
            { valor: 5, simbolo: 'V' },
            { valor: 4, simbolo: 'IV' },
            { valor: 1, simbolo: 'I' }
        ];

        let resultado = '';

        for (let i = 0; i < valoresRomanos.length; i++) {
            while (num >= valoresRomanos[i].valor) {
                resultado += valoresRomanos[i].simbolo;
                num -= valoresRomanos[i].valor;
            }
        }

        return resultado;
    }

    // Cargar las carreras disponibles cuando el componente se monta
    useEffect(() => {
        const cargarCarreras = async () => {
            try {
                const response = await axios.get('http://localhost:8000/carreras');
                setCarreras(response.data);
            } catch (error) {
                console.error('Error al cargar las carreras:', error);
            }
        };

        cargarCarreras();
    }, []);

    // Verificar si el usuario ya tiene una carrera asignada
    useEffect(() => {
        const verificarCarrera = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/usuario-carrera?email=${user.email}`);

                if (response.data && response.data.carrera) {
                    setIsCarreraCargada(true);
                    obtenerAsignaturas(response.data.carrera.id);
                } else {
                    setIsCarreraCargada(false);
                    setShowModal(true); // Mostrar el modal si no tiene carrera asociada
                }
            } catch (error) {
                console.error('Error al verificar la carrera:', error);
            }
        };

        verificarCarrera();
    }, [user.email]);

    // Obtener las asignaturas para la carrera seleccionada
    const obtenerAsignaturas = async (carreraId) => {
        try {
            const response = await axios.get(`http://localhost:8000/asignaturas?carreraId=${carreraId}`);
            setAsignaturas(response.data);
        } catch (error) {
            console.error('Error al obtener las asignaturas:', error);
        }
    };

    const handleCarreraChange = (e) => {
        setSelectedCarrera(e.target.value);
    };

    const handleCloseModal = async () => {
        if (!selectedCarrera) return;

        try {
            await axios.post('http://localhost:8000/asociar-usuario-carrera/', {
                email: user.email,
                carrera_id: selectedCarrera,
            });
            setIsCarreraCargada(true);
            setShowModal(false);
            obtenerAsignaturas(selectedCarrera);
        } catch (error) {
            console.error('Error al asociar carrera:', error);
        }
    };

    useEffect(() => {
        const obtenerEstados = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/obtener-estados/?email=${user.email}`);
                setEstadoAsignaturas(response.data.estados);
            } catch (error) {
                console.error('Error al obtener los estados de las asignaturas:', error);
            }
        };

        obtenerEstados();
    }, [user.email]);

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
            if (creditosSeleccionados + Number(asignatura.creditos) > 31) {
                alert("No puedes seleccionar más de 31 créditos.");
                return;
            }
            nuevoEstado = 'enCurso';
            setCreditosSeleccionados((prev) => prev + Number(asignatura.creditos));
        } else if (currentEstado === 'enCurso') {
            nuevoEstado = 'aprobado';
            setCreditosSeleccionados((prev) => prev - Number(asignatura.creditos));
        } else if (currentEstado === 'aprobado') {
            nuevoEstado = 'noCursado';
        }

        setEstadoAsignaturas((prevState) => ({
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
            try {
                const dataToSend = {
                    email: user.email,
                    asignaturas_en_curso: asignaturasEnCurso,
                    asignaturas_aprobadas: asignaturasAprobadas,
                    asignaturas_a_eliminar: asignaturasNoCursadas,
                };

                await axios.post('http://localhost:8000/guardar-asignaturas/', dataToSend);
                console.log("Asignaturas guardadas y relaciones eliminadas en Neo4j");
                setShowSuccessMessage(true); // Muestra el mensaje de éxito
            } catch (error) {
                console.error("Error al guardar o eliminar asignaturas:", error.response ? error.response.data : error.message);
            }
        }
    };

    const getBackgroundStyle = (asignatura) => {
        const currentEstado = estadoAsignaturas[asignatura.id] || 'noCursado';
        if (currentEstado === 'noCursado') return { backgroundColor: '#808080' };
        else if (currentEstado === 'enCurso') return { backgroundColor: '#0000FF' };
        else if (currentEstado === 'aprobado') return { backgroundColor: '#000080' };
        return { backgroundColor: 'white' };
    };

    const renderTooltip = (props, creditos) => (
        <Tooltip id="button-tooltip" {...props}>
            Créditos: {creditos}
        </Tooltip>
    );

    return (
        <div>
            {/* Ventana emergente */}
            {showSuccessMessage && (
                <div className="success-message">
                    <p>Avance guardado con éxito</p>
                    <button onClick={() => setShowSuccessMessage(false)}>X</button>
                </div>
            )}

            <div className='header'>
                <img src="logo-ucen-azul.png.png" alt="Logo" className="logo" />
                <div className="titles-container">
                    <h1>Simulador Malla</h1>
                    <h2>Ingeniería Civil en Computación e Informática</h2>
                    <div className="subtitle">
                        <span>Facultad de Ingeniería y Arquitectura</span>
                    </div>
                </div>
            </div>

            <div className="guardar">
                <button onClick={guardarAsignaturas}>Guardar Avance</button>
            </div>

            <div className="leyenda-container">
                <div className="leyendas">
                    <div className="leyenda-fila">
                        <div className="leyenda-item">
                            <div
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    marginRight: '8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#0000FF',
                                    border: '1px solid #000000',
                                }}
                            ></div>
                            <span>En curso</span>
                        </div>
                        <div className="leyenda-item">
                            <div
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    marginRight: '8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#808080',
                                    border: '1px solid #000000',
                                }}
                            ></div>
                            <span>No Cursado</span>
                        </div>
                        <div className="leyenda-item">
                            <div
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    marginRight: '8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#000080',
                                    border: '1px solid #000000',
                                }}
                            ></div>
                            <span>Cursado</span>
                        </div>
                    </div>
                </div>

                <div className="creditos-seleccionados">
                    <h3>Créditos Seleccionados</h3>
                    <p>{creditosSeleccionados}</p>
                </div>
            </div>

            <div className='simulador'>
                <div className="simulador-container">
                    {Object.keys(asignaturas).map((semestre) => {
                        const asignaturasSemestre = asignaturas[semestre];
                        const practicas = asignaturasSemestre.filter((asignatura) => asignatura.nombre.includes('Práctica'));
                        const asignaturasSinPracticas = asignaturasSemestre.filter((asignatura) => !asignatura.nombre.includes('Práctica'));

                        return (
                            <div key={semestre} className="semestre-columna">
                                <h3>Semestre {enteroARomano(parseInt(semestre))}</h3>
                                <div className="contenido-semestre">
                                    {practicas.length > 0 && (
                                        <div className="practica-columna">
                                            {practicas.map((practica) => (
                                                <OverlayTrigger
                                                    key={practica.id}
                                                    placement="top"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={(props) => renderTooltip(props, practica.creditos)}
                                                >
                                                    <div
                                                        className="ulPractica"
                                                        onClick={() => handleAsignaturaClick(practica)}
                                                        style={getBackgroundStyle(practica)}
                                                    >
                                                        <div className="ilPractica">{practica.nombre}</div>
                                                    </div>
                                                </OverlayTrigger>
                                            ))}
                                        </div>
                                    )}
                                    <div className="ulAsignatura">
                                        {asignaturasSinPracticas.map((asignatura) => (
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
            </div>
        </div>
    );
}

export default Simulador;
