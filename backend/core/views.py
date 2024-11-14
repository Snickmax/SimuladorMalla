from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .neo4j_config import Neo4jConnection

class AsignaturaViewSet(viewsets.ViewSet):

    def list_carreras(self, request):
        conn = Neo4jConnection()
        with conn.session() as session:
            result = session.run("MATCH (c:Carrera) RETURN c.id AS id, c.nombre AS nombre")
            carreras = [{"id": record["id"], "nombre": record["nombre"]} for record in result]  # Usar una lista por comprensión
        
        conn.close()
        return Response(carreras)

    def list_asignaturas(self, request):
        carrera_id = request.query_params.get('carreraId')
        
        conn = Neo4jConnection()  # Crear una instancia de la clase Neo4jConnection
        with conn.driver.session() as session:
            # Consulta de Neo4j para obtener asignaturas y agruparlas por semestre
            result = session.run("""
                MATCH (a:Asignatura)-[p:PERTENECE_A]->(c:Carrera {id: $carrera_id})
                OPTIONAL MATCH (a)-[:REQUISITO {tipo:"Requisito"}]->(pr:Asignatura)
                OPTIONAL MATCH (a)-[:REQUISITO {tipo:"Postrequisito"}]->(po:Asignatura)
                WITH a, p, collect(DISTINCT pr) AS prerrequisitos, collect(DISTINCT po) AS postrequisitos
                RETURN a.id AS id, a.descripcion AS descripcion, a.nombre AS nombre, a.creditos AS creditos, 
                    p.semestre AS semestre, a.categoriaId AS categoriaId, a.categoriaNombre AS categoriaNombre, prerrequisitos, postrequisitos
                ORDER BY p.semestre
            """, carrera_id=carrera_id)

            asignaturas_por_semestre = {}
            for record in result:
                semestre = record["semestre"]
                asignatura_data = {
                    "id": record["id"],
                    "nombre": record["nombre"],
                    "creditos": record["creditos"],
                    "descripcion": record["descripcion"],
                    "categoriaId": record["categoriaId"],
                    "categoriaNombre": record["categoriaNombre"],
                    "prerrequisitos": [{"id": pr["id"], "nombre": pr["nombre"], "creditos": pr["creditos"]} for pr in record["prerrequisitos"]],
                    "postrequisitos": [{"id": po["id"], "nombre": po["nombre"], "creditos": po["creditos"]} for po in record["postrequisitos"]],
                }

                if semestre not in asignaturas_por_semestre:
                    asignaturas_por_semestre[semestre] = []
                asignaturas_por_semestre[semestre].append(asignatura_data)

        conn.close()  # Cerrar la conexión
    
        return Response(asignaturas_por_semestre)
    
    def guardar_malla(self, request):
        todasLasAsignaturas = request.data.get('todasLasAsignaturas', [])
        carreraSeleccionadas = request.data.get('carreraSeleccionadas', [])
        relacionConSemestre = request.data.get('relacionConSemestre', [])
        asignaturasConRequisitos = request.data.get('asignaturasConRequisitos', [])
        requisitosNumericos = request.data.get('requisitosNumericos', [])
        
        if not carreraSeleccionadas:
            return Response({"error": "El campo 'carreraSeleccionadas' es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)
        print(carreraSeleccionadas)
        conn = Neo4jConnection()
        with conn.driver.session() as session:
            query ="""
            MATCH (n) 
            DETACH DELETE n; 
            """

            session.run(query)
            
            carreraId, carreraNombre = carreraSeleccionadas
                
            query = """
            CREATE (c:Carrera {id: $id, nombre: $nombre})
            """
            session.run(query, id=carreraId, nombre=carreraNombre )

            for Id, nombre, creditos, descripcion, categoriaId, categoriaNombre in todasLasAsignaturas:
                query = """
                CREATE (a:Asignatura {id: $id, nombre: $nombre, creditos: $creditos, descripcion: $descripcion, categoriaId: $categoriaId, categoriaNombre: $categoriaNombre})
                """
                session.run(query, id=Id, nombre=nombre, creditos=creditos, descripcion=descripcion, categoriaId=categoriaId, categoriaNombre=categoriaNombre)
            
            for semestre, asignaturas in relacionConSemestre:
                query = """
                MATCH (c:Carrera {id: $nombre})
                MATCH (a:Asignatura) WHERE a.id IN $asignaturas
                CREATE (a)-[:PERTENECE_A {semestre: $semestre }]->(c)
                """
                session.run(query, asignaturas=asignaturas, semestre=semestre, nombre=carreraId)
            
            for asignatura, requisito in asignaturasConRequisitos:
                query = """
                MATCH (a1:Asignatura {id: $asignatura }), (a2:Asignatura {id: $requisito })
                CREATE (a1)-[:REQUISITO {tipo: 'Requisito'}]->(a2)
                CREATE (a2)-[:REQUISITO {tipo: 'Postrequisito'}]->(a1)
                """
                session.run(query, asignatura=asignatura, requisito=requisito)

            for semester, subjects in requisitosNumericos:
                
                query_subjects = """
                MATCH (s:Asignatura)-[:PERTENECE_A {semestre: $semester}]->(:Carrera {id: $nombre})
                RETURN s.id AS subject_id
                """
                
                current_subjects = session.run(query_subjects, semester=semester, nombre=carreraId).data()
                
                for subject in subjects:
                    for current in current_subjects:
                        current_subject_id = current['subject_id']
                        
                        query = """
                        MATCH (a:Asignatura {id: $subject_id})
                        MATCH (s:Asignatura {id: $object_final})
                        CREATE (a)-[:REQUISITO {tipo: 'Requisito'}]->(s)
                        CREATE (s)-[:REQUISITO {tipo: 'Postrequisito'}]->(a)
                        """
                        # Ejecutar la consulta con los parámetros correspondientes
                        session.run(query, object_final=current_subject_id, subject_id=subject)
       
        conn.close()
        return Response({"message": "Asignaturas guardadas y relaciones eliminadas exitosamente"}, status=status.HTTP_200_OK)


class UsuarioViewSet(viewsets.ViewSet):
    def create(self, request):
        email = request.data.get('email')

        if not email:
            return Response({"error": "El campo 'email' es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)

        conn = Neo4jConnection()
        with conn.driver.session() as session:
            # Verificar si el usuario ya existe
            existing_user = session.run(
                """
                MATCH (u:Usuario {email: $email})
                RETURN u
                """,
                email=email
            ).single()

            if existing_user:
                return Response({"message": "El usuario ya existe"}, status=status.HTTP_409_CONFLICT)

            # Si el usuario no existe, crear uno nuevo
            session.run(
                """
                CREATE (u:Usuario {email: $email})
                """,
                email=email
            )

        conn.close()
        return Response({"message": "Usuario creado exitosamente"}, status=status.HTTP_201_CREATED)

    def guardar_asignaturas(self, request):
        email = request.data.get('email')
        asignaturas_en_curso = request.data.get('asignaturas_en_curso', [])
        asignaturas_aprobadas = request.data.get('asignaturas_aprobadas', [])
        asignaturas_a_eliminar = request.data.get('asignaturas_a_eliminar', [])

        if not email:
            return Response({"error": "El campo 'email' es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)

        conn = Neo4jConnection()
        with conn.driver.session() as session:
            # Guardar asignaturas en curso
            for asignatura_id in asignaturas_en_curso:
                session.run(
                    """
                    MATCH (u:Usuario {email: $email}), (a:Asignatura {id: $asignatura_id})
                    MERGE (u)-[r:CURSA]->(a)
                    SET r.estado = 'enCurso'
                    """,
                    email=email,
                    asignatura_id=asignatura_id
                )

            # Guardar asignaturas aprobadas
            for asignatura_id in asignaturas_aprobadas:
                session.run(
                    """
                    MATCH (u:Usuario {email: $email})-[r:CURSA {estado: 'enCurso'}]->(a:Asignatura {id: $asignatura_id})
                    DELETE r
                    """,
                    email=email,
                    asignatura_id=asignatura_id
                )
                session.run(
                    """
                    MATCH (u:Usuario {email: $email}), (a:Asignatura {id: $asignatura_id})
                    MERGE (u)-[r:CURSA]->(a)
                    SET r.estado = 'aprobado'
                    """,
                    email=email,
                    asignatura_id=asignatura_id
                )

            # Eliminar asignaturas no cursadas
            if asignaturas_a_eliminar:
                session.run(
                    """
                    MATCH (u:Usuario {email: $email})-[r:CURSA]->(a:Asignatura)
                    WHERE a.id IN $asignaturas_a_eliminar
                    DELETE r
                    """,
                    email=email,
                    asignaturas_a_eliminar=asignaturas_a_eliminar
                )

        conn.close()
        return Response({"message": "Asignaturas guardadas y relaciones eliminadas exitosamente"}, status=status.HTTP_200_OK)

    
        
    def obtener_estados(self, userId):
        conn= Neo4jConnection()
        with conn.driver.session() as session:
            result = session.run(
                """
                MATCH p=(:Usuario {email: $userId })-[r:CURSA]->(:Asignatura) 
                RETURN p
                """,
                userId=userId
                
            ).single()
            
        
