import React, { useEffect, useState } from 'react';
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
      } catch (error) {
        console.error('Error fetching asignaturas:', error);
      }
    } else {
      setAsignaturas({});
    }
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

  const getBackgroundStyle = (asignatura) => {
    if (
      hoveredAsignatura &&
      hoveredAsignatura.prerrequisitos.some(
        (prerrequisito) => prerrequisito.id === asignatura.id
      )
    ) {
      return { backgroundColor: 'lightblue' };
    }
    if (
      hoveredAsignatura &&
      hoveredAsignatura.postrequisitos.some(
        (postrequisito) => postrequisito.id === asignatura.id
      )
    ) {
      return { backgroundColor: 'orange' };
    }
    return {};
  };

  const toRoman = (num) => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    return romanNumerals[num - 1] || num;
  };

  return (
    <div className={`${isMenuVisible ? 'menu-visible' : ''}`}>
      <div className='header'>
        <h1>Malla Ingeniería Civil en Computación e Informática</h1>
        <h2>Facultad de Ingeniería y Arquitectura</h2>

        <img src="logo-ucen-azul.png.png" alt="logo ucen" className="logo-ucen" /> 

        <select value={selectedCarrera} onChange={handleCarreraChange}>
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

      <div className='malla-curricular'>
        <div className="malla-container">
          {Object.keys(asignaturas).map(semestre => {
            const asignaturasSemestre = asignaturas[semestre];
            const practicas = asignaturasSemestre.filter(asignatura => asignatura.nombre.includes('Práctica'));
            const asignaturasSinPracticas = asignaturasSemestre.filter(asignatura => !asignatura.nombre.includes('Práctica'));

            return (
              <div key={semestre} className="semestre-columna" style={{ position: 'relative' }}>
                {/* Cuadraditos de "Tema" encima de los semestres específicos */}
                {(semestre === '2' || semestre === '4' || semestre === '6') && (
                  <div className={`tema-item tema-${semestre}`}>
                    <span className={`color-box tema-color tema-color-tema-${semestre}`}></span> 
                    {`Tema ${semestre === '2' ? 'I' : semestre === '4' ? 'II' : 'III'}`}
                  </div>
                )}
                <h3>Semestre {toRoman(parseInt(semestre, 10))}</h3>
                <div className="contenido-semestre">
                  {practicas.length > 0 && (
                    <div className="practica-columna">
                      {practicas.map(practica => (
                        <div className='ulPracticas'
                          key={practica.id}
                          onClick={notMenu ? () => handleAsignaturaClick(practica) : () => {}}
                          onMouseEnter={() => handleMouseEnter(practica)}
                          onMouseLeave={handleMouseLeave}
                          style={getBackgroundStyle(practica)}>

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
                        onClick={notMenu ? () => handleAsignaturaClick(asignatura) : () => {}}
                        onMouseEnter={() => handleMouseEnter(asignatura)}
                        onMouseLeave={handleMouseLeave}
                        style={getBackgroundStyle(asignatura)}
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

        <div className={`sidebar ${isMenuVisible ? 'visible' : ''}`}>
          <h2>{selectedAsignatura?.nombre} ({selectedAsignatura?.creditos} créditos)</h2>
          <p><strong>Descripción:</strong> {selectedAsignatura?.descripcion}</p>
          <p><strong>Prerrequisitos:</strong></p>
          <ul>
            {selectedAsignatura?.prerrequisitos?.map(prer => (
              <li key={prer.id}>
                {prer.nombre} ({prer.creditos} créditos)
              </li>
            ))}
          </ul>
          <p><strong>Postrequisitos:</strong></p>
          <ul>
            {selectedAsignatura?.postrequisitos?.map(post => (
              <li key={post.id}>
                {post.nombre} ({post.creditos} créditos)
              </li>
            ))}
          </ul>

          {/* Botón para cerrar el menú en la parte inferior */}
          {isMenuVisible && (
            <button className="close-menu-button" onClick={handleCloseMenu}>❮</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MallaCurricular;
