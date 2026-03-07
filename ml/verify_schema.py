import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
try:
    sb = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_KEY"))
    print("Testing persona_confidence insert on sessions table...")
    res = sb.table("sessions").update({"persona_confidence": 0.5}).eq("ip_hash", "test_hash").execute()
    print("Success: sessions table has persona_confidence column")
except Exception as e:
    print(f"Error checking column: {e}")
