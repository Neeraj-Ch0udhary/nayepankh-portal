from supabase import create_client, Client
from supabase.lib.client_options import SyncClientOptions
from dotenv import load_dotenv
import httpx
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env")

options = SyncClientOptions(
    httpx_client=httpx.Client(http2=False, timeout=30)
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY, options=options)