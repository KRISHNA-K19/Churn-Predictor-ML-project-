**AI-Based Customer Churn Prediction & Retention Analytics Platform**

An end-to-end, production-ready machine learning platform that predicts customer churn, explains why customers are likely to leave, and recommends retention strategies using Explainable AI (SHAP), FastAPI, and an interactive analytics dashboard. Built using the IBM Telco Customer Churn Dataset and deployed with a modern full-stack architecture.

**Overview**

Customer churn is one of the biggest business challenges in the telecom industry. Retaining existing customers is significantly cheaper than acquiring new ones.

**This project solves four critical business problems:**

1.Which customers are likely to churn?

2.Why are they likely to leave?

3.Which factors drive churn overall?

4.What actions should businesses take to retain them?

**The platform combines:**

Machine Learning, 
Explainable AI (SHAP), 
Real-Time Prediction APIs, 
Interactive Analytics Dashboard, 
Deployment using Docker + Cloud Hosting.

**Problem Statement**

Telecom companies lose a large number of customers every year due to poor engagement, pricing dissatisfaction, and lack of long-term commitment.

Traditional churn analysis systems often fail because they:

->Only provide predictions

->Lack interpretability

->Do not offer actionable insights

->Are not deployable in real-world production environments

This project addresses these gaps by building a complete AI-powered churn analytics platform.

**Live Demo**

Service	URL
🖥️ Frontend Dashboard	Vercel Frontend Dashboard - https://churn-predictor-ml-project.vercel.app/

⚡ Backend API	Render Backend API - https://churn-predictor-ml-project.onrender.com

📄 Swagger API Docs	FastAPI Swagger Docs - https://churn-predictor-ml-project.onrender.com/docs

⚠️ Free-tier backend hosting may take 20–30 seconds to wake up on the first request.

**Key Features**

**✅ Machine Learning Churn Prediction
**
Predicts churn probability in real time
Classifies customers into:

🟢 Low Risk

🟡 Medium Risk

🔴 High Risk

**✅ Explainable AI with SHAP**

1. Global feature importance analysis

2. Customer-level churn explanations

3. Top contributing churn factors returned with every prediction

**✅ Interactive Dashboard**

1. Customer input form

2. Risk visualization

3. SHAP explanation charts

4. Retention recommendations

5. Prediction history tracking

**✅ Production-Ready Backend**

1. FastAPI REST API

2. Pydantic validation

3. Modular architecture

4. Swagger/OpenAPI documentation

**✅ Deployment & DevOps**

1. Dockerized backend/frontend

2. Cloud deployment using Render & Vercel

3. GitHub version control

**System Workflow**

<img width="1536" height="1024" alt="ChatGPT Image May 26, 2026, 04_59_48 PM" src="https://github.com/user-attachments/assets/ee377a6d-a4ba-4c1f-a9ef-6866da156f74" />


**Dataset Information**

IBM Telco Customer Churn Dataset

Total Customers - 7,043

Features - 21

Churn Rate - 26.5%

Source - Kaggle

**⚙️ Data Processing Pipeline**

Data Cleaning
Fixed TotalCharges datatype issues

Handled missing values using median imputation

**Feature Engineering**

Created custom business-driven features:

Feature	Description:

	charges_per_tenure - MonthlyCharges / (tenure + 1)
	is_high_value - Customers paying above ₹70/month
	is_long_term - Customers with tenure > 24 months

**Encoding & Scaling**

One-Hot Encoding for categorical variables

StandardScaler for feature normalization

**🤖 Machine Learning Models**


Three machine learning models were trained and evaluated.


	Logistic Regression	80.55%(Accuracy) 			66.89%(precision) 	 	52.94%(recall)  	 59.10%(F1-score) 		84.59%(ROC-AUC)

	Random Forest	79.06%(Accuracy)			63.57%(precision)			49.47%(recall)			55.64%(F1-score)			82.30%(ROC-AUC)

	XGBoost	77.93%(Accuracy)	59.52%(precision)			52.67%(recall)			55.89%(F1-score)			81.88%(ROC-AUC)

🏆 Best Performing Model


Logistic Regression achieved the highest ROC-AUC score and was selected as the primary prediction model.

**🔍 Explainable AI (SHAP)
**

This project integrates SHAP (SHapley Additive exPlanations) to make predictions interpretable.

**Global Explanations**

Understand which features affect churn across the entire customer base.

**Local Explanations
**

Explain why a specific customer is predicted to churn.

**Visualizations**

<img width="1200" height="600" alt="Model_Comparison" src="https://github.com/user-attachments/assets/2172a6d4-1bd0-4a73-be1a-b5b53d9b0742" />

**⚡ FastAPI Prediction API**

Endpoint

POST /api/v1/predict

📥 Sample Request

	{
	  "tenure": 2,
	  "MonthlyCharges": 85.0,
	  "TotalCharges": 170.0,
	  "Contract": "Month-to-month",
	  "InternetService": "Fiber optic",
	  "PaymentMethod": "Electronic check",
	  "SeniorCitizen": 0
	}

📤 Sample Response

		{
		  "churn_probability": 0.4833,
		  "risk_level": "Medium",
		  "top_reasons": [
		
	    {
	      "feature": "charges_per_tenure",
	      "importance": 1.5283
	    },
	    {
	      "feature": "InternetService_Fiber optic",
	      "importance": 0.6227
	    },
	    {
	      "feature": "Contract_Two year",
	      "importance": 0.2730
	    }
	  ]
	}

**🚦 Risk Classification**

Risk Level	Probability Range

🟢 Low	0% – 30%

🟡 Medium	30% – 60%

🔴 High	60% – 100%

**📈 Business Insights from SHAP Analysis**

🔴 Factors Increasing Churn Risk

High charges_per_tenure - Customers feel pricing is too high early in the relationship

Month-to-month contracts - No long-term commitment

Fiber optic internet - Possible dissatisfaction or pricing concerns

Electronic check payment - Lower customer engagement

No online security - Less investment in services

**🟢 Factors Reducing Churn Risk**

Two-year contracts - Higher loyalty

Long tenure - Strong customer trust

Tech support subscription - Better service experience

Online security add-on - Higher engagement

High TotalCharges - Long-term high-value customers rarely churn

**💡 Retention Recommendations**

🔴 High Risk - Personal call + discount/upgrade offer

🟡 Medium Risk - Personalized email + free add-on

🟢 Low Risk - Loyalty rewards + engagement campaigns

**📊 Dashboard Features**

Customer input form

Churn probability visualization

Risk badge indicators

SHAP explanation chart

Retention recommendations

Prediction history

**Frontend Tech Stack**

<img width="1919" height="1079" alt="Screenshot 2026-05-26 160904" src="https://github.com/user-attachments/assets/aab40c2c-cfeb-4198-aa46-08eab8e4331d" />


Next.js 14

Tailwind CSS

Recharts

**🛠️ Tech Stack**

Data Processing - Python, Pandas, NumPy

Machine Learning - Scikit-learn, XGBoost

Explainability - SHAP

Visualization - Matplotlib, Seaborn, Plotly

Backend API - FastAPI, Uvicorn, Pydantic

Frontend - Next.js 14, Tailwind CSS

Deployment - Docker, Render, Vercel

Version Control - Git, GitHub

**Future Improvements**

User authentication system

Real-time streaming predictions

Customer segmentation module

Automated email retention campaigns

Drift detection & model monitoring

CI/CD pipeline integration

Kubernetes deployment

**Author**

Krishnamoorthy K

If you found this project useful:

Give the repository a star

Fork the project

Share feedback

Contribute improvements.
