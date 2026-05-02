"""Integration tests for /api/auth routes."""


def _signup(client, email: str = "user@example.com", password: str = "password123") -> dict:
    return client.post("/api/auth/signup", json={"email": email, "password": password})


def _login_form(client, email: str = "user@example.com", password: str = "password123") -> dict:
    return client.post("/api/auth/login", data={"username": email, "password": password})


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# POST /api/auth/signup
# ---------------------------------------------------------------------------


def test_signup_returns_token(client) -> None:
    resp = _signup(client)
    assert resp.status_code == 201
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_signup_normalizes_email_to_lowercase(client) -> None:
    resp = client.post("/api/auth/signup", json={"email": "UPPER@Example.COM", "password": "password123"})
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    me = client.get("/api/auth/me", headers=_auth_headers(token))
    assert me.json()["email"] == "upper@example.com"


def test_signup_duplicate_email_returns_409(client) -> None:
    _signup(client, email="dup@example.com")
    resp = _signup(client, email="dup@example.com")
    assert resp.status_code == 409


def test_signup_short_password_returns_422(client) -> None:
    resp = client.post("/api/auth/signup", json={"email": "short@example.com", "password": "short"})
    assert resp.status_code == 422


def test_signup_with_display_name(client) -> None:
    resp = client.post(
        "/api/auth/signup",
        json={"email": "named@example.com", "password": "password123", "display_name": "Alice"},
    )
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    me = client.get("/api/auth/me", headers=_auth_headers(token))
    assert me.json()["display_name"] == "Alice"


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------


def test_login_returns_token(client) -> None:
    _signup(client, email="login@example.com")
    resp = _login_form(client, email="login@example.com")
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password_returns_401(client) -> None:
    _signup(client, email="badpw@example.com")
    resp = _login_form(client, email="badpw@example.com", password="wrongpassword")
    assert resp.status_code == 401


def test_login_unknown_email_returns_401(client) -> None:
    resp = _login_form(client, email="nobody@example.com")
    assert resp.status_code == 401


def test_login_error_does_not_distinguish_email_vs_password(client) -> None:
    """Both bad-email and bad-password return the same 401 detail."""
    _signup(client, email="same@example.com")
    bad_pw = _login_form(client, email="same@example.com", password="wrongpassword")
    bad_email = _login_form(client, email="nobody@example.com", password="password123")
    assert bad_pw.json()["detail"] == bad_email.json()["detail"]


# ---------------------------------------------------------------------------
# GET /api/auth/me
# ---------------------------------------------------------------------------


def test_me_returns_user(client) -> None:
    resp = _signup(client, email="me@example.com")
    token = resp.json()["access_token"]
    me = client.get("/api/auth/me", headers=_auth_headers(token))
    assert me.status_code == 200
    body = me.json()
    assert body["email"] == "me@example.com"
    assert "id" in body
    assert "created_at" in body


def test_me_without_token_returns_401(client) -> None:
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_me_with_invalid_token_returns_401(client) -> None:
    resp = client.get("/api/auth/me", headers=_auth_headers("not.a.valid.token"))
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# POST /api/auth/password
# ---------------------------------------------------------------------------


def test_change_password_succeeds(client) -> None:
    _signup(client, email="pw@example.com", password="oldpassword")
    token = _login_form(client, email="pw@example.com", password="oldpassword").json()["access_token"]
    resp = client.post(
        "/api/auth/password",
        json={"current_password": "oldpassword", "new_password": "newpassword123"},
        headers=_auth_headers(token),
    )
    assert resp.status_code == 204

    # Old password no longer works
    assert _login_form(client, email="pw@example.com", password="oldpassword").status_code == 401
    # New password works
    assert _login_form(client, email="pw@example.com", password="newpassword123").status_code == 200


def test_change_password_wrong_current_returns_401(client) -> None:
    _signup(client, email="pwwrong@example.com", password="correct123")
    token = _login_form(client, email="pwwrong@example.com", password="correct123").json()["access_token"]
    resp = client.post(
        "/api/auth/password",
        json={"current_password": "wrongpassword", "new_password": "newpassword123"},
        headers=_auth_headers(token),
    )
    assert resp.status_code == 401


def test_change_password_new_too_short_returns_422(client) -> None:
    _signup(client, email="pwshort@example.com", password="correct123")
    token = _login_form(client, email="pwshort@example.com", password="correct123").json()["access_token"]
    resp = client.post(
        "/api/auth/password",
        json={"current_password": "correct123", "new_password": "short"},
        headers=_auth_headers(token),
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# DELETE /api/auth/me
# ---------------------------------------------------------------------------


def test_delete_me_returns_204(client) -> None:
    _signup(client, email="delete@example.com")
    token = _login_form(client, email="delete@example.com", password="password123").json()["access_token"]
    resp = client.delete("/api/auth/me", headers=_auth_headers(token))
    assert resp.status_code == 204


def test_delete_me_token_unusable_after_deletion(client) -> None:
    _signup(client, email="gone@example.com")
    token = _login_form(client, email="gone@example.com", password="password123").json()["access_token"]
    client.delete("/api/auth/me", headers=_auth_headers(token))
    # Token still cryptographically valid, but user no longer in DB
    resp = client.get("/api/auth/me", headers=_auth_headers(token))
    assert resp.status_code == 401


def test_delete_me_without_token_returns_401(client) -> None:
    resp = client.delete("/api/auth/me")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Cross-user isolation
# ---------------------------------------------------------------------------


def test_token_cannot_access_other_users_data(client) -> None:
    """A valid token for user A cannot be used to act as user B."""
    _signup(client, email="alice@example.com", password="alicepass1")
    token_a = _login_form(client, email="alice@example.com", password="alicepass1").json()["access_token"]

    _signup(client, email="bob@example.com", password="bobpass123")
    token_b = _login_form(client, email="bob@example.com", password="bobpass123").json()["access_token"]

    me_a = client.get("/api/auth/me", headers=_auth_headers(token_a)).json()
    me_b = client.get("/api/auth/me", headers=_auth_headers(token_b)).json()

    assert me_a["id"] != me_b["id"]
    assert me_a["email"] == "alice@example.com"
    assert me_b["email"] == "bob@example.com"
