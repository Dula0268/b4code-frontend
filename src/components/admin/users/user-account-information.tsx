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
    { label: "EMAIL ADDRESS", value: user.email, icon: <Mail size={16} color="#7d3c98" /> },
    { label: "PHONE NUMBER", value: user.phone, icon: <Phone size={16} color="#27ae60" /> },
    { label: "JOINED DATE", value: user.joined, icon: <Calendar size={16} color="#2f80ed" /> },
    { label: "LAST LOGIN", value: user.lastLogin, icon: <Clock size={16} color="#f2994a" /> },
    { label: "TIME ZONE", value: user.timezone, icon: <Globe size={16} color="#eb5757" /> },
  ];

  return (
    <div className="bg-white rounded-2xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-neutral-100/50">
      <h2 className="m-0 mb-6 text-lg font-extrabold text-(--black-2) flex items-center gap-2">
        <span className="w-1.5 h-6 rounded-full bg-(--brand-primary) inline-block" />
        Account Information
      </h2>
      <div className="flex flex-col gap-5">
        {fields.map(({ label, value, icon }) => (
          <div key={label} className="flex items-start gap-4 p-3 rounded-xl hover:bg-neutral-50/80 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-neutral-100 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <p className="m-0 mb-1 text-[11px] font-bold tracking-wider text-(--gray-3) uppercase">
                {label}
              </p>
              <p className="m-0 text-[14px] text-(--black-2) font-semibold">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
