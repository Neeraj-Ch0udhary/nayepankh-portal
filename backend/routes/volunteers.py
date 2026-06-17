from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from db.supabase_client import supabase

volunteers_bp = Blueprint("volunteers", __name__)


@volunteers_bp.route("/profile", methods=["POST"])
@jwt_required()
def create_profile():
    user_id = get_jwt_identity()
    data = request.get_json()

    existing = supabase.table("volunteer_profiles").select("id").eq("user_id", user_id).execute()
    if existing.data:
        return jsonify({"error": "Profile already exists"}), 409

    result = supabase.table("volunteer_profiles").insert({
        "user_id": user_id,
        "city": data.get("city", ""),
        "phone": data.get("phone", ""),
        "skills": data.get("skills", []),
        "availability": data.get("availability", "weekends"),
        "bio": data.get("bio", "")
    }).execute()

    return jsonify(result.data[0]), 201


@volunteers_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_my_profile():
    user_id = get_jwt_identity()
    result = supabase.table("volunteer_profiles").select("*").eq("user_id", user_id).execute()
    if not result.data:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(result.data[0]), 200


@volunteers_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()

    result = supabase.table("volunteer_profiles").update({
        "city": data.get("city"),
        "phone": data.get("phone"),
        "skills": data.get("skills"),
        "availability": data.get("availability"),
        "bio": data.get("bio")
    }).eq("user_id", user_id).execute()

    return jsonify(result.data[0]), 200


@volunteers_bp.route("/leaderboard", methods=["GET"])
def leaderboard():
    profiles = supabase.table("volunteer_profiles").select("user_id, tasks_completed, city").order("tasks_completed", desc=True).limit(10).execute()

    result = []
    for p in profiles.data:
        user = supabase.table("users").select("name").eq("id", p["user_id"]).execute()
        if user.data:
            result.append({
                "name": user.data[0]["name"],
                "tasks_completed": p["tasks_completed"],
                "city": p["city"]
            })

    return jsonify(result), 200


@volunteers_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_volunteers():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    profiles = supabase.table("volunteer_profiles").select("*").execute()
    result = []
    for p in profiles.data:
        user = supabase.table("users").select("name, email").eq("id", p["user_id"]).execute()
        if user.data:
            result.append({**p, **user.data[0]})

    return jsonify(result), 200