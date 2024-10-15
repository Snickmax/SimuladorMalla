import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MallaCurricular.css';
import { Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const MallaCurricular = () => {
  const [asignaturas, setAsignaturas] = useState({});
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [hoveredAsignatura, setHoveredAsignatura] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  useEffect(() => {
    const storedAsignaturas = localStorage.getItem('asignaturas');

    if (storedAsignaturas) {
      // Si los datos están en localStorage, los usamos
      setAsignaturas(JSON.parse(storedAsignaturas));
    } else {
      // Si no están en localStorage, hacemos la petición al servidor
      axios.get('http://localhost:8000/asignaturas/')
        .then(response => {
          setAsignaturas(response.data);
          // Guardamos los datos en localStorage
          localStorage.setItem('asignaturas', JSON.stringify(response.data));
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
  }, []);

  const handleAsignaturaClick = (asignatura) => {
    setSelectedAsignatura(asignatura);
    setShowOffcanvas(true);
  };

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
    setSelectedAsignatura(null);
  };

  const handleMouseEnter = (asignatura) => {
    setHoveredAsignatura(asignatura);
  };

  const handleMouseLeave = () => {
    setHoveredAsignatura(null);
  };

  const getBackgroundStyle = (asignatura) => {
    // Cambiar el color de los prerrequisitos cuando se pase el ratón por encima de una asignatura
    if (
      hoveredAsignatura &&
      hoveredAsignatura.prerrequisitos.some(
        (prerrequisito) => prerrequisito.id === asignatura.id
      )
    ) {
      return { backgroundColor: 'lightblue' }; // Cambiar el color de fondo
    }
    if (
      hoveredAsignatura &&
      hoveredAsignatura.postrequisitos.some(
        (postrequisitos) => postrequisitos.id === asignatura.id
      )
    ) {
      return { backgroundColor: 'orange' }; // Cambiar el color de fondo
    }
    return {};
  };

  return (
    <div className="malla-curricular">
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
                        onClick={() => handleAsignaturaClick(practica)}
                        onMouseEnter={() => handleMouseEnter(practica)}
                        onMouseLeave={handleMouseLeave}
                        style={getBackgroundStyle(practica)}>

                        <div className='ilPracticas'
                          key={practica.id}
                          onClick={() => handleAsignaturaClick(practica)}
                          onMouseEnter={() => handleMouseEnter(practica)}
                          style={getBackgroundStyle(practica)}>

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
                      onMouseEnter={() => handleMouseEnter(asignatura)}
                      onMouseLeave={handleMouseLeave}
                      style={getBackgroundStyle(asignatura)} // Aplicar el estilo cuando se hace hover
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

      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{selectedAsignatura?.nombre} ({selectedAsignatura?.creditos} créditos)</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
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
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default MallaCurricular;
