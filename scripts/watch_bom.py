import time
import os
import subprocess

EXCEL = "resources/excel/ER5215-301.xlsx"
JSON = "data/components.json"

last_mtime = os.path.getmtime(EXCEL)
print(f"Watching {EXCEL}... (Ctrl+C to stop)")

while True:
    time.sleep(1)
    current_mtime = os.path.getmtime(EXCEL)
    if current_mtime != last_mtime:
        last_mtime = current_mtime
        subprocess.run(["python", "scripts/export_bom.py"])
        print("Exported!")
