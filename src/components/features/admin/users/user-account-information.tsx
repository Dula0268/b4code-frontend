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
    { label: "EMAIL ADDRESS", value: user.email },
    { label: "PHONE NUMBER", value: user.phone },
    { label: "JOINED DATE", value: user.joined },
    { label: "LAST LOGIN", value: user.lastLogin },
    { label: "TIME ZONE", value: user.timezone },
  ];

  return (
    <div className="bg-white rounded-2xl px-7 py-6 shadow-sm">
      <h2 className="m-0 mb-[22px] text-base font-bold text-[var(--black-2)]">
        Account Information
      </h2>
      {fields.map(({ label, value }) => (
        <div key={label} style={{ marginBottom: "20px" }}>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.07em",
              color: "var(--gray-3)",
              textTransform: "uppercase",
            }}
          >
            {label}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "var(--black-2)",
              fontWeight: 500,
            }}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
