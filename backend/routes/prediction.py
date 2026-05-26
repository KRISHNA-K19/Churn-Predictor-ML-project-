from fastapi import APIRouter
from app.schemas import CustomerInput, PredictionOutput
from services.predictor import predict_churn

router = APIRouter()

@router.post("/predict", response_model=PredictionOutput)
def predict(customer: CustomerInput):
    data = customer.dict()
    result = predict_churn(data)
    return result