AI-Based Customer Churn Prediction & Retention Analytics Platform


An end-to-end, industry-level machine learning platform that predicts customer churn, explains why customers leave, and recommends personalized retention actions — all through a real-time REST API and interactive dashboard.


📌 Table of Contents

Project Overview
Live Demo
Key Features
Business Insights
Project Architecture
Tech Stack
Folder Structure
ML Model Performance
API Reference
Installation & Setup
Docker Deployment
Screenshots
Resume Bullet Points


📖 Project Overview
Customer churn — when customers stop doing business with a company — is one of the most costly problems in any subscription-based business. Acquiring a new customer costs 5x more than retaining an existing one.
This platform solves the problem end-to-end:
StageWhat it doesPredictIdentifies which customers are likely to churnExplainUses SHAP to show exactly WHY a customer is at riskRecommendSuggests personalized retention actionsVisualizeDisplays business insights through an interactive dashboard
Built on the IBM Telco Customer Churn Dataset — an industry-standard dataset used by data scientists worldwide.

🌐 Live Demo
ServiceURL🖥️ Frontend Dashboardhttps://your-app.vercel.app⚡ Backend APIhttps://your-api.onrender.com📚 API Documentationhttps://your-api.onrender.com/docs

⚠️ Free tier backend may take 30 seconds to wake up on first request.


✨ Key Features
🤖 Machine Learning

Trains and compares 3 ML models: Logistic Regression, Random Forest, XGBoost
Evaluates across 5 metrics: Accuracy, Precision, Recall, F1-Score, ROC-AUC
Automatically selects and saves the best performing model

🔍 Explainable AI (XAI)

SHAP (SHapley Additive exPlanations) integration
Global feature importance — which factors drive churn overall
Per-customer explanations — exactly why THIS customer is at risk
Business-readable insights from model decisions

⚡ Real-Time Prediction API

FastAPI REST API with automatic Swagger documentation
Returns churn probability, risk level, and top contributing factors
Sub-second response time
CORS enabled for frontend integration

📊 Interactive Dashboard

Built with Next.js + Tailwind CSS + Recharts
Customer risk assessment with color-coded badges (Green/Yellow/Red)
SHAP feature importance visualization
AI-generated personalized retention recommendations
Prediction history tracking

🐳 Production Ready

Fully Dockerized with docker-compose
Deployed on Render (backend) and Vercel (frontend)
Environment-based configuration
CORS middleware for cross-origin requests


📊 Business Insights
Discovered from SHAP analysis on the IBM Telco dataset:
🔴 HIGH CHURN RISK FACTORS:
  • Month-to-month contracts → 3x higher churn rate than annual contracts
  • New customers with high charges → charges_per_tenure is #1 predictor
  • Fiber optic internet users → possible service quality dissatisfaction
  • Electronic check payment method → correlated with higher churn
  • No online security or tech support → customers feel unsupported

🟢 RETENTION FACTORS:
  • Two-year contract holders → most loyal customer segment
  • Customers with high total charges → long-term loyal customers
  • Tech support subscribers → feel supported, stay longer
  • Online security subscribers → higher engagement, lower churn
Recommended Retention Actions by Risk Level:
Risk LevelProbabilityAction🟢 Low< 30%Standard engagement, monitor monthly🟡 Medium30–60%Personalized email, loyalty reward offer🔴 High> 60%Immediate outreach, contract upgrade discount, account manager

🏗️ Project Architecture
[IBM Telco Dataset]
        ↓
[Data Preprocessing Pipeline]
  • Handle missing values
  • Encode categorical features
  • Feature engineering (charges_per_tenure, is_high_value, is_long_term)
        ↓
[ML Training Engine]
  • Logistic Regression
  • Random Forest
  • XGBoost  ← Best Model
        ↓
[Model Evaluation]
  • Accuracy, Precision, Recall, F1, ROC-AUC
  • ROC Curve Comparison
  • Best model auto-selected and saved
        ↓
[Explainable AI — SHAP]
  • Global feature importance
  • Per-customer SHAP force plots
        ↓
[FastAPI Prediction API]
  POST /api/v1/predict
  → churn_probability
  → risk_level
  → top_reasons (SHAP)
        ↓
[Next.js Dashboard]
  • Customer input form
  • Risk visualization
  • Retention recommendations
        ↓
[Docker + Render + Vercel]
  • Fully deployed and publicly accessible

🛠️ Tech Stack
Machine Learning
ToolPurposePandas + NumPyData processingScikit-learnLogistic Regression, Random Forest, preprocessingXGBoostGradient boosted trees (best model)SHAPExplainable AIMatplotlib + SeabornEDA visualizationsJoblibModel serialization
Backend
ToolPurposeFastAPIREST API frameworkUvicornASGI serverPydanticRequest/response validationPython 3.10+Runtime
Frontend
ToolPurposeNext.js 14React frameworkTailwind CSSStylingRechartsCharts and visualizationsAxiosAPI calls
DevOps
ToolPurposeDocker + Docker ComposeContainerizationRenderBackend deploymentVercelFrontend deploymentGit + GitHubVersion control

📁 Folder Structure
customer-churn-ai/
│
├── backend/
│   ├── app/
│   │   └── schemas.py          # Pydantic input/output models
│   ├── routes/
│   │   └── prediction.py       # API route handlers
│   ├── services/
│   │   └── predictor.py        # Core prediction + SHAP logic
│   └── main.py                 # FastAPI app entry point
│
├── frontend/
│   ├── app/
│   │   └── page.js             # Main dashboard UI
│   ├── Dockerfile
│   └── .env.local
│
├── ml/
│   ├── notebooks/
│   │   ├── 01_eda.ipynb                  # Exploratory Data Analysis
│   │   ├── 02_model_evaluation.ipynb     # Model comparison + ROC curves
│   │   └── 03_shap_explainability.ipynb  # SHAP analysis
│   ├── training/
│   │   └── train_models.py     # Train all 3 models
│   ├── saved_models/           # Trained .pkl files
│   │   ├── XGBoost.pkl
│   │   ├── Random_Forest.pkl
│   │   ├── Logistic_Regression.pkl
│   │   ├── best_model.pkl
│   │   ├── scaler.pkl
│   │   └── feature_names.pkl
│   └── preprocessing/
│       └── preprocess.py       # Data cleaning pipeline
│
├── data/
│   └── telco_churn.csv         # IBM Telco Dataset (not in git)
│
├── docker/
│   └── Dockerfile.backend
│
├── docker-compose.yml
├── requirements.txt
└── README.md

📈 ML Model Performance
Trained and evaluated on the IBM Telco Customer Churn Dataset (7,043 customers, 80/20 split):
ModelAccuracyPrecisionRecallF1-ScoreROC-AUCLogistic Regression80.55%66.89%52.94%59.10%84.59%Random Forest79.06%63.57%49.47%55.64%82.30%XGBoost77.93%59.52%52.67%55.89%81.88%

✅ Best Model selected by ROC-AUC: Logistic Regression (84.59%)
XGBoost used for SHAP explainability due to TreeExplainer compatibility.

Top SHAP Features (Most Important Predictors):
1. charges_per_tenure          → Monthly cost relative to tenure
2. Contract_Two year           → Long-term contract commitment
3. TotalCharges                → Overall customer value
4. MonthlyCharges              → Current billing amount
5. InternetService_Fiber optic → Service type

🔌 API Reference
Base URL
https://your-api.onrender.com/api/v1
POST /predict
Predicts churn probability for a single customer.
Request Body:
json{
  "tenure": 12,
  "MonthlyCharges": 80.0,
  "TotalCharges": 960.0,
  "Contract": "Month-to-month",
  "InternetService": "Fiber optic",
  "PaymentMethod": "Electronic check",
  "SeniorCitizen": 0,
  "gender": "Male",
  "Partner": "No",
  "Dependents": "No",
  "PhoneService": "Yes",
  "PaperlessBilling": "Yes"
}
Response:
json{
  "churn_probability": 0.4833,
  "risk_level": "Medium",
  "top_reasons": [
    {"feature": "charges_per_tenure", "importance": 1.5283},
    {"feature": "InternetService_Fiber optic", "importance": 0.6227},
    {"feature": "Contract_Two year", "importance": 0.2730},
    {"feature": "OnlineSecurity_Yes", "importance": 0.1997},
    {"feature": "MultipleLines_Yes", "importance": 0.1564}
  ]
}
Risk Levels:
LevelProbabilityColorLow< 30%🟢 GreenMedium30–60%🟡 YellowHigh> 60%🔴 Red
GET /
Health check endpoint.
json{"status": "running", "message": "Churn Prediction API is live"}

🚀 Installation & Setup
Prerequisites

Python 3.10+
Node.js 20+
Git

1. Clone the Repository
bashgit clone https://github.com/KRISHNA-K19/Churn-Predictor-ML-project-.git
cd Churn-Predictor-ML-project-
2. Setup Python Virtual Environment
bashpython -m venv venv

# Windows
.\venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
3. Install Python Dependencies
bashpip install -r requirements.txt
4. Download Dataset

Download from: https://www.kaggle.com/datasets/blastchar/telco-customer-churn
Place telco_churn.csv inside the data/ folder

5. Train the Models
bashcd ml/training
python train_models.py
6. Start the Backend API
bashcd backend
uvicorn main:app --reload --port 8000
API running at: http://localhost:8000
Swagger docs at: http://localhost:8000/docs
7. Start the Frontend
bashcd frontend
npm install
npm run dev
Dashboard running at: http://localhost:3000

🐳 Docker Deployment
Run the entire stack with one command:
bashdocker-compose up --build
Services:

Backend: http://localhost:8000
Frontend: http://localhost:3000


📸 Screenshots
Dashboard — Customer Prediction

Interactive form with real-time churn risk assessment

SHAP Feature Importance

Top factors driving churn for each individual customer

Model Comparison

ROC curves and metrics across all 3 models


💼 Resume Bullet Points
- Developed an end-to-end AI-powered Customer Churn Prediction platform using
  XGBoost, Random Forest, and Logistic Regression on the IBM Telco dataset,
  achieving 84.59% ROC-AUC with explainable predictions via SHAP analysis.

- Built a real-time prediction REST API with FastAPI returning churn probability,
  risk segmentation (Low/Medium/High), and top contributing SHAP factors
  per customer with sub-second response time.

- Delivered a Next.js analytics dashboard visualizing churn risk, SHAP feature
  importance, and AI-generated retention recommendations, deployed via Docker
  on Render and Vercel with full CI/CD from GitHub.

📚 Dataset
IBM Telco Customer Churn Dataset

Source: Kaggle
Records: 7,043 customers
Features: 21 columns
Target: Churn (Yes/No) — 26.5% positive class


🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first.

📄 License
This project is licensed under the MIT License.

👤 Author
Krishnamoorthy K

GitHub: @KRISHNA-K19



⭐ If this project helped you, please give it a star on GitHub!
