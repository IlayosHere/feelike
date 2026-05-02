"""Integration tests for GET /api/tags."""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _signup_and_token(client, email: str, password: str = "password123") -> str:
    resp = client.post("/api/auth/signup", json={"email": email, "password": password})
    assert resp.status_code == 201
    return resp.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create_entry(client, token: str, tags: list[str]) -> None:
    resp = client.post(
        "/api/entries/",
        json={"content": "entry for tag test", "tags": tags},
        headers=_auth(token),
    )
    assert resp.status_code == 201


# ---------------------------------------------------------------------------
# GET /api/tags
# ---------------------------------------------------------------------------


def test_list_tags_empty(client) -> None:
    token = _signup_and_token(client, "tags_empty@example.com")
    resp = client.get("/api/tags/", headers=_auth(token))
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_tags_returns_current_user_tags(client) -> None:
    token = _signup_and_token(client, "tags_own@example.com")
    _create_entry(client, token, tags=["work", "ideas"])
    resp = client.get("/api/tags/", headers=_auth(token))
    assert resp.status_code == 200
    names = [t["name"] for t in resp.json()]
    assert sorted(names) == ["ideas", "work"]


def test_list_tags_does_not_return_other_users_tags(client) -> None:
    token_a = _signup_and_token(client, "tags_isolation_a@example.com")
    token_b = _signup_and_token(client, "tags_isolation_b@example.com")
    _create_entry(client, token_a, tags=["private-tag"])
    resp = client.get("/api/tags/", headers=_auth(token_b))
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_tags_ordered_alphabetically(client) -> None:
    token = _signup_and_token(client, "tags_order@example.com")
    _create_entry(client, token, tags=["zebra", "apple", "mango"])
    resp = client.get("/api/tags/", headers=_auth(token))
    assert resp.status_code == 200
    names = [t["name"] for t in resp.json()]
    assert names == sorted(names)
    assert names == ["apple", "mango", "zebra"]


def test_list_tags_requires_auth(client) -> None:
    resp = client.get("/api/tags/")
    assert resp.status_code == 401


def test_list_tags_response_shape(client) -> None:
    token = _signup_and_token(client, "tags_shape@example.com")
    _create_entry(client, token, tags=["journal"])
    resp = client.get("/api/tags/", headers=_auth(token))
    assert resp.status_code == 200
    tag = resp.json()[0]
    assert "id" in tag
    assert "name" in tag
    assert "created_at" in tag
    assert tag["name"] == "journal"
