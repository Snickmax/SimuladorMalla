from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .neo4j_config import Neo4jConnection

class AsignaturaViewSet(viewsets.ViewSet):

    def list(self, request):
        conn = Neo4jConnection()  # Crear una instancia de la clase Neo4jConnection
        with conn.driver.session() as session:
            # Consulta de Neo4j para obtener asignaturas y agruparlas por semestre
            result = session.run("""
                MATCH (a:Asignatura)-[p:PERTENECE_A]->(c:Carrera)
                RETURN a.id AS id, a.nombre AS nombre, a.creditos AS creditos, p.semestre AS semestre
                ORDER BY p.semestre
            """)

            asignaturas_por_semestre = {}
            for record in result:
                semestre = record["semestre"]
                if semestre not in asignaturas_por_semestre:
                    asignaturas_por_semestre[semestre] = []
                asignaturas_por_semestre[semestre].append({
                    "id": record["id"],
                    "nombre": record["nombre"],
                    "creditos": record["creditos"]
                })

        conn.close()  # Cerrar la conexión

        return Response(asignaturas_por_semestre)


    def create(self, request):
        nombre = request.data.get('nombre')
        creditos = request.data.get('creditos')
        id_asignatura = request.data.get('id')
        
        if not nombre or not creditos or not id_asignatura:
            return Response({"error": "Todos los campos (id, nombre, créditos) son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

        conn = Neo4jConnection()
        with conn.driver.session() as session:
            session.run(
                """
                CREATE (a:Asignatura {id: $id, nombre: $nombre, creditos: $creditos})
                """,
                id=id_asignatura, nombre=nombre, creditos=creditos
            )
        conn.close()

        return Response({"message": "Nodo de asignatura creado exitosamente"}, status=status.HTTP_201_CREATED)
    
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