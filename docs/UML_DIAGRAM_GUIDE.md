# SkinSense UML Diagram Guide

This document is a complete drawing reference for the SkinSense Digital Skin Analysis project. It is written from the implemented project structure:

- Frontend: React/Vite application in `frontend/`
- Backend: Flask REST API in `backend/`
- Image processing: OpenCV and NumPy modules in `backend/image_processing/`
- Database: MySQL schema in `backend/database/schema_normalized.sql`
- Product assets: local fallback assets in `frontend/public/products/`

Use the diagrams below for the project report, presentation, or software-design documentation. The Mermaid definitions can be pasted into Mermaid Live Editor, GitHub Markdown, or a Mermaid-compatible diagram tool. If drawing manually in draw.io, use the element lists and relationships given before each diagram.

## 1. System Scope

SkinSense accepts a facial image, validates and preprocesses it, detects the face and skin region, evaluates visible skin parameters, calculates scores, stores the report, and presents recommendations, products, tips, and history.

The system is an image-based preliminary assessment tool. It is not a medical diagnostic system.

## 2. Actors

### Primary actors

- **User**: registers, logs in, uploads a facial image, views results, views history, receives product suggestions, and manages profile information.
- **Administrator**: manages products and product advertisement images.

### External systems and supporting actors

- **Web Browser**: runs the React frontend and sends HTTP requests.
- **Flask REST API**: receives frontend requests and coordinates backend services.
- **MySQL Database**: stores users, reports, analysis results, products, recommendations, routines, and lifestyle tips.
- **OpenCV/NumPy Processing Engine**: detects the face and calculates image-based parameters.
- **File Storage**: stores uploaded images, annotated images, and parameter visualizations.

## 3. Diagram Set

Draw these diagrams in this order:

1. Use Case Diagram: system functionality and actors.
2. Activity Diagram: complete facial-analysis workflow.
3. Sequence Diagram: upload-to-result interaction.
4. Class Diagram: major software classes/modules and their relationships.
5. ER Diagram: database tables and foreign-key relationships.
6. Component Diagram: frontend, backend, processing, database, and storage boundaries.
7. Deployment Diagram: physical/runtime deployment.
8. State Diagram: analysis report lifecycle.

---

# Diagram 1: Use Case Diagram

## Purpose

Shows what each actor can do from outside the system.

## Actors to draw

- User
- Administrator
- Web Browser
- MySQL Database
- Image Processing Engine

## Use cases to draw

### Authentication

- Register account
- Login
- Logout
- Manage profile

### Analysis

- Upload facial image
- Validate image
- Assess image quality
- Detect face
- Extract skin region
- Analyze skin parameters
- Calculate parameter scores
- Calculate overall skin health score
- View analysis result
- View annotated image and parameter maps

### Recommendations and history

- View product recommendations
- View lifestyle tips
- View analysis history
- View previous report
- Browse products
- Search products
- Filter products by category, concern, or skin type

### Administration

- Add product
- Update product image
- Manage product information

## Relationships to draw

- `Upload facial image` includes `Validate image`.
- `Upload facial image` includes `Assess image quality`.
- `Upload facial image` includes `Detect face`.
- `Detect face` includes `Extract skin region`.
- `Extract skin region` includes `Analyze skin parameters`.
- `Analyze skin parameters` includes `Calculate parameter scores`.
- `Calculate parameter scores` includes `Calculate overall skin health score`.
- `View analysis result` includes `View annotated image and parameter maps`.
- `View analysis result` includes `View product recommendations`.
- `View analysis result` includes `View lifestyle tips`.
- Administrator specializes the User actor for product-management use cases.

## Mermaid version

```mermaid
flowchart LR
    User([User])
    Admin([Administrator])
    Browser([Web Browser])
    API[[SkinSense REST API]]
    DB[(MySQL Database)]
    Engine[[OpenCV / NumPy Engine]]

    subgraph SkinSense[SkinSense System]
        Register((Register account))
        Login((Login))
        Profile((Manage profile))
        Upload((Upload facial image))
        Validate((Validate image))
        Quality((Assess image quality))
        Detect((Detect face))
        Extract((Extract skin region))
        Analyze((Analyze skin parameters))
        Scores((Calculate scores))
        Overall((Calculate overall score))
        Results((View analysis result))
        Maps((View annotated image and parameter maps))
        Products((View product recommendations))
        Tips((View lifestyle tips))
        History((View analysis history))
        Browse((Browse and search products))
        AddProduct((Add product))
        EditProduct((Update product image))
    end

    User --> Register
    User --> Login
    User --> Profile
    User --> Upload
    User --> Results
    User --> History
    User --> Browse
    Admin --> AddProduct
    Admin --> EditProduct
    Browser --> API
    API --> DB
    API --> Engine

    Upload -. includes .-> Validate
    Upload -. includes .-> Quality
    Upload -. includes .-> Detect
    Detect -. includes .-> Extract
    Extract -. includes .-> Analyze
    Analyze -. includes .-> Scores
    Scores -. includes .-> Overall
    Results -. includes .-> Maps
    Results -. includes .-> Products
    Results -. includes .-> Tips
```

---

# Diagram 2: Activity Diagram

## Purpose

Shows the control flow from image upload to the final score and recommendations.

## Activity steps

1. User selects an image.
2. Frontend validates file type and size.
3. Backend authenticates the user.
4. Backend validates the uploaded extension.
5. Backend saves the image with a generated filename.
6. Backend creates a report with `Processing` status.
7. Image is preprocessed.
8. Image quality is assessed.
9. If quality is insufficient, the report fails and an error is returned.
10. Face is detected using Haar Cascade.
11. If no face is found, the report fails.
12. Facial skin region is extracted.
13. Color analysis is performed.
14. Redness, dark spots, wrinkles, texture, oiliness, dryness, pimples, and skin tone are analyzed.
15. Parameter scores are calculated.
16. Overall score and category are calculated.
17. Annotated images and parameter visualizations are saved.
18. Results are persisted in the database.
19. Product recommendations and lifestyle tips are selected.
20. Report is returned to the frontend.
21. User views the result.

## Mermaid version

```mermaid
flowchart TD
    Start([Start]) --> Select[User selects facial image]
    Select --> ClientCheck{Valid type and size?}
    ClientCheck -- No --> ClientError[Show upload validation error]
    ClientError --> End([End])
    ClientCheck -- Yes --> Request[POST /api/analysis]
    Request --> Auth{Authenticated user?}
    Auth -- No --> AuthError[Return 401 error]
    AuthError --> End
    Auth -- Yes --> Save[Save uploaded image]
    Save --> Report[Create report with Processing status]
    Report --> Preprocess[Preprocess image]
    Preprocess --> Quality[Assess image quality]
    Quality --> QualityOK{Quality acceptable?}
    QualityOK -- No --> FailQuality[Mark report failed]
    QualityOK -- Yes --> Face[Detect face with Haar Cascade]
    Face --> FaceFound{Face detected?}
    FaceFound -- No --> FailFace[Mark report failed]
    FaceFound -- Yes --> Skin[Extract skin region and mask]
    Skin --> Color[Analyze color spaces]
    Color --> Parameters[Run parameter detectors]
    Parameters --> Scores[Calculate parameter scores]
    Scores --> Overall[Calculate overall score and category]
    Overall --> Visuals[Create annotated image and parameter maps]
    Visuals --> Persist[Save results in MySQL]
    Persist --> Recommend[Select products and lifestyle tips]
    Recommend --> Response[Return analysis JSON]
    Response --> Display[Display report, score, concerns and recommendations]
    Display --> End
    FailQuality --> End
    FailFace --> End
```

---

# Diagram 3: Sequence Diagram

## Purpose

Shows the message order for the main use case: uploading an image and receiving an analysis report.

## Lifelines

- User
- React `SkinAnalysis` page
- `analysisService`
- Flask `analysis_routes`
- `auth` middleware
- `analysis_service`
- Image-processing modules
- MySQL database
- Upload/file storage

## Important messages

- `POST /api/analysis` with multipart image and authenticated token.
- `require_auth()` validates the token and sets the authenticated user.
- `save_uploaded_image()` stores the source image.
- `create_analysis_record()` inserts the initial report.
- Processing modules return measurements and masks.
- Score calculator returns parameter scores and overall score.
- Visualizer writes annotated images.
- Database stores the completed report and result rows.
- API returns the formatted analysis response.

## Mermaid version

```mermaid
sequenceDiagram
    actor User
    participant UI as SkinAnalysis React Page
    participant Client as analysisService
    participant Route as POST /api/analysis
    participant Auth as require_auth middleware
    participant Service as analysis_service.analyze_skin
    participant Vision as OpenCV/NumPy modules
    participant Files as Upload File Storage
    participant DB as MySQL Database

    User->>UI: Select facial image
    UI->>Client: analyzeImage(file)
    Client->>Route: POST multipart image + auth token
    Route->>Auth: Validate token
    Auth-->>Route: Authenticated user
    Route->>Service: analyze_skin(image, user_id)
    Service->>Files: save_uploaded_image(image)
    Files-->>Service: image_path
    Service->>DB: INSERT report(status=Processing)
    DB-->>Service: report_id
    Service->>Vision: preprocess image
    Vision-->>Service: processed image
    Service->>Vision: assess quality
    Vision-->>Service: quality score
    Service->>Vision: detect face
    Vision-->>Service: face bounding box
    Service->>Vision: extract skin region
    Vision-->>Service: skin mask
    Service->>Vision: run redness, dark spots, wrinkles, texture detectors
    Vision-->>Service: parameter measurements
    Service->>Vision: run oiliness, dryness, pimples, tone detectors
    Vision-->>Service: parameter measurements
    Service->>Vision: calculate scores and overall score
    Vision-->>Service: scores and category
    Service->>Files: save annotated image and parameter maps
    Files-->>Service: visualization paths
    Service->>DB: UPDATE report and INSERT analysis results
    DB-->>Service: persistence complete
    Service-->>Route: complete analysis result
    Route-->>Client: 200 analysis response
    Client-->>UI: formatAnalysisResult(response)
    UI-->>User: Show score, concerns, maps and recommendations
```

---

# Diagram 4: Class Diagram

## Purpose

Shows the main software abstractions and how they collaborate. Since the backend is Python and the frontend is React, represent React pages/services as classes or components with stereotypes.

## Classes/components to draw

### Frontend

- `SkinAnalysisPage`
- `AuthContext`
- `analysisService`
- `productService`
- `ProductRecommendationSlider`
- `SkinParameters`

### Backend API

- `AuthRoutes`
- `AnalysisRoutes`
- `ProductRoutes`
- `HistoryRoutes`
- `ProfileRoutes`
- `RecommendationRoutes`
- `AuthMiddleware`

### Backend services

- `AuthService`
- `AnalysisService`
- `ProductService`
- `HistoryService`
- `ProfileService`
- `RecommendationService`

### Image-processing functions/modules

- `Preprocessing`
- `ImageQuality`
- `FaceDetection`
- `SkinExtraction`
- `ColorAnalysis`
- `RednessDetection`
- `DarkSpotDetection`
- `WrinkleDetection`
- `TextureAnalysis`
- `OilinessDetection`
- `DrynessDetection`
- `PimpleDetection`
- `SkinTone`
- `ScoreCalculator`

### Data objects

- `User`
- `Report`
- `AnalysisResult`
- `Product`
- `Recommendation`
- `LifestyleTip`

## Relationships to draw

- Routes depend on their corresponding services.
- `AnalysisService` composes the image-processing modules.
- `AnalysisService` uses `Database` and `FileStorage`.
- `SkinAnalysisPage` uses `analysisService`, `SkinParameters`, and `ProductRecommendationSlider`.
- `RecommendationService` uses `AnalysisResult`, `Product`, and severity rules.
- `Report` has many `AnalysisResult` objects.
- `AnalysisResult` refers to one `SkinCondition` and one `SeverityLevel`.
- `Product` belongs to a `Brand` and `ProductCategory`.

## Mermaid version

```mermaid
classDiagram
    class SkinAnalysisPage {
        +selectedImage
        +report
        +handleImageSelect(file)
        +handleAnalyze()
        +loadReport(analysisId)
    }
    class AuthContext {
        +user
        +token
        +login(credentials)
        +logout()
        +register(data)
    }
    class analysisService {
        +analyzeImage(file)
        +getAnalysis(analysisId)
        +formatAnalysisResult(response)
    }
    class ProductRecommendationSlider {
        +recommendations
        +renderProductSlides()
    }
    class AnalysisRoutes {
        +create_analysis()
        +fetch_analysis(analysis_id)
    }
    class AuthRoutes {
        +register()
        +login()
        +logout()
    }
    class ProductRoutes {
        +products()
        +search()
        +products_by_concern()
        +products_by_skin_type()
        +add_product()
        +edit_product_image()
    }
    class AnalysisService {
        +save_uploaded_image(image)
        +create_analysis_record(user_id, path)
        +analyze_skin(image, user_id)
        +create_analysis_visualization(...)
    }
    class RecommendationService {
        +get_recommendations(analysis_id)
        +get_recommendations_for_parameters(parameters)
        +get_recommendations_by_concern(concern)
    }
    class ProductService {
        +get_products(filters)
        +get_product(product_id)
        +search_products(query)
        +create_product(data)
        +update_product_image(id, url)
    }
    class AuthMiddleware {
        +require_auth()
        +admin_only()
    }
    class FaceDetection {
        +detect_face(image)
        +detect_faces(image)
    }
    class SkinExtraction {
        +extract_skin_region(image, face)
    }
    class RednessDetection {
        +detect_redness(image, mask)
    }
    class DarkSpotDetection {
        +detect_dark_spots(image, mask)
    }
    class WrinkleDetection {
        +detect_wrinkles(image, mask)
    }
    class TextureAnalysis {
        +analyze_texture(image, mask)
    }
    class OilinessDetection {
        +detect_oiliness(image, mask)
    }
    class DrynessDetection {
        +detect_dryness(image, mask)
    }
    class PimpleDetection {
        +detect_pimples(image, mask)
    }
    class SkinTone {
        +classify_skin_tone(image, mask)
    }
    class ScoreCalculator {
        +calculate_parameter_scores(results)
        +calculate_overall_score(scores)
        +get_score_category(score)
    }
    class User {
        +user_id
        +full_name
        +email
        +role
    }
    class Report {
        +report_id
        +image_path
        +overall_score
        +skin_type
        +analysis_status
    }
    class AnalysisResult {
        +result_id
        +score
        +detected_area_percentage
        +confidence
    }
    class Product {
        +product_id
        +product_name
        +description
        +price
        +product_url
    }
    class Recommendation {
        +recommendation_id
        +priority
        +reason
        +usage_frequency
    }

    SkinAnalysisPage --> analysisService
    SkinAnalysisPage --> ProductRecommendationSlider
    AuthContext --> AuthRoutes
    analysisService --> AnalysisRoutes
    AnalysisRoutes --> AuthMiddleware
    AnalysisRoutes --> AnalysisService
    AuthRoutes --> AuthMiddleware
    ProductRoutes --> ProductService
    AnalysisService --> FaceDetection
    AnalysisService --> SkinExtraction
    AnalysisService --> RednessDetection
    AnalysisService --> DarkSpotDetection
    AnalysisService --> WrinkleDetection
    AnalysisService --> TextureAnalysis
    AnalysisService --> OilinessDetection
    AnalysisService --> DrynessDetection
    AnalysisService --> PimpleDetection
    AnalysisService --> SkinTone
    AnalysisService --> ScoreCalculator
    AnalysisService --> Report
    RecommendationService --> AnalysisResult
    RecommendationService --> Product
    User "1" --> "many" Report
    Report "1" --> "many" AnalysisResult
    Report "1" --> "many" Recommendation
    Recommendation "many" --> "1" Product
```

---

# Diagram 5: ER / Database Diagram

## Purpose

Shows the permanent data model and foreign-key relationships. Use crow's-foot notation when drawing manually.

## Tables and important attributes

### User and analysis

- `users(user_id PK, full_name, email, phone_no, password, profile_image, role, created_at, updated_at)`
- `reports(report_id PK, user_id FK, image_path, analysis_date, overall_score, overall_status, skin_type, image_quality_score, analysis_status, error_message)`
- `skin_conditions(condition_id PK, condition_name, description, detection_method)`
- `severity_levels(severity_id PK, severity_name, score_min, score_max, description)`
- `analysis_results(result_id PK, report_id FK, condition_id FK, severity_id FK, score, detected_area_percentage, confidence, detected_regions)`

### Products

- `brands(brand_id PK, brand_name, description, brand_logo, website_url)`
- `product_categories(category_id PK, category_name, description)`
- `products(product_id PK, brand_id FK, category_id FK, product_name, description, ingredients, usage_instructions, skin_type, price, product_url, is_active)`
- `product_images(image_id PK, product_id FK, image_path, image_type, is_primary)`

### Recommendations and guidance

- `condition_product_recommendations(recommendation_id PK, condition_id FK, severity_id FK, product_id FK, priority, recommendation_reason, usage_frequency)`
- `report_recommendations(report_recommendation_id PK, report_id FK, result_id FK, product_id FK, priority, reason)`
- `routines(routine_id PK, routine_name, routine_type, description)`
- `routine_products(routine_product_id PK, routine_id FK, product_id FK, step_number, instruction)`
- `lifestyle_tips(tip_id PK, tip_title, tip_description, condition_id FK, severity_id FK)`
- `report_lifestyle_tips(report_tip_id PK, report_id FK, tip_id FK)`

## Cardinalities

- One `users` row has many `reports` rows.
- One `reports` row has many `analysis_results` rows.
- One `skin_conditions` row has many `analysis_results` rows.
- One `severity_levels` row has many `analysis_results` rows.
- One `brands` row has many `products` rows.
- One `product_categories` row has many `products` rows.
- One `products` row has many `product_images` rows.
- `condition_product_recommendations` resolves the many-to-many relationship between conditions and products with severity and priority.
- `report_recommendations` links a report and analysis result to a recommended product.
- `routines` and `products` are many-to-many through `routine_products`.
- `reports` and `lifestyle_tips` are many-to-many through `report_lifestyle_tips`.

## Mermaid version

```mermaid
erDiagram
    USERS ||--o{ REPORTS : owns
    REPORTS ||--o{ ANALYSIS_RESULTS : contains
    SKIN_CONDITIONS ||--o{ ANALYSIS_RESULTS : identifies
    SEVERITY_LEVELS ||--o{ ANALYSIS_RESULTS : classifies
    BRANDS ||--o{ PRODUCTS : owns
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : groups
    PRODUCTS ||--o{ PRODUCT_IMAGES : has
    SKIN_CONDITIONS ||--o{ CONDITION_PRODUCT_RECOMMENDATIONS : maps
    SEVERITY_LEVELS ||--o{ CONDITION_PRODUCT_RECOMMENDATIONS : qualifies
    PRODUCTS ||--o{ CONDITION_PRODUCT_RECOMMENDATIONS : recommends
    REPORTS ||--o{ REPORT_RECOMMENDATIONS : receives
    ANALYSIS_RESULTS ||--o{ REPORT_RECOMMENDATIONS : explains
    PRODUCTS ||--o{ REPORT_RECOMMENDATIONS : appears_in
    ROUTINES ||--o{ ROUTINE_PRODUCTS : contains
    PRODUCTS ||--o{ ROUTINE_PRODUCTS : included_in
    SKIN_CONDITIONS o|--o{ LIFESTYLE_TIPS : guides
    SEVERITY_LEVELS o|--o{ LIFESTYLE_TIPS : targets
    REPORTS ||--o{ REPORT_LIFESTYLE_TIPS : receives
    LIFESTYLE_TIPS ||--o{ REPORT_LIFESTYLE_TIPS : assigned

    USERS {
        int user_id PK
        varchar email UK
        enum role
    }
    REPORTS {
        int report_id PK
        int user_id FK
        decimal overall_score
        varchar analysis_status
    }
    SKIN_CONDITIONS {
        int condition_id PK
        varchar condition_name UK
        varchar detection_method
    }
    SEVERITY_LEVELS {
        int severity_id PK
        varchar severity_name UK
        decimal score_min
        decimal score_max
    }
    ANALYSIS_RESULTS {
        int result_id PK
        int report_id FK
        int condition_id FK
        int severity_id FK
        decimal score
        decimal confidence
    }
    BRANDS {
        int brand_id PK
        varchar brand_name UK
    }
    PRODUCT_CATEGORIES {
        int category_id PK
        varchar category_name UK
    }
    PRODUCTS {
        int product_id PK
        int brand_id FK
        int category_id FK
        varchar product_name
        decimal price
        boolean is_active
    }
    PRODUCT_IMAGES {
        int image_id PK
        int product_id FK
        varchar image_path
        boolean is_primary
    }
    CONDITION_PRODUCT_RECOMMENDATIONS {
        int recommendation_id PK
        int condition_id FK
        int severity_id FK
        int product_id FK
        int priority
    }
    REPORT_RECOMMENDATIONS {
        int report_recommendation_id PK
        int report_id FK
        int result_id FK
        int product_id FK
    }
    ROUTINES {
        int routine_id PK
        varchar routine_name
        enum routine_type
    }
    ROUTINE_PRODUCTS {
        int routine_product_id PK
        int routine_id FK
        int product_id FK
        int step_number
    }
    LIFESTYLE_TIPS {
        int tip_id PK
        int condition_id FK
        int severity_id FK
        varchar tip_title
    }
    REPORT_LIFESTYLE_TIPS {
        int report_tip_id PK
        int report_id FK
        int tip_id FK
    }
```

---

# Diagram 6: Component Diagram

## Purpose

Shows the deployable software parts and their interfaces.

## Components to draw

### Frontend components

- React UI pages: Home, Login, Signup, Dashboard, SkinAnalysis, History, Products, Profile.
- React contexts: `AuthContext`, `ThemeContext`.
- Frontend services: `api`, `authService`, `analysisService`, `productService`, `historyService`, `profileService`.
- Shared components: `SkinParameters`, charts, product sliders, upload components.

### Backend components

- Flask application.
- Authentication routes and services.
- Analysis routes and service.
- Product routes and service.
- Recommendation routes and service.
- History routes and service.
- Profile routes and service.
- Authentication middleware.
- Image-processing package.
- Database access layer.
- Upload and visualization storage.

## Interfaces

- REST/JSON over HTTP between React and Flask.
- Multipart upload for facial images.
- SQL between services/database access and MySQL.
- Local file I/O between analysis service and upload storage.

## Mermaid version

```mermaid
flowchart LR
    subgraph Client[Client Tier]
        UI[React Pages and Components]
        Context[AuthContext and ThemeContext]
        FrontServices[Frontend API Services]
    end

    subgraph Server[Application Tier]
        Flask[Flask Application]
        AuthAPI[Auth Routes]
        AnalysisAPI[Analysis Routes]
        ProductAPI[Product Routes]
        HistoryAPI[History Routes]
        ProfileAPI[Profile Routes]
        RecommendationAPI[Recommendation Routes]
        Middleware[JWT/Auth Middleware]
        Services[Backend Services]
        Vision[Image Processing Package]
        DBAccess[Database Access Layer]
    end

    subgraph Resources[Resource Tier]
        MySQL[(MySQL Database)]
        Uploads[(Upload and Visualization Files)]
    end

    UI --> Context
    UI --> FrontServices
    FrontServices -->|HTTP REST / JSON| Flask
    Flask --> AuthAPI
    Flask --> AnalysisAPI
    Flask --> ProductAPI
    Flask --> HistoryAPI
    Flask --> ProfileAPI
    Flask --> RecommendationAPI
    AuthAPI --> Middleware
    AnalysisAPI --> Middleware
    ProductAPI --> Middleware
    AnalysisAPI --> Services
    ProductAPI --> Services
    HistoryAPI --> Services
    ProfileAPI --> Services
    RecommendationAPI --> Services
    Services --> Vision
    Services --> DBAccess
    Services --> Uploads
    DBAccess -->|SQL| MySQL
```

---

# Diagram 7: Deployment Diagram

## Purpose

Shows where each part runs at runtime.

## Nodes to draw

- User device/browser.
- Frontend development/production server, typically Vite during development.
- Backend server running Flask on port 5000.
- MySQL database server.
- File system or upload directory.

## Artifacts

- React JavaScript/CSS bundle.
- Flask Python application.
- OpenCV Haar Cascade XML file.
- Python image-processing modules.
- MySQL schema and data.
- Uploaded original and generated analysis images.

## Mermaid version

```mermaid
flowchart TB
    Device[User Device\nWeb Browser]
    Frontend[Frontend Host\nReact/Vite\nlocalhost:5173]
    Backend[Backend Host\nFlask REST API\nlocalhost:5000]
    Python[Python Runtime\nOpenCV + NumPy + PyWavelets]
    Database[(MySQL Server\nskinsense2)]
    Storage[(Backend uploads/\noriginal + annotated + parameter images)]

    Device -->|HTTP| Frontend
    Frontend -->|REST API / CORS| Backend
    Backend --> Python
    Backend -->|SQL| Database
    Backend -->|File I/O| Storage
    Python --> Storage
```

## Deployment notes

- Frontend API base URL is configured with `VITE_API_URL`, defaulting to `http://localhost:5000/api`.
- Flask enables CORS for `/api/*`.
- Backend limits uploaded files to 5 MB.
- Uploaded files are generated with UUID-based filenames.

---

# Diagram 8: Analysis Report State Diagram

## Purpose

Shows the lifecycle of an analysis report from upload through completion or failure.

## States

- New
- Uploading
- Processing
- Quality Checked
- Face Detected
- Skin Extracted
- Parameters Analyzed
- Scored
- Recommendations Prepared
- Completed
- Failed

## Transitions

- New -> Uploading: user submits an image.
- Uploading -> Processing: image saved and report created.
- Processing -> Quality Checked: preprocessing and quality assessment finish.
- Quality Checked -> Face Detected: quality is acceptable.
- Quality Checked -> Failed: quality is unacceptable.
- Face Detected -> Skin Extracted: face found.
- Face Detected -> Failed: no face found.
- Skin Extracted -> Parameters Analyzed: mask is created.
- Parameters Analyzed -> Scored: all detectors return measurements.
- Scored -> Recommendations Prepared: score and category are available.
- Recommendations Prepared -> Completed: results are stored and returned.
- Any processing state -> Failed: unexpected processing/database error.

## Mermaid version

```mermaid
stateDiagram-v2
    [*] --> New
    New --> Uploading : submit image
    Uploading --> Processing : save image + create report
    Processing --> QualityChecked : preprocess and assess quality
    QualityChecked --> FaceDetected : quality acceptable
    QualityChecked --> Failed : quality rejected
    FaceDetected --> SkinExtracted : face found
    FaceDetected --> Failed : no face found
    SkinExtracted --> ParametersAnalyzed : create skin mask
    ParametersAnalyzed --> Scored : detector results available
    Scored --> RecommendationsPrepared : calculate overall score
    RecommendationsPrepared --> Completed : persist and return report
    Processing --> Failed : unexpected error
    SkinExtracted --> Failed : extraction error
    ParametersAnalyzed --> Failed : detector error
    Scored --> Failed : database error
    Failed --> [*]
    Completed --> [*]
```

---

# 4-Stage Presentation Version

For a short project presentation, group the complete system into these four modules, matching the Home page:

1. **Upload Image Module**: accepts and validates the facial image.
2. **Image Processing Module**: preprocesses the image, checks quality, detects the face, and extracts the skin region.
3. **Parameter Analysis Module**: detects redness, dark spots, wrinkles, texture, oiliness, dryness, pimples, and skin tone, then calculates scores.
4. **Results Module**: displays the overall score, concerns, annotated images, product suggestions, lifestyle tips, and analysis history.

Draw these four modules as a high-level package diagram if your report requires one:

```mermaid
flowchart LR
    A[1. Upload Image] --> B[2. Image Processing]
    B --> C[3. Parameter Analysis]
    C --> D[4. Results and Recommendations]
    D --> E[(Database and File Storage)]
```

# Drawing Conventions

Use these UML conventions when reproducing the diagrams manually:

- **Actor**: stick figure.
- **Use case**: oval.
- **Class/component**: rectangle with a name compartment.
- **Database table/entity**: rectangle with attributes or crow's-foot ER notation.
- **System boundary**: large rectangle around use cases.
- **Solid arrow**: request, dependency, or control flow.
- **Dashed arrow**: include, return, or indirect dependency.
- **Open triangle arrow**: inheritance/generalization.
- **Filled diamond**: composition; use only when the child cannot exist independently.
- **Open diamond**: aggregation.
- **Crow's foot**: many relationship.
- **1**: exactly one.
- **0..1**: optional one.
- **0..***: zero or many.
- **1..***: one or many.

# Recommended Report Order

1. System overview.
2. Use case diagram.
3. Four-module architecture diagram.
4. Activity diagram.
5. Sequence diagram.
6. Class diagram.
7. ER/database diagram.
8. Component diagram.
9. Deployment diagram.
10. State diagram.
11. Short explanation of the image-processing algorithms.
12. Limitations: image quality, lighting, pose, skin-tone variation, and non-medical preliminary assessment.

# Algorithm Reference for the Diagrams

- Face detection: OpenCV Haar Cascade frontal-face classifier.
- Redness: LAB, HSV, and excess-red voting with morphology and connected components.
- Dark spots: grayscale, LAB, YCrCb, black-hat morphology, and connected components.
- Wrinkles: CLAHE, black-hat morphology, Gabor filters, Canny, Laplacian, and LBP.
- Texture: LBP variance, Gabor filters, Laplacian, Haar wavelets, and GLCM contrast.
- Oiliness: HSV brightness, low saturation, LAB brightness, and connected components.
- Dryness: grayscale mean brightness and standard deviation.
- Pimples: HSV/LAB redness, adaptive thresholding, morphology, and connected components.
- Skin tone: median LAB lightness; tone uniformity uses lightness standard deviation.
- Overall score: parameter scores are combined by the score-calculation module and mapped to a score category.
