import React from 'react';
import MallaCurricular from './components/MallaCurricular';
import SubjectForm from './components/SubjectForm';
import EliminarAsignatura from './components/EliminarAsignatura'; 


function App() {
  return (
    <div className="App">
      <h1>Gestión de Asignaturas</h1>
      <SubjectForm />
      <EliminarAsignatura />
      <MallaCurricular />
    </div>
  );
}

export default App;
