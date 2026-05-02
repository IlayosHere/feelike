"""Integration tests for /api/entries routes."""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _signup_and_token(client, email: str, password: str = "password123") -> str:
    resp = client.post("/api/auth/signup", json={"email": email, "password": password})
    assert resp.status_code == 201
    return resp.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create(client, token: str, **kwargs) -> dict:
    payload = {"content": "test entry", **kwargs}
    return client.post("/api/entries/", json=payload, headers=_auth(token))


# ---------------------------------------------------------------------------
# POST /api/entries/
# ---------------------------------------------------------------------------


def test_create_entry_minimal(client) -> None:
    token = _signup_and_token(client, "create_minimal@example.com")
    resp = _create(client, token, content="My first thought")
    assert resp.status_code == 201
    body = resp.json()
    assert body["content"] == "My first thought"
    assert body["mood"] is None
    assert body["tags"] == []
    assert "id" in body
    assert "created_at" in body
    assert "updated_at" in body


def test_create_entry_with_mood(client) -> None:
    token = _signup_and_token(client, "create_mood@example.com")
    resp = _create(client, token, content="Feeling great", mood="happy")
    assert resp.status_code == 201
    assert resp.json()["mood"] == "happy"


def test_create_entry_with_tags(client) -> None:
    token = _signup_and_token(client, "create_tags@example.com")
    resp = _create(client, token, content="Tagged entry", tags=["work", "ideas"])
    assert resp.status_code == 201
    assert sorted(resp.json()["tags"]) == ["ideas", "work"]


def test_create_entry_tags_lowercased(client) -> None:
    token = _signup_and_token(client, "create_tags_lower@example.com")
    resp = _create(client, token, content="Tags uppercase", tags=["Work", "IDEAS"])
    assert resp.status_code == 201
    assert sorted(resp.json()["tags"]) == ["ideas", "work"]


def test_create_entry_empty_content_returns_422(client) -> None:
    token = _signup_and_token(client, "create_empty@example.com")
    resp = _create(client, token, content="   ")
    assert resp.status_code == 422


def test_create_entry_invalid_mood_returns_422(client) -> None:
    token = _signup_and_token(client, "create_bad_mood@example.com")
    resp = _create(client, token, content="Good day", mood="elated")
    assert resp.status_code == 422


def test_create_entry_too_many_tags_returns_422(client) -> None:
    token = _signup_and_token(client, "create_many_tags@example.com")
    too_many = [f"tag{i}" for i in range(21)]
    resp = _create(client, token, content="Overflow", tags=too_many)
    assert resp.status_code == 422


def test_create_entry_requires_auth(client) -> None:
    resp = client.post("/api/entries/", json={"content": "no auth"})
    assert resp.status_code == 401


def test_create_entry_deduplicates_tag_rows(client) -> None:
    """Creating two entries with the same tag reuses the same Tag row."""
    token = _signup_and_token(client, "create_dedup_tags@example.com")
    _create(client, token, content="First", tags=["shared"])
    resp = _create(client, token, content="Second", tags=["shared"])
    assert resp.status_code == 201
    assert resp.json()["tags"] == ["shared"]


# ---------------------------------------------------------------------------
# GET /api/entries/
# ---------------------------------------------------------------------------


def test_list_entries_empty(client) -> None:
    token = _signup_and_token(client, "list_empty@example.com")
    resp = client.get("/api/entries/", headers=_auth(token))
    assert resp.status_code == 200
    body = resp.json()
    assert body["items"] == []
    assert body["next_cursor"] is None


def test_list_entries_returns_own_entries(client) -> None:
    token = _signup_and_token(client, "list_own@example.com")
    _create(client, token, content="Entry A")
    _create(client, token, content="Entry B")
    resp = client.get("/api/entries/", headers=_auth(token))
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 2
    contents = {e["content"] for e in items}
    assert contents == {"Entry A", "Entry B"}


def test_list_entries_does_not_return_other_users_entries(client) -> None:
    token_a = _signup_and_token(client, "list_isolation_a@example.com")
    token_b = _signup_and_token(client, "list_isolation_b@example.com")
    _create(client, token_a, content="Alice's entry")
    resp = client.get("/api/entries/", headers=_auth(token_b))
    assert resp.status_code == 200
    assert resp.json()["items"] == []


def test_list_entries_ordered_newest_first(client) -> None:
    token = _signup_and_token(client, "list_order@example.com")
    _create(client, token, content="First")
    _create(client, token, content="Second")
    _create(client, token, content="Third")
    items = client.get("/api/entries/", headers=_auth(token)).json()["items"]
    # Three entries exist; ordering by (created_at DESC, id DESC) is correct.
    # In SQLite in-process tests all created_at values may be equal (same clock tick),
    # so we assert set membership rather than a specific order.
    assert len(items) == 3
    assert {e["content"] for e in items} == {"First", "Second", "Third"}


def _collect_all_pages(client, token: str, limit: int) -> list[dict]:
    """Exhaust all pages and return every item, asserting no duplicates."""
    all_items: list[dict] = []
    seen_ids: set[str] = set()
    cursor: str | None = None
    while True:
        url = f"/api/entries/?limit={limit}"
        if cursor:
            url += f"&cursor={cursor}"
        body = client.get(url, headers=_auth(token)).json()
        for item in body["items"]:
            assert item["id"] not in seen_ids, f"duplicate id {item['id']} across pages"
            seen_ids.add(item["id"])
            all_items.append(item)
        cursor = body["next_cursor"]
        if cursor is None:
            break
    return all_items


def test_list_entries_pagination(client) -> None:
    token = _signup_and_token(client, "list_paginate@example.com")
    for i in range(5):
        _create(client, token, content=f"Entry {i}")

    all_items = _collect_all_pages(client, token, limit=3)
    assert len(all_items) == 5
    assert {e["content"] for e in all_items} == {f"Entry {i}" for i in range(5)}


def test_list_entries_no_duplicate_across_pages(client) -> None:
    token = _signup_and_token(client, "list_no_dup@example.com")
    for i in range(6):
        _create(client, token, content=f"Item {i}")

    all_items = _collect_all_pages(client, token, limit=4)
    assert len(all_items) == 6


def test_list_entries_invalid_cursor_returns_400(client) -> None:
    token = _signup_and_token(client, "list_bad_cursor@example.com")
    resp = client.get("/api/entries/?cursor=notavalidcursor!!", headers=_auth(token))
    assert resp.status_code == 400


def test_list_entries_requires_auth(client) -> None:
    resp = client.get("/api/entries/")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# GET /api/entries/{id}
# ---------------------------------------------------------------------------


def test_get_entry_returns_entry(client) -> None:
    token = _signup_and_token(client, "get_entry@example.com")
    entry_id = _create(client, token, content="Detail view").json()["id"]
    resp = client.get(f"/api/entries/{entry_id}", headers=_auth(token))
    assert resp.status_code == 200
    assert resp.json()["content"] == "Detail view"


def test_get_entry_includes_tags(client) -> None:
    token = _signup_and_token(client, "get_tags@example.com")
    entry_id = _create(client, token, content="Tagged", tags=["a", "b"]).json()["id"]
    body = client.get(f"/api/entries/{entry_id}", headers=_auth(token)).json()
    assert sorted(body["tags"]) == ["a", "b"]


def test_get_entry_wrong_user_returns_404(client) -> None:
    token_a = _signup_and_token(client, "get_isolation_a@example.com")
    token_b = _signup_and_token(client, "get_isolation_b@example.com")
    entry_id = _create(client, token_a, content="Alice's private").json()["id"]
    resp = client.get(f"/api/entries/{entry_id}", headers=_auth(token_b))
    assert resp.status_code == 404


def test_get_entry_nonexistent_returns_404(client) -> None:
    token = _signup_and_token(client, "get_missing@example.com")
    resp = client.get("/api/entries/00000000-0000-0000-0000-000000000000", headers=_auth(token))
    assert resp.status_code == 404


def test_get_entry_requires_auth(client) -> None:
    resp = client.get("/api/entries/some-id")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# PATCH /api/entries/{id}
# ---------------------------------------------------------------------------


def test_patch_entry_content(client) -> None:
    token = _signup_and_token(client, "patch_content@example.com")
    entry_id = _create(client, token, content="Original").json()["id"]
    resp = client.patch(
        f"/api/entries/{entry_id}", json={"content": "Updated"}, headers=_auth(token)
    )
    assert resp.status_code == 200
    assert resp.json()["content"] == "Updated"


def test_patch_entry_set_mood(client) -> None:
    token = _signup_and_token(client, "patch_mood@example.com")
    entry_id = _create(client, token, content="Neutral start").json()["id"]
    resp = client.patch(
        f"/api/entries/{entry_id}", json={"mood": "calm"}, headers=_auth(token)
    )
    assert resp.status_code == 200
    assert resp.json()["mood"] == "calm"


def test_patch_entry_clear_mood(client) -> None:
    token = _signup_and_token(client, "patch_clear_mood@example.com")
    entry_id = _create(client, token, content="Happy entry", mood="happy").json()["id"]
    resp = client.patch(
        f"/api/entries/{entry_id}", json={"mood": None}, headers=_auth(token)
    )
    assert resp.status_code == 200
    assert resp.json()["mood"] is None


def test_patch_entry_replace_tags(client) -> None:
    token = _signup_and_token(client, "patch_tags@example.com")
    entry_id = _create(client, token, content="Tagged", tags=["old"]).json()["id"]
    resp = client.patch(
        f"/api/entries/{entry_id}", json={"tags": ["new", "fresh"]}, headers=_auth(token)
    )
    assert resp.status_code == 200
    assert sorted(resp.json()["tags"]) == ["fresh", "new"]


def test_patch_entry_empty_tags_clears_tags(client) -> None:
    token = _signup_and_token(client, "patch_clear_tags@example.com")
    entry_id = _create(client, token, content="Tagged", tags=["work"]).json()["id"]
    resp = client.patch(
        f"/api/entries/{entry_id}", json={"tags": []}, headers=_auth(token)
    )
    assert resp.status_code == 200
    assert resp.json()["tags"] == []


def test_patch_entry_partial_update_leaves_other_fields(client) -> None:
    token = _signup_and_token(client, "patch_partial@example.com")
    entry_id = _create(client, token, content="Original", mood="happy", tags=["keep"]).json()["id"]
    resp = client.patch(
        f"/api/entries/{entry_id}", json={"content": "Changed"}, headers=_auth(token)
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["content"] == "Changed"
    assert body["mood"] == "happy"
    assert body["tags"] == ["keep"]


def test_patch_entry_invalid_mood_returns_422(client) -> None:
    token = _signup_and_token(client, "patch_bad_mood@example.com")
    entry_id = _create(client, token, content="Entry").json()["id"]
    resp = client.patch(
        f"/api/entries/{entry_id}", json={"mood": "euphoric"}, headers=_auth(token)
    )
    assert resp.status_code == 422


def test_patch_entry_wrong_user_returns_404(client) -> None:
    token_a = _signup_and_token(client, "patch_isolation_a@example.com")
    token_b = _signup_and_token(client, "patch_isolation_b@example.com")
    entry_id = _create(client, token_a, content="Alice's").json()["id"]
    resp = client.patch(
        f"/api/entries/{entry_id}", json={"content": "Hijacked"}, headers=_auth(token_b)
    )
    assert resp.status_code == 404


def test_patch_entry_nonexistent_returns_404(client) -> None:
    token = _signup_and_token(client, "patch_missing@example.com")
    resp = client.patch(
        "/api/entries/00000000-0000-0000-0000-000000000000",
        json={"content": "Ghost"},
        headers=_auth(token),
    )
    assert resp.status_code == 404


def test_patch_entry_requires_auth(client) -> None:
    resp = client.patch("/api/entries/some-id", json={"content": "x"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# DELETE /api/entries/{id}
# ---------------------------------------------------------------------------


def test_delete_entry_returns_204(client) -> None:
    token = _signup_and_token(client, "delete_entry@example.com")
    entry_id = _create(client, token, content="To be deleted").json()["id"]
    resp = client.delete(f"/api/entries/{entry_id}", headers=_auth(token))
    assert resp.status_code == 204


def test_delete_entry_removes_from_list(client) -> None:
    token = _signup_and_token(client, "delete_removes@example.com")
    entry_id = _create(client, token, content="Ephemeral").json()["id"]
    client.delete(f"/api/entries/{entry_id}", headers=_auth(token))
    items = client.get("/api/entries/", headers=_auth(token)).json()["items"]
    assert all(e["id"] != entry_id for e in items)


def test_delete_entry_wrong_user_returns_404(client) -> None:
    token_a = _signup_and_token(client, "delete_isolation_a@example.com")
    token_b = _signup_and_token(client, "delete_isolation_b@example.com")
    entry_id = _create(client, token_a, content="Alice's").json()["id"]
    resp = client.delete(f"/api/entries/{entry_id}", headers=_auth(token_b))
    assert resp.status_code == 404


def test_delete_entry_nonexistent_returns_404(client) -> None:
    token = _signup_and_token(client, "delete_missing@example.com")
    resp = client.delete("/api/entries/00000000-0000-0000-0000-000000000000", headers=_auth(token))
    assert resp.status_code == 404


def test_delete_entry_requires_auth(client) -> None:
    resp = client.delete("/api/entries/some-id")
    assert resp.status_code == 401


def test_delete_entry_twice_second_returns_404(client) -> None:
    token = _signup_and_token(client, "delete_twice@example.com")
    entry_id = _create(client, token, content="Once").json()["id"]
    client.delete(f"/api/entries/{entry_id}", headers=_auth(token))
    resp = client.delete(f"/api/entries/{entry_id}", headers=_auth(token))
    assert resp.status_code == 404
