---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - "c:/RealProject/ScrapperOffre/_bmad-output/analysis/brainstorming-session-2026-01-06.md"
  - "c:/RealProject/ScrapperOffre/_bmad-output/planning-artifacts/research/technical-Architecture-automation-research-2026-01-07.md"
date: 2026-01-07
author: Roket
---

# Product Brief: ScrapperOffre

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

ScrapperOffre est une solution d'automatisation intelligente et locale destinée à transformer la recherche d'emploi, souvent fastidieuse et répétitive, en un processus fluide et organisé. Conçu pour les développeurs et chercheurs d'emploi soucieux de leur vie privée, cet outil utilise la technologie de scraping avancée (Playwright) pour agréger les offres de LinkedIn et Indeed directement dans un tableau de bord Notion centralisé.

En se distinguant par son approche "Local-First" et "Zéro-Config" (via un Setup Wizard), ScrapperOffre élimine les coûts récurrents et garantit la confidentialité des données en s'appuyant sur des modèles d'IA locaux (Ollama) pour l'analyse des offres. La stratégie de déploiement privilégie une V1 MVP intégrée à Notion, évolutive vers une V2 "Desktop App" autonome, offrant ainsi une valeur immédiate tout en préparant le futur.

---

## Core Vision

### Problem Statement

La recherche d'emploi moderne est un parcours du combattant fragmenté : les candidats passent des heures à naviguer entre plusieurs plateformes (LinkedIn, Indeed), à copier-coller des détails dans des feuilles de calcul pour le suivi, et à rédiger des lettres de motivation répétitives. Ce processus manuel est chronophage, sujet aux erreurs, et mentalement épuisant, détournant l'énergie de la préparation aux entretiens.

### Problem Impact

*   **Perte de temps massive :** Des heures perdues sur des tâches administratives à faible valeur ajoutée.
*   **Charge mentale :** Difficulté à suivre l'état des candidatures (Envoyé, Relance, Entretien).
*   **Occasions manquées :** Réactivité faible face aux nouvelles offres due à la fatigue.
*   **Vie privée exposée :** Utilisation d'outils en ligne tiers qui collectent souvent les données des candidats.

### Why Existing Solutions Fall Short

*   **Outils SaaS onéreux :** Les bots existants nécessitent souvent des abonnements mensuels et dépendent d'API payantes.
*   **Complexité technique :** Les scripts open-source existants nécessitent souvent une configuration lourde (.env, Docker) rédhibitoire pour le grand public.
*   **Manque de personnalisation :** Les solutions "auto-apply" envoient souvent des messages génériques.
*   **Données dispersées :** Peu d'outils offrent une intégration fluide avec un outil de gestion personnel comme Notion.

### Proposed Solution (V1 - MVP)

ScrapperOffre V1 propose une architecture modulaire exécutée localement :
1.  **Agrégation Automatisée :** Un script intelligent (Playwright) qui visite les plateformes cibles et extrait les offres pertinentes.
2.  **Expérience "Clé en Main" :** Un "Setup Wizard" interactif guide l'installation initiale (Notion Token, Ollama Model), rendant l'outil accessible sans compétences DevOps.
3.  **Centralisation Notion :** Synchronisation automatique vers une base de données Notion.
4.  **Intelligence Locale à la Demande :** Intégration optimisée d'Ollama (Llama 3) activée uniquement lorsque l'utilisateur le demande, pour minimiser l'impact ressources.

### Key Differentiators

*   **100% Gratuit & Privé :** Utilisation exclusive de ressources locales (Ollama), zéro dépendance au Cloud pour l'IA.
*   **Zéro-Config :** Installation guidée pas-à-pas masquant la complexité technique sous-jacente.
*   **Indétectabilité :** Stratégie de scraping "Humaine" et résiliente.
*   **Intégration Notion Native :** S'intègre dans le workflow de productivité existant de l'utilisateur.

---

## Target Users

### Primary User: "L'Étudiant / Jeune Diplômé" (The Efficient Seeker)
*   **Profil :** Étudiant en recherche de stage/alternance ou jeune diplômé cherchant son premier CDI.
*   **Contexte :** Tech ou Non-Tech (Marketing, Commerce, RH). Sous pression, envoie des dizaines de candidatures par semaine.
*   **Frustrations :**
    *   Passe ses journées à rafraîchir LinkedIn/Indeed.
    *   Épuisé par la rédaction de lettres de motivation "sur-mesure" qui se ressemblent toutes.
    *   Perd le fil de ses candidatures (tableurs Excel mal tenus).
*   **Niveau Technique :** Variable. Sait utiliser un ordinateur mais refuse de passer 2h à configurer un environnement de dev. Veut un outil qui "juste marche".
*   **Objectif :** Décrocher un entretien en minimisant le temps administratif.

### Secondary User: "Le Freelance / Chasseur d'Opportunités"
*   **Profil :** Indépendant cherchant ses prochaines missions.
*   **Besoin spécifique :** Veille ultra-ciblée (mots-clés précis, TJM).
*   **Motivation :** Réactivité. Veut être le premier à répondre à une offre fraîche.

### User Journey (Le "Happy Path")

1.  **Installation (Day 0) :**
    *   Télécharge ScrapperOffre.
    *   Lance le "Setup Wizard" : Se connecte à Notion en 2 clics, le script vérifie/installe Ollama silencieusement (ou guide l'install).
    *   *Aha! Moment :* Une base de données "Job Tracker" apparaît magiquement dans son Notion personnel.

2.  **Configuration (Day 1) :**
    *   Rentre ses critères dans Notion (ex: "Alternance Marketing Paris").
    *   Coche "Active".

3.  **Usage Quotidien (Routine) :**
    *   Le script tourne en fond (ou lancé manuellement via une icône bureau).
    *   L'utilisateur ouvre Notion : 10 nouvelles offres qualifiées sont là.
    *   Il coche "Générer Intro" sur une offre intéressante.
    *   *Magic Moment :* En 3 secondes (via Ollama local), un message d'approche hyper-personnalisé apparaît, mentionnant les points clés de l'annonce.
    *   Il copie-colle, envoie, et change le statut à "Candidaté".

---

## MVP Scope (V1)

### Core Features
1.  **Multi-Platform Scraping Engine (Playwright)**
    *   **Sources supportées :** LinkedIn, Indeed, HelloWork, Welcome to the Jungle.
    *   **Architecture "Provider" :** Conception modulaire pour ajouter facilement d'autres sources futur.
    *   **Extraction Unifiée :** Normalisation des données (Titre, Entreprise, Salaire, URL, Description) quel que soit le site source.
    *   **Filtrage Intelligent :** Mots-clés requis/interdits (ex: "React", "Junior" / Exclusion "ESN", "Stage").
2.  **Notion Sync "Zero-Config"**
    *   Création automatique de la DB Notion si absente lors du premier lancement.
    *   Dédoublonnage centralisé (ne crée pas d'entrée si l'URL existe déjà).
3.  **Local AI Assistant (Ollama)**
    *   **Intégration Notion :** Bouton "Générer Intro" (via propriété Checkbox ou Status).
    *   **Prompt Engineering :** Génération de message d'approche personnalisé basé sur la description de l'offre (Template système optimisé).
4.  **Setup Wizard**
    *   CLI interactive pour l'installation initiale (Check Node, Check Ollama, Set Notion Token).

### Out of Scope for MVP
*   **Système de Notifications :** Pas d'email ou de popup desktop. L'utilisateur doit vérifier son Notion.
*   **Multi-Compte :** Un seul profil candidat supporté pour l'instant.
*   **Interface Graphique (GUI) :** L'outil tourne en tâche de fond ou via terminal, piloté depuis Notion.
*   **Auto-Apply :** Pas de candidature automatique ("1-click apply"). L'utilisateur garde le contrôle de l'envoi final.

### MVP Success Criteria
*   **Adoption :** L'utilisateur lance le script au moins 3 fois par semaine.
*   **Stabilité :** < 1% d'erreurs de scraping sur les 4 plateformes.
*   **Satisfaction :** L'utilisateur génère au moins 5 messages d'approche par session.

### Future Vision (V2 & Beyond)
*   **Desktop App Standalone (Tauri) :** S'affranchir de Notion pour les utilisateurs qui préfèrent une app dédiée.
*   **Notifications Temps Réel :** Être alerté dans la minute d'une nouvelle offre "Dream Job".
*   **Analytics Candidat :** Tableau de bord des taux de réponse et performance des messages.

---

## Success Metrics

### Primary Metric: Efficiency (Time to Apply)
*   **Objectif :** Réduire drastiquement le temps consacré à chaque candidature individuelle.
*   **KPI :** Réduire le **"Time to Apply" moyen de 20 min à < 3 min** par offre (incluant la relecture humaine rapide).
*   **Pourquoi :** Maximise le ROI du temps investi par l'utilisateur.

### Secondary Metric: Outcome (Interviews)
*   **Objectif :** Transformer le volume en résulats concrets.
*   **KPI :** Générer un flux régulier de **2 à 3 entretiens par semaine**.
*   **Pourquoi :** Privilégier la qualité de la conversion sur la quantité de spam ("Vanity Metrics").

### Technical Health Metric: Resilience
*   **Objectif :** Garantir la pérennité du service sans risquer les comptes utilisateurs.
*   **KPI :** **99% de détection proactive des blocages** (Arrêt automatique avant bannissement). "Service Health Score" positif.
*   **Pourquoi :** Mieux vaut rater un jour de scraping que de perdre son compte LinkedIn.
