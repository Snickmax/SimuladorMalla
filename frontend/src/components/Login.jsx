import { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

function Login() {
    const [user, setUser] = useState({});


    function handleCallbackResponse(response) {
        const userObject = jwtDecode(response.credential)
        setUser(userObject);
        document.getElementById("signInDiv").hidden = true;
        const email = userObject.email;
        if (email) {
            saveUserEmailToDatabase(email);
        }
    }

    const saveUserEmailToDatabase = async (email) => {
        try {
            // Envía una solicitud POST al backend para guardar el email en Neo4j
            await axios.post('http://localhost:8000/guardar-usuario/', { email });
        } catch (error) {
            console.error("Error al guardar el email en la base de datos:", error.response ? error.response.data : error.message);
        }
    };

    function handleSignOut(event){
        setUser({});
        document.getElementById("signInDiv").hidden = false;

    }

    useEffect(() => {
        // Inicializar el botón de Google Sign-In
        window.google.accounts.id.initialize({
            client_id: "1092419716281-mregl22qvg3k1qtgmcgg2ecaem5j2ckq.apps.googleusercontent.com",
            callback: handleCallbackResponse
        });

        // Renderizar el botón de Google Sign-In
        window.google.accounts.id.renderButton(
            document.getElementById("signInDiv"),
            { theme: "outline", size: "large" }
        );
    }, []);

    return (
        <div className="App">
            <div id="signInDiv"></div>
            { Object.keys(user).length != 0 &&
            <button onClick={ (e) => handleSignOut(e)}>Cerrar Sesion</button>
            }
            {user &&
                <div>
                    <img src={user.picture}></img>
                    <h3>{user.name}</h3>
                </div>            
            }
        </div>
    );
}

export default Login;

