# Bulk Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement bulk selection and sequential action execution for container, image, network, and volume tables.

**Architecture:**
- **Frontend State:** Use `Set<string>` or similar for tracking selected IDs per table.
- **Header Transformation:** Update table headers to detect selection and render bulk action buttons.
- **Processing:** Sequential queue-based processing of actions (e.g., delete, start, stop).

**Tech Stack:** React, TypeScript, Lucide React.

---

### Task 1: Bulk Selection Logic
**Files:**
- Modify: `frontend/src/components/ContainerTable.tsx`
- Modify: `frontend/src/components/ImageTable.tsx`
- Modify: `frontend/src/components/NetworkTable.tsx`
- Modify: `frontend/src/components/VolumeTable.tsx`

- [ ] **Step 1: Add selection state to tables**
  Add `[selectedIds, setSelectedIds] = useState<Set<string>>(new Set())` to each table.

- [ ] **Step 2: Add checkboxes to rows and header**
  Add a checkbox column in `<thead>` and `<tbody>`. Implement "Select All" logic.

### Task 2: Header Integration
**Files:**
- Modify: `frontend/src/components/ContainerTable.tsx` (Repeat for other tables)

- [ ] **Step 1: Implement conditional header rendering**
  If `selectedIds.size > 0`, swap standard table header with action bar showing count and buttons.

### Task 3: Sequential Action Executor
**Files:**
- Create: `frontend/src/utils/bulkActions.ts`

- [ ] **Step 1: Create `executeBulkAction` utility**
  Takes an array of IDs and an async action function. Loops through IDs calling the action, ensuring sequential completion.

### Task 4: Integration
**Files:**
- Modify: All table components

- [ ] **Step 1: Link bulk buttons to `executeBulkAction`**
  Wire up "Start Selected", "Stop Selected", etc., to the new utility.
