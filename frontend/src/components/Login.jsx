// Login.js
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function Login({ user, setUser }) {
    function handleCallbackResponse(response) {
        const userObject = jwtDecode(response.credential);
        console.log(userObject)
        console.log(user)
        setUser(userObject);
        document.getElementById("signInDiv").hidden = true;

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
        document.getElementById("signInDiv").hidden = false;
    }

    useEffect(() => {
        window.google.accounts.id.initialize({
            client_id: "1092419716281-mregl22qvg3k1qtgmcgg2ecaem5j2ckq.apps.googleusercontent.com",
            callback: handleCallbackResponse
        });

        window.google.accounts.id.renderButton(
            document.getElementById("signInDiv"),
            { theme: "outline", size: "large" }
        );
    }, []);

    return (
        <div>
            <div id="signInDiv"></div>

            {
                user && (
                    <div className="user-info">

                        <button onClick={handleSignOut}>Cerrar Sesion</button>
                        <img src={user.picture} alt="User" />
                        <h3>{user.name}</h3>
                    </div>
                )
            }
        </div >
    );
}

export default Login;
