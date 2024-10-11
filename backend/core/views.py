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
                OPTIONAL MATCH (a)-[:REQUISITO {tipo:"Requisito"}]->(pr:Asignatura)
                OPTIONAL MATCH (a)-[:REQUISITO {tipo:"Postrequisito"}]->(po:Asignatura)
                RETURN a.id AS id, a.nombre AS nombre, a.creditos AS creditos, p.semestre AS semestre,
                       collect(pr) AS prerrequisitos, collect(po) AS postrequisitos
                ORDER BY p.semestre
            """)

            asignaturas_por_semestre = {}
            for record in result:
                semestre = record["semestre"]
                asignatura_data = {
                    "id": record["id"],
                    "nombre": record["nombre"],
                    "creditos": record["creditos"],
                    "prerrequisitos": [{"id": pr.id, "nombre": pr['nombre'], "creditos": pr['creditos']} for pr in record["prerrequisitos"]],
                    "postrequisitos": [{"id": po.id, "nombre": po['nombre'], "creditos": po['creditos']} for po in record["postrequisitos"]],
                }

                if semestre not in asignaturas_por_semestre:
                    asignaturas_por_semestre[semestre] = []
                asignaturas_por_semestre[semestre].append(asignatura_data)

        conn.close()  # Cerrar la conexión

        return Response(asignaturas_por_semestre)
