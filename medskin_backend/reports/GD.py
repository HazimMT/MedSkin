from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USERNAME = "neo4j"
PASSWORD = "newpassword"

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))


def recommend_drug(disease, current_drugs):
    query = """
    MATCH (drug:Drug)-[:TREATS]->(disease:Disease {name: $disease})
    WHERE NOT EXISTS {
        MATCH (drug)-[:INTERACTS_WITH]->(interaction:DrugInteraction)
        WHERE interaction.name IN $current_drugs
    }
    RETURN drug.name AS recommended_drug, drug.description AS description
    """
    with driver.session() as session:
        results = session.run(query, disease=disease, current_drugs=current_drugs)
        return results.data()


disease = "Rosacea"
record = ['Etanercept']

recommendations = recommend_drug(disease, record)

if recommendations:
    print("Recommended Drugs:")
    for recommendation in recommendations:
        print(f"- {recommendation['recommended_drug']}")
else:
    print("No suitable drug found that treats the specified disease and does not interact with the patients record.")

driver.close()