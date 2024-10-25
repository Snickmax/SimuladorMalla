import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MallaCurricular.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';

const MallaCurricular = () => {
  const [asignaturas, setAsignaturas] = useState({});
  const [carreras, setCarreras] = useState([]);
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [hoveredAsignatura, setHoveredAsignatura] = useState(null);

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

  const handleMouseEnter = (asignatura) => {
    setHoveredAsignatura(asignatura);
  };

  const handleMouseLeave = () => {
    setHoveredAsignatura(null);
  };

  const getBackgroundStyle = (asignatura) => {
    if (
      hoveredAsignatura &&
      hoveredAsignatura.prerrequisitos.some(
        (prerrequisito) => prerrequisito.id === asignatura.id
      )
    ) 
    if (
      hoveredAsignatura &&
      hoveredAsignatura.postrequisitos.some(
        (postrequisito) => postrequisito.id === asignatura.id
      )
    ) 
    return {};
  };

  return (
    <div>
      <div className='header'>
        <Login />
        <h1>Malla Interactiva</h1>
        <select value={selectedCarrera} onChange={handleCarreraChange}>
          {carreras.map((carrera) => (
            <option key={carrera.id} value={carrera.id}>{carrera.nombre}</option>
          ))}
        </select>
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
      </div>
    </div>
  );
};

export default MallaCurricular;
