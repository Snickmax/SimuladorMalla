import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function Login({ user, setUser, isMenuVisible }) { // Añadido isMenuVisible como prop
    const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);

    function handleCallbackResponse(response) {
        const userObject = jwtDecode(response.credential);
        setUser(userObject);

        // Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(userObject));

        const email = userObject.email;
        if (email) {
            saveUserEmailToDatabase(email);
        }
    }

    const saveUserEmailToDatabase = async (email) => {
        try {
            await axios.post('http://localhost:8000/guardar-usuario/', { email });
        } catch (error) {
            console.error("Error al guardar el email en la base de datos:", error.response ? error.response.data : error.message);
        }
    };

    function handleSignOut() {
        setUser(null);
        localStorage.removeItem('user'); // Eliminar usuario de localStorage
        setShowGoogleSignIn(false);
    }

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser); // Restaurar el usuario de localStorage
        }

        window.google.accounts.id.initialize({
            client_id: "1092419716281-mregl22qvg3k1qtgmcgg2ecaem5j2ckq.apps.googleusercontent.com",
            callback: handleCallbackResponse
        });

        if (showGoogleSignIn) {
            window.google.accounts.id.renderButton(
                document.getElementById("signInDiv"),
                { theme: "outline", size: "large" }
            );
        }
    }, [showGoogleSignIn]);

    return (
        <div className={`login-container ${isMenuVisible ? 'menu-open' : ''}`}>
            {/* Contenedor del botón "Simulador" y "Acceder por Google" */}
            {
                !user && (
                    <div className="simulador-button-container">
                        <button className="simulador-button" onClick={() => setShowGoogleSignIn(!showGoogleSignIn)}>Simulador</button>

                        {/* Botón "Acceder por Google" aparece debajo de "Simulador" */}
                        {showGoogleSignIn && (
                            <div id="signInDiv" style={{ marginTop: '10px' }}></div>
                        )}
                    </div>)
            }

            {/* Información del usuario cuando está logueado */}
            {
                user && (
                    <div className="user-info">
                        <button onClick={handleSignOut}>Cerrar Sesión</button>
                        <img src={user.picture} alt="User" />
                        <h3>{user.name}</h3>
                    </div>
                )
            }
        </div>
    );
}

export default Login;
