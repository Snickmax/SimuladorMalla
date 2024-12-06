import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function Login({ user, setUser, isMenuVisible }) {
    const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
    const [showUserInfo, setShowUserInfo] = useState(false);

    const toggleUserInfo = () => {
        setShowUserInfo((prev) => !prev);
    };

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

    // Función que abre el modal cuando el usuario intenta cerrar sesión
    const handleSignOutClick = () => {
        setIsModalOpen(true); // Abre el modal
    };

    const handleSignOut = () => {
        setUser(null); // Eliminar usuario del estado
        localStorage.removeItem('user'); // Eliminar usuario de localStorage
        setShowGoogleSignIn(false); // Actualiza el estado del botón de inicio de sesión
        setIsModalOpen(false); // Cierra el modal
        console.log("Usuario cerrado sesión");
    };

    // Función para cancelar y cerrar el modal sin cerrar sesión
    const handleCancel = () => {
        setIsModalOpen(false); // Cierra el modal sin hacer nada
    };

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

    const modalStyles = {
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', /* Fondo semitransparente */
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000, /* Asegura que el modal esté encima de otros elementos */
        },
        modalContent: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            width: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', /* Sombra suave para el modal */
        },
        modalActions: {
            marginTop: '20px',
        },
        button: {
            padding: '10px 20px',
            margin: '5px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#007BFF',
            color: 'white',
            borderRadius: '5px',
            transition: 'background-color 0.3s ease',
        },
        buttonHover: {
            backgroundColor: '#0056b3',
        },
        modalText: {
            fontSize: '18px',
            marginBottom: '10px',
        },
        modalSubText: {
            fontSize: '14px',
            marginBottom: '20px',
        }
    };

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
                    <div className="user-container">
                        <img
                            src={user.picture}
                            alt="User"
                            className="user-logo"
                            onClick={toggleUserInfo}
                        />
                        <div className={`user-info ${showUserInfo ? "show" : "hide"}`}>
                            <h3>{user.name}</h3>
                            <button onClick={handleSignOutClick}>Cerrar Sesión</button>
                        </div>
                    </div>
                )
            }

            {/* Modal de confirmación */}
            {isModalOpen && (
                <div style={modalStyles.modal}>
                    <div style={modalStyles.modalContent}>
                        <h4 style={modalStyles.modalText}>¿Estás seguro de que quieres cerrar sesión?</h4>
                        <p style={modalStyles.modalSubText}>Puede que pierdas progreso no guardado.</p>
                        <div style={modalStyles.modalActions}>
                            <button
                                style={modalStyles.button}
                                onClick={handleSignOut}>
                                Sí, Cerrar Sesión
                            </button>
                            <button
                                style={{ ...modalStyles.button, ...modalStyles.buttonHover }}
                                onClick={handleCancel}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;
