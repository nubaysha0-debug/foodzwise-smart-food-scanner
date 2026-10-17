# FoodzWise — Smart Packaged Food & Nutrition Scanner
### FSSAI Food Transparency & Dietary Decision Intelligence Platform

> **Live Application**: Scan any packaged food barcode or nutrition label and receive an instant, plain-language, explainable health fit analysis tailored to personalized dietary requirements and FSSAI Front-of-Pack guidelines.

---

## 🚀 Overview & Problem Statement

Packaged food consumers in India are increasingly exposed to misleading front-of-pack marketing claims (*"High Protein"*, *"Zero Trans Fat"*, *"No Added Sugar"*). Concurrently, critical health hazards—such as excessive sodium, palm oil frying mediums, high glycemic simple sugars, and synthetic azo dyes—remain buried in tiny, complex back-of-pack tables.

**FoodzWise** bridges this transparency gap with a client-first, privacy-respecting progressive web application that delivers:
1. **FSSAI HFSS Warning System**: Evaluates Indian draft Front-of-Pack guidelines for High Fat, Sugar, and Salt per 100g/100ml.
2. **Comprehensive Food Coverage (2.5M+ Products)**: Offline-first verified Indian staples + real-time search across the entire Open Food Facts / FSSAI market database.
3. **14-Digit FSSAI License Decoder**: Verifies and decodes any Indian FSSAI license number (license type, state jurisdiction, registration year, and registrar code).
4. **Personalized Health Scoring (0–100)**: Dynamic suitability scoring customized for Type 2 Diabetes, Hypertension (DASH diet), Celiac Disease, Lactose Intolerance, Renal Care, Child Safety, Veganism, and Jain diets.
5. **Multi-Format Barcode Engine**: Live camera scanning via `@zxing/browser` alongside image file upload, manual entry, and instant 1-tap popular Indian food testing.
6. **OCR Nutrition Table Digitizer**: Extracts and normalizes dense label text with an interactive editor allowing on-the-fly recalculations.
7. **Algorithmic Alternative Recommender**: Automatically suggests healthier, category-matched alternatives (e.g., swapping fried instant noodles with sun-dried foxtail millet noodles).
8. **Side-by-Side Product Comparison**: Head-to-head nutritional delta analysis and winner recommendations.

---

## 🛠 Tech Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling & Design System**: Tailwind CSS v4, Lucide Icons, Mobile-first responsive layout
- **Computer Vision & Scanner**: `@zxing/browser` Multi-Format Barcode Reader
- **Data Architecture**: Offline-First Local Catalogue + Live Open Food Facts API (2.5M+ products)
- **Privacy & Storage**: 100% Client-Side Local Storage (zero telemetry or tracking)

---

## 📋 Popular Verified Indian Foods

Test the application instantly using the integrated **Popular Foods** launcher:

| Barcode | Sample Product | Primary Health Flags & FSSAI Profile Alignment |
|---|---|---|
| `8901719101014` | Parle-G Biscuits | High Sugar (26.5g/100g), Palm Oil, Wheat Gluten |
| `8901262010054` | Amul Pasteurized Butter | High Saturated Fat (51g/100g), High Sodium (840mg) |
| `8901491101831` | Kurkure Masala Munch | High Sodium (940mg), Refined Palmolein, MSG enhancers |
| `8904004400282` | Haldiram's Bhujia Sev | High Lipid Density (42g Fat), High Sodium (820mg) |
| `8901063012028` | Britannia Good Day Butter | Palm Oil, Saturated Fat (10.8g), High Sugar (23.5g) |
| `8901233024042` | Cadbury Dairy Milk | High Sugar HFSS (56g/100g), Milk Solids |
| `8901207010484` | Real Mixed Fruit Juice | Liquid Sugar HFSS (>6g/100ml), Vitamin C added |
| `8900000000073` | Masala Instant Noodles | Extreme Sodium HFSS (1180mg), Palm Oil, MSG |
| `8900000000035` | High-Protein Rolled Oats | Clean Nova 1, 21.5g Protein, 11.8g Fiber |
| `8900000000097` | Mildly Sweet Coconut Water | Natural Isotonic Hydration, Low Calorie (19 kcal) |
| `8901042953250` | MTR Ready Dal Makhani | Ready Meal, Dairy Cream, Black Gram Protein |

---

## ⚙️ Running Locally

```bash
# Clone the repository
git clone https://github.com/your-username/foodzwise.git
cd foodzwise

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Type check and build
npm run lint
npm run build
```

---

## 📄 License & Disclaimer

*Disclaimer: FoodzWise is an educational and wellness intelligence platform. It does not replace clinical medical counsel, diagnosis, or regulatory certification.*
