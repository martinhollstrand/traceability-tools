# **traceabilitytools.com – Systemspecifikation**

Detta dokument beskriver design, funktionalitet, teknik och UI/UX-krav för traceabilitytools.com, ett webbaserat verktyg för sökning, visning och jämförelse av hållbarhetsrapportering-verktyg.

Tjänsten består av en publik del och en administrativ del med inloggning.

---

# **1. Översikt**

Målet är att bygga en snabb, modern och responsiv tjänst där användare enkelt kan:

* Utforska en lista över verktyg för hållbarhetsrapportering
* Filtrera, sortera och jämföra olika verktyg
* Läsa en sammanfattande rapport och ladda ner en PDF
* Förstå skillnader mellan verktyg genom en AI-genererad jämförelsesammanfattning

Admin ska kunna:

* Ladda upp Excel-filer som automatiskt parsas till PostgreSQL
* Hantera metadata kring en rapport
* Hantera PDF-uppladdning för rapport
* Redigera enskilda datapunkter
* Se historik och versioner

---

# **2. Designprinciper**

UI ska vara:

* Rent, tydligt och professionellt
* Responsivt (mobil först → desktop)
* Byggt med komponenter som enkelt kan återanvändas
* Tillgängligt med fokus på läsbarhet

Grafisk profil:

* Använd Peak Tools färgpalett för primära element
* Neutral bakgrund, ljusa ytor, hög kontrast
* Logotyp placerad i headern

Komponenter:

* Tailwind CSS + shadcn/ui 
* Återanvändbara UI-moduler: tabeller, filter, kort, modaler, drawers

Sättet användaren navigerar:

* Öppen, enkel toppnavigering
* Minimal visuell friktion
* Inspiration: modern b2b SaaS

---

# **3. Informationsarkitektur**

## Publik del

* Startsida
* Alla verktyg (lista)
* Jämförelsevy
* Rapportsida
* Detaljvy (valfritt, drawer eller ny sida)
* Inloggning

## Admin

* Dashboard
* Data & Excel-hantering
* Kolumnmappning
* Redigering av enskilda datapunkter
* Rapport-inställningar
* PDF-uppladdning
* Versioner

---

# **4. UI-specifikation**

## **4.1. Header**

* Logotyp (Peak Tools)
* Länkar:

  * Alla verktyg
  * Jämför (endast aktiv om användaren lagt till val)
  * Rapport
* Länk “Admin”
* Sticky vid scroll

## **4.2. Startsida**

### Sektioner:

1. **Hero**

   * Kort rubrik
   * Beskrivande text
   * CTA: “Se alla verktyg”
2. **Key stats**

   * Antal verktyg (räknas från databasen)
3. **Så fungerar tjänsten**

   * Tre punkter: Utforska, Jämför, Förstå

---

# **4.3. Lista över verktyg**

### Komponenter:

* Sökfält (text)
* Filter (pills/dropdowns)
* Sortering per kolumn
* Tabell med:

  * 4–5 prioriterade kolumner
  * Expandera för att visa hela datasetet
  * Checkbox för “lägg till i jämförelse”

### Interaktioner:

* Sticky “Jämför bar” när minst ett verktyg är valt
* Knapp: “Jämför valda”

---

# **4.4. Jämförelsevy**

* Överst: Rubrik + vilka verktyg som jämförs
* Panel: AI-genererad sammanfattning
* Tabell:

  * Kolumner = verktyg
  * Rader = attribut (prioriterade först)
  * Expand för fler rader
* Möjlighet att ta bort verktyg från jämförelsen

---

# **4.5. Rapportsida**

* Titel
* Kort ingress
* Lista med nyckelfynd
* Länk/knapp för PDF-nedladdning
* Optional preview embedded

---

# **5. Admin UI**

## **5.1. Admin layout**

* Sidebar:

  * Dashboard
  * Data & Excel
  * Rapport
  * Versioner
* Top bar:

  * Username
  * Logga ut

---

## **5.2. Dashboard**

* Antal verktyg
* Datum för senaste Excel-uppladdning
* Antal kolumner
* Snabbknapp “Ladda upp excel”

---

## **5.3. Data & Excel-hantering**

### Funktionalitet:

* Upload-komponent för Excel
* Förhandsvisning av kolumner och rader
* Bekräfta import
* Automatiskt skapa dynamisk datamodell baserat på kolumner
* Visa varningar vid förändrade kolumner

---

## **5.4. Redigering av data**

* Tabell med inline-edit
* Sök och filtrera i adminvyn
* Sparknappar per rad eller autosave

---

## **5.5. Rapportinställningar**

* Fält för:

  * Rapporttitel
  * Ingress
  * Lista över key findings
* Upload av PDF
* Preview av publika rapportsidan

---

## **5.6. Versioner**

* Lista över tidigare Excel-versioner:

  * Datum
  * Uppladdare
  * Antal rader
* Funktioner:

  * Markera aktiv version
  * Visa diff (ej krav för V1)

---

# **6. Teknisk specifikation**

## 6.1 Frontend

* Next.js App Router
* React Server Components
* Tailwind CSS + shadcn/ui
* Server Actions där hinderlös variation finns
* TypeScript

---

## 6.2 Backend & Databas

* PostgreSQL via Neon
* Drizzle ORM för schema och migrationer
* Tabeller:

  * tools (alla datapunkter från Excel)
  * tool_versions (metadata för Excel-uppladdningar)
  * report_metadata
  * admin_users (BetterAuth)
  * optional: embeddings om vektorsök används

---

## 6.3 Excel-import

* Parse via ett bibliotek som `xlsx` eller `SheetJS`

* Steg:

  1. Ladda upp Excel
  2. Identifiera kolumner
  3. Konvertera till JSON
  4. Mappa till dynamiska fält
  5. Spara i PostgreSQL
  6. Skapa ny version i versionstabellen

* Felhantering:

  * Ogiltiga kolumnnamn
  * Tomma celler
  * Dubbeldata

---

## 6.4 Autentisering

* BetterAuth.js med:

  * Email/password eller
  * Magic link
* Skydda alla admin-routes

---

## 6.5 AI-integration

* GPT-5.1-mini via:

  * Vercel AI SDK
  * Edge Runtime (föredras)
* Input: valda datapunkter från jämförelse
* Output: kort text (3–5 meningar)

---

## 6.6 Deployment

* Hostas på Vercel
* CI via GitHub
* Prebuild command: generera Drizzle-migrationer

---

# **7. Prioriterad Milstolpsplan**

### **M1: Basfunktioner (publik)**

* Lista alla verktyg
* Filtrering och sökning
* Jämförelsevy (utan AI)
* Rapportsida (statisk)

### **M2: Admin och Excel**

* Inloggning
* Excel-uppladdning
* Kolumnmappning
* Data lagras i PostgreSQL
* Rapportsidans admininställningar

### **M3: AI och förbättrad jämförelse**

* GPT-5.1-mini integration
* Sammanfattningspanel
* Förädlade filter och sortering

### **M4: Versioner och avancerade funktioner**

* Versioneringssystem
* Historikvy
* Möjlighet att aktivera äldre versioner

---

# **8. Kvalitetskrav**

* Prestanda: Sidor ska ladda snabbt även med 500+ rader data
* SEO: Publika sidor indexerbara
* Tillgänglighet: WCAG AA-betoning
* Säkerhet: Auth guard på alla admin-routes, inga känsliga endpoints publika

---

Den här filen räcker som “single source of truth” för både utvecklare och AI-kodverktyg.
Vill du också ha:

* En filstruktur (`tree`) för projektet
* En `README.md` för utvecklare
* Ett komplett Drizzle-schema
* Prompten särskilt optimerad för Cursor / Claude Code?
