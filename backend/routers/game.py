"""Read-only game engine API. The JSON file is the single source of truth (edit it, uvicorn reloads)."""

import json
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException

from models.game import Arena, FatherAttack, GameEngine, ResumePower

ENGINE_PATH = Path(__file__).parent.parent / "data" / "engine.json"

router = APIRouter(prefix="/game", tags=["game"])


def _real_url(value: object) -> str | None:
    return value if isinstance(value, str) and value.startswith(("http://", "https://")) else None


@lru_cache(maxsize=1)
def load_engine() -> GameEngine:
    raw = json.loads(ENGINE_PATH.read_text(encoding="utf-8"))
    links = raw.get("personal_links", {})
    raw["personal_links"] = {k: _real_url(links.get(k)) for k in ("cv_url", "linkedin_url", "contact_url")}
    return GameEngine.model_validate(raw)


@router.get("", response_model=GameEngine)
async def get_engine():
    return load_engine()


@router.get("/attacks/{attack_id}", response_model=FatherAttack)
async def get_attack(attack_id: str):
    for attack in load_engine().father_attacks:
        if attack.id.lower() == attack_id.lower():
            return attack
    raise HTTPException(status_code=404, detail="attack not found")


@router.get("/arenas/{arena_id}", response_model=Arena)
async def get_arena(arena_id: str):
    for arena in load_engine().arenas:
        if arena.id == arena_id:
            return arena
    raise HTTPException(status_code=404, detail="arena not found")


@router.get("/powers", response_model=list[ResumePower])
async def get_powers():
    return load_engine().resume_power_vault
