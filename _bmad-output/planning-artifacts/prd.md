---
stepsCompleted: [1, 2, 3, 4, 9, 10, 11]
inputDocuments:
  - "c:/RealProject/ScrapperOffre/_bmad-output/planning-artifacts/product-brief-ScrapperOffre-2026-01-07.md"
  - "c:/RealProject/ScrapperOffre/_bmad-output/planning-artifacts/research/technical-Architecture-automation-research-2026-01-07.md"
  - "c:/RealProject/ScrapperOffre/_bmad-output/analysis/brainstorming-session-2026-01-06.md"
workflowType: 'prd'
lastStep: 1
briefCount: 1
researchCount: 1
brainstormingCount: 1
projectDocsCount: 0
---

# Product Requirements Document - ScrapperOffre

**Date:** 2026-01-07

## Executive Summary

ScrapperOffre est une solution d'automatisation "Local-First" conçue pour transformer la recherche d'emploi en un processus fluide et organisé. Destiné aux étudiants, jeunes diplômés et freelances, l'outil élimine la friction de la veille et de la candidature en centralisant automatiquement les offres (LinkedIn, Indeed, HelloWork, WTTJ) dans Notion et en pré-rédigeant des messages d'approche via une IA locale.

### What Makes This Special

*   **Souveraineté des Données :** Contrairement aux SaaS, tout tourne en local (Node.js + Ollama). Aucune donnée utilisateur ne quitte la machine (Privacy & Zero-Cost).
*   **Expérience "Zéro-Config" :** Abstraction complète de la complexité technique via un installateur simplifié, rendant la puissance du scraping et de l'IA accessible aux profils non-techs.
*   **Intégration Workflow Native :** Ne force pas l'adoption d'un nouvel outil d'organisation ; s'insère transparentement dans l'écosystème Notion existant de l'utilisateur sous forme de service d'arrière-plan.

## Project Classification

**Technical Type:** Local Background Automation
**Domain:** Productivity / HR Tech
**Complexity:** Medium
**Project Context:** Greenfield - new project

## Success Criteria

### User Success (The "Why")
*   **Time Efficiency:** "Time to Apply" réduit à **< 3 min/offre** (vs 20 min).
*   **Outcome:** Génération stable de **2-3 entretiens/semaine**.
*   **Ease of Use:** Installation complète (Wizard) en **< 5 minutes** sans erreur.

### Technical Success (The "How")
*   **Engineering Standards:** Refus strict de la dette technique. Adhésion aux principes **SOLID, DRY, KISS, YAGNI**.
*   **Quality Assurance (TDD):**
    *   Développement piloté par les tests (TDD) obligatoire.
    *   Couverture **Unit & E2E** critique.
    *   Suite de tests **Non-Régression** automatisée avant chaque commit.
*   **System Performance:**
    *   Scraping : **< 30s** par page de résultats.
    *   IA : Génération de message en **< 10s** (sur hardware standard).
    *   Fiabilité : **< 0.1%** d'erreurs de synchronisation Notion.
*   **Developer Experience (DX):** Codebase propre, modulaire et documentée, permettant une contribution facile.

### Business Success (The Value)
*   **Volume:** Capacité de traiter **50+ offres qualifiées/semaine**.
*   **Health:** **0 Bannissement** de compte LinkedIn sur 3 mois (Grâce aux stratégies d'évitement Smart Scraping).

## Product Scope

### MVP - Minimum Viable Product
*   **Multi-Platform Scraper:** LinkedIn, Indeed, HelloWork, WTTJ.
*   **Integration:** Synchro unidirectionnelle vers Notion (Database "Job Tracker").
*   **Local AI:** Génération de messages d'approche via Ollama (Llama 3).
*   **UX:** Setup Wizard (CLI Interactive) pour installation Zéro-Config.

### Vision (Future)
*   **V2:** Système de Notifications temps réel.
*   **V3:** Application Desktop complète (Tauri) avec Analytics candidat.

## User Journeys

### Journey 1: The "Silent Guardian" (Error Recovery)
Tom lance son script avant d'aller se coucher, espérant trouver des offres fraîches au réveil. Durant la nuit, LinkedIn déclenche un captcha inattendu.
*   **Au lieu de crasher silencieusement**, le système détecte le blocage et se met en pause.
*   **Résolution :** Le lendemain, Tom ouvre son Notion. Il voit une **bannière "Callout" rouge** en haut de son Dashboard : *"⚠️ LinkedIn inaccessible temporairement (Limitation technique détectée). Réessai auto dans 24h."*
*   Grâce à cette transparence, Tom sait que le système fonctionne mais est en pause de sécurité. Il n'est pas banni.

### Journey 2: The "Pivot" (Configuration Change)
Après 2 mois de stage, Lucas cherche maintenant un CDI. Il doit mettre à jour ses critères.
*   **Action :** Il va dans la section "Configuration" de son Dashboard Notion.
*   **Interaction :** Il voit un champ Multi-Select "Contrat". Il décoche "Stage" et sélectionne "CDI" (valeur prédéfinie).
*   Il ajoute aussi un tag custom "Télétravail" dans le champ "Mots-clés".
*   Tom n'a jamais touché au fichier de config JSON. Tout s'est fait visuellement.

### Journey 3: The "Urgent Hunter" (Manual Trigger)
Sarah, freelance, vient de terminer une mission. Elle veut voir les offres *maintenant*, pas demain.
*   **Action :** Elle clique sur un bouton "🔄 Refresh Now" dans son Notion.
*   **Contrainte System :** Comme elle a déjà rafraîchi il y a 1h, le système lui affiche un message : *"⏳ Cool down activé. Prochain scan possible dans 2h pour protéger votre compte."*
*   Sarah comprend que l'outil la protège contre elle-même. Elle revient plus tard.

### Journey Requirements Summary
*   **Notion Write Access :** Capacité d'écrire des blocs (Callouts) et de lire des propriétés (Tags).
*   **State Persistence :** Le système doit se souvenir de la dernière heure de scan (pour le cooldown).
*   **Error Categorization :** Distinguer "Bug script" vs "Blocage plateforme" pour adapter le message.

## Functional Requirements

### 1. Scraping Core & Providers
*   **FR-01:** Scraper les offres depuis LinkedIn, Indeed, HelloWork, WTTJ via liste d'URLs.
*   **FR-02:** Extraire les métadonnées normalisées (Titre, Entreprise, Lieu, Contrat, Salaire, URL, Description).
*   **FR-03:** Gérer la pagination et les limites de volume par session.
*   **FR-04:** Mécanisme "Circuit Breaker" : pause automatique en cas de détection de bot/captcha.

### 2. Notion Integration
*   **FR-05:** Initialisation & validation du schéma de la Database Notion au démarrage.
*   **FR-06:** Dédoublonnage strict des offres basé sur l'URL source.
*   **FR-07:** Mapping dynamique des statuts et tags via configuration.

### 3. Local AI Assistant
*   **FR-08:** Génération de message déclenchée par une propriété Notion ("Generate").
*   **FR-09:** Insertion du contenu généré dans le corps de la page Notion.

### 4. System & Data Management
*   **FR-10 (Logs):** Le système doit produire des logs structurés (Info, Warn, Error) avec rotation de fichiers pour le debugging.
*   **FR-11 (Export):** L'utilisateur doit pouvoir exporter l'historique des jobs en JSON/CSV local via une commande, pour backup ou analyse externe.
*   **FR-12 (Wizard):** Assistant d'installation CLI interactif pour configurer les credentials et chemins.

## Non-Functional Requirements

### Quality & Maintainability (Engineering Excellence)
*   **NFR-01 (Testing):** Couverture de tests obligatoire : Unitaires (>80%), Intégration (API Notion mockée), et E2E (Scraping sur pages statiques).
*   **NFR-02 (Standards):** Validation stricte via ESLint/Prettier et Typage fort (TypeScript Strict Mode). Architecture Modulaire (Provider Pattern).
*   **NFR-03 (Observability):** Logs clairs permettant de tracer une erreur sans debugger le code.

### Security & Privacy
*   **NFR-04 (Local-First):** AUCUNE donnée (credentials, cookies, jobs) ne doit être envoyée vers un serveur tiers autre que Notion/Ollama.
*   **NFR-05 (Storage):** Les tokens Notion et cookies doivent être stockés localement de manière sécurisée (ou via var d'env).

### Performance & Reliability
*   **NFR-06 (Resilience):** Retry policy exponentielle pour les requêtes réseau échouées.
*   **NFR-07 (Footprint):** L'empreinte mémoire du processus Node.js ne doit pas excéder 500Mo.
