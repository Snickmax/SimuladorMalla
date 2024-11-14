import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CrearMalla.css';

const CrearMalla = () => {
    const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
    const [carreras, setCarreras] = useState([]);
    const [semestres, setSemestres] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [editandoAsignatura, setEditandoAsignatura] = useState(null);

    // Llamamos a la función que carga las carreras y asignaturas al cargar el componente
    useEffect(() => {
        fetchCarreras();
    }, []);

    const fetchCarreras = async () => {
        try {
            const response = await axios.get('http://localhost:8000/carreras/');
            const carrerasData = response.data;
            setCarreras(carrerasData);

            if (carrerasData.length > 0) {
                // Obtener las asignaturas de la primera carrera
                setCarreraSeleccionada(carrerasData[0])
                fetchAsignaturas(carrerasData[0].id);
            }
        } catch (error) {
            console.error('Error fetching carreras:', error);
        }
    };

    const fetchAsignaturas = async (carreraId) => {
        try {
            const response = await axios.get(`http://localhost:8000/asignaturas/?carreraId=${carreraId}`);
            const data = response.data;

            // Mapeo para las categorías
            const categoriasMap = {};

            // Convertir los semestres y asignaturas en un formato adecuado
            const formattedSemestres = Object.entries(data).map(([semestre, asignaturas]) => ({
                id: Number(semestre),
                asignaturas: asignaturas.map(asignatura => {
                    // Manejo de categorías sin duplicados
                    if (!categoriasMap[asignatura.categoriaId]) {
                        categoriasMap[asignatura.categoriaId] = {
                            id: asignatura.categoriaId,
                            nombre: asignatura.categoriaNombre
                        };
                    }

                    // Manejo de prerrequisitos
                    let tienePrerrequisito = false;
                    let prerrequisitoId = null;
                    let semestrePrerrequisito = null;

                    if (asignatura.prerrequisitos && asignatura.prerrequisitos.length > 0) {
                        tienePrerrequisito = true;

                        if (asignatura.prerrequisitos.length === 1) {
                            // Si hay solo un prerrequisito, obtener el id de ese prerrequisito
                            prerrequisitoId = asignatura.prerrequisitos[0].id;
                        } else {
                            // Si hay más de uno, buscar el semestre en el que está el primer prerrequisito
                            for (let semestreKey in data) {
                                const semestreData = data[semestreKey];
                                const prereq = asignatura.prerrequisitos[0];  // Tomamos el primer prerrequisito

                                // Buscar si el primer prerrequisito existe en el semestre actual
                                const found = semestreData.some(asig => asig.id === prereq.id);

                                if (found) {
                                    semestrePrerrequisito = Number(semestreKey);  // Asignar el semestre donde se encuentra
                                    prerrequisitoId = semestrePrerrequisito
                                    break;
                                }
                            }
                        }
                    }

                    return {
                        id: asignatura.id,
                        nombre: asignatura.nombre,
                        creditos: asignatura.creditos,
                        descripcion: asignatura.descripcion,
                        categoriaId: asignatura.categoriaId,
                        categoriaNombre: asignatura.categoriaNombre,
                        tienePrerrequisito: tienePrerrequisito,
                        prerrequisito: prerrequisitoId,
                    };
                }),
                nuevaAsignatura: crearNuevaAsignatura() // Asumo que esta función es parte de tu código
            }));

            const categoriasArray = Object.values(categoriasMap);

            // Establecer el estado de los semestres y categorías
            setSemestres(formattedSemestres);
            setCategorias(categoriasArray);

        } catch (error) {
            console.error('Error fetching asignaturas:', error);
        }
    };

    const handleCarreraChange = async (event) => {
        const carreraId = event.target.value;
        setCarreraSeleccionada(carreras.find(c => c.id === carreraId))
        fetchAsignaturas(carreraId);
    };

    const crearNuevaAsignatura = () => ({
        id: '',
        nombre: '',
        creditos: '',
        descripcion: '',
        categoriaId: '',
        categoriaNombre: '',
        tienePrerrequisito: false,
        prerrequisito: '',
    });

    const agregarCategoria = () => {
        if (categorias.length < 4) {
            const nuevaCategoria = {
                id: `Categoria${categorias.length + 1}`,
                nombre: `Nombre de Categoria ${categorias.length + 1}`
            };
            setCategorias([...categorias, nuevaCategoria]);
        } else {
            alert('No se pueden agregar más de 4 categorías.');
        }
    };

    const agregarCarrera = () => {
        const nuevaCarrera = {
            id: `carrera ${carreras.length + 1}`,
            nombre: `Nombre de carrera ${carreras.length + 1}`
        };
        setCarreras([...carreras, nuevaCarrera]);
    };

    const eliminarCarrera = (carreraId) => {

        setCarreras(carreras.filter(cat => cat.id !== carreraId));
    };

    const eliminarCategoria = (categoriaId) => {
        if (categorias[categorias.length - 1].id !== categoriaId) {
            alert("Solo puedes eliminar la última categoría.");
            return;
        }

        const esCategoriaAsignada = semestres.some((sem) =>
            sem.asignaturas.some((asig) => asig.categoriaId === categoriaId)
        );

        if (esCategoriaAsignada) {
            alert(`No se puede eliminar la categoría "${categoriaId}" porque está asignada a una asignatura.`);
            return;
        }

        setCategorias(categorias.filter(cat => cat.id !== categoriaId));
    };

    const modificarCategoriaNombre = (categoriaId, nuevoNombre) => {
        setCategorias(categorias.map(cat =>
            cat.id === categoriaId ? { ...cat, nombre: nuevoNombre } : cat
        ));
    };

    const modificarCarreraNombre = (carreraId, nuevoNombre) => {
        setCarreras(carreras.map(cat =>
            cat.id === carreraId ? { ...cat, nombre: nuevoNombre } : cat
        ));
    };

    const modificarCarreraId = (carreraNombre, nuevoId) => {
        setCarreras(carreras.map(cat =>
            cat.nombre === carreraNombre ? { ...cat, id: nuevoId } : cat
        ));
    };

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
        const { id, nombre, creditos, descripcion, categoriaId, categoriaNombre, tienePrerrequisito, prerrequisito } = semestre.nuevaAsignatura;

        // Validación de campos obligatorios
        if (!id || !nombre || !creditos || !descripcion || !categoriaId || !categoriaNombre) {
            alert('Los campos ID, Nombre, Créditos, Descripción y Categoria son obligatorios.');
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

    // Función para manejar el cambio de categoría y guardar ID y nombre
    const handleCategoriaChange = (e, semestreId) => {
        const categoriaId = e.target.value;
        // Obtener el nombre de la categoría seleccionada
        const categoriaNombre = categorias.find(cat => cat.id === categoriaId)?.nombre || '';

        setSemestres(semestres.map(semestre => {
            if (semestre.id === semestreId) {
                return {
                    ...semestre,
                    nuevaAsignatura: {
                        ...semestre.nuevaAsignatura,
                        categoriaId,
                        categoriaNombre, // Guardar el nombre de la categoría en la asignatura
                    },
                };
            }
            return semestre;
        }));
    };

    const guardarMalla = async () => {
        // Obtener las asignaturas según su estado
        const todasLasAsignaturas = semestres.flatMap(semestre =>
            semestre.asignaturas.map(asignatura => [
                asignatura.id,
                asignatura.nombre,
                asignatura.creditos,
                asignatura.descripcion,
                asignatura.categoriaId,
                asignatura.categoriaNombre
            ])
        );

        const carreraSeleccionadas = [carreraSeleccionada.id,carreraSeleccionada.nombre]

        const relacionConSemestre = semestres.map(semestre => [
            semestre.id,
            semestre.asignaturas.map(asignatura => asignatura.id)
        ]);

        const asignaturasConRequisitos = [];

        semestres.forEach(semestre => {
            semestre.asignaturas.forEach(asignatura => {
                if (asignatura.prerrequisito && asignatura.prerrequisito.length > 2) {
                    asignaturasConRequisitos.push([asignatura.id, asignatura.prerrequisito]);
                }
            });
        });

        const requisitosNumericos = [];

        semestres.forEach(semestre => {
            semestre.asignaturas.forEach(asignatura => {
                // Verificar si prerrequisito es numérico y no vacío
                if (typeof asignatura.prerrequisito === 'number') {
                    // Verificar si ya existe el prerrequisito en la lista
                    const found = requisitosNumericos.find(item => item[0] === asignatura.prerrequisito);

                    if (found) {
                        // Si ya existe, agregamos la asignatura a la lista de asignaturas
                        found[1].push(asignatura.id);
                    } else {
                        // Si no existe, agregamos una nueva entrada
                        requisitosNumericos.push([asignatura.prerrequisito, [asignatura.id]]);
                    }
                }
            });
        });

        try {
            // Crear el objeto con todos los datos
            const dataToSend = {
                todasLasAsignaturas: todasLasAsignaturas,
                carreraSeleccionadas: carreraSeleccionadas,
                relacionConSemestre: relacionConSemestre,
                asignaturasConRequisitos: asignaturasConRequisitos,
                requisitosNumericos: requisitosNumericos
            };

            // Realizar la solicitud POST al backend para guardar y eliminar asignaturas
            await axios.post('http://localhost:8000/guardar-malla/', dataToSend);
            console.log("Malla guardadas en Neo4j");

        } catch (error) {
            console.error("Error al guardar Malla:", error.response ? error.response.data : error.message);
        }

    };

    return (
        <div className="crear-malla-container">
            <h1>Crear Malla Académica</h1>
            <label htmlFor="carrera-select">Seleccione una carrera:</label>
            <br /><br />
            <select id="carrera-select" onChange={handleCarreraChange}>
                {carreras.map((carrera) => (
                    <option key={carrera.id} value={carrera.id}>
                        {carrera.nombre}
                    </option>
                ))}
            </select>
            <br /><br />
            <div className="etiquetas">
                {carreras.map((carreras) => (
                    <span key={carreras.id} className="etiqueta">
                        <input
                            type="text"
                            value={carreras.id}
                            onChange={(e) => modificarCarreraId(carreras.nombre, e.target.value)}
                        />
                        <input
                            type="text"
                            value={carreras.nombre}
                            onChange={(e) => modificarCarreraNombre(carreras.id, e.target.value)}
                        />
                        <button onClick={() => eliminarCarrera(carreras.id)}>X</button>
                    </span>
                ))}
                <button className="agregar-etiqueta-btn" onClick={agregarCarrera}>+</button>
            </div>
            <br />
            <button onClick={agregarSemestre} className="agregar-semestre-btn">+ Agregar Semestre</button>
            <div className="semestres-row">
                {semestres.map(semestre => (
                    <div key={semestre.id} className="semestre-column">
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
                            <select
                                name="categoriaId"
                                value={editandoAsignatura ? editandoAsignatura.categoriaId : semestre.nuevaAsignatura.categoriaId || ''}
                                onChange={(e) => {
                                    if (editandoAsignatura) {
                                        handleEditInputChange(e);
                                    } else {
                                        handleCategoriaChange(e, semestre.id);
                                    }
                                }}
                            >
                                <option value="">Seleccionar Categoría</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
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
            <div className="categorias-container">
                <h4>Categorías</h4>
                <div className="etiquetas">
                    {categorias.map((categoria) => (
                        <span key={categoria.id} className="etiqueta">
                            <input
                                type="text"
                                value={categoria.nombre}
                                onChange={(e) => modificarCategoriaNombre(categoria.id, e.target.value)}
                            />
                            <button onClick={() => eliminarCategoria(categoria.id)}>X</button>
                        </span>
                    ))}
                    {categorias.length < 4 && (
                        <button className="agregar-etiqueta-btn" onClick={agregarCategoria}>+</button>
                    )}
                </div>
            </div>
            <button className='agregar-semestre-btn' onClick={guardarMalla}>Guardar</button>
        </div>
    );
};

export default CrearMalla;
