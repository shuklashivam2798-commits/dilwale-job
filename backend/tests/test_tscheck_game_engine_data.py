"""API-bearing criteria: GET /api/game shape (arenas, attacks, vault) and attack detail lookups.

Covers:
- "Resume Power Vault" (21 cards P01-P21, 7 with source TCS, achieved count)
- "All nine deterministic outcomes" (9 father_attacks with proven/partial/learning outcomes,
  G1 evidence 1.5% -> 2.4% +60% relative, papa line present)
- GET /api/game/attacks/{id} 404 on unknown id
"""

import pytest


def test_game_engine_returns_core_shape(client):
    resp = client.get("/game")
    assert resp.status_code == 200, resp.text
    data = resp.json()

    arena_ids = [a["id"] for a in data["arenas"]]
    assert arena_ids == ["growth", "insight", "ownership"]

    attack_ids = sorted(a["id"] for a in data["father_attacks"])
    assert attack_ids == ["G1", "G2", "G3", "I1", "I2", "I3", "O1", "O2", "O3"]

    vault = data["resume_power_vault"]
    assert len(vault) == 21
    ids = sorted(c["id"] for c in vault)
    assert ids[0] == "P01" and ids[-1] == "P21"

    tcs_sourced = [c for c in vault if "TCS" in c.get("source", "")]
    assert len(tcs_sourced) == 7, f"expected 7 TCS-sourced vault cards, got {len(tcs_sourced)}"

    achieved = [c for c in vault if c.get("achievement_type") == "Achieved"]
    assert len(achieved) == 15, f"expected 15 achieved vault cards, got {len(achieved)}"


def test_father_attacks_have_nine_deterministic_outcomes(client):
    data = client.get("/game").json()
    attacks = {a["id"]: a for a in data["father_attacks"]}
    assert len(attacks) == 9

    expected_outcomes = {
        "G1": "proven", "G2": "proven", "G3": "learning",
        "I1": "proven", "I2": "proven", "I3": "learning",
        "O1": "proven", "O2": "partial", "O3": "learning",
    }
    for aid, outcome in expected_outcomes.items():
        assert attacks[aid]["outcome"] == outcome, f"{aid} outcome mismatch"
        assert attacks[aid].get("papa"), f"{aid} missing papa reaction line"

    g1 = attacks["G1"]
    assert "1.5%" in g1["evidence"] and "2.4%" in g1["evidence"] and "60%" in g1["evidence"]

    g3 = attacks["G3"]
    assert "learning" in g3 and g3["learning"]
    assert g3["papa"].startswith("Ek heart gaya!")


def test_attack_detail_lookup_and_404(client):
    resp = client.get("/game/attacks/G1")
    assert resp.status_code == 200, resp.text
    assert resp.json()["id"] == "G1"

    resp_404 = client.get("/game/attacks/tscheck-unknown-attack-id")
    assert resp_404.status_code == 404, resp_404.text
