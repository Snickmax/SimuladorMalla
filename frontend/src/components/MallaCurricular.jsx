import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './MallaCurricular.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const MallaCurricular = () => {
  const [asignaturas, setAsignaturas] = useState({});
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [hoveredAsignatura, setHoveredAsignatura] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [notMenu, setNotMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado para el loading

  const asignaturaRefs = useRef({});

  useEffect(() => {
    const updateSidebarHeight = () => {
      const malla = document.querySelector('.malla-curricular');
      const sidebar = document.querySelector('.sidebar');
      if (malla && sidebar) {
        sidebar.style.height = `${malla.offsetHeight}px`; // Ajusta la altura de la barra lateral
      }
    };

    // Ejecuta al montar y cada vez que la ventana se redimensiona
    updateSidebarHeight();
    window.addEventListener('resize', updateSidebarHeight);

    return () => {
      window.removeEventListener('resize', updateSidebarHeight);
    };
  }, []);

  useEffect(() => {
    fetchCarreras();
  }, []);

  const fetchCarreras = async () => {
    try {
      const response = await axios.get('http://localhost:8000/carreras/');
      const carrerasData = response.data;
      setCarreras(carrerasData);

      if (carrerasData.length > 0) {
        setSelectedCarrera(carrerasData[0])
        await fetchAsignaturas(carrerasData[0].id);
      }
    } catch (error) {
      console.error('Error fetching carreras:', error);
    } finally {
      setIsLoading(false); // Desactivar el loading una vez cargado
    }
  };

  const fetchAsignaturas = async (carreraId) => {
    try {
      setIsLoading(true); // Activar el loading al cargar asignaturas
      const response = await axios.get(`http://localhost:8000/asignaturas/?carreraId=${carreraId}`);
      const asignaturasData = response.data;
      // Inicializar referencias para las asignaturas
      const refs = {};
      Object.values(asignaturasData).flat().forEach(asignatura => {
        refs[asignatura.id] = React.createRef();
      });
      asignaturaRefs.current = refs;

      setAsignaturas(asignaturasData);
    } catch (error) {
      console.error('Error fetching carreras:', error);
    } finally {
      setIsLoading(false); // Desactivar el loading una vez cargado
    }
  };

  const handleCarreraChange = async (event) => {
    const carreraId = event.target.value;
    fetchAsignaturas(carreraId);
  };

  const handleAsignaturaClick = (asignatura) => {
    setSelectedAsignatura(asignatura);
    setIsMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
    setSelectedAsignatura(null);
  };

  const handleMouseEnter = (asignatura) => {
    setHoveredAsignatura(asignatura);
  };

  const handleMouseLeave = () => {
    setHoveredAsignatura(null);
  };

  const toggleNotMenu = () => {
    setNotMenu(!notMenu);
    handleCloseMenu();
  };
  const handleMouseEnterHover = (id) => {
    // Buscar la asignatura que coincide con la id dada
    const asignatura = Object.values(asignaturas).flat().find(asignatura => asignatura.id === id);

    // Si la asignatura es encontrada, actualizar el estado de hoveredAsignatura
    if (asignatura) {
      setHoveredAsignatura(asignatura);
    }
  };


  const getBackgroundStyle = (asignatura) => {
    if (hoveredAsignatura && hoveredAsignatura.id === asignatura.id) {
      return { backgroundColor: '#ff6624', color: '#fff' }; // Color para el hover de la asignatura misma
    }
    if (
      hoveredAsignatura &&
      hoveredAsignatura.prerrequisitos.some(
        (prerrequisito) => prerrequisito.id === asignatura.id
      )
    ) {
      return { backgroundColor: '#ff8a84', color: '#fff' };
    }
    if (
      hoveredAsignatura &&
      hoveredAsignatura.postrequisitos.some(
        (postrequisito) => postrequisito.id === asignatura.id
      )
    ) {
      return { backgroundColor: '#af3a11', color: '#fff' };
    }
    return {};
  };

  // Nueva función para aplicar estilo difuminado a otros elementos
  const getDiffuseStyle = (asignatura) => {
    if (
      hoveredAsignatura &&
      hoveredAsignatura.id !== asignatura.id &&
      !hoveredAsignatura.prerrequisitos.some(
        (prerrequisito) => prerrequisito.id === asignatura.id
      ) &&
      !hoveredAsignatura.postrequisitos.some(
        (postrequisito) => postrequisito.id === asignatura.id
      )
    ) {
      return { opacity: 0.5 };
    }
    return {};
  };

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

  const handlePrerrequisitoClick = (prerrequisitoId) => {
    const ref = asignaturaRefs.current[prerrequisitoId];
    if (ref) {
      ref.current.click(); // Simula el clic en la asignatura correspondiente
    }
  };

  return (
    <div >
      {isLoading ? (
        <div className="loading-screen">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div>

          <div className='header'>
            <div>
              <img src="logo-ucen-azul.png.png" alt="logo ucen" className="logo-ucen" />

            </div>
            <div className='informacion'>
              <h1>Malla {selectedCarrera.nombre}</h1>
              <h2>Facultad de Ingeniería y Arquitectura</h2>


              <select onChange={handleCarreraChange}>
                {carreras.map((carrera) => (
                  <option key={carrera.id} value={carrera.id}>{carrera.nombre}</option>
                ))}
              </select>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                  checked={notMenu}
                  onChange={toggleNotMenu}
                />
                <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
                  {notMenu ? "Desactivar Menú" : "Activar Menú"}
                </label>
              </div>
            </div>
          </div>
          <div className={`${isMenuVisible ? 'menu-visible' : ''}`}>

            <div className='malla-curricular'>
              <div className={`sidebar ${isMenuVisible ? 'visible' : ''}`}>
                <h2>{selectedAsignatura?.nombre}</h2>
                <h2>({selectedAsignatura?.creditos} créditos)</h2>
                <p><strong>Descripción:</strong> <br />{selectedAsignatura?.descripcion}</p>
                <p><strong>Requisitos:</strong></p>
                <ul>
                  {selectedAsignatura?.prerrequisitos && selectedAsignatura.prerrequisitos.length > 0 ? (
                    selectedAsignatura.prerrequisitos.map(prer => (
                      <li key={prer.id}
                        className='lireq'
                        onClick={() => handlePrerrequisitoClick(prer.id)}
                        onMouseEnter={() => handleMouseEnterHover(prer.id)}
                        onMouseLeave={handleMouseLeave}>
                        {prer.nombre}
                      </li>
                    ))
                  ) : (
                    <li>
                      <strong>Admision</strong>
                    </li>
                  )}
                </ul>
                {selectedAsignatura?.postrequisitos && selectedAsignatura.postrequisitos.length > 0 ? (
                  <div>
                    <p><strong>Abre:</strong></p>
                    <ul>
                      {selectedAsignatura.postrequisitos.map(post => (

                        <li key={post.id}
                          className='lireq'
                          onMouseEnter={() => handleMouseEnterHover(post.id)}
                          onClick={() => handlePrerrequisitoClick(post.id)}
                          onMouseLeave={handleMouseLeave}>
                          {post.nombre}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div></div>
                )}


                {/* Botón para cerrar el menú en la parte inferior */}
                {isMenuVisible && (
                  <button className="close-menu-button" onClick={handleCloseMenu}>❮</button>
                )}
              </div>
              <div className="malla-container">
                {Object.keys(asignaturas).map(semestre => {
                  const asignaturasSemestre = asignaturas[semestre];
                  const practicas = asignaturasSemestre.filter(asignatura => asignatura.nombre.includes('Práctica'));
                  const asignaturasSinPracticas = asignaturasSemestre.filter(asignatura => !asignatura.nombre.includes('Práctica'));

                  return (
                    <div key={semestre} className="semestre-columna">
                      <h3>{enteroARomano(semestre)} SEMESTRE</h3>
                      <div className="contenido-semestre">
                        {practicas.length > 0 && (
                          <div className="practica-columna">
                            {practicas.map(practica => (
                              <div className='ulPracticas'
                                key={practica.id}
                                ref={asignaturaRefs.current[practica.id]}
                                onClick={notMenu ? () => handleAsignaturaClick(practica) : () => { }}
                                onMouseEnter={() => handleMouseEnter(practica)}
                                onMouseLeave={handleMouseLeave}
                                style={{ ...getBackgroundStyle(practica), ...getDiffuseStyle(practica) }}>

                                <div className='ilPracticas' style={getBackgroundStyle(practica)}>
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
                              ref={asignaturaRefs.current[asignatura.id]}
                              className={`cuadro ilAsignaturas ${asignatura.categoriaId}`}
                              onClick={notMenu ? () => handleAsignaturaClick(asignatura) : () => { }}
                              onMouseEnter={() => handleMouseEnter(asignatura)}
                              onMouseLeave={handleMouseLeave}
                              style={{
                                ...getBackgroundStyle(asignatura),
                                ...getDiffuseStyle(asignatura),
                              }}
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
        </div>
      )}
    </div>
  );
};

export default MallaCurricular;