from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from db.supabase_client import supabase
import os
from groq import Groq
import re
tasks_bp = Blueprint("tasks", __name__)
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@tasks_bp.route("/", methods=["GET"])
def get_tasks():
    status = request.args.get("status", None)
    query = supabase.table("tasks").select("*").order("created_at", desc=True)
    if status:
        query = query.eq("status", status)
    result = query.execute()
    return jsonify(result.data), 200


@tasks_bp.route("/", methods=["POST"])
@jwt_required()
def create_task():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    user_id = get_jwt_identity()
    data = request.get_json()
    result = supabase.table("tasks").insert({
        "title": data.get("title"),
        "description": data.get("description"),
        "required_skills": data.get("required_skills", []),
        "due_date": data.get("due_date"),
        "created_by": user_id
    }).execute()

    return jsonify(result.data[0]), 201


@tasks_bp.route("/<task_id>/apply", methods=["POST"])
@jwt_required()
def apply_task(task_id):
    user_id = get_jwt_identity()

    existing = supabase.table("task_applications").select("id").eq("task_id", task_id).eq("user_id", user_id).execute()
    if existing.data:
        return jsonify({"error": "Already applied"}), 409

    supabase.table("task_applications").insert({
        "task_id": task_id,
        "user_id": user_id
    }).execute()

    return jsonify({"message": "Applied successfully"}), 201


@tasks_bp.route("/my", methods=["GET"])
@jwt_required()
def my_tasks():
    user_id = get_jwt_identity()
    result = supabase.table("tasks").select("*").eq("assigned_to", user_id).execute()
    return jsonify(result.data), 200


@tasks_bp.route("/<task_id>/complete", methods=["POST"])
@jwt_required()
def complete_task(task_id):
    user_id = get_jwt_identity()
    claims = get_jwt()

    task = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not task.data:
        return jsonify({"error": "Task not found"}), 404
    if task.data[0]["assigned_to"] != user_id and claims.get("role") != "admin":
        return jsonify({"error": "Not authorized"}), 403

    supabase.table("tasks").update({"status": "completed"}).eq("id", task_id).execute()

    profile = supabase.table("volunteer_profiles").select("tasks_completed").eq("user_id", task.data[0]["assigned_to"]).execute()
    if profile.data:
        new_count = profile.data[0]["tasks_completed"] + 1
        supabase.table("volunteer_profiles").update({"tasks_completed": new_count}).eq("user_id", task.data[0]["assigned_to"]).execute()

        if new_count >= 5:
            existing_cert = supabase.table("certificates").select("id").eq("user_id", task.data[0]["assigned_to"]).execute()
            if not existing_cert.data:
                supabase.table("certificates").insert({"user_id": task.data[0]["assigned_to"]}).execute()

    return jsonify({"message": "Task marked complete"}), 200


@tasks_bp.route("/<task_id>/ai-assign", methods=["POST"])
@jwt_required()
def ai_assign(task_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    task = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not task.data:
        return jsonify({"error": "Task not found"}), 404
    task = task.data[0]

    volunteers = supabase.table("volunteer_profiles").select("*").execute()
    if not volunteers.data:
        return jsonify({"error": "No volunteers found"}), 404

    volunteer_list = []
    for v in volunteers.data:
        user = supabase.table("users").select("name, email").eq("id", v["user_id"]).execute()
        if user.data:
            volunteer_list.append({
                "user_id": v["user_id"],
                "name": user.data[0]["name"],
                "skills": v["skills"],
                "city": v["city"],
                "availability": v["availability"],
                "tasks_completed": v["tasks_completed"]
            })

    prompt = f"""
You are an AI agent for NayePankh Foundation, an NGO.
Your job is to assign the best volunteer for a task based on skills match.

Task:
- Title: {task['title']}
- Description: {task['description']}
- Required Skills: {task['required_skills']}

Volunteers:
{volunteer_list}

Return ONLY the user_id of the best matching volunteer. Nothing else.
"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150
    )

    raw_output = response.choices[0].message.content.strip()
    uuid_match = re.search(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", raw_output)

    if not uuid_match:
        return jsonify({"error": "AI could not determine a match", "raw_output": raw_output}), 500

    best_user_id = uuid_match.group(0)
    supabase.table("tasks").update({
        "assigned_to": best_user_id,
        "status": "assigned"
    }).eq("id", task_id).execute()

    assigned_volunteer = next((v for v in volunteer_list if v["user_id"] == best_user_id), None)

    return jsonify({
        "message": "Task assigned by AI",
        "assigned_to": assigned_volunteer
    }), 200