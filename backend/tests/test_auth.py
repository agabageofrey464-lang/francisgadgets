async def test_register_and_login(client):
    register_resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "jane@example.com", "password": "SuperSecret1", "full_name": "Jane Doe"},
    )
    assert register_resp.status_code == 201
    body = register_resp.json()
    assert body["user"]["email"] == "jane@example.com"
    assert body["access_token"]

    dup_resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "jane@example.com", "password": "SuperSecret1", "full_name": "Jane Doe"},
    )
    assert dup_resp.status_code == 409

    login_resp = await client.post(
        "/api/v1/auth/login", json={"email": "jane@example.com", "password": "SuperSecret1"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    me_resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "jane@example.com"


async def test_login_wrong_password(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "bob@example.com", "password": "SuperSecret1", "full_name": "Bob"},
    )
    resp = await client.post("/api/v1/auth/login", json={"email": "bob@example.com", "password": "wrong"})
    assert resp.status_code == 401
