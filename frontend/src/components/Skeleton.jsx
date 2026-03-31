function SkeletonBlock({ width = '100%', height = 14, radius = 4, style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, var(--parchment-dark) 25%, var(--parchment-darker) 50%, var(--parchment-dark) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style
    }} />
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <SkeletonBlock width="65%" height={18} radius={6} />
        <SkeletonBlock width={60} height={20} radius={20} />
      </div>
      <SkeletonBlock width="90%" height={12} />
      <SkeletonBlock width="75%" height={12} />
      <div style={{ display: 'flex', gap: 6 }}>
        <SkeletonBlock width={56} height={20} radius={20} />
        <SkeletonBlock width={72} height={20} radius={20} />
        <SkeletonBlock width={48} height={20} radius={20} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <SkeletonBlock width="40%" height={11} />
        <SkeletonBlock width={24} height={24} radius={12} />
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

export function NoteDetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SkeletonBlock width="60%" height={36} radius={8} />
      <SkeletonBlock width="45%" height={16} />
      <div style={{ display: 'flex', gap: 8 }}>
        <SkeletonBlock width={70} height={22} radius={20} />
        <SkeletonBlock width={90} height={22} radius={20} />
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        {['Overview','Chat','Quiz'].map(t => <SkeletonBlock key={t} width={80} height={38} radius={4} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[100,85,90,70,80].map((w,i) => <SkeletonBlock key={i} width={`${w}%`} height={13} />)}
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[60,100,80,95,65].map((w,i) => <SkeletonBlock key={i} width={`${w}%`} height={13} />)}
        </div>
      </div>
    </div>
  );
}

export default SkeletonBlock;
