from flask import Blueprint, render_template

index_bp = Blueprint("index", __name__)

@index_bp.route("/")
def home():
    return render_template("index.html")

@index_bp.route("/index.html")
def home_html():
    return render_template("index.html")
