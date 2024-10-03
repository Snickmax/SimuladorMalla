from rest_framework import viewsets
from .models import Asignatura
from .serializers import AsignaturaSerializer
from .neo4j_config import Neo4jConnection
from rest_framework.response import Response

# URI y autenticación para la base de datos Neo4j
class AsignaturaViewSet(viewsets.ModelViewSet):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer

    def list(self, request):
        conn = Neo4jConnection()  # Crear una instancia de la clase
        with conn.driver.session() as session:
            result = session.run("MATCH (a:Asignatura) RETURN a")
            asignaturas = [
                {
                    "id": record["a"]["id"],
                    "creditos": record["a"]["creditos"],
                    "nombre": record["a"]["nombre"]
                }
                for record in result
            ]
        conn.close()  # Asegúrate de cerrar la conexión
        serializer = AsignaturaSerializer(asignaturas, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        instance = serializer.save()
        self.create_neo4j_node(instance)

    def create_neo4j_node(self, instance):
        with Neo4jConnection() as conn:
            with conn.driver.session() as session:
                session.run(
                    "CREATE (a:Asignatura {id: $id, creditos: $creditos, nombre: $nombre})",
                    id=instance.id, creditos=instance.creditos, nombre=instance.nombre
                )

    def perform_update(self, serializer):
        instance = serializer.save()
        self.update_neo4j_node(instance)

    def update_neo4j_node(self, instance):
        with Neo4jConnection() as conn:
            with conn.driver.session() as session:
                session.run(
                    "MATCH (a:Asignatura {id: $id}) "
                    "SET a.creditos = $creditos, a.nombre = $nombre",
                    id=instance.id, creditos=instance.creditos, nombre=instance.nombre
                )

    def perform_destroy(self, instance):
        self.delete_neo4j_node(instance)
        instance.delete()

    def delete_neo4j_node(self, instance):
        with Neo4jConnection() as conn:
            with conn.driver.session() as session:
                session.run(
                    "MATCH (a:Asignatura {id: $id}) DELETE a",
                    id=instance.id
                )
