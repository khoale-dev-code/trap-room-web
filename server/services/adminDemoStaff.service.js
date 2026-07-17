
import { Employee } from "../models/Employee.js";
import { WorkShift } from "../models/WorkShift.js";
import {
  STAFF_ROLE_TEMPLATES,
  normalizePermissions,
} from "../security/staffPermissions.js";
import { hashPassword } from "../utils/password.js";

const STAFF_DEMO_PREFIX =
  "TRAP_ADMIN_GUIDE_V2_STAFF";

const DEMO_PASSWORD =
  "TrapDemo@2026";

export async function getAdminDemoStaffStatus() {
  const [employees, workShifts] =
    await Promise.all([
      Employee.countDocuments({
        isDemo: true,
        demoKey: {
          $regex: `^${STAFF_DEMO_PREFIX}:`,
        },
      }),
      WorkShift.countDocuments({
        isDemo: true,
        demoKey: {
          $regex: `^${STAFF_DEMO_PREFIX}:`,
        },
      }),
    ]);

  return {
    counts: {
      employees,
      workShifts,
    },
    total:
      Number(employees || 0) +
      Number(workShifts || 0),
  };
}

export async function seedAdminDemoStaffData() {
  const employees = [];

  const employeeDefinitions = [
    {
      key: "manager",
      employeeCode: "DEMO-MGR-01",
      fullName: "[DEMO] Mai Manager",
      phone: "0909000101",
      email: "demo.manager@trap.local",
      position: "Store Manager",
      role: "manager",
      username: "demo.manager",
      permissions:
        STAFF_ROLE_TEMPLATES.manager,
      note:
        "[DEMO] Account is disabled by default. Enable it only during supervised training.",
    },
    {
      key: "barista",
      employeeCode: "DEMO-BAR-01",
      fullName: "[DEMO] Bao Barista",
      phone: "0909000102",
      email: "demo.barista@trap.local",
      position: "Barista",
      role: "barista",
      username: "demo.barista",
      permissions:
        STAFF_ROLE_TEMPLATES.barista,
      note:
        "[DEMO] Demonstrates a limited employee account and personal schedule access.",
    },
    {
      key: "cashier",
      employeeCode: "DEMO-CAS-01",
      fullName: "[DEMO] Chi Cashier",
      phone: "0909000103",
      email: "demo.cashier@trap.local",
      position: "Cashier",
      role: "cashier",
      username: "demo.cashier",
      permissions:
        STAFF_ROLE_TEMPLATES.cashier,
      note:
        "[DEMO] Demonstrates booking permissions and weekly shift assignment.",
    },
  ];

  for (const definition of employeeDefinitions) {
    const employee =
      await ensureDemoEmployee(
        definition
      );

    employees.push(employee);
  }

  const [
    manager,
    barista,
    cashier,
  ] = employees;

  const monday = getMonday(
    formatDate(new Date())
  );

  const shiftDefinitions = [
    {
      key: "monday-morning",
      date: monday,
      title: "[DEMO] Monday morning",
      startTime: "07:30",
      endTime: "11:00",
      position: "Opening team",
      requiredStaff: 2,
      employeeIds: [
        manager._id,
        barista._id,
      ],
      note:
        "[DEMO] Demonstrates a fully staffed opening shift.",
    },
    {
      key: "monday-evening",
      date: monday,
      title: "[DEMO] Monday evening",
      startTime: "18:00",
      endTime: "21:30",
      position: "Closing team",
      requiredStaff: 2,
      employeeIds: [
        cashier._id,
      ],
      note:
        "[DEMO] Deliberately short-staffed so the warning is visible.",
    },
    {
      key: "tuesday-midday",
      date: addDays(monday, 1),
      title: "[DEMO] Tuesday midday",
      startTime: "11:00",
      endTime: "14:30",
      position: "Service team",
      requiredStaff: 2,
      employeeIds: [
        barista._id,
        cashier._id,
      ],
      note:
        "[DEMO] Demonstrates two employees sharing one shift.",
    },
    {
      key: "wednesday-afternoon",
      date: addDays(monday, 2),
      title: "[DEMO] Wednesday afternoon",
      startTime: "14:30",
      endTime: "18:00",
      position: "Service team",
      requiredStaff: 2,
      employeeIds: [
        manager._id,
        cashier._id,
      ],
      note:
        "[DEMO] Use this shift when explaining edit and reassignment.",
    },
    {
      key: "friday-evening",
      date: addDays(monday, 4),
      title: "[DEMO] Friday evening",
      startTime: "18:00",
      endTime: "21:30",
      position: "Peak service",
      requiredStaff: 3,
      employeeIds: [
        manager._id,
        barista._id,
        cashier._id,
      ],
      note:
        "[DEMO] Demonstrates a fully staffed peak shift.",
    },
    {
      key: "weekend-morning",
      date: addDays(monday, 5),
      title: "[DEMO] Weekend morning",
      startTime: "07:30",
      endTime: "12:00",
      position: "Weekend team",
      requiredStaff: 2,
      employeeIds: [
        barista._id,
        cashier._id,
      ],
      note:
        "[DEMO] Demonstrates a longer custom shift.",
    },
  ];

  for (const definition of shiftDefinitions) {
    await ensureDemoShift(
      definition
    );
  }

  return getAdminDemoStaffStatus();
}

export async function clearAdminDemoStaffData() {
  const shifts =
    await WorkShift.deleteMany({
      isDemo: true,
      demoKey: {
        $regex: `^${STAFF_DEMO_PREFIX}:`,
      },
    });

  const employees =
    await Employee.deleteMany({
      isDemo: true,
      demoKey: {
        $regex: `^${STAFF_DEMO_PREFIX}:`,
      },
    });

  return {
    deleted: {
      workShifts:
        Number(
          shifts.deletedCount || 0
        ),
      employees:
        Number(
          employees.deletedCount || 0
        ),
    },
  };
}

async function ensureDemoEmployee(
  definition
) {
  const demoKey =
    `${STAFF_DEMO_PREFIX}:employee:${definition.key}`;

  let employee =
    await Employee.findOne({
      demoKey,
    }).select(
      "+passwordHash +passwordSalt"
    );

  if (!employee) {
    const password =
      await hashPassword(
        DEMO_PASSWORD
      );

    employee =
      new Employee({
        ...definition,
        passwordHash:
          password.passwordHash,
        passwordSalt:
          password.passwordSalt,
        permissions:
          normalizePermissions(
            definition.permissions,
            definition.role
          ),
        accountEnabled: false,
        isActive: true,
        mustChangePassword: true,
        hireDate: formatDate(
          new Date()
        ),
        isDemo: true,
        demoKey,
      });
  } else {
    Object.assign(employee, {
      employeeCode:
        definition.employeeCode,
      fullName:
        definition.fullName,
      phone: definition.phone,
      email: definition.email,
      position:
        definition.position,
      role: definition.role,
      username:
        definition.username,
      permissions:
        normalizePermissions(
          definition.permissions,
          definition.role
        ),
      accountEnabled: false,
      isActive: true,
      mustChangePassword: true,
      note: definition.note,
      isDemo: true,
      demoKey,
    });
  }

  await employee.save();

  return employee;
}

async function ensureDemoShift(
  definition
) {
  const demoKey =
    `${STAFF_DEMO_PREFIX}:shift:${definition.key}`;

  const existing =
    await WorkShift.findOne({
      demoKey,
    });

  const payload = {
    ...definition,
    status: "published",
    createdBy:
      "admin-demo-guide",
    updatedBy:
      "admin-demo-guide",
    isDemo: true,
    demoKey,
  };

  if (existing) {
    Object.assign(
      existing,
      payload
    );

    await existing.save();
    return existing;
  }

  return WorkShift.create(
    payload
  );
}

function formatDate(value) {
  const date =
    new Date(value);

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
}

function addDays(
  value,
  days
) {
  const date =
    new Date(
      `${value}T12:00:00`
    );

  date.setDate(
    date.getDate() +
      Number(days)
  );

  return formatDate(date);
}

function getMonday(value) {
  const date =
    new Date(
      `${value}T12:00:00`
    );

  const day =
    date.getDay();

  date.setDate(
    date.getDate() +
      (
        day === 0
          ? -6
          : 1 - day
      )
  );

  return formatDate(date);
}
