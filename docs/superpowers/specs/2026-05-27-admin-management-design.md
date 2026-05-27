# Tentacl Admin Management Specification

## 1. Overview
This specification details the implementation of a "Settings" view for user management, password updates, and Role-Based Access Control (RBAC).

## 2. Design Features
- **User Management:**
  - Admin users can list all users.
  - Admin users can create new users with a designated role (`admin` or `readonly`).
  - Admin users can delete other users.
- **Security:**
  - Users can change their own password by providing the current password and the new password.
- **Role-Based Access Control (RBAC):**
  - `admin`: Full control over all resources and settings.
  - `readonly`: Can view all resources (Containers, Images, etc.) but cannot perform any write operations (Create, Start, Stop, Delete, Pull). Action buttons will be hidden in the UI.
- **UI Interaction:**
  - A new "SETTINGS" item in the Sidebar.
  - Settings view divided into "User Management" (Admin only) and "Security" (All users).

## 3. Implementation Strategy
- **Backend:**
  - Update `db.User` struct to include `Role`.
  - Extend `AuthHandler` to support user listing, deletion, and password updates.
  - Add RBAC middleware to protect mutation endpoints.
  - Update JWT claims to include `role`.
- **Frontend:**
  - Create `SettingsView` component.
  - Update `AuthContext` to store and expose user role.
  - Conditional rendering in tables and wizards based on user role.
  - Add "SETTINGS" to `Sidebar` and `AppRouter`.
