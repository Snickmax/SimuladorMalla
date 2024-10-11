import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
      {Object.keys(asignaturas).map(semestre => (
        <div key={semestre} className="semestre-columna">
          <h3>Semestre {semestre}</h3>
          <ul>
            {asignaturas[semestre].map(asignatura => (
              <li key={asignatura.id}>
                {asignatura.nombre} ({asignatura.creditos} créditos)
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MallaCurricular;
