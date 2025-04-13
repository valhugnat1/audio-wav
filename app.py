# app.py - Main application file
import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import shutil
from pathlib import Path

app = FastAPI()

# Ensure uploads directory exists
uploads_dir = Path("uploads")
if not uploads_dir.exists():
    uploads_dir.mkdir()

# Serve static files from the public directory
app.mount("/", StaticFiles(directory="public", html=True), name="public")

@app.post("/audio")
async def upload_audio(audio: UploadFile = File(...)):
    # Check if file is uploaded
    if not audio:
        raise HTTPException(status_code=400, detail="No audio file received")
    
    # Generate a unique filename with UUID
    file_id = f"{uuid.uuid4()}.wav"
    file_path = uploads_dir / file_id
    
    # Save the uploaded file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        print(f"File saved: {file_id}")
        return {"id": file_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)