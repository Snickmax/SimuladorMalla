import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MallaCurricular.css'; // Asegúrate de que esta ruta es correcta
import { Offcanvas } from 'react-bootstrap'; // Asegúrate de que solo importas Offcanvas
import 'bootstrap/dist/css/bootstrap.min.css';

const MallaCurricular = () => {
  const [asignaturas, setAsignaturas] = useState({});
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/asignaturas/')
      .then(response => {
        setAsignaturas(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleAsignaturaClick = (asignatura) => {
    setSelectedAsignatura(asignatura);
    setShowOffcanvas(true);
  };

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
    setSelectedAsignatura(null);
  };

  return (
    <div className="malla-curricular">
      <div className="malla-container">
        {Object.keys(asignaturas).map(semestre => {
          const asignaturasSemestre = asignaturas[semestre];

          // Filtrar prácticas
          const practicas = asignaturasSemestre.filter(asignatura => asignatura.nombre.includes('Práctica'));
          const asignaturasSinPracticas = asignaturasSemestre.filter(asignatura => !asignatura.nombre.includes('Práctica'));

          return (
            <div key={semestre} className="semestre-columna">
              <h3>Semestre {semestre}</h3>
              <div className="contenido-semestre">
                {practicas.length > 0 && (
                  <div className="practica-columna">
                    <h4>Prácticas</h4>
                    {practicas.map(practica => (
                      <ul className='ulPracticas' key={practica.id}>
                        <li className='ilPracticas'>{practica.nombre} ({practica.creditos} créditos)</li>
                      </ul>
                    ))}
                  </div>
                )}
                <div className="asignaturas-columna">
                  <h4>Asignaturas</h4>
                  <ul className='ulAsignaturas'>
                    {asignaturasSinPracticas.map(asignatura => (
                      <li key={asignatura.id} className="cuadro ilAsignaturas" onClick={() => handleAsignaturaClick(asignatura)}>
                        {asignatura.nombre} ({asignatura.creditos} créditos)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{selectedAsignatura?.nombre}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <p><strong>Descripción:</strong> {selectedAsignatura?.descripcion}</p>
          <p><strong>Prerrequisitos:</strong></p>
          <ul>
            {selectedAsignatura?.prerrequisitos?.reduce((unique, prer) => {
              if (!unique.some(item => item.nombre === prer.nombre)) {
                unique.push(prer);
              }
              return unique;
            }, []).map(prer => (
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
