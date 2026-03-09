import { useState } from "react";
import { Pencil, Mail, Phone, Save } from "lucide-react";

interface UserFormProps {
  initialData?: {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    timezone?: string;
  };
  onCancel?: () => void;
  onSave?: (data: UserFormData) => void;
}

interface UserFormData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  timezone: string;
}

const ROLES = ["Property Owner", "Staff"];

const TIMEZONES = [
  "Pacific Time (US & Canada)",
  "Mountain Time (US & Canada)",
  "Central Time (US & Canada)",
  "Eastern Time (US & Canada)",
  "UTC",
  "London",
  "Paris",
  "Dubai",
  "Kolkata",
  "Singapore",
  "Tokyo",
];

export default function UserForm({
  initialData,
  onCancel,
  onSave,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: initialData?.fullName ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    role: initialData?.role ?? ROLES[0],
    timezone: initialData?.timezone ?? TIMEZONES[0],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave?.(formData);
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
        <Pencil size={18} className="text-gray-600" />
        <h2 className="text-lg font-bold text-(--black-2) m-0">
          General Information
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-500">Full Name</label>
          <div className="relative">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-(--black-2) outline-none focus:border-(--brand-primary) focus:bg-white transition-colors"
              placeholder="Enter full name"
            />
            <Pencil
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Email & Phone Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-(--black-2) outline-none focus:border-(--brand-primary) focus:bg-white transition-colors"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500">
              Phone Number
            </label>
            <div className="relative">
              <Phone
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-(--black-2) outline-none focus:border-(--brand-primary) focus:bg-white transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        {/* Role & Timezone Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-(--black-2) outline-none focus:border-(--brand-primary) focus:bg-white transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "36px",
              }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-500">
              Timezone
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-(--black-2) outline-none focus:border-(--brand-primary) focus:bg-white transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "36px",
              }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--brand-primary) text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Save size={15} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
