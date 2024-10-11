from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .neo4j_config import Neo4jConnection

class AsignaturaViewSet(viewsets.ViewSet):

    def list(self, request):
        conn = Neo4jConnection()
        with conn.driver.session() as session:
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

        conn.close()

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

    def destroy(self, request, pk=None):
        if pk is None:
            return Response({"error": "ID de asignatura es requerido para eliminar"}, status=status.HTTP_400_BAD_REQUEST)

        conn = Neo4jConnection()
        with conn.driver.session() as session:
            # Primero, verifica si la asignatura existe
            result = session.run(
                """
                MATCH (a:Asignatura {id: $id})
                RETURN a
                """,
                id=pk
            )

            if not result.single():  # Si no se encuentra la asignatura
                return Response({"error": "Asignatura no encontrada"}, status=status.HTTP_404_NOT_FOUND)

            # Si se encuentra, procede a eliminarla
            session.run(
                """
                MATCH (a:Asignatura {id: $id})
                DELETE a
                """,
                id=pk
            )

        conn.close()

        return Response({"message": "Nodo de asignatura eliminado exitosamente"}, status=status.HTTP_204_NO_CONTENT)
