# SmartQ 🍽️

> QR-Based Smart Queue & Pre-Order System for Restaurants

## Problem
Restaurants during peak hours face long waiting lines outside while tables inside remain underutilized. Customers have no visibility into wait times, and food preparation only begins after seating — creating unnecessary delays and lost revenue.

## Inspiration
It all started with biryani.

Not just any biryani — Golconda's, the kind of place where the smell hits you from the parking lot and suddenly nothing else in life matters. We showed up hungry, excited, ready. Then we saw the line. 45 minutes. Outside. In Chennai heat.
No token. No updates. No idea if we were getting closer or just slowly becoming part of the scenery. Meanwhile we could literally see empty tables inside. It was painful in a way that only hunger and injustice combined can be.
That was the moment. Not a boardroom, not a research paper — just two hungry college kids standing outside a biryani shop wondering why nobody had fixed this yet.
So we did.

## Solution
SmartQ is a QR-based web app where walk-in customers scan a code to join a digital queue, view their position in real time, and pre-order food while waiting — so the kitchen can start preparing before they're even seated.

## Live Demo
🔗 https://smartq2-4a715.web.app

## How It Works
**Customer flow:**
1. Scan QR code at restaurant entrance
2. Enter group size and table sharing preference
3. Get a token number and see live queue position
4. Pre-order food from the menu while waiting
5. Get notified when table is ready

**Staff flow:**
1. Open dashboard at /dashboard
2. View live queue with all waiting groups
3. See pre-orders and revenue in real time
4. Seat groups with one click

## Tech Stack
- React + Vite
- Firebase Firestore (real-time database)
- Firebase Hosting
- React Router DOM

## Team
- Hackathon: Resonate 2026
- Track: Smart Infrastructure & Urban Resilience
