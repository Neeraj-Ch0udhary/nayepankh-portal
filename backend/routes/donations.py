from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.supabase_client import supabase

donations_bp = Blueprint("donations", __name__)


@donations_bp.route("/", methods=["GET"])
def get_donations():
    result = supabase.table("donations").select("*").order("donated_at", desc=True).limit(20).execute()
    return jsonify(result.data), 200


@donations_bp.route("/", methods=["POST"])
def add_donation():
    data = request.get_json()

    if not data.get("donor_name") or not data.get("amount"):
        return jsonify({"error": "Donor name and amount are required"}), 400

    result = supabase.table("donations").insert({
        "donor_name": data.get("donor_name"),
        "amount": data.get("amount"),
        "category": data.get("category", "other"),
        "message": data.get("message", "")
    }).execute()

    return jsonify(result.data[0]), 201


@donations_bp.route("/stats", methods=["GET"])
def donation_stats():
    donations = supabase.table("donations").select("amount, category").execute()

    total = sum(d["amount"] for d in donations.data)
    by_category = {}
    for d in donations.data:
        cat = d["category"]
        by_category[cat] = by_category.get(cat, 0) + d["amount"]

    return jsonify({
        "total": total,
        "by_category": by_category,
        "count": len(donations.data)
    }), 200