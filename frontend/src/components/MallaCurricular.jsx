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
    fetchCarreras();
  }, []);

  const fetchCarreras = async () => {
    try {
      const response = await axios.get('http://localhost:8000/carreras/');
      const carrerasData = response.data;
      setCarreras(carrerasData);

      if (carrerasData.length > 0) {
        fetchAsignaturas(carrerasData[0].id);
      }
    } catch (error) {
      console.error('Error fetching carreras:', error);
    }
  };

  const fetchAsignaturas = async (carreraId) => {
    try {
      const response = await axios.get(`http://localhost:8000/asignaturas/?carreraId=${carreraId}`);
      const asignaturasData = response.data;
      setAsignaturas(asignaturasData);
    } catch (error) {
      console.error('Error fetching carreras:', error);
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

  const getBackgroundStyle = (asignatura) => {
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

  return (
    <div className={`${isMenuVisible ? 'menu-visible' : ''}`}>
      <div className='header'>
        <h1>Malla Interactiva</h1>
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

      <div className='malla-curricular'>
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
