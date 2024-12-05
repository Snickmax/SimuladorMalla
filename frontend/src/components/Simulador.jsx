import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Simulador.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import Login from './Login';

function Simulador({ user, setUser }) {
    const [asignaturas, setAsignaturas] = useState({});
    const [carreras, setCarreras] = useState([]);
    const [selectedCarrera, setSelectedCarrera] = useState('');
    const [estadoAsignaturas, setEstadoAsignaturas] = useState({});
    const [creditosSeleccionados, setCreditosSeleccionados] = useState(0);
    const [showModal, setShowModal] = useState(false);  // Modal visible por defecto
    const [isCarreraCargada, setIsCarreraCargada] = useState(false); // Para controlar la carga inicial
    const [isLoading, setIsLoading] = useState(true); // Nuevo estado para el loading
    const [hoveredAsignatura, setHoveredAsignatura] = useState(null);
    const [hoveredTexto, setHoveredTexto] = useState('');
    const [candado, setcandado] = useState(null);
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
                    // Llamar a la API para obtener las asignaturas relacionadas a la carrera
                    setSelectedCarrera(response.data.carrera.nombre)
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
        } finally {
            setIsLoading(false); // Desactivar el loading una vez cargado
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
            setIsCarreraCargada(true); // Ahora el usuario tiene una carrera asociada
            setShowModal(false); // Cerrar el modal
            obtenerAsignaturas(selectedCarrera); // Obtener las asignaturas después de asociar la carrera
        } catch (error) {
            console.error('Error al asociar carrera:', error);
        }
    };

    useEffect(() => {
        const obtenerEstados = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/obtener-estados/?email=${user.email}`);
                setEstadoAsignaturas(response.data.estados); // Establece los estados de las asignaturas
            } catch (error) {
                console.error('Error al obtener los estados de las asignaturas:', error);
            }
        };

        obtenerEstados(); // Llama a la función para obtener los estados
    }, [user.email]); // Dependencia de `user.email`

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
            setCreditosSeleccionados(prev => prev + Number(asignatura.creditos));
        } else if (currentEstado === 'enCurso') {
            nuevoEstado = 'aprobado';
            setCreditosSeleccionados(prev => prev - Number(asignatura.creditos));
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
        if (currentEstado === 'noCursado') return { backgroundColor: '#4c4c4c' };
        else if (currentEstado === 'enCurso') return { backgroundColor: '#1464f6' };
        else if (currentEstado === 'aprobado') return { backgroundColor: '#033076' };
        return { backgroundColor: 'white' };
    };


    const getBlockStyle = (asignatura) => {
        const prerrequisitos = asignatura.prerrequisitos || [];
        const todosPrerrequisitosAprobados = prerrequisitos.every((pr) => estadoAsignaturas[pr.id] === 'aprobado');

        if (!todosPrerrequisitosAprobados) {
            return { };
        }
        return {};
    };

    const getCandado = (asignatura) => {
        const prerrequisitos = asignatura.prerrequisitos || [];
        const todosPrerrequisitosAprobados = prerrequisitos.every((pr) => estadoAsignaturas[pr.id] === 'aprobado');

        if (!todosPrerrequisitosAprobados) {
            setcandado(asignatura.id)
        }
    };

    const handleMouseEnter = (asignatura) => {
        setHoveredAsignatura(asignatura.id);
        setHoveredTexto(`Creditos: ${asignatura.creditos}`);
    };

    const handleMouseLeave = () => {
        setHoveredAsignatura(null);
        setHoveredTexto('');
    };

    return (
        <div>
            {/* Modal para seleccionar la carrera */}
            {!isCarreraCargada && (
                <Modal
                    show={showModal}
                    onHide={() => { }}
                    centered
                    backdrop="static"  // Hace que no se pueda cerrar al hacer clic fuera del modal
                    keyboard={false}  // Desactiva el cierre con la tecla Escape
                >
                    <Modal.Header>
                        <Modal.Title>Selecciona tu Carrera</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <select value={selectedCarrera} onChange={handleCarreraChange}>
                            <option value="">Selecciona una carrera</option>
                            {carreras.map((carrera) => (
                                <option key={carrera.id} value={carrera.id}>
                                    {carrera.nombre}
                                </option>
                            ))}
                        </select>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary"
                            onClick={handleCloseModal}
                            disabled={!selectedCarrera} // Deshabilitar hasta que se seleccione una carrera
                        >
                            Confirmar
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {isLoading ? (
                <div>
                    <div className='header'>
                        <div>
                            <img src="logo-ucen-azul.png.png" alt="logo ucen" className="logo-ucen" />
                        </div>

                        <div className='informacion'>
                            <h1 className='tittle'>Malla Simulada </h1>
                        </div>

                        <Login user={user} setUser={setUser} />
                    </div>

                    <div className="loading-screen">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>Cargando datos...</p>
                    </div>

                </div>

            ) : (
                <div>
                    <div className='header'>
                        <div>
                            <img src="logo-ucen-azul.png.png" alt="logo ucen" className="logo-ucen" />
                        </div>

                        <div className='informacion'>
                            <h1 className='tittle'>Malla Simulada </h1>
                            <h1>{selectedCarrera}</h1>
                            <h2>Facultad de Ingeniería y Arquitectura</h2>
                        </div>

                        <Login user={user} setUser={setUser} />
                    </div>
                    <div className="leyenda">
                        <div className='leyendas'>
                            <h3>Leyenda de procesos</h3>
                            <div className="leyenda-fila">
                                <div className="leyenda-item">
                                    <div
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            marginRight: '8px',
                                            borderRadius: '4px',
                                            backgroundColor: '#4c4c4c',
                                            border: '1px solid #000000',
                                        }}
                                    ></div>
                                    <span>No cursado</span>
                                </div>
                                <div className="leyenda-item">
                                    <div
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            marginRight: '8px',
                                            borderRadius: '4px',
                                            backgroundColor: '#1464f6',
                                            border: '1px solid #000000',
                                        }}
                                    ></div>
                                    <span>En Curso</span>
                                </div>
                                <div className="leyenda-item">
                                    <div
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            marginRight: '8px',
                                            borderRadius: '4px',
                                            backgroundColor: '#033076',
                                            border: '1px solid #000000',
                                        }}
                                    ></div>
                                    <span>Aprobado</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='info-content'>
                        <p>Créditos seleccionados: {creditosSeleccionados}</p>
                        <div className="guardar">
                            <button onClick={guardarAsignaturas}>Guardar Avance</button>
                        </div>
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

                                                        <div
                                                            className='ulPractica'
                                                            onClick={() => handleAsignaturaClick(practica)}
                                                            onMouseEnter={() => handleMouseEnter(practica)}
                                                            onMouseLeave={handleMouseLeave}
                                                            style={{
                                                                ...getBackgroundStyle(practica),
                                                                ...getBlockStyle(practica),
                                                            }}
                                                        >
                                                            <div className='ilPractica'>
                                                                {hoveredAsignatura === practica.id ? hoveredTexto : practica.nombre}
                                                            </div>
                                                        </div>

                                                    ))}
                                                </div>
                                            )}
                                            <div className='ulAsignatura'>
                                                {asignaturasSinPracticas.map(asignatura => {

                                                    const prerrequisitos = asignatura.prerrequisitos || [];
                                                    const todosPrerrequisitosAprobados = prerrequisitos.every((pr) => estadoAsignaturas[pr.id] === 'aprobado');

                                                    return (
                                                        <div
                                                            className="cuadro ilAsignatura"
                                                            onClick={() => handleAsignaturaClick(asignatura)}
                                                            onMouseEnter={() => handleMouseEnter(asignatura)}
                                                            onMouseLeave={handleMouseLeave}
                                                            style={{
                                                                ...getBackgroundStyle(asignatura),
                                                                ...getBlockStyle(asignatura)
                                                            }}
                                                        >
                                                            <div>
                                                                {hoveredAsignatura === asignatura.id ? hoveredTexto : asignatura.nombre}
                                                            </div>
                                                            <div>
                                                                {!todosPrerrequisitosAprobados && (
                                                                    <div>
                                                                        🔒
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Simulador;
