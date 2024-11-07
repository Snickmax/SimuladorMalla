// App.js
import React, { useState } from 'react';
import Simulador from './components/Simulador';
import MallaCurricular from './components/MallaCurricular';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null); // Estado para almacenar el usuario autenticado

  return (
    <div className="App">
      <Login user={user} setUser={setUser}/> 
      {user ? <Simulador user={user}/>: <MallaCurricular/>}
    </div>
  );
}

export default App;
