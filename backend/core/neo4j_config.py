from neo4j import GraphDatabase
from django.conf import settings

class Neo4jConnection:
    def __init__(self):
        db_config = settings.NEO4J_DATABASES['default']
        self.driver = GraphDatabase.driver(
            db_config['HOST'],
            auth=(db_config['USER'], db_config['PASSWORD'])
        )

    def close(self):
        self.driver.close()
        
    def session(self):
        """Abre una nueva sesión con la base de datos."""
        return self.driver.session()