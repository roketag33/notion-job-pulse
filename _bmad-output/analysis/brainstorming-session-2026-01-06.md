---
stepsCompleted: [1, 2, 3]
inputDocuments: []
session_topic: 'Création d''un outil centralisé pour scraper (LinkedIn, Indeed), agréger et gérer les candidatures'
session_goals: 'Automatiser l''importation vers Notion, simplifier le flux de travail, améliorer l''efficacité'
selected_approach: 'ai-recommended'
techniques_used: ['Decision Tree Mapping', 'SCAMPER Method', 'Reverse Brainstorming']
ideas_generated: ['Logic flow: Anti-bot -> Keyword -> Date', 'Deduplication via ID/Hash', 'Static Data: Company, Desc, Salary, Pre-reqs, Location, Contact', 'Dynamic Status: Contacted, Replied, Process', 'Update Logic: >1 month = probably expired, 404 = removed', 'Combine scraping + LLM generation', 'Assets: Cover Letter, Intro Message, Talking Points', 'Trigger: Checkbox/Button in Notion (On-demand)', 'Threats: Bot Detection, HTML Changes, IP Ban', 'Mitigation: Residential IP (Local Run)', 'Mitigation: Playwright with Human Delays', 'Mitigation: Semantic Selectors']
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Roket
**Date:** 2026-01-06

## Session Overview

**Topic:** Création d'un outil centralisé pour scraper (LinkedIn, Indeed), agréger et gérer les candidatures.
**Goals:** Automatiser l'importation des offres vers des outils comme Notion, simplifier le flux de travail (Sélection -> Candidature -> Mise à jour), et améliorer l'efficacité par rapport aux tableaux manuels.

### Session Setup

L'utilisateur souhaite créer une application d'automatisation pour la recherche d'emploi. L'accent est mis sur l'efficacité et l'intégration avec des outils existants comme Notion. L'approche choisie est de recevoir des recommandations techniques de l'IA.

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Création d'un outil centralisé pour scraper (LinkedIn, Indeed), agréger et gérer les candidatures.

**Recommended Techniques:**

- **Decision Tree Mapping:** Essentiel pour visualiser logiquement le flux complexe (Scraping -> Filtrage -> Candidature -> Mise à jour Notion).
- **SCAMPER Method:** Pour innover sur les fonctionnalités des tableaux standards (Modifier, Combiner, Adapter).
- **Reverse Brainstorming:** Pour anticiper les échecs liés au scraping et assurer la robustesse du système.

**AI Rationale:** Cette séquence progressive commence par structurer le flux logique (fondation), puis cherche à l'enrichir créativement (innovation), et enfin à le blinder contre les points de rupture technique (résilience), ce qui couvre parfaitement les besoins d'un outil d'automatisation complexe.

## Technique Execution Results

### Decision Tree Mapping

**Focus:** Logic Flow & Architecture

**Key Workflows Defined:**

1.  **Entry Strategy:**
    *   Validation Anti-bot (The Guardian)
    *   Recherche par Mots-clés (The Hunter)
    *   Tri par Date (récent d'abord)

2.  **Deduplication Logic:**
    *   Vérification ID/Hash unique contre la base Notion avant extraction.

3.  **Data Extraction Schema:**
    *   *Static:* Nom entreprise, Description, Salaire, Pré-requis, Lieux, Nom du contact.
    *   *Dynamic Status:* Contacté, Réponse reçue, Étape processus.

4.  **Lifecycle Management (The Updater):**
    *   **Logic:** Vérification périodique des offres existantes.
    *   **Rule 1 (Time):** Si offre > 1 mois -> Statut "Probablement périmée".
    *   **Rule 2 (Access):** Si erreur 404/disparue -> Statut "N'existe plus".

### SCAMPER Method

**Focus:** Feature Innovation (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse)

**Key Innovations:**

1.  **COMBINE (Scraping + GenAI):**
    *   Le système ne fait pas que lire, il *écrit*.
    *   Utilisation d'un LLM pour analyser l'offre vs le CV utilisateur.

2.  **Product Outputs (SUBSTITUTE blank page):**
    *   Génération automatique de : Lettre de motivation, Message d'approche (3-4 lignes), Arguments clés.

3.  **Workflow MODIFY (On-Demand):**
    *   Eviter le gaspillage de ressources (et d'argent API).
    *   **Logic:** Scraping initial -> User Review -> Click "Generate" (Checkbox/Button) -> LLM Activation.
    *   Donne le contrôle à l'utilisateur et rend le système interactif.

### Reverse Brainstorming

**Focus:** Resilience & Risk Mitigation

**Threat Analysis (How to Fail):**
1.  **Bot Detection:** Triggering anti-scraping protections.
2.  **IP Ban:** Making too many requests too fast.
3.  **HTML Changes:** Selectors breaking when sites update.

**Mitigation Strategies (The Antidotes):**
1.  **Tech Stack:** Use **Playwright/Puppeteer** (Real Browser) over simple HTTP requests.
2.  **Behavior:** Implement **Random Human Delays** and scrolling.
3.  **Network:** Run **Locally** (Residential IP) to avoid cloud IP blacklists.
4.  **Resilience:** Use **Semantic Selectors** (text-based) rather than rigid CSS classes, and implement "Skip & Log" error handling to prevent crashes.

## Session Conclusion

**Outcome:** A complete blueprint for a robust, automated job application system.
**Core Architecture:** Local Playwright Scraper -> Notion Database -> On-Demand LLM Generation.
**Key Value:** Combines automated aggregation with intelligent, user-controlled content generation to maximize efficiency without losing quality.
**Next Steps:** Proceed to technical research (Research Workflow) to validate specific libraries and Notion API integration.
