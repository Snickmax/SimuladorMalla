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
                    p.semestre AS semestre, prerrequisitos, postrequisitos
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
                    "prerrequisitos": [{"id": pr["id"], "nombre": pr["nombre"], "creditos": pr["creditos"]} for pr in record["prerrequisitos"]],
                    "postrequisitos": [{"id": po["id"], "nombre": po["nombre"], "creditos": po["creditos"]} for po in record["postrequisitos"]],
                }

                if semestre not in asignaturas_por_semestre:
                    asignaturas_por_semestre[semestre] = []
                asignaturas_por_semestre[semestre].append(asignatura_data)

        conn.close()  # Cerrar la conexión
    
        return Response(asignaturas_por_semestre)