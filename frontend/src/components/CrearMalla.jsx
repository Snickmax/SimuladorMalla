import React, { useState } from 'react';
import './CrearMalla.css';

const CrearMalla = () => {
    const [semestres, setSemestres] = useState([]);
    const [editandoAsignatura, setEditandoAsignatura] = useState(null);

    const crearNuevaAsignatura = () => ({
        id: '',
        nombre: '',
        creditos: '',
        descripcion: '',
        tienePrerrequisito: false,
        prerrequisito: '',
    });

    const agregarSemestre = () => {
        setSemestres([...semestres, { id: semestres.length + 1, asignaturas: [], nuevaAsignatura: crearNuevaAsignatura() }]);
    };

    const eliminarSemestre = (semestreId) => {
        if (semestreId === semestres.length) {
            setSemestres(semestres.filter((semestre) => semestre.id !== semestreId));
        } else {
            alert("Solo puedes eliminar el último semestre");
        }
    };

    const handleInputChange = (e, semestreId) => {
        const { name, value } = e.target;
        setSemestres(semestres.map(semestre => {
            if (semestre.id === semestreId) {
                return {
                    ...semestre,
                    nuevaAsignatura: {
                        ...semestre.nuevaAsignatura,
                        [name]: value,
                    },
                };
            }
            return semestre;
        }));
    };

    const handlePrerrequisitoToggle = (semestreId) => {
        setSemestres(semestres.map(semestre => {
            if (semestre.id === semestreId) {
                return {
                    ...semestre,
                    nuevaAsignatura: {
                        ...semestre.nuevaAsignatura,
                        tienePrerrequisito: !semestre.nuevaAsignatura.tienePrerrequisito,
                        prerrequisito: '',
                    },
                };
            }
            return semestre;
        }));
    };

    const agregarAsignatura = (semestreId) => {
        const semestre = semestres.find(s => s.id === semestreId);
        const { id, nombre, creditos, descripcion, tienePrerrequisito, prerrequisito } = semestre.nuevaAsignatura;

        // Validación de campos obligatorios
        if (!id || !nombre || !creditos || !descripcion) {
            alert('Los campos ID, Nombre, Créditos y Descripción son obligatorios.');
            return;
        }

        // Verificar que la ID no se repita en ninguna asignatura existente
        const idDuplicada = semestres.some((sem) =>
            sem.asignaturas.some((asig) => asig.id === id)
        );

        if (idDuplicada) {
            alert(`La ID "${id}" ya existe en otra asignatura. Por favor, elige una ID diferente.`);
            return;
        }
        // Si el campo de prerrequisito está activado, validar que se haya seleccionado uno
        if (tienePrerrequisito && !prerrequisito) {
            alert('Debe seleccionar un prerrequisito si está marcado "Tiene Prerrequisito".');
            return;
        }

        // Agregar asignatura al semestre correspondiente
        setSemestres(semestres.map(sem => {
            if (sem.id === semestreId) {
                const nuevaAsignatura = { ...sem.nuevaAsignatura }; // Generamos un ID único
                return {
                    ...sem,
                    asignaturas: [...sem.asignaturas, nuevaAsignatura],
                    nuevaAsignatura: crearNuevaAsignatura(),
                };
            }
            return sem;
        }));
    };

    const eliminarAsignatura = (semestreId, asignaturaId) => {
        // Encontrar la asignatura a eliminar
        const asignaturaAEliminar = semestres
            .find((sem) => sem.id === semestreId)
            .asignaturas.find((asig) => asig.id === asignaturaId);

        // Verificar si la asignatura es un prerrequisito en algún semestre
        const esPrerrequisito = semestres.some((sem) =>
            sem.asignaturas.some((asig) => asig.prerrequisito === asignaturaAEliminar.id)
        );

        if (esPrerrequisito) {
            alert(`No se puede eliminar la asignatura "${asignaturaAEliminar.nombre}" porque es un prerrequisito de otra asignatura.`);
            return;
        }

        // Proceder a eliminar la asignatura si no es prerrequisito
        setSemestres(semestres.map((sem) => {
            if (sem.id === semestreId) {
                return {
                    ...sem,
                    asignaturas: sem.asignaturas.filter((asig) => asig.id !== asignaturaId),
                };
            }
            return sem;
        }));
    };


    const editarAsignatura = (semestreId, asignatura) => {
        setEditandoAsignatura({ ...asignatura, semestreId, originalId: asignatura.id });
    };


    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditandoAsignatura(prevState => ({ ...prevState, [name]: value }));
    };

    const guardarEdicionAsignatura = () => {
        const idDuplicada = semestres.some((sem) =>
            sem.asignaturas.some((asig) => asig.id === editandoAsignatura.id && asig.id !== editandoAsignatura.originalId)
        );

        if (idDuplicada) {
            alert(`La ID "${editandoAsignatura.id}" ya existe en otra asignatura. Por favor, elige una ID diferente.`);
            return;
        }

        setSemestres(semestres.map(sem => {
            if (sem.id === editandoAsignatura.semestreId) {
                return {
                    ...sem,
                    asignaturas: sem.asignaturas.map(asig =>
                        asig.id === editandoAsignatura.originalId ? editandoAsignatura : asig
                    ),
                };
            }

            return sem;
        }));

        // Ahora necesitamos actualizar los prerrequisitos en las otras asignaturas de todos los semestres
        setSemestres(prevSemestres => prevSemestres.map(sem => {
            // Recorremos todas las asignaturas de todos los semestres
            const asignaturasActualizadas = sem.asignaturas.map(asig => {
                // Si la asignatura editada es un prerrequisito de otra asignatura, actualizamos el valor
                if (asig.prerrequisito === editandoAsignatura.originalId) {
                    return { ...asig, prerrequisito: editandoAsignatura.id };
                }
                return asig;
            });

            return {
                ...sem,
                asignaturas: asignaturasActualizadas,
            };
        }));
        setEditandoAsignatura(null);
    };

    return (
        <div className="crear-malla-container">
            <h1>Crear Malla Académica</h1>
            <button onClick={agregarSemestre} className="agregar-semestre-btn">+ Agregar Semestre</button>
            <div className="semestres-row">
                {semestres.map(semestre => (
                    <div key={semestre.id} className="semestre-columna">
                        <h3>Semestre {semestre.id}</h3>
                        <button onClick={() => eliminarSemestre(semestre.id)} className="eliminar-semestre-btn">X</button>
                        <div className="asignaturas-container">
                            {semestre.asignaturas.map(asignatura => (
                                <div key={asignatura.id} className="asignatura">
                                    <p>{asignatura.nombre} ({asignatura.creditos} créditos)</p>
                                    <br />
                                    {asignatura.prerrequisito ? (
                                        // Buscar la asignatura cuyo ID coincida con el ID del prerrequisito
                                        <p>Prerrequisito: {
                                            semestres
                                                .flatMap(s => s.asignaturas) // Obtener todas las asignaturas de todos los semestres
                                                .find(asig => asig.id === asignatura.prerrequisito)?.nombre || `${asignatura.prerrequisito} Semestre`
                                        }</p>
                                    ) : (
                                        <p>Sin prerrequisito</p>
                                    )}
                                    <button className="edit-Button" onClick={() => editarAsignatura(semestre.id, asignatura)}>Editar</button>
                                    <button className="close-Button" onClick={() => eliminarAsignatura(semestre.id, asignatura.id)}>X</button>
                                </div>
                            ))}
                        </div>
                        <div className="nueva-asignatura-form">
                            <h4>{editandoAsignatura ? 'Editar Asignatura' : 'Agregar Asignatura'}</h4>
                            <input
                                type="text"
                                name="id"
                                placeholder="ID de la Asignatura"
                                value={editandoAsignatura ? editandoAsignatura.id : semestre.nuevaAsignatura.id}
                                onChange={(e) => {
                                    if (editandoAsignatura) {
                                        handleEditInputChange(e);
                                    } else {
                                        handleInputChange(e, semestre.id);
                                    }
                                }}
                            />
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Nombre de la Asignatura"
                                value={editandoAsignatura ? editandoAsignatura.nombre : semestre.nuevaAsignatura.nombre}
                                onChange={(e) => {
                                    if (editandoAsignatura) {
                                        handleEditInputChange(e);
                                    } else {
                                        handleInputChange(e, semestre.id);
                                    }
                                }}
                            />
                            <input
                                type="number"
                                name="creditos"
                                placeholder="Créditos"
                                value={editandoAsignatura ? editandoAsignatura.creditos : semestre.nuevaAsignatura.creditos}
                                onChange={(e) => {
                                    if (editandoAsignatura) {
                                        handleEditInputChange(e);
                                    } else {
                                        handleInputChange(e, semestre.id);
                                    }
                                }}
                            />
                            <textarea
                                name="descripcion"
                                placeholder="Descripción"
                                value={editandoAsignatura ? editandoAsignatura.descripcion : semestre.nuevaAsignatura.descripcion}
                                onChange={(e) => {
                                    if (editandoAsignatura) {
                                        handleEditInputChange(e);
                                    } else {
                                        handleInputChange(e, semestre.id);
                                    }
                                }}
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editandoAsignatura ? editandoAsignatura.tienePrerrequisito : semestre.nuevaAsignatura.tienePrerrequisito}
                                    onChange={() => {
                                        if (editandoAsignatura) {
                                            setEditandoAsignatura({
                                                ...editandoAsignatura,
                                                tienePrerrequisito: !editandoAsignatura.tienePrerrequisito,
                                                prerrequisito: '',
                                            });
                                        } else {
                                            handlePrerrequisitoToggle(semestre.id);
                                        }
                                    }}
                                />
                                ¿Tiene Prerrequisito?
                            </label>
                            {(editandoAsignatura ? editandoAsignatura.tienePrerrequisito : semestre.nuevaAsignatura.tienePrerrequisito) && (
                                <select
                                    name="prerrequisito"
                                    value={editandoAsignatura ? editandoAsignatura.prerrequisito : semestre.nuevaAsignatura.prerrequisito || ''}
                                    onChange={(e) => {
                                        if (editandoAsignatura) {
                                            handleEditInputChange(e);
                                        } else {
                                            handleInputChange(e, semestre.id);
                                        }
                                    }}
                                >
                                    <option value="">Seleccionar Prerrequisito</option>
                                    {semestres
                                        .filter((s) => s.id < semestre.id) // Filtra los semestres anteriores
                                        .map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {`Semestre ${s.id}`} {/* Mostrar el semestre */}
                                            </option>
                                        ))}

                                    {semestres
                                        .filter((s) => s.id < semestre.id)
                                        .flatMap((s) =>
                                            s.asignaturas.map((asignatura) => (
                                                <option key={asignatura.id} value={asignatura.id}>
                                                    {asignatura.nombre}
                                                </option>
                                            ))
                                        )}
                                </select>
                            )}
                            <br />
                            <button className={editandoAsignatura ? "guardar-cambios-btn" : "guardar-asignatura-btn"} onClick={() => editandoAsignatura ? guardarEdicionAsignatura() : agregarAsignatura(semestre.id)}>
                                {editandoAsignatura ? 'Guardar Cambios' : 'Guardar Asignatura'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CrearMalla;
