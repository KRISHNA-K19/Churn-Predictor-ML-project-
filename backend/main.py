from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.prediction import router as prediction_router

app = FastAPI(
    title="Churn Prediction API",
    description="AI-based customer churn prediction with explainability",
    version="1.0.0"
)

# Allow frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {"status": "running", "message": "Churn Prediction API is live"}