# vSphere Bootstrap Designer

vSphere Bootstrap Designer is an MVP web application for collecting post-install vSphere cluster design inputs, validating them aggressively, and generating two outputs:

- a deployment plan
- a PowerCLI script for execution

This project assumes ESXi hosts are already installed and reachable, and that vCenter already exists. It does not perform bare-metal ESXi installation, VCSA deployment, NSX integration, or storage array automation.

## What the MVP does

- creates a datacenter
- creates a cluster
- adds ESXi hosts to a cluster
- creates one vSphere Distributed Switch
- creates VLAN-backed distributed port groups
- models dedicated VMkernel networking intent for management, vMotion, storage A, and storage B
- validates VLAN, uplink, host, and VMkernel assignment rules
- generates a PowerCLI script based on the submitted design

## Key networking opinion

The app enforces a strict separation model:

- the management port group carries only the management VMkernel adapter
- the vMotion port group carries only the vMotion VMkernel adapter
- the storage A port group carries only the storage A VMkernel adapter
- the storage B port group carries only the storage B VMkernel adapter
- guest VM port groups carry no VMkernel adapters

Storage is handled as a special case with exactly two storage VLANs and exactly two storage VMkernel networks.

## Project structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── tests/
│   ├── pyproject.toml
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── steps/
│   │   ├── types/
│   │   └── utils/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── examples/
│   ├── sample-design.json
│   └── sample-powercli.ps1
└── README.md
```

## JSON contract


Top-level sections:

- `metadata`
- `vcenter`
- `datacenter`
- `cluster`
- `distributedSwitch`
- `networking`
- `hosts`

Important fields:

- `networking.vmkernelPortgroups.management`
- `networking.vmkernelPortgroups.vmotion`
- `networking.vmkernelPortgroups.storageA`
- `networking.vmkernelPortgroups.storageB`
- `networking.guestPortgroups`
- `hosts[].vmkernelAdapters`

## Backend

Tech stack:

- FastAPI
- Pydantic

Main backend files:


API endpoints:

- `GET /api/health`
- `GET /api/designs/schema`
- `POST /api/designs/validate`
- `POST /api/designs/generate`

Validation rules include:

- required fields and structural validity
- unique VLAN IDs across management, vMotion, storage, and guest traffic
- exactly two storage networks through `storageA` and `storageB`
- storage A and storage B VLANs must differ
- storage preferred uplinks must differ unless explicitly allowed
- storage preferred and secondary uplinks must differ per storage network
- storage uplinks cannot overlap with guest traffic uplinks
- each host must provide complete VMkernel definitions
- each VMkernel role must map only to its dedicated port group key

## Frontend

Tech stack:

- React
- TypeScript
- Vite


Wizard flow:

1. Environment
2. VMkernel Networks
3. Storage Networks
4. Guest Networks
5. Hosts
6. Review

The review screen explicitly restates the dedicated VMkernel mapping so the operator can confirm that guest networks do not receive VMkernel adapters.

## Local setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

If your backend runs elsewhere, set:

```bash
export VITE_API_BASE="http://localhost:8000/api"
```

## Usage

1. Open the frontend.
2. Complete the multi-step form.
3. Use Validate at any stage to check the design.
4. Review the dedicated VMkernel and guest network separation on the Review step.
5. Generate the output.
6. Copy the generated PowerCLI from the results page into your operational process after review.



## Assumptions

- one datacenter per design
- one cluster per design
- one distributed switch per design
- guest traffic is distributed-port-group-only and never VMkernel-backed
- storage requires exactly two dedicated VMkernel networks
- PowerCLI is generated but not executed by the app
- no authentication or persistence in the MVP

## Known MVP limits

- no database persistence
- no authentication
- no execution of PowerCLI from the web app
- no rollback logic
- no NSX, storage array, or lifecycle integration

