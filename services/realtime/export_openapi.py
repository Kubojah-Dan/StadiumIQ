import json
from app.main import app

def export_openapi():
    with open("openapi.json", "w") as f:
        json.dump(app.openapi(), f, indent=2)
    print("Exported openapi.json successfully")

if __name__ == "__main__":
    export_openapi()
