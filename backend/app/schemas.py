from pydantic import BaseModel
from typing import Optional

class CustomerInput(BaseModel):
    tenure: float
    MonthlyCharges: float
    TotalCharges: Optional[float] = None
    gender: str = "Male"
    Partner: str = "No"
    Dependents: str = "No"
    PhoneService: str = "Yes"
    MultipleLines: str = "No"
    InternetService: str = "Fiber optic"
    OnlineSecurity: str = "No"
    OnlineBackup: str = "No"
    DeviceProtection: str = "No"
    TechSupport: str = "No"
    StreamingTV: str = "No"
    StreamingMovies: str = "No"
    Contract: str = "Month-to-month"
    PaperlessBilling: str = "Yes"
    PaymentMethod: str = "Electronic check"
    SeniorCitizen: int = 0

class PredictionOutput(BaseModel):
    churn_probability: float
    risk_level: str
    top_reasons: list