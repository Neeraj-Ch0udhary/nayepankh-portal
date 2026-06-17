from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from db.supabase_client import supabase
import qrcode
import base64
from io import BytesIO

events_bp = Blueprint("events", __name__)


@events_bp.route("/", methods=["GET"])
def get_events():
    result = supabase.table("events").select("*").order("date").execute()
    return jsonify(result.data), 200


@events_bp.route("/", methods=["POST"])
@jwt_required()
def create_event():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin only"}), 403

    user_id = get_jwt_identity()
    data = request.get_json()

    result = supabase.table("events").insert({
        "title": data.get("title"),
        "description": data.get("description"),
        "date": data.get("date"),
        "location": data.get("location"),
        "total_slots": data.get("total_slots", 10),
        "created_by": user_id
    }).execute()

    event = result.data[0]

    qr = qrcode.make(f"nayepankh://checkin/{event['id']}")
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    supabase.table("events").update({"qr_code": qr_base64}).eq("id", event["id"]).execute()
    event["qr_code"] = qr_base64

    return jsonify(event), 201


@events_bp.route("/<event_id>/register", methods=["POST"])
@jwt_required()
def register_event(event_id):
    user_id = get_jwt_identity()

    event = supabase.table("events").select("*").eq("id", event_id).execute()
    if not event.data:
        return jsonify({"error": "Event not found"}), 404

    event = event.data[0]
    if event["filled_slots"] >= event["total_slots"]:
        return jsonify({"error": "Event is full"}), 400

    existing = supabase.table("event_registrations").select("id").eq("event_id", event_id).eq("user_id", user_id).execute()
    if existing.data:
        return jsonify({"error": "Already registered"}), 409

    supabase.table("event_registrations").insert({
        "event_id": event_id,
        "user_id": user_id
    }).execute()

    supabase.table("events").update({"filled_slots": event["filled_slots"] + 1}).eq("id", event_id).execute()

    return jsonify({"message": "Registered successfully"}), 201


@events_bp.route("/<event_id>/checkin", methods=["POST"])
@jwt_required()
def checkin(event_id):
    user_id = get_jwt_identity()

    reg = supabase.table("event_registrations").select("*").eq("event_id", event_id).eq("user_id", user_id).execute()
    if not reg.data:
        return jsonify({"error": "Not registered for this event"}), 404

    supabase.table("event_registrations").update({"attended": True}).eq("event_id", event_id).eq("user_id", user_id).execute()

    return jsonify({"message": "Check-in successful"}), 200


@events_bp.route("/my", methods=["GET"])
@jwt_required()
def my_events():
    user_id = get_jwt_identity()
    regs = supabase.table("event_registrations").select("event_id, attended, registered_at").eq("user_id", user_id).execute()

    result = []
    for r in regs.data:
        event = supabase.table("events").select("*").eq("id", r["event_id"]).execute()
        if event.data:
            result.append({**event.data[0], "attended": r["attended"]})

    return jsonify(result), 200