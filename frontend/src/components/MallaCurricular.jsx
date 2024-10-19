import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MallaCurricular.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const MallaCurricular = () => {
  const [asignaturas, setAsignaturas] = useState({});
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [hoveredAsignatura, setHoveredAsignatura] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [notMenu, setNotMenu] = useState(false);

  useEffect(() => {
    const storedAsignaturas = localStorage.getItem('asignaturas');

    if (storedAsignaturas) {
      setAsignaturas(JSON.parse(storedAsignaturas));
    } else {
      axios.get('http://localhost:8000/asignaturas/')
        .then(response => {
          setAsignaturas(response.data);
          localStorage.setItem('asignaturas', JSON.stringify(response.data));
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
  }, []);

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
        (postrequisitos) => postrequisitos.id === asignatura.id
      )
    ) {
      return { backgroundColor: 'orange' };
    }
    return {};
  };

  return (
    <div className={`${isMenuVisible ? 'menu-visible' : ''}`}>
      <div className='header'>
        <h1>Malla Interactiva</h1>
        <h2>Ingeniería Civil en Computación e Informática</h2>
        
        {/* Switch de Bootstrap para activar/desactivar el menú */}
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
              <div key={semestre} className="semestre-columna">
                <h3>Semestre {semestre}</h3>
                <div className="contenido-semestre">
                  {practicas.length > 0 && (
                    <div className="practica-columna">
                      {practicas.map(practica => (
                        <div className='ulPracticas'
                          key={practica.id}
                          onClick={notMenu ? () => handleAsignaturaClick(practica) : () => { }}
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

                        onClick={notMenu ? () => handleAsignaturaClick(asignatura) : () => { }}
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

        {/* Menú lateral (Sidebar) */}
        <div className={`sidebar ${isMenuVisible ? 'visible' : ''}`}>
          <button className="close-btn" onClick={handleCloseMenu}>X</button>
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
        </div>
      </div>
    </div>
  );
};

export default MallaCurricular;
