export const PERMISSIONS = {
  // Patient management
  PATIENTS_VIEW: ["admin", "dentist", "hygienist", "receptionist"],
  PATIENTS_CREATE: ["admin", "receptionist"],
  PATIENTS_EDIT: ["admin", "receptionist"],
  PATIENTS_DELETE: ["admin"],

  // Appointment management
  APPOINTMENTS_VIEW: ["admin", "dentist", "hygienist", "receptionist"],
  APPOINTMENTS_CREATE: ["admin", "dentist", "receptionist"],
  APPOINTMENTS_EDIT: ["admin", "dentist", "receptionist"],
  APPOINTMENTS_DELETE: ["admin"],

  // Treatment management
  TREATMENTS_VIEW: ["admin", "dentist", "hygienist"],
  TREATMENTS_CREATE: ["admin", "dentist"],
  TREATMENTS_EDIT: ["admin", "dentist"],
  TREATMENTS_DELETE: ["admin", "dentist"],

  // Billing management
  BILLING_VIEW: ["admin", "accountant", "receptionist"],
  BILLING_CREATE: ["admin", "accountant", "receptionist"],
  BILLING_EDIT: ["admin", "accountant"],
  BILLING_DELETE: ["admin"],

  // Inventory management
  INVENTORY_VIEW: ["admin", "dentist", "hygienist", "receptionist"],
  INVENTORY_CREATE: ["admin", "receptionist"],
  INVENTORY_EDIT: ["admin", "receptionist"],
  INVENTORY_DELETE: ["admin"],

  // Staff management
  STAFF_VIEW: ["admin"],
  STAFF_CREATE: ["admin"],
  STAFF_EDIT: ["admin"],
  STAFF_DELETE: ["admin"],

  // Reports
  REPORTS_VIEW: ["admin", "dentist", "accountant"],
}

export function hasPermission(userRole: string, permission: string[]): boolean {
  return permission.includes(userRole) || userRole === "admin"
}
