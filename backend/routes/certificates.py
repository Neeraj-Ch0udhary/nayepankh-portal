from flask import Blueprint, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.supabase_client import supabase
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from io import BytesIO
from datetime import datetime

certificates_bp = Blueprint("certificates", __name__)


@certificates_bp.route("/check", methods=["GET"])
@jwt_required()
def check_certificate():
    user_id = get_jwt_identity()

    profile = supabase.table("volunteer_profiles").select("tasks_completed").eq("user_id", user_id).execute()
    if not profile.data:
        return jsonify({"eligible": False, "tasks_completed": 0, "tasks_needed": 5}), 200

    tasks_completed = profile.data[0]["tasks_completed"]
    cert = supabase.table("certificates").select("id, issued_at").eq("user_id", user_id).execute()

    return jsonify({
        "eligible": tasks_completed >= 5,
        "tasks_completed": tasks_completed,
        "tasks_needed": max(0, 5 - tasks_completed),
        "certificate_issued": bool(cert.data),
        "issued_at": cert.data[0]["issued_at"] if cert.data else None
    }), 200


@certificates_bp.route("/download", methods=["GET"])
@jwt_required()
def download_certificate():
    user_id = get_jwt_identity()

    profile = supabase.table("volunteer_profiles").select("tasks_completed").eq("user_id", user_id).execute()
    if not profile.data or profile.data[0]["tasks_completed"] < 5:
        return jsonify({"error": "Complete 5 tasks to get your certificate"}), 403

    user = supabase.table("users").select("name").eq("id", user_id).execute()
    if not user.data:
        return jsonify({"error": "User not found"}), 404

    name = user.data[0]["name"]
    date = datetime.now().strftime("%B %d, %Y")

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("title", fontSize=36, alignment=TA_CENTER, textColor=colors.HexColor("#1a6b3c"), spaceAfter=20, fontName="Helvetica-Bold")
    subtitle_style = ParagraphStyle("subtitle", fontSize=16, alignment=TA_CENTER, textColor=colors.grey, spaceAfter=30)
    name_style = ParagraphStyle("name", fontSize=28, alignment=TA_CENTER, textColor=colors.HexColor("#2d2d2d"), spaceAfter=20, fontName="Helvetica-Bold")
    body_style = ParagraphStyle("body", fontSize=14, alignment=TA_CENTER, textColor=colors.HexColor("#444444"), spaceAfter=10)
    date_style = ParagraphStyle("date", fontSize=12, alignment=TA_CENTER, textColor=colors.grey)

    content = [
        Spacer(1, 30),
        Paragraph("NayePankh Foundation", title_style),
        Paragraph("Certificate of Volunteer Appreciation", subtitle_style),
        Spacer(1, 20),
        Paragraph("This is to certify that", body_style),
        Paragraph(name, name_style),
        Paragraph("has successfully completed volunteer tasks and made a meaningful contribution", body_style),
        Paragraph("to the upliftment of underprivileged communities through NayePankh Foundation.", body_style),
        Spacer(1, 30),
        Paragraph(f"Issued on: {date}", date_style),
        Spacer(1, 20),
        Paragraph("UP Government Registered NGO | 80G & 12A Certified", date_style),
    ]

    doc.build(content)
    buffer.seek(0)

    return Response(
        buffer.getvalue(),
        mimetype="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=certificate_{name}.pdf"}
    )