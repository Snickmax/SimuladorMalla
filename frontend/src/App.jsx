// App.js
import React, { useState } from 'react';
import Simulador from './components/Simulador';
import MallaCurricular from './components/MallaCurricular';
import CrearMalla from './components/CrearMalla';

function App() {
  const [user, setUser] = useState(null); // Estado para almacenar el usuario autenticado

  return (
    <div className="App">
      {user ? <Simulador user={user} setUser={setUser}/>: <MallaCurricular user={user} setUser={setUser}/>}
    </div>
  );
}

export default App;
