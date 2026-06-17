from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from db.supabase_client import supabase
from groq import Groq
import os
import csv
import io

admin_bp = Blueprint("admin", __name__)
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    total_volunteers = len(supabase.table("users").select("id").eq("role", "volunteer").execute().data)
    total_tasks = len(supabase.table("tasks").select("id").execute().data)
    completed_tasks = len(supabase.table("tasks").select("id").eq("status", "completed").execute().data)
    total_events = len(supabase.table("events").select("id").execute().data)
    total_donations = supabase.table("donations").select("amount").execute()
    donation_sum = sum(d["amount"] for d in total_donations.data)
    certificates_issued = len(supabase.table("certificates").select("id").execute().data)

    return jsonify({
        "total_volunteers": total_volunteers,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "total_events": total_events,
        "total_donations": donation_sum,
        "certificates_issued": certificates_issued
    }), 200


@admin_bp.route("/volunteers/export", methods=["GET"])
@jwt_required()
def export_volunteers():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    profiles = supabase.table("volunteer_profiles").select("*").execute()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Email", "City", "Phone", "Skills", "Availability", "Tasks Completed"])

    for p in profiles.data:
        user = supabase.table("users").select("name, email").eq("id", p["user_id"]).execute()
        if user.data:
            writer.writerow([
                user.data[0]["name"],
                user.data[0]["email"],
                p["city"],
                p["phone"],
                ", ".join(p["skills"] or []),
                p["availability"],
                p["tasks_completed"]
            ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=volunteers.csv"}
    )


@admin_bp.route("/generate-content", methods=["POST"])
@jwt_required()
def generate_content():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    data = request.get_json()
    topic = data.get("topic", "")
    platform = data.get("platform", "Instagram")

    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    prompt = f"""
You are a social media content creator for NayePankh Foundation, a UP Government registered NGO 
that helps underprivileged people through food drives, clothes donation, education, and hygiene awareness.

Create an engaging {platform} post about: {topic}

Requirements:
- Warm, inspiring tone
- Include relevant emojis
- Add 5 relevant hashtags at the end
- Keep it under 200 words
- End with a call to action to volunteer or donate
"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400
    )

    content = response.choices[0].message.content.strip()
    return jsonify({"content": content}), 200


@admin_bp.route("/tasks/applications", methods=["GET"])
@jwt_required()
def get_applications():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    apps = supabase.table("task_applications").select("*").eq("status", "pending").execute()
    result = []
    for a in apps.data:
        task = supabase.table("tasks").select("title").eq("id", a["task_id"]).execute()
        user = supabase.table("users").select("name, email").eq("id", a["user_id"]).execute()
        if task.data and user.data:
            result.append({
                **a,
                "task_title": task.data[0]["title"],
                "volunteer_name": user.data[0]["name"],
                "volunteer_email": user.data[0]["email"]
            })

    return jsonify(result), 200


@admin_bp.route("/tasks/applications/<app_id>", methods=["PUT"])
@jwt_required()
def update_application(app_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    data = request.get_json()
    status = data.get("status")

    app = supabase.table("task_applications").select("*").eq("id", app_id).execute()
    if not app.data:
        return jsonify({"error": "Application not found"}), 404

    supabase.table("task_applications").update({"status": status}).eq("id", app_id).execute()

    if status == "accepted":
        supabase.table("tasks").update({
            "assigned_to": app.data[0]["user_id"],
            "status": "assigned"
        }).eq("id", app.data[0]["task_id"]).execute()

    return jsonify({"message": f"Application {status}"}), 200