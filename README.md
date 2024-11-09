# SimuladorMalla
El proyecto busca optimizar la malla curricular, haciendo que sea más accesible e interactiva. Su objetivo es permitir a los estudiantes ver su progreso académico, los requisitos de cada asignatura y simular su avance en la carrera.


despliegue:
    1. Frontend: react cambiar los localhost a la ip del server y en vite.config.js host en true
    2. Modelo de negocio: setting.py en DEBUG = False y correr con comando:
        python manage.py runserver 0.0.0.0:8000
    3. DB: en los tres puntos de la base de datos ir a setting y Añade o modifica la línea
        dbms.default_listen_address=0.0.0.0
    4. .env poner host ip
