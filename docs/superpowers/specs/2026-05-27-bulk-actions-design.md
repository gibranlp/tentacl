# Tentacl Bulk Actions Specification

## 1. Overview
This specification details the implementation of bulk action capabilities for resource management tables (Containers, Images, Networks, Volumes).

## 2. Design Features
- **UI Interaction:** 
  - Each table row contains a permanently visible checkbox.
  - Table header includes a "Select All" checkbox.
  - Upon selecting one or more items, the table header transforms to display:
    - Selection count (e.g., "3 Selected").
    - Action buttons (e.g., "Start Selected", "Stop Selected", "Remove Selected").
- **Processing:** 
  - Actions will be performed sequentially using a queue system to ensure Docker API stability.

## 3. Implementation Strategy
- **Frontend:** 
  - Update `ContainerTable`, `ImageTable`, `NetworkTable`, `VolumeTable` to maintain selection state.
  - Implement header transformation logic.
- **Backend:** 
  - Leverage existing individual CRUD endpoints, orchestrated sequentially on the frontend.
