export default function AgentPersonalizationPage() {
  return (
    <div className="max-w-[720px]">
      <h1 className="text-[28px] font-semibold text-[var(--color-text-primary)]">
        Agent personalization
      </h1>
      <p className="mt-3 text-[14px] text-[var(--color-text-secondary)]">
        Configure the coding and agent assistance defaults used throughout the
        workspace. This page is the destination for the coding tools link in
        account preferences.
      </p>

      <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Coding tools
        </h2>
        <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
          Choose the preferences that guide assisted coding workflows, agent
          behavior, and future automation defaults.
        </p>
      </div>
    </div>
  );
}
