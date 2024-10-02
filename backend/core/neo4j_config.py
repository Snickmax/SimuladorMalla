from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

class Neo4jConnection:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            os.getenv('NEO4J_URI'),
            auth=(os.getenv('NEO4J_USER'), os.getenv('NEO4J_PASSWORD'))
        )
        self.driver.verify_authentication()

    def close(self):
        self.driver.close()
