import { Mail, Phone, Calendar, Clock, Globe } from "lucide-react";

interface UserAccountInformationProps {
  user: {
    email: string;
    phone: string;
    joined: string;
    lastLogin: string;
    timezone: string;
  };
}

export default function UserAccountInformation({
  user,
}: UserAccountInformationProps) {
  const fields = [
    { label: "Email Address", value: user.email, icon: <Mail size={16} className="text-indigo-600" />, bg: "bg-indigo-50" },
    { label: "Phone Number", value: user.phone, icon: <Phone size={16} className="text-emerald-600" />, bg: "bg-emerald-50" },
    { label: "Joined Date", value: user.joined, icon: <Calendar size={16} className="text-blue-600" />, bg: "bg-blue-50" },
    { label: "Last Login", value: user.lastLogin, icon: <Clock size={16} className="text-amber-600" />, bg: "bg-amber-50" },
    { label: "Time Zone", value: user.timezone, icon: <Globe size={16} className="text-rose-600" />, bg: "bg-rose-50" },
  ];

  return (
    <div className="bg-white rounded-2xl p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <h2 className="m-0 mb-6 text-xl font-extrabold text-neutral-900 flex items-center gap-2 tracking-tight">
        <span className="w-1.5 h-6 rounded-full bg-indigo-600 inline-block" />
        Account Information
      </h2>
      <div className="flex flex-col gap-4">
        {fields.map(({ label, value, icon, bg }) => (
          <div key={label} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-neutral-50 transition-colors group">
            <div className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {label}
              </p>
              <p className="m-0 text-[15px] text-neutral-900 font-semibold truncate">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
