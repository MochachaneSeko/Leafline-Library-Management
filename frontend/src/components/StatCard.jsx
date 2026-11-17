export default function StatCard({ label, value, detail, icon: Icon, tone = 'green' }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>;
}
