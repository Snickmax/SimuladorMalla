from neo4j import GraphDatabase
URI = "neo4j+s://e010170e.databases.neo4j.io"
AUTH = ("neo4j", "45wo0vIMm4a9r3Pao3j5DDQLlvTiuv4fqL22pvx5KQ8")  

class Neo4jConnection:
    def __init__(self):
        self.driver = GraphDatabase.driver(URI, auth=AUTH )
        self.driver.verify_connectivity()

    def close(self):
        self.driver.close()
