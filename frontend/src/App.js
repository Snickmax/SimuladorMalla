import React from 'react';
import SubjectList from './components/SubjectList';
import SubjectForm from './components/SubjectForm';

function App() {
    return (
        <div className="App">
            <h1>Gestión de Asignaturas</h1>
            <SubjectForm />
            <SubjectList />
        </div>
    );
}

export default App;
