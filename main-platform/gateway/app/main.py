import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from .router import router as api_router

# Determine the project root (two levels up from this file)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

app = FastAPI(title="Unified Downloader Gateway")

# Include the API router first
app.include_router(api_router)

# Friendly convenience shortcuts
@app.get("/downloader")
async def to_dl(): return RedirectResponse(url="/#downloader-section")
@app.get("/youtube")
async def to_yt(): return RedirectResponse(url="/pages/youtube.html")
@app.get("/tiktok")
async def to_tt(): return RedirectResponse(url="/pages/tiktok.html")
@app.get("/instagram")
async def to_ig(): return RedirectResponse(url="/pages/instagram.html")
@app.get("/facebook")
async def to_fb(): return RedirectResponse(url="/pages/facebook.html")
@app.get("/twitter")
async def to_tw(): return RedirectResponse(url="/pages/twitter.html")
@app.get("/snapchat")
async def to_sc(): return RedirectResponse(url="/pages/snapchat.html")
@app.get("/pinterest")
async def to_pin(): return RedirectResponse(url="/pages/pinterest.html")
@app.get("/reddit")
async def to_red(): return RedirectResponse(url="/pages/reddit.html")
@app.get("/threads")
async def to_thr(): return RedirectResponse(url="/pages/threads.html")
@app.get("/twitch")
async def to_twt(): return RedirectResponse(url="/pages/twitch.html")
@app.get("/blog")
async def to_blog(): return RedirectResponse(url="/pages/blog.html")
@app.get("/about")
async def to_about(): return RedirectResponse(url="/pages/about.html")
@app.get("/contact")
async def to_contact(): return RedirectResponse(url="/pages/contact.html")
@app.get("/privacy-policy")
async def to_privacy(): return RedirectResponse(url="/pages/privacy-policy.html")
@app.get("/terms-of-service")
async def to_terms(): return RedirectResponse(url="/pages/terms-of-service.html")
@app.get("/copyright")
async def to_copyright(): return RedirectResponse(url="/pages/copyright.html")
@app.get("/disclaimer")
async def to_disclaimer(): return RedirectResponse(url="/pages/disclaimer.html")

# Mount static and pages if they exist
static_dir = os.path.join(FRONTEND_DIR, "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static_assets")

pages_dir = os.path.join(FRONTEND_DIR, "pages")
if os.path.exists(pages_dir):
    app.mount("/pages", StaticFiles(directory=pages_dir, html=True), name="pages")

# Mount the frontend static files. ``html=True`` serves index.html
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
