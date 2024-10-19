from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

class Neo4jConnection:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            os.getenv('NEO4J_URI'),
            auth=(os.getenv('NEO4J_USERNAME'), os.getenv('NEO4J_PASSWORD'))
        )
        self.driver.verify_connectivity()

    def close(self):
        self.driver.close()
        
    def session(self):
        """Abre una nueva sesión con la base de datos."""
        return self.driver.session()