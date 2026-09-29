# CIRIS Core Prototype

I want you to rebuild and substantially improve the existing CIRIS platform using this deployed application as the reference:

https://ciris-platform.vercel.app

IMPORTANT CONTEXT:

I currently only have access to the deployed CIRIS website. I do not have the original source repository.

Therefore, treat the existing deployment as the product reference and build a clean, maintainable, functional CIRIS prototype from it.

This is NOT just a visual redesign.

The goal is to create a FUNCTIONAL CIRIS platform where the major interactions, telemetry, diagnostics, engineering simulations, AI diagnostics and AI chat actually work.

The final result should look significantly more polished while also behaving like a real product prototype.

==================================================

1. CORE PRODUCT
   ==================================================

CIRIS is a solar-powered health and safety smartwatch platform.

Core hardware concept:

* ESP32-S3
* MAX30101
* BMI270
* MAX30208 / TMP117
* SHT31
* BME280
* CN3065 solar charging
* LiPo battery
* SOS button
* haptic motor
* piezo/buzzer
* BLE connectivity

The platform should demonstrate how these systems work together.

IMPORTANT:

Because this is currently a web prototype and there may not be a physical ESP32 connected, clearly distinguish:

REAL SOFTWARE FUNCTIONALITY
from
SIMULATED DEVICE TELEMETRY
from
FUTURE HARDWARE INTEGRATION.

Do NOT falsely claim that browser telemetry is coming from physical hardware if it is simulated.

Use a visible but tasteful:

DEMO DEVICE · SIMULATED TELEMETRY

indicator when appropriate.

==================================================
2. PRODUCT GOAL
===============

The finished platform should allow a user to:

1. enter the CIRIS platform
2. view device status
3. view simulated live telemetry
4. view historical telemetry
5. simulate sensor events
6. trigger simulated safety events
7. run AI diagnostics
8. chat with CIRIS Intelligence
9. inspect hardware
10. inspect system architecture
11. inspect engineering telemetry
12. manage emergency contacts
13. view alerts/events
14. create a diagnostic/support report

Everything should have a real UI interaction and state change.

Do not create buttons that merely look functional.

==================================================
3. INFORMATION ARCHITECTURE
===========================

Use a clean application structure:

CIRIS

Overview
Technology
Live Console
Safety
Engineering
Support

Inside Engineering:

Hardware
Telemetry
Diagnostics
Engineering Sandbox

Inside Safety:

SOS
Emergency Contacts
Alerts
Fall Detection

Inside Support:

AI Diagnostics
CIRIS Intelligence
RMA / Support

Do not put every feature into one giant scrolling page.

==================================================
4. OVERVIEW
===========

Create a premium product overview.

Hero:

CIRIS

Solar-powered health & safety intelligence for the wrist.

Supporting text:

Continuous sensing. Autonomous power. Immediate emergency response.

Actions:

Explore CIRIS
Open Live Console

View Architecture

The landing page should communicate the product within approximately 10 seconds.

Do not overwhelm the hero with technical specifications.

==================================================
5. PRODUCT / WATCH ANIMATION
============================

The current deployment contains a product/watch animation.

Rebuild this experience with much better visual quality.

The animation should communicate:

closed watch
→ enclosure
→ PCB
→ sensors
→ processor
→ power system
→ battery
→ solar subsystem
→ reassembled watch

Improve pixel quality.

DO NOT simply upscale blurry assets.

Use high-resolution assets or recreate the product visualization where necessary.

Use:

* WebP/AVIF where appropriate
* WebM/video where appropriate
* high-DPI rendering
* correct aspect ratio
* optimized loading
* smooth animation
* no visible frame tearing
* no blurry scaling
* no layout shifts

The product animation should feel like a premium hardware product presentation.

==================================================
6. LIVE DEVICE CONSOLE
======================

Build a genuinely interactive Live Console.

Display:

Heart Rate
SpO₂
Skin Temperature
Motion
Humidity
Pressure
Battery
Solar Power
Device Status
Safety Status

Use simulated telemetry that changes over time realistically.

Do not randomly change every value independently.

Create a coherent simulated device state.

For example:

Heart rate should respond to activity state.

Motion should affect activity.

Activity should influence heart rate.

Power consumption should respond to activity/display/system load.

Solar input should influence charging.

Environmental sensors should remain correlated.

Battery should slowly change based on:

solar input
system consumption
device state

Provide device states:

Idle
Walking
Running
Emergency
Charging
Low Power

Changing the state should affect relevant telemetry.

==================================================
7. HISTORICAL TELEMETRY
=======================

Create actual historical telemetry visualization.

Allow:

1 hour
6 hours
24 hours

Show charts for:

Heart Rate
SpO₂
Temperature
Battery
Solar Input
Activity

Use generated/demo historical data.

Make the charts interactive.

Hovering over the graph should show:

timestamp
value
state

==================================================
8. DEVICE SIMULATOR
===================

Create a real Engineering Sandbox.

Controls:

ACTIVITY

Idle
Walking
Running

SAFETY

Normal
Simulate Fall
Simulate Impact
Trigger SOS

POWER

Normal
Charging
Low Battery
Darkness
Bright Sun

ENVIRONMENT

Normal
High Temperature
High Humidity
Storm

When a state changes:

update the simulated telemetry
update the dashboard
create an event
update the event log
allow AI diagnostics to see the new state

Do not make these buttons cosmetic.

==================================================
9. SAFETY SYSTEM
================

Implement a functional simulated safety subsystem.

Example:

User selects:

SIMULATE FALL

System should:

1. change motion state
2. detect abnormal acceleration
3. create a fall event
4. update safety status
5. display alert
6. start simulated emergency countdown
7. allow user to cancel
8. if not cancelled, simulate SOS activation
9. create event in history

Display:

Fall detected
Emergency response initiated

This should feel like a real system simulation.

Also implement:

SOS activation
SOS cancellation
Emergency contacts
Alert history
Safety event history

==================================================
10. AI DIAGNOSTICS
==================

THIS IS A CRITICAL REQUIREMENT.

The AI diagnostics system must actually work.

Create:

CIRIS AI DIAGNOSTICS

The system should analyze the current device state.

It should have access to:

* current telemetry
* historical telemetry
* device state
* battery state
* solar input
* environmental readings
* motion state
* safety events
* recent alerts
* simulated sensor faults

The AI should identify:

* abnormal readings
* sensor anomalies
* battery issues
* power problems
* temperature anomalies
* motion/fall events
* inconsistent sensor combinations
* possible hardware faults
* potential safety events

The output should be structured.

Example:

DIAGNOSTIC RESULT

Status:
WARNING

Detected:
Unusual power consumption

Evidence:
Battery dropped 8% while solar input remained near zero.

Affected subsystem:
Power

Likely cause:
High device activity combined with insufficient solar input.

Recommended action:
Reduce system activity or recharge device.

Confidence:
87%

==================================================
11. AI DIAGNOSTIC MODES
=======================

Provide:

Run Full Diagnostics

Quick Health Check

Analyze Current Event

Analyze Sensor

Analyze Battery

Analyze Safety Event

Each should generate useful output based on the actual simulated device state.

Do NOT return the same generic response every time.

The response must use the current telemetry/context.

==================================================
12. CIRIS INTELLIGENCE CHAT
===========================

Create a functional AI chat interface.

Name:

CIRIS Intelligence

Subtitle:

Context-aware device assistant

The assistant should understand the current device context.

Users can ask:

"Is my device healthy?"

"Why is the battery dropping?"

"What happened during the last event?"

"Why did the fall detector trigger?"

"Explain the current sensor readings."

"Is the solar system charging?"

"What does the MAX30101 measure?"

"What should I check if SpO₂ becomes abnormal?"

The assistant should answer using:

current telemetry
historical telemetry
device state
known CIRIS hardware
recent events
diagnostic results

==================================================
13. AI IMPLEMENTATION
=====================

Do NOT create a fake chat UI that only returns predefined responses.

Use a proper AI backend/API architecture.

Create a secure server-side AI endpoint.

NEVER expose API keys in client-side code.

Create an abstraction such as:

/api/ai/chat

/api/ai/diagnostics

The AI layer should receive structured CIRIS context rather than an uncontrolled dump of the entire application state.

Create a structured context object containing:

device_state
telemetry
history
alerts
events
hardware
diagnostics

Use environment variables for AI credentials.

If an external AI provider is not configured, implement a clearly identified local/demo fallback so the application remains usable.

Do not pretend the fallback is a real external AI model.

==================================================
14. AI SAFETY
=============

CIRIS is health and safety related.

The AI must NOT present itself as a doctor or make definitive medical diagnoses.

It should provide:

observations
possible explanations
device-level recommendations
safety warnings
appropriate escalation guidance

For potentially dangerous health readings, recommend appropriate professional/emergency assistance rather than claiming certainty.

Make the distinction between:

DEVICE OBSERVATION
and
MEDICAL DIAGNOSIS

very clear.

==================================================
15. AI DIAGNOSTIC HISTORY
=========================

Store previous diagnostic results for the current demo/device session.

Show:

timestamp
diagnostic type
status
affected subsystem
summary

Allow the user to open a previous diagnostic result.

==================================================
16. EVENT SYSTEM
================

Create a centralized event system.

Events should include:

sensor anomaly
fall detected
SOS activated
SOS cancelled
low battery
charging started
charging stopped
high temperature
abnormal motion
diagnostic completed

Every event should have:

ID
timestamp
type
severity
message
source
related telemetry where applicable

Use this same event system across:

Live Console
Safety
Engineering
AI Diagnostics

Do not build separate disconnected event systems for each page.

==================================================
17. HARDWARE EXPLORER
=====================

Create an interactive hardware explorer.

Categories:

Compute
Optical
Motion
Thermal
Environment
Power
Solar
Safety
Audio/Haptic

Each component should show:

component
purpose
key specifications
CIRIS role

Important components:

ESP32-S3
MAX30101
BMI270
MAX30208
TMP117
SHT31
BME280
CN3065
LiPo battery
SOS
haptic motor
piezo

Use expandable technical details.

==================================================
18. ENGINEERING TELEMETRY
=========================

Provide an engineering-level telemetry view.

Include:

raw sensor values
sampling information
device state
event stream
power state
sensor status

Use clean instrumentation-style UI.

The engineering console should feel different from the normal consumer dashboard while remaining visually consistent.

==================================================
19. SUPPORT / RMA
=================

Create a functional support workflow.

Fields:

Name
Email
Hardware category
Issue
Description

Automatically attach relevant diagnostic context when possible.

Example:

Device state
Latest diagnostics
Recent events
Relevant telemetry

Allow generation of a structured support/RMA report.

==================================================
20. AUTHENTICATION / DEMO MODE
==============================

Provide:

Sign In
Register Device
Continue in Demo Mode

Do not force emergency contacts during initial authentication.

Emergency contacts belong inside Safety.

If actual authentication/backend persistence cannot be implemented with the currently available infrastructure, clearly structure the application so authentication can be connected later.

Do not create fake security claims.

==================================================
21. DESIGN SYSTEM
=================

The visual redesign must be substantial.

Use:

dark graphite
subtle borders
premium typography
restrained accent colors
clean spacing
strong hierarchy

The platform should feel like:

premium wearable technology
+
engineering console
+
medical-device interface
+
aerospace instrumentation

Avoid:

generic AI SaaS
cyberpunk
excessive neon
excessive glass
random gradients
floating decorative cards
overuse of rounded rectangles
huge text everywhere
tiny unreadable text
excessive glowing borders

==================================================
22. NAVIGATION
==============

Primary:

Overview
Technology
Live Console
Safety
Engineering
Support

Persistent device state:

● DEMO DEVICE
SIMULATED TELEMETRY

Use breadcrumbs or contextual headers where useful.

Avoid confusing nested navigation.

==================================================
23. RESPONSIVE DESIGN
=====================

Fully support:

desktop
laptop
tablet
mobile

Do not merely shrink desktop components.

Ensure:

no horizontal overflow
touch-friendly controls
readable charts
proper mobile navigation
proper animation scaling
usable diagnostic panels
usable chat interface

==================================================
24. PERFORMANCE
===============

Optimize:

animation assets
images
fonts
JavaScript
component rendering
chart rendering
AI request handling
loading states

Lazy-load heavy sections.

Do not load massive animation assets unnecessarily.

==================================================
25. ERROR / LOADING STATES
==========================

Every major interactive system needs:

loading
success
error
empty
offline
simulated/demo

states.

AI:

Generating diagnosis...
AI unavailable
Retry

Telemetry:

Connecting...
Connected
Simulation paused

Device:

Online
Offline
Demo

==================================================
26. CODE ARCHITECTURE
=====================

Create a clean modular architecture.

Separate:

UI
simulation
telemetry
events
AI
diagnostics
hardware metadata
support

Do not put the entire application logic into page components.

Create reusable components.

Avoid duplicated logic.

==================================================
27. IMPORTANT FUNCTIONALITY RULE
================================

Do not create buttons that do nothing.

Every visible action must either:

* change application state
* trigger a real API request
* update telemetry
* create an event
* open meaningful information
* run a simulation
* generate a diagnostic
* send a chat request
* submit/store data

If something cannot actually be implemented, do not make it look implemented.

Clearly mark it:

Coming Soon
Hardware Required
Demo Only

==================================================
28. FINAL EXPERIENCE
====================

The final CIRIS platform should feel like a real working prototype rather than a static concept website.

A user should be able to:

ENTER CIRIS
↓
SEE DEVICE STATUS
↓
OPEN LIVE TELEMETRY
↓
CHANGE DEVICE STATE
↓
SIMULATE A SENSOR EVENT
↓
SEE THE SYSTEM RESPOND
↓
RUN AI DIAGNOSTICS
↓
ASK CIRIS INTELLIGENCE ABOUT THE EVENT
↓
VIEW THE RESULT IN HISTORY
↓
GENERATE A SUPPORT/RMA REPORT

This complete flow is essential.

==================================================
29. IMPLEMENTATION ORDER
========================

Do not attempt a superficial redesign first.

Build in this order:

PHASE 1
Inspect existing deployment/reference and establish project architecture.

PHASE 2
Create design system and application shell.

PHASE 3
Implement device-state and telemetry simulation engine.

PHASE 4
Implement event system.

PHASE 5
Implement Live Console and historical telemetry.

PHASE 6
Implement Safety subsystem and event simulation.

PHASE 7
Implement AI diagnostics backend.

PHASE 8
Implement CIRIS Intelligence chat.

PHASE 9
Implement hardware/engineering explorer.

PHASE 10
Implement support/RMA.

PHASE 11
Implement high-quality product animation.

PHASE 12
Responsive and performance optimization.

PHASE 13
Complete QA.

==================================================
30. QA REQUIREMENT
==================

Before considering the project complete, test the complete user journey.

Test:

* navigation
* telemetry updates
* historical charts
* state changes
* fall simulation
* SOS simulation
* emergency cancellation
* event creation
* diagnostic generation
* diagnostic history
* AI chat
* AI context awareness
* hardware explorer
* RMA generation
* mobile layouts
* animation
* loading states
* error states

Fix console errors.

Fix broken interactions.

Fix layout overflow.

Fix duplicated components.

Fix visual inconsistencies.

Do not stop at making the homepage look good.

The entire platform must work.

==================================================
FINAL DESIGN PRINCIPLE
======================

The objective is NOT:

"make this website prettier."

The objective is:

"turn CIRIS into a polished, functional, believable wearable health-and-safety engineering platform."

Keep the technical depth.

Organize it.

Make the interactions real.

Make the AI actually useful.

Make the diagnostics context-aware.

Make the visual design premium and intentional.

And make it clear which capabilities are simulated versus connected to physical hardware.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ciris-pulse-guardian.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a0720c6e-a77f-4a66-9e6a-865562bfa76e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
