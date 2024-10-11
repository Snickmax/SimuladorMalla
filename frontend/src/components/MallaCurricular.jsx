import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MallaCurricular.css'; // Asegúrate de que esta ruta es correcta

const MallaCurricular = () => {
  const [asignaturas, setAsignaturas] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8000/asignaturas/')
      .then(response => {
        setAsignaturas(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

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
                    {practicas.map(practica => (
                      <ul key={practica.id} >
                        {practica.nombre} ({practica.creditos} créditos)
                      </ul>
                    ))}
                  </div>
                )}
                <div className="asignaturas-columna">
                  <ul>
                    {asignaturasSinPracticas.map(asignatura => (
                      <li key={asignatura.id} className="cuadro">
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
    </div>
  );
};

export default MallaCurricular;
