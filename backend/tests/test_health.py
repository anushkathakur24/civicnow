def test_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_health_db(client):
    r = client.get("/api/v1/health/db")
    assert r.status_code == 200
    assert r.json()["database"] == "reachable"
